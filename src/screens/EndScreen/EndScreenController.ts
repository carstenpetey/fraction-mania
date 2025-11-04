import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";
import { ScreenController } from "../../types.ts";

import { EndScreenModel } from "./EndScreenModel.ts";
import { EndScreenView } from "./EndScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";
import type { Layer } from "konva/lib/Layer";

/**
 * EndScreenController - Coordinates game logic between Model and View
 */
export class EndScreenController extends ScreenController {
  private readonly model: EndScreenModel;
  private readonly view: EndScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, layer: Layer) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new EndScreenModel();
    this.view = new EndScreenView(STAGE_WIDTH, STAGE_HEIGHT);

    layer.add(this.view.getGroup());

    this.view.setOnReturn(() => {
      this.screenSwitcher.switchToScreen({ type: "menu" });
    });
  }

  override show(): void {
    this.model.reset();
    super.show();
  }

  override hide(): void {
    super.hide();
  }

  /**
   * Get the view group
   */
  getView(): EndScreenView {
    return this.view;
  }
}
