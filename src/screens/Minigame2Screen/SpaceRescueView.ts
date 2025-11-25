//------------------------------------------
// Initial Imports
//------------------------------------------

import Konva from "konva";

// --- RENDERER IMPORTS ---
import { AsteroidRenderer } from "./UI rendering/AsteroidRenderer.ts";
import { BackgroundRenderer } from "./UI rendering/BackgroundRenderer.ts";
import { EndPopupRenderer } from "./UI rendering/EndPopupRenderer.ts";
import { IntroPopupRenderer } from "./UI rendering/IntroPopupRenderer.ts";
import { MessageRenderer } from "./UI rendering/MessageRenderer.ts";
import { PromptRenderer } from "./UI rendering/PromptRenderer.ts";
import { ShipTimerRenderer } from "./UI rendering/TimeRenderer.ts";

// --- MODEL IMPORTS ---
import type { Fraction } from "../../models/Fraction.ts";
import type { View } from "../../types.ts";
import type { SpaceRescueModel } from "./SpaceRescueModel";

// define a handler for when a fraction is clicked
type OnFractionClick = (fraction: Fraction) => void;

//------------------------------------------
// View Class
//------------------------------------------
export class SpaceRescueView implements View {
  // --- READONLY VARIABLES ---
  // the main top-level Konva Group. This holds all visible elements on the screen.
  private readonly group: Konva.Group;

  // Konva group that holds only the interactive game elements. This is a separate group because
  // this group should be hidden when the controller switches screens
  private readonly gameElementsGroup: Konva.Group;

  // a reference to the Konva Text node created by the PromptRenderer.
  private readonly promptText!: Konva.Text;

  // handles display of message on screen
  private readonly messageRenderer!: MessageRenderer;

  // --- MUTABLE VARIABLES ---
  // a map to hold references to the Konva Groups for each asteroid. the map structure allows us
  // to easily handle the updateVisuals() function
  private fractionNodes: Map<string, Konva.Group> = new Map();

  // image for asteroid
  private asteroidImage: Konva.Image | null = null;

  // group that is meant to be visible for the intro popup
  private dialogueGroup: Konva.Group | null = null;

  // group that is meant to be visible for the end popup
  private endPopupGroup: Konva.Group | null = null;

  // instance of ShipTimerRenderer, which manages the ship image and its Konva Tween
  // the view delegates all timing/ship animation commands
  private timerRenderer!: ShipTimerRenderer;

  // function provided by the controller. executed when timer runs out
  private onTimerEnd!: () => void;

  // spaceship image
  private timerShip!: Konva.Image;

  //------------------------------------------
  // Constructor
  //------------------------------------------
  constructor(model: SpaceRescueModel, onFractionClick: OnFractionClick) {
    // creating new groups
    this.group = new Konva.Group({ visible: false });
    this.gameElementsGroup = new Konva.Group({ visible: false });

    // rendering the background
    this.group.add(BackgroundRenderer.createBackground());
    this.group.add(this.gameElementsGroup);

    // rendering prompt text
    this.promptText = PromptRenderer.create();
    this.gameElementsGroup.add(this.promptText);

    // initializing message renderer
    this.messageRenderer = new MessageRenderer(this.group);

    // loading asteroid image
    Konva.Image.fromURL("/asteroid.png", (image) => {
      this.asteroidImage = image;

      // creating asteroids once loading
      this.createAsteroids(model, onFractionClick);

      // drawing asteroids
      this.group.getLayer()?.draw();
    });

    // loading spaceship image
    // loading spaceship image
    Konva.Image.fromURL("/spaceship.png", (image) => {
      this.timerShip = image;

      // initialize time renderer (this wraps the ship into a container)
      this.timerRenderer = new ShipTimerRenderer({
        timerShip: this.timerShip,
        duration: 25,
      });

      // add the whole timer container to game elements
      this.gameElementsGroup.add(this.timerRenderer.getNode());

      this.group.getLayer()?.draw();
    });
  }

  // ------------------------------------------
  //  Asteroid Creation Helper (uses AsteroidRenderer)
  // ------------------------------------------
  /**
   * function that creates asteroids using renderer
   * @param model we need the model to know which fractions we will use
   * @param onFractionClick handler defining what happens if an asteroid is clicked
   */
  private createAsteroids(model: SpaceRescueModel, onFractionClick: OnFractionClick): void {
    // checking if image is correctly loaded
    if (!this.asteroidImage) return;

    // calling the renderer
    this.fractionNodes = AsteroidRenderer.createAsteroids({
      fractions: model.asteroids,
      asteroidImage: this.asteroidImage,
      onFractionClick,
      parentGroup: this.gameElementsGroup,
    });
  }

  // ------------------------------------------
  // Timer Management (uses TimeRenderer)
  // ------------------------------------------
  /**
   * defining handler
   * @param handler the handler that defines what happens when the game neds
   */
  public setTimerEndHandler(handler: () => void) {
    this.onTimerEnd = handler;
  }

  /**
   * starts the timer
   */
  public startTimer(): void {
    if (!this.timerRenderer) return;
    this.timerRenderer.start(this.onTimerEnd);
  }

  /**
   * stops the timer
   */
  public stopTimer() {
    this.timerRenderer?.stop();
  }

  // ------------------------------------------
  // Introductory Pop-up (uses IntroPopupRenderer)
  // ------------------------------------------
  /**
   * displaying the intro popup dialogue
   * @param onStart handler that defines what happens when start button is clicked
   */
  public showIntroDialogue(onStart: () => void): void {
    // create the popup group using the renderer
    this.dialogueGroup = IntroPopupRenderer.createPopup(() => {
      // what happens when start is clicked
      this.hideIntroDialogue();
      onStart();
    });

    // add dialogue group and redraw
    this.group.add(this.dialogueGroup);
    this.group.getLayer()?.draw();
  }

  /**
   * once popup isn't needed anymore, we need to hide it
   */
  public hideIntroDialogue(): void {
    // if exists, destroy it
    if (this.dialogueGroup) {
      this.dialogueGroup.destroy();
      this.dialogueGroup = null;
    }

    // once destroyed, redraw
    this.gameElementsGroup.visible(true);
    this.group.getLayer()?.draw();
  }

  // ------------------------------------------
  //  End Pop-up (uses EndPopupRenderer)
  // ------------------------------------------
  /**
   * creating popup in case game isn't completed
   * @param onReturn what happens when return button is clicked
   */
  public showFailurePopup(onReturn: () => void): void {
    // make sure game elements can't be clicked
    this.gameElementsGroup.listening(false);

    // using renderer to design popup
    this.endPopupGroup = EndPopupRenderer.createPopup({
      title: "Mission Failed!",
      message: "Better luck next time! Keep fighting pilot.",
      onReturn,
      theme: "failure",
    });

    // drawing the popup
    this.group.add(this.endPopupGroup);
    this.group.getLayer()?.draw();
  }

  /**
   * creating popup when game is completed
   * @param onReturn what happens when return button is clicked
   */
  public showSuccessPopup(onReturn: () => void): void {
    // make sure game elements can't be clicked
    this.gameElementsGroup.listening(false);

    // using renderer to design popup
    this.endPopupGroup = EndPopupRenderer.createPopup({
      title: "Mission Success!",
      message: "You've cleared all asteroids! Excellent work, pilot!",
      onReturn,
      theme: "success",
    });

    // drawing the popupp
    this.group.add(this.endPopupGroup);
    this.group.getLayer()?.draw();
  }

  /**
   * once popup is no longer needed, we want to destroy it
   */
  public hideEndPopup(): void {
    if (this.endPopupGroup) {
      this.endPopupGroup.destroy();
      this.endPopupGroup = null;
      this.gameElementsGroup.listening(true);
      this.group.getLayer()?.draw();
    }
  }

  // ------------------------------------------
  //  Message Text (uses MessageRenderer)
  // ------------------------------------------
  /**
   * displaying message using renderer
   * @param message message to print
   * @param duration how long message will be printed
   */
  public displayMessage(message: string, duration: number): void {
    this.messageRenderer.displayMessage(message, duration);
  }

  // ------------------------------------------
  // Reset/Setup New Round
  // ------------------------------------------
  /**
   * reset function so that we can play game again
   * @param model the game model, so we can reset it
   * @param onFractionClick what happens when an asteroid is clicked
   */
  public clearAndSetupNewRound(model: SpaceRescueModel, onFractionClick: OnFractionClick): void {
    // destroy existing asteroid Konva nodes
    this.fractionNodes.forEach((nodeGroup) => nodeGroup.destroy());
    this.fractionNodes.clear();

    // recreate using the renderer (string keys)
    const newNodes = AsteroidRenderer.createAsteroids({
      fractions: model.asteroids,
      asteroidImage: this.asteroidImage!,
      onFractionClick,
      parentGroup: this.gameElementsGroup,
    });

    this.fractionNodes = newNodes;

    // reset timer visuals
    this.timerRenderer?.reset();

    // hide game elements until popup is dismissed
    this.gameElementsGroup.visible(false);

    // redraw
    this.group.getLayer()?.draw();
  }

  // ------------------------------------------
  //  Core View Management (Remains)
  // ------------------------------------------
  /**
   * function that updates visual feedback
   * @param model the model for the game
   */
  public updateVisuals(model: SpaceRescueModel): void {
    const orderText =
      model.sortOrder === "ascending" ? "SMALLEST to LARGEST" : "LARGEST to SMALLEST";

    this.promptText.text(
      `Click the asteroids in order: ${orderText} (Next: #${model.getNextTargetIndex() + 1})`,
    );
    this.promptText.offsetX(this.promptText.width() / 2);

    // pre-compute sorted target order as string keys for fast lookup
    const targetKeys = model.getTargetOrder().map((f) => f.toString());
    const nextIndex = model.getNextTargetIndex();

    // apply opacity to each asteroid depending on progress
    this.fractionNodes.forEach((nodeGroup, fractionKey) => {
      const fractionPosition = targetKeys.indexOf(fractionKey);
      const alreadyCleared = fractionPosition > -1 && fractionPosition < nextIndex;

      nodeGroup.opacity(alreadyCleared ? 0.3 : 1.0);
    });

    this.group.getLayer()?.draw();
  }

  // standard show, hide, and getGroup methods
  show() {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }
  hide() {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }
  getGroup() {
    return this.group;
  }
}
