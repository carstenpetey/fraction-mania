import { ScreenController } from "../../types.ts";

import { Minigame1ScreenView } from "./Minigame1ScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

export class Minigame1ScreenController extends ScreenController {
  private readonly view: Minigame1ScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    // Pass the back-to-menu handler into the View:
    this.view = new Minigame1ScreenView(() => {
      this.screenSwitcher.switchToScreen({ type: "menu" });
    });
  }

  getView(): Minigame1ScreenView {
    return this.view;
  }
}
