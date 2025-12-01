// importing the screen controller
import { ScreenController } from "../../types.ts";

// we will be using the model and view for the minigame
// to follow the Model-View-Controller format
import { SpaceRescueModel } from "./SpaceRescueModel";
import { SpaceRescueView } from "./SpaceRescueView";

// this game requires clicking on fractions in a certain order, so we will need the fraction model we created
import type { Fraction } from "../../models/Fraction.ts";
import type { GameState } from "../../models/GameState.ts";
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

  // we need the game state so we can vary minigame difficulty on chosen difficulty at the start
  private readonly gameState: GameState;

  // boolean determining if the game has been started
  private gameStarted: boolean = false;

  // defining a sound that will be played when clicking an asteroid (idea from lab)
  private readonly laserSound: HTMLAudioElement;

  // defining our constructor, given a screen switcher object and a game state object
  constructor(screenSwitcher: ScreenSwitcher, gameState: GameState) {
    super();

    // initialize screen switcher object
    this.screenSwitcher = screenSwitcher;

    // initializing the game state
    this.gameState = gameState;

    // initialize the model (starts the first round)
    this.model = new SpaceRescueModel();

    // initialize the view, passing the click handler
    this.view = new SpaceRescueView(this.model, (fraction) => this.handleFractionClick(fraction));

    // defining timer handler
    this.view.setTimerEndHandler(() => this.handleTimeExpired());

    // defining the sound that will be played (in public folder)
    this.laserSound = new Audio("/laser.mp3");
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
        this.screenSwitcher.switchToScreen({ type: "board" });
      });
    }
  }

  /**
   * helper function that defines the duration of the minigame depending on the difficulty in game state
   * @returns the duration of the minigame, in seconds
   */
  private getDurationByDifficulty(): number {
    // extracting the difficulty
    const difficulty = this.gameState.getDifficulty();

    // defining minigame duration depending on difficulty
    switch (difficulty) {
      case "Hard":
        return 15;
      case "Medium":
        return 20;
      case "Easy":
      default:
        return 25;
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

    // getting the round duration
    const roundDuration = this.getDurationByDifficulty();

    // starting the timer with specified duration
    this.view.startTimer(roundDuration);

    // updating the visuals on the screen
    this.view.updateVisuals(this.model);
  }

  /**
   * handles a click on any asteroid.
   * @param clickedFraction the fraction that is being clicked
   */
  private handleFractionClick(clickedFraction: Fraction): void {
    if (!this.gameStarted) return;

    // playing the laser sound
    void this.laserSound.play();

    // allowing for multiple clicks in succession to trigger sound
    this.laserSound.currentTime = 0;

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
          this.screenSwitcher.switchToScreen({ type: "board" });
        });
      }
    } else {
      // wrong click case, we want to add a strike
      const strikes = this.model.addStrike();
      const remaining = 3 - strikes;

      // show message with remaining lives
      this.view.displayMessage(`Incorrect! Strikes left: ${remaining}`, 400);

      // if player is out of strikes, fail immediately
      if (this.model.isOutOfStrikes()) {
        this.view.stopTimer();
        this.view.showFailurePopup(() => {
          this.view.hideEndPopup();
          this.hide();
          this.screenSwitcher.switchToScreen({ type: "board" });
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
