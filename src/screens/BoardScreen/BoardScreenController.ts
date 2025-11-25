import { ScreenController, type ScreenSwitcher } from "../../types.ts";

import { BoardScreenModel } from "./BoardScreenModel.ts";
import { BoardScreenView } from "./BoardScreenView.ts";

import type { Player } from "./containers/Player.ts";

export class BoardScreenController extends ScreenController {
  private readonly model: BoardScreenModel;
  private readonly view: BoardScreenView;

  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new BoardScreenModel();
    this.view = new BoardScreenView(
      () => this.handlePauseClick(),
      () => this.handleDiceClick(),
      this.model,
    );
  }

  /*
   * Updates the position of a camera
   */
  public updateCameraPanning(mousePos: { x: number; y: number }) {
    this.view.boardRenderer.centerCameraOnPlayer(this.model.getPlayer().currentTile, mousePos);
  }

  private handlePauseClick(): void {
    // TODO Pause placeholder
  }

  private handleDiceClick(): void {
    const player: Player = this.model.getPlayer();
    if (player.getCurrentTile().getType().type === "normal") {
      player.move();
    } else if (player.getCurrentTile().getType().type === "end") {
      this.screenSwitcher.switchToScreen({ type: "end" });
    } else {
      this.screenSwitcher.switchToScreen({ type: "game" });
      player.move();
    }
    this.view.updatePlayerPos(this.model.getPlayer());
  }

  getView(): BoardScreenView {
    return this.view;
  }
}
