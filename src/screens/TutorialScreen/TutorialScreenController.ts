import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";
import { ScreenController } from "../../types.ts";

import { TutorialScreenView } from "./TutorialScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

/**
 * TutorialScreenController - Coordinates game logic for View
 */
export class TutorialScreenController extends ScreenController {
  private readonly view: TutorialScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.view = new TutorialScreenView(STAGE_WIDTH, STAGE_HEIGHT, () => this.handleReturn());
  }

  private handleReturn(): void {
    this.screenSwitcher.switchToScreen({ type: "menu" });
  }

  override show(): void {
    this.view.getGroup().visible(true);
  }

  override hide(): void {
    this.view.getGroup().visible(false);
  }

  /**
   * Get the view group
   */
  getView(): TutorialScreenView {
    return this.view;
  }
}
