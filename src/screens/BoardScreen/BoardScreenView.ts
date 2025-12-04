import Konva from "konva";

import { DiceService } from "../../services/DiceService.ts";
import { SleeperService } from "../../services/SleeperSerive.ts";
import { ButtonFactory } from "../../util/ButtonFactory.ts";

import { BoardRenderer } from "./utils/BoardRenderer.ts";

import type { View } from "../../types.ts";
import type { BoardPhase, BoardScreenModel } from "./BoardScreenModel.ts";
import type { Player } from "./containers/Player.ts";
import type { Tile } from "./containers/Tile.ts";

export class BoardScreenView implements View {
  private readonly width = window.innerWidth;
  private readonly height = window.innerHeight;

  // The whole screen group.
  private readonly viewGroup: Konva.Group;
  // Specifically tiles and player render group, good to keep separate for the future (aka camera).
  private readonly boardGroup: Konva.Group;

  public readonly boardRenderer: BoardRenderer;

  private readonly model: BoardScreenModel;
  private readonly onPauseClick: () => void;
  private readonly onDiceClick: () => Promise<void>;
  private readonly onMoveClick: () => Promise<void>;

  private pauseButtonGroup: Konva.Group | null = null;
  private diceButtonGroup: Konva.Group | null = null;
  private moveButtonGroup: Konva.Group | null = null;
  private pendingRollTextGroup: Konva.Text | null = null;
  private bonusRollTextGroup: Konva.Text | null = null;

  constructor(
    onPauseClick: () => void,
    onDiceClick: () => Promise<void>,
    onMoveClick: () => Promise<void>,
    model: BoardScreenModel,
  ) {
    this.viewGroup = new Konva.Group({ visible: true });
    this.boardGroup = new Konva.Group({ visible: true });

    this.viewGroup.add(this.boardGroup);

    this.boardRenderer = new BoardRenderer(this.boardGroup, this.width, this.height);

    this.model = model;
    this.onPauseClick = onPauseClick;
    this.onDiceClick = onDiceClick;
    this.onMoveClick = onMoveClick;

    // Setup the scene
    this.initializeBoard();
  }

  /*
   *Calls all main rendering functions.
   */
  private initializeBoard(): void {
    // Specify the start tile and origin of the board.
    this.boardRenderer.drawBoard(this.model.getStart());
    this.boardGroup.position({ x: -400, y: 0 });

    this.boardRenderer.drawPlayer(this.model.getPlayer());
    this.boardRenderer.drawMonster(this.model.getMonster());

    // Connect board render elements to a board group.
    this.boardRenderer.renderedTileMap.forEach((tile) => this.boardGroup.add(tile));

    this.boardGroup.add(this.boardRenderer.renderedPlayer);
    this.boardGroup.add(this.boardRenderer.renderedMonster);

    // UI buttons
    this.drawPauseButton();
    this.drawDiceButton();
    this.drawMoveButton();

    this.drawPendingRollText();
    this.drawBonusRollText();

    this.diceButtonGroup?.show();
    this.boardRenderer.renderedMonster.hide();
  }

  private drawPauseButton(): void {
    this.pauseButtonGroup = ButtonFactory.construct()
      .pos(this.width * 0.9, this.height * 0.1)
      .icon("/pause.svg")
      .backColor("#df1e19")
      .iconColor("white")
      .onClick(this.onPauseClick)
      .build();
    this.viewGroup.add(this.pauseButtonGroup);
  }

  private drawDiceButton(): void {
    this.diceButtonGroup = ButtonFactory.construct()
      .pos(this.width * 0.5, this.height * 0.9)
      .width(200)
      .text("Roll Dice")
      .backColor("#df1e19")
      /* eslint-disable ts/no-misused-promises */
      .onClick(this.onDiceClick)
      .build();
    this.viewGroup.add(this.diceButtonGroup);

    this.diceButtonGroup.hide();
  }

  private drawMoveButton(): void {
    this.moveButtonGroup = ButtonFactory.construct()
      .pos(this.width * 0.5, this.height * 0.9)
      .width(200)
      .text("Move!")
      .onClick(this.onMoveClick)
      .build();
    this.viewGroup.add(this.moveButtonGroup);

    this.moveButtonGroup.hide();
  }

  private drawPendingRollText(): void {
    this.pendingRollTextGroup = new Konva.Text({
      x: this.width * 0.49,
      y: this.height * 0.8,
      text: "67",
      fontSize: 48,
      fontFamily: "Arial",
      fill: "black",
      align: "center",
    });
    this.viewGroup.add(this.pendingRollTextGroup);

    this.pendingRollTextGroup.hide();
  }

  private drawBonusRollText(): void {
    this.bonusRollTextGroup = new Konva.Text({
      x: this.width * 0.51,
      y: this.height * 0.8,
      text: "67",
      fontSize: 48,
      fontFamily: "Arial",
      fill: "green",
      align: "center",
    });
    this.viewGroup.add(this.bonusRollTextGroup);

    this.bonusRollTextGroup.hide();
  }

  public updateRollState(pendingRoll: number, bonusRoll: number) {
    this.pendingRollTextGroup?.setText(pendingRoll.toString());
    this.bonusRollTextGroup?.setText(`+${bonusRoll}`);
    void (pendingRoll === 0
      ? this.pendingRollTextGroup?.hide()
      : this.pendingRollTextGroup?.show());
    void (bonusRoll === 0 ? this.bonusRollTextGroup?.hide() : this.bonusRollTextGroup?.show());
  }

  public updatePhaseState(phase: BoardPhase) {
    if (phase === "move") {
      this.diceButtonGroup?.hide();
      this.moveButtonGroup?.show();
    } else {
      this.diceButtonGroup?.show();
      this.moveButtonGroup?.hide();
    }
  }

  /*
   * Updates the position of a player
   * @param player - player object state
   */
  public async updatePlayerPos(player: Player): Promise<void> {
    return this.boardRenderer.updatePlayer(player.currentTile);
  }

  /*
   * Updates the position of a monster
   * @param monster - monster object state
   */
  public async updateMonsterPos(monster: Player): Promise<void> {
    return this.boardRenderer.updateMonster(monster.currentTile);
  }

  /*
   * Show monster
   */
  public showMonster(): void {
    this.boardRenderer.renderedMonster.show();
  }

  /*
   * Changes the zoom on board
   */
  public async updateCameraZoom(tile: Tile, factor: number, duration: number): Promise<void> {
    return this.boardRenderer.updateCameraZoom(tile, factor, duration);
  }

  /*
   * Fade the board
   */
  public async updateBoardFade(factor: number, duration: number): Promise<void> {
    return this.boardRenderer.fadeBoard(factor, duration);
  }

  /*
   * Hides buttons to avoid unnecessary user input.
   */
  public hideButtons() {
    this.diceButtonGroup?.hide();
    this.moveButtonGroup?.hide();
  }

  /*
   * Quick animation for dice rolling.
   */
  public async animateDiceJiggle(duration: number): Promise<void> {
    for (let i = 0; i < 16; i++) {
      const random = DiceService.rollDice(6);
      this.pendingRollTextGroup?.text(random.toString());
      /* eslint-disable-next-line no-await-in-loop */
      await SleeperService.sleep(duration);
    }
  }

  /*
   * Show the screens
   */
  show(): void {
    this.viewGroup.visible(true);
    this.viewGroup.getLayer()?.draw();
  }

  /*
   * Hide the screen
   */
  hide(): void {
    this.viewGroup.visible(false);
    this.viewGroup.getLayer()?.draw();
  }

  /*
   * Returns view group
   */
  getGroup(): Konva.Group {
    return this.viewGroup;
  }

  /*
   * Resets board view and all rendered elements.
   */
  public resetBoardView(): void {
    this.viewGroup.destroyChildren();
    this.boardGroup.destroyChildren();

    this.viewGroup.add(this.boardGroup);

    this.initializeBoard();
  }
}
