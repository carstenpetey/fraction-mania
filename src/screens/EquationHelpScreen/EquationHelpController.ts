// imports needed for controller
import { ScreenController } from "../../types.ts";

import { EquationHelpScreenView } from "./EquationHelpView.ts";

import type { ScreenSwitcher } from "../../types.ts";

/**
 * HelpScreenController - Manages interactions and state for the help screen.
 */
export class EquationHelpScreenController extends ScreenController {
  // properties needed for the controller
  private readonly view: EquationHelpScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  // constructor for controller
  constructor(screenSwitcher: ScreenSwitcher) {
    super();

    // initialize screenSwitcher
    this.screenSwitcher = screenSwitcher;

    // initialize view
    this.view = new EquationHelpScreenView(
      // handling video select
      (url) => this.handleVideoSelect(url),
      // handling when back button is pressed
      () => this.handleBackClick(),
    );
  }

  /**
   * plays the correct YouTube video depending on
   * which button was pressed.
   */
  private handleVideoSelect(url: string): void {
    // playing video as defined in the view
    this.view.showVideoEmbed(url);
  }

  /**
   * handles when back button was clicked. mean to take
   * user back to question screen
   */
  private handleBackClick(): void {
    // edge cases/ preventive measure: making sure video is not playing while back button is pressed
    // even though it was designed in a way where video should not be playing to begin with
    this.view.hideVideoEmbed();

    // hiding the view
    this.view.hide();

    // go back to question screen
    this.screenSwitcher.switchToScreen({ type: "game" });
  }

  /**
   * get the view
   */
  public getView(): EquationHelpScreenView {
    return this.view;
  }
}
