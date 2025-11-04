// screens/PauseScreen/PauseScreenController.ts
import { ScreenController } from "../../types.ts";

import { PauseScreenView } from "./PauseScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

/**
 * PauseScreenController - mirrors MainMenuScreenController structure,
 * but only takes the ScreenSwitcher (no Stage arg).
 */
export class PauseScreenController extends ScreenController {
  private readonly view: PauseScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    // Wire up view callbacks
    this.view = new PauseScreenView(
      () => this.handleResume(),
      () => this.handleHelp(),
      () => this.handleRestart(),
      () => this.handleQuit(),
    );
  }

  private handleResume(): void {
    this.screenSwitcher.switchToScreen({ type: "game" });
  }

  private handleHelp(): void {
    this.screenSwitcher.switchToScreen({ type: "help" });
  }

  private handleRestart(): void {
    // Reset flow if you have one, then go to game
    this.screenSwitcher.switchToScreen({ type: "game" });
  }

  private handleQuit(): void {
    this.screenSwitcher.switchToScreen({ type: "menu" });
  }

  getView(): PauseScreenView {
    return this.view;
  }
}
