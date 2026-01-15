import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";
import { ScreenController } from "../../types.ts";

import { EndScreenModel } from "./EndScreenModel.ts";
import { EndScreenView } from "./EndScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

/**
 * EndScreenController - Coordinates game logic between Model and View
 */
export class EndScreenController extends ScreenController {
  private readonly model: EndScreenModel;
  private readonly view: EndScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new EndScreenModel();
    this.view = new EndScreenView(STAGE_WIDTH, STAGE_HEIGHT);

    this.view.setOnReturn(() => {
      this.screenSwitcher.switchToScreen({ type: "menu" });
    });
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
  getView(): EndScreenView {
    return this.view;
  }

  getModel(): EndScreenModel {
  return this.model;
  }
}
