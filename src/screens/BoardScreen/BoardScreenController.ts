import { DiceService } from "../../services/DiceService.ts";
import { SleeperService } from "../../services/SleeperSerive.ts";
import { ScreenController, type ScreenSwitcher } from "../../types.ts";

import { BoardScreenModel } from "./BoardScreenModel.ts";
import { BoardScreenView } from "./BoardScreenView.ts";

import type { GameState } from "../../models/GameState.ts";
import type { Player } from "./containers/Player.ts";
import type { Tile } from "./containers/Tile.ts";

export class BoardScreenController extends ScreenController {
  private readonly model: BoardScreenModel;
  private readonly view: BoardScreenView;

  private readonly gameState: GameState;

  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, gameState: GameState) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.gameState = gameState;
    this.model = new BoardScreenModel(gameState);
    this.view = new BoardScreenView(
      () => this.handlePauseClick(),
      async () => this.handleDiceClick(),
      async () => this.handleMoveClick(),
      this.model,
    );
  }

  /*
   * Updates the position of a camera
   */
  public async updateCameraPanning(mousePos: { x: number; y: number }) {
    await this.view.boardRenderer.centerCameraOnPlayer(
      this.model.getPlayer().currentTile,
      mousePos,
    );
  }

  private handlePauseClick(): void {
    // TODO Pause placeholder
  }

  private async handleDiceClick(): Promise<void> {
    // Present the question as an overlay and await the result.
    this.view.hideButtons();

    // Reset the flag before presenting the question
    this.gameState.setPassedQuestion(false);

    let passed = false;

    // If the ScreenSwitcher provides presentQuestion, use it (preferred)
    // otherwise fall back to the older polling behavior.
    if (typeof this.screenSwitcher.presentQuestion === "function") {
      passed = await this.screenSwitcher.presentQuestion();
    } else {
      // Fallback: show question screen and poll for return to board
      this.screenSwitcher.switchToScreen({ type: "game" });

      // Wait until the App switches back to the board screen

      while (this.screenSwitcher.getCurrentScreen() !== "board") {
        // eslint-disable-next-line no-await-in-loop
        await SleeperService.sleep(100);
      }

      passed = this.gameState.hasPassedQuestion();
    }

    if (passed) {
      /*
       * Not sure why exactly, but awaiting for response
       * from question screen would sometimes arrive as we press
       * roll dice button, causing the button to apper during the roll animation.
       * Thus to avoid user accidentally clicking it, we forcefully hide them
       * before any animations start.
       */
      this.view.hideButtons();
      // Player passed — perform normal roll and movement
      this.model.roll();
      this.model.setPhase("move");

      this.view.updateRollState(this.model.getRoll(), this.gameState.getBonus());
      await this.view.animateDiceJiggle(40);
      this.view.updateRollState(this.model.getRoll(), this.gameState.getBonus());

      this.gameState.incrementTurn();
      await this.handleMonsterActions();
      await this.checkMonsterCatch();
      this.view.updatePhaseState(this.model.getPhase());
    } else {
      this.view.hideButtons();
      // Player failed — skip their move and immediately run monster actions
      this.gameState.incrementTurn();
      await this.handleMonsterActions();
      await this.checkMonsterCatch();
      this.view.updatePhaseState(this.model.getPhase());
    }
  }

  private async handleMoveClick(): Promise<void> {
    this.view.hideButtons();

    const player: Player = this.model.getPlayer();

    while (this.model.getRoll() > 0) {
      player.move();
      this.model.deacrementRoll();
      this.view.updateRollState(this.model.getRoll(), this.gameState.getBonus());

      /* eslint-disable-next-line no-await-in-loop */
      await this.view.updatePlayerPos(this.model.getPlayer());
    }

    const cTile: Tile = player.getCurrentTile();

    switch (cTile.getType().type) {
      case "end":
        this.screenSwitcher.switchToScreen({ type: "end" });
        this.restBoard();
        break;
      case "minigame":
        const game = DiceService.rollDice(2);
        await this.view.updateBoardFade(0.0, 0.8);
        if (game === 1) {
          this.screenSwitcher.switchToScreen({ type: "minigame1" });
        } else {
          this.screenSwitcher.switchToScreen({ type: "minigame2" });
        }
        break;
      default:
        break;
    }

    await this.view.updateBoardFade(1.0, 0.0);

    this.model.setPhase("roll");

    this.view.updateRollState(this.model.getRoll(), this.gameState.getBonus());
    this.view.updatePhaseState(this.model.getPhase());
  }

  private async handleMonsterActions(): Promise<void> {
    if (this.gameState.getTurnCount() === 2) {
      this.view.hideButtons();
      this.view.showMonster();
      await Promise.resolve(
        this.view.boardRenderer.centerCameraOnPlayer(this.model.getMonster().currentTile, null),
      );
      await SleeperService.sleep(1500);
      await Promise.resolve(
        this.view.boardRenderer.centerCameraOnPlayer(this.model.getPlayer().currentTile, null),
      );
      this.view.updatePhaseState(this.model.getPhase());
    }

    if (this.gameState.getTurnCount() > 2) {
      for (let i = 0; i < DiceService.rollDice(6); i++) {
        this.model.getMonster().move();
      }

      await this.view.updateMonsterPos(this.model.getMonster());
    }
  }

  private async checkMonsterCatch(): Promise<void> {
    if (
      !this.model.getMonster().isAheadOf(this.model.getPlayer()) &&
      this.gameState.getTurnCount() > 2
    ) {
      this.view.hideButtons();
      await SleeperService.sleep(1500);
      this.screenSwitcher.switchToScreen({ type: "end" });
      this.restBoard();
    }
  }

  getView(): BoardScreenView {
    return this.view;
  }

  // Refresh the board view state (useful after overlays close)
  public refreshView(): void {
    this.view.updatePhaseState(this.model.getPhase());
  }

  /*
   * Resets Model and View for a baord and Game State variables used in board.
   */
  public restBoard(): void {
    this.gameState.resetGameState();
    this.model.resetBoardModel();
    this.view.resetBoardView();

    void this.view.updatePlayerPos(this.model.getPlayer());
    void this.view.updateMonsterPos(this.model.getMonster());
  }
}
