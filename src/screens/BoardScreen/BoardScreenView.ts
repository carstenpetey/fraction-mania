import Konva from "konva";

import { ButtonFactory } from "../../util/ButtonFactory.ts";

import { BoardRenderer } from "./utils/BoardRenderer.ts";

import type { View } from "../../types.ts";
import type { BoardScreenModel } from "./BoardScreenModel.ts";
import type { Player } from "./containers/Player.ts";

export class BoardScreenView implements View {
  private readonly width = window.innerWidth;
  private readonly height = window.innerHeight;

  // The whole screen group.
  private readonly viewGroup: Konva.Group;
  // Specifically tiles and player render group, good to keep separate for the future (aka camera).
  private readonly boardGroup: Konva.Group;

  private readonly boardRenderer: BoardRenderer;

  private readonly model: BoardScreenModel;
  private readonly onPauseClick: () => void;
  private readonly onDiceClick: () => void;

  constructor(onPauseClick: () => void, onDiceClick: () => void, model: BoardScreenModel) {
    this.viewGroup = new Konva.Group({ visible: true });
    this.boardGroup = new Konva.Group({ visible: true });

    this.viewGroup.add(this.boardGroup);

    this.boardRenderer = new BoardRenderer(this.boardGroup, this.width, this.height);

    this.model = model;
    this.onPauseClick = onPauseClick;
    this.onDiceClick = onDiceClick;

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

    // Connect board render elements to a board group.
    this.boardRenderer.renderedTileMap.forEach((tile) => this.boardGroup.add(tile));

    this.boardGroup.add(this.boardRenderer.renderedPlayer);

    // UI buttons
    this.drawPauseButton();
    this.drawDiceButton();
  }

  // TODO Create a Button factory to avoid duplicates as this
  private drawPauseButton(): void {
    const pauseButtonGroup = ButtonFactory.construct()
      .pos(this.width * 0.9, this.height * 0.1)
      .text("Pause")
      .onClick(this.onPauseClick)
      .build();
    this.viewGroup.add(pauseButtonGroup);
  }

  // TODO Create a Button factory to avoid duplicates as this
  private drawDiceButton(): void {
    const diceButtonGroup = ButtonFactory.construct()
      .pos(this.width * 0.5, this.height * 0.9)
      .width(200)
      .text("Roll Dice")
      .onClick(this.onDiceClick)
      .build();
    this.viewGroup.add(diceButtonGroup);
  }

  /*
   * Updates the position of a player
   * @param player - player object state
   */
  public updatePlayerPos(player: Player) {
    this.boardRenderer.updatePlayer(player.currentTile);
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
}
