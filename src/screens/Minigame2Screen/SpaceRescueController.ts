// importing the screen controller
import { ScreenController } from "../../types.ts";

// we will be using the model and view for the minigame
// to follow the Model-View-Controller format
import { SpaceRescueModel } from "./SpaceRescueModel";
import { SpaceRescueView } from "./SpaceRescueView";

// this game requires clicking on fractions in a certain order, so we will need the fraction model we created
import type { Fraction } from "../../models/Fraction.ts";
// we will need the screenswitcher
import type { ScreenSwitcher } from "../../types.ts";

/**
 * class for the controller
 */
export class SpaceRescueController extends ScreenController {
  // by nature of MVC, we will need the model and the view in order to get them to interact
  private readonly model: SpaceRescueModel;
  private readonly view: SpaceRescueView;

  // need the screenswitcher so that we can define interactions between various scenes
  private readonly screenSwitcher: ScreenSwitcher;

  // boolean determining if the game has been started
  private gameStarted: boolean = false;

  // defining our constructor, given a screen switcher object
  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    // initialize screen switcher object
    this.screenSwitcher = screenSwitcher;

    // initialize the model (starts the first round)
    this.model = new SpaceRescueModel();

    // initialize the view, passing the click handler
    this.view = new SpaceRescueView(this.model, (fraction) => this.handleFractionClick(fraction));

    // defining timer handler
    this.view.setTimerEndHandler(() => this.handleTimeExpired());
  }

  /**
   * defining what happens when the timer expires
   */
  private handleTimeExpired() {
    // checking if the game has been completed
    if (!this.model.isRoundComplete()) {
      this.gameStarted = false;

      // show the failure popup
      this.view.showFailurePopup(() => {
        this.view.hideEndPopup();
        this.hide();
        this.screenSwitcher.switchToScreen({ type: "menu" });
      });
    }
  }

  /**
   * starting the game (after clicking start game in intro popup)
   */
  private startGame(): void {
    // close the popup
    this.view.hideIntroDialogue();

    // setting boolean value to be true
    this.gameStarted = true;

    // starting the timer
    this.view.startTimer();

    // updating the visuals on the screen
    this.view.updateVisuals(this.model);
  }

  /**
   * handles a click on any asteroid.
   * @param clickedFraction the fraction that is being clicked
   */
  private handleFractionClick(clickedFraction: Fraction): void {
    if (!this.gameStarted) return;

    // checking if the clicked fraction is correct
    const isCorrect = this.model.checkClick(clickedFraction);

    // if correct, we want to update the visuals
    if (isCorrect) {
      this.view.updateVisuals(this.model);

      // if correct and game is over, handle correctly by ending the game
      if (this.model.isRoundComplete()) {
        this.view.stopTimer();
        this.view.showSuccessPopup(() => {
          this.view.hideEndPopup();
          this.hide();
          this.screenSwitcher.switchToScreen({ type: "menu" });
        });
      }
    } else {
      // wrong click case, we want to add a strike
      const strikes = this.model.addStrike();
      const remaining = 3 - strikes;

      // show message with remaining lives
      this.view.displayMessage(`Incorrect! Strikes left: ${remaining}`, 400);

      // if player is out of strikes → fail immediately
      if (this.model.isOutOfStrikes()) {
        this.view.stopTimer();
        this.view.showFailurePopup(() => {
          this.view.hideEndPopup();
          this.hide();
          this.screenSwitcher.switchToScreen({ type: "menu" });
        });
      }
    }
  }

  // defining getView
  public getView(): SpaceRescueView {
    return this.view;
  }

  // defining show
  public show(): void {
    // reset model
    this.model.reset();

    // cleaning up visuals
    this.view.clearAndSetupNewRound(this.model, (fraction) => this.handleFractionClick(fraction));

    // show the intro popup
    this.view.showIntroDialogue(() => this.startGame());

    // make the view visible
    this.view.show();
  }

  // hide the view
  public hide(): void {
    this.view.hide();
  }
}
