import Konva from "konva";

import { GameState } from "./models/GameState.ts";
import { BoardScreenController } from "./screens/BoardScreen/BoardScreenController.ts";
import { EndScreenController } from "./screens/EndScreen/EndScreenController.ts";
import { EquationHelpScreenController } from "./screens/EquationHelpScreen/EquationHelpController.ts";
import { MainMenuScreenController } from "./screens/MainMenuScreen/MainMenuScreenController.ts";
import { PizzaMinigameController } from "./screens/Minigame1Screen/PizzaMinigameController.ts";
import { SpaceRescueController } from "./screens/Minigame2Screen/SpaceRescueController.ts";
import { PauseScreenController } from "./screens/PauseScreen/PauseScreenController.ts";
import { QuestionScreenController } from "./screens/QuestionScreen/QuestionScreenController.ts";
import { TutorialScreenController } from "./screens/TutorialScreen/TutorialScreenController.ts";

import type { QuestionConfig } from "./services/QuestionService.ts";
import type { Screen, ScreenSwitcher } from "./types.ts";

/**
 * Main Application - Coordinates all screens
 *
 * This class demonstrates screen management using Konva Groups.
 * Each screen (Menu, Game, Results) has its own Konva.Group that can be
 * shown or hidden independently.
 *
 * Key concept: All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
  private readonly stage: Konva.Stage;
  private readonly layer: Konva.Layer;

  private readonly gameState: GameState;

  private readonly mainMenuController: MainMenuScreenController;
  private readonly boardScreenController: BoardScreenController;
  private readonly pauseScreenController: PauseScreenController;
  private readonly pizzaMinigameController: PizzaMinigameController;
  private readonly endScreenController: EndScreenController;
  private readonly equationHelpScreenController: EquationHelpScreenController;
  private readonly minigame2Controller: SpaceRescueController;
  private readonly tutorialScreenController: TutorialScreenController;

  private gameScreenController: QuestionScreenController;
  private storedGameController: QuestionScreenController | null = null;

  private tutorialPreviousScreen: Screen["type"] | null = null;

  // track current screen so Esc can toggle game <-> pause
  private current: Screen["type"] = "menu";
  private previous: Screen["type"] | null = null;
  //private readonly currentDifficulty: string = "Easy";

  // pause function
  togglePause() {
    // If we're already on pause, go back to wherever we paused from
    if (this.current === "pause") {
      if (this.previous) {
        this.switchToScreen({ type: this.previous });
      }
    } else if (this.current === "game" || this.current === "board") {
      // SAVE game state before pausing
      if (this.current === "game") {
        this.storedGameController = this.gameScreenController;
      }

      // If we're on any other screen, remember it and go to pause
      this.previous = this.current;
      this.switchToScreen({ type: "pause" });
    }
  }

  constructor(container: string) {
    // Initialize Konva stage (the main canvas)
    this.stage = new Konva.Stage({
      container,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Initiailize difficulty
    //this.currentDifficulty = "Easy";

    // Create a layer (screens will be added to this layer)
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Initialize Game state
    this.gameState = new GameState();

    // Initialize all screen controllers
    // Each controller manages a Model, View, and handles user interactions
    this.mainMenuController = new MainMenuScreenController(this, this.gameState);
    this.boardScreenController = new BoardScreenController(this, this.gameState);
    this.pauseScreenController = new PauseScreenController(this);
    this.gameScreenController = new QuestionScreenController(
      this,
      this.getDifficultyConfig("Easy"),
      this.gameState,
    );
    this.pizzaMinigameController = new PizzaMinigameController(this, this.gameState);
    this.endScreenController = new EndScreenController(this);
    this.equationHelpScreenController = new EquationHelpScreenController(this);
    this.minigame2Controller = new SpaceRescueController(this, this.gameState);
    this.tutorialScreenController = new TutorialScreenController(this);

    // Add all screen groups to the layer
    // All screens exist simultaneously but only one is visible at a time
    this.layer.add(this.mainMenuController.getView().getGroup());
    this.layer.add(this.boardScreenController.getView().getGroup());
    this.layer.add(this.pauseScreenController.getView().getGroup());
    this.layer.add(this.gameScreenController.getView().getGroup());
    this.layer.add(this.pizzaMinigameController.getView().getGroup());
    this.layer.add(this.endScreenController.getView().getGroup());
    this.layer.add(this.equationHelpScreenController.getView().getGroup());
    this.layer.add(this.minigame2Controller.getView().getGroup());
    this.layer.add(this.tutorialScreenController.getView().getGroup());

    // start on main menu
    this.mainMenuController.show();
    this.pauseScreenController.hide();
    this.boardScreenController.hide();
    this.pizzaMinigameController.hide();
    this.endScreenController.hide();
    this.tutorialScreenController.hide();
    this.minigame2Controller.hide();
    this.current = "menu";

    // Draw the layer (render everything to the canvas)
    this.layer.draw();

    // ESC toggles game <-> pause (only when in those states)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.togglePause();
      }
    });

    // If in board state, update the camera positioning.
    // this.stage.on("mousemove", () => {
    //   if (this.current == "board") {
    //     this.boardScreenControoler.updateCameraPanning(
    //       this.stage.getPointerPosition() ?? {x: 0, y: 0});
    //   }
    // });
  }

  /**
   * Map difficulty level to question generation configuration
   *
   * Here, we define what each difficulty level means in terms of
   * actual question parameters. This central function makes it easy to
   * adjust difficulty levels without touching multiple files.
   */
  private getDifficultyConfig(difficulty: string): QuestionConfig {
    switch (difficulty) {
      case "Easy":
        return {
          operations: ["+", "-"],
          numOperations: 1,
          maxNumerator: 9,
          maxDenominator: 9,
          numChoices: 4,
          commonDenominator: true,
        };

      case "Medium":
        return {
          operations: ["+", "-", "*", "/"],
          numOperations: 1,
          maxNumerator: 10,
          maxDenominator: 10,
          numChoices: 4,
          commonDenominator: false,
        };

      case "Hard":
        return {
          operations: ["+", "-", "*", "/"],
          numOperations: 2,
          maxNumerator: 12,
          maxDenominator: 12,
          numChoices: 4,
          commonDenominator: false,
        };
      default:
        return this.getDifficultyConfig("Easy");
    }
  }

  /**
   * Switch to a different screen
   *
   * This method implements screen management by:
   * 1. Hiding all screens (setting their Groups to invisible)
   * 2. Showing only the requested screen
   *
   * This pattern ensures only one screen is visible at a time.
   */
  switchToScreen(screen: Screen): void {
    // Hide all screens first by setting their Groups to invisible
    this.mainMenuController.hide();
    // Don't hide board when showing question popup (enables popup capability)
    if (screen.type !== "game") {
      this.boardScreenController.hide();
    }
    this.gameScreenController.hide();
    this.pauseScreenController.hide();
    this.pizzaMinigameController.hide();
    this.endScreenController.hide();
    this.tutorialScreenController.hide();

    // Show the requested screen based on the screen type
    switch (screen.type) {
      case "menu":
        this.mainMenuController.show();
        break;
      case "board":
        // allows interaction with board when returning from question screen
        this.boardScreenController.getView().getGroup().listening(true);
        this.boardScreenController.show();
        // Ensure UI (buttons) reflect the current board phase after overlays close
        try {
          this.boardScreenController.refreshView();
        } catch {
          // ignore if refreshView is not present
        }
        break;
      case "pause":
        this.pauseScreenController.show();
        break;
      case "game":
        // question screen a popup overlay so the board is still technically visible
        // this disables board interactions while popup is showing
        this.boardScreenController.getView().getGroup().listening(false);

        // Check if we're returning from help and should restore previous state
        if (this.storedGameController) {
          // Restore the stored game controller
          this.gameScreenController = this.storedGameController;
          this.storedGameController = null;
          this.gameScreenController.show();
          break;
        } else {
          // TODO Really big mess, better to clean it up and move configuration part to gameState/controller

          // Get the configuration for the selected difficulty
          const config = this.getDifficultyConfig(this.gameState.getDifficulty());
          this.gameScreenController.getView().getGroup().remove();
          // creates a new controller with the correct difficulty config
          this.gameScreenController = new QuestionScreenController(this, config, this.gameState);
          // add the new view to the layer
          this.layer.add(this.gameScreenController.getView().getGroup());
          // start the question (updates view and shows the screen)
          this.gameScreenController.startQuestion();
        }
        break;
      case "minigame1":
        this.pizzaMinigameController.show();
        this.pizzaMinigameController.startMinigame();
        break;
      case "minigame2":
        this.minigame2Controller.show();
        break;
      case "end":
        this.endScreenController.show();
        break;
      case "equation_help":
        // Store the current game controller to preserve the question
        this.storedGameController = this.gameScreenController;
        this.equationHelpScreenController.show();
        break;
      case "tutorial":
        // Record where we came from
        this.tutorialPreviousScreen = this.current;
        this.tutorialScreenController.show();
        break;
    }

    this.current = screen.type;
    this.layer.draw();
  }

  // Expose current screen for controllers that need to wait on navigation
  getCurrentScreen(): Screen["type"] {
    return this.current;
  }

  resetBoard(): void {
    this.boardScreenController.resetBoard();
  }

  forceQuitAllMinigames(): void {
    // Space Rescue
    this.minigame2Controller.forceQuit?.();

    // Pizza Minigame
    //this.pizzaMinigameController.forceQuit?.();

    // Question popup (just hide it)
    try {
      this.gameScreenController.hide();
    } catch {}

    this.boardScreenController.resetBoard();
  }

  getTutorialPrevious(): Screen["type"] | null {
    return this.tutorialPreviousScreen;
  }

  // Present the question overlay and resolve when it completes.
  // Returns true if the player answered correctly, false otherwise.
  async presentQuestion(): Promise<boolean> {
    return new Promise((resolve) => {
      const config = this.getDifficultyConfig(this.gameState.getDifficulty());

      // Remove any existing question view group to avoid duplicates
      try {
        this.gameScreenController.getView().getGroup().remove();
      } catch {
        // ignore
      }

      // Create controller with callback
      this.gameScreenController = new QuestionScreenController(
        this,
        config,
        this.gameState,
        (passed: boolean) => {
          // When question completes, switch back to board and resolve.
          // Use switchToScreen so standard screen-show logic runs (including refresh).
          this.switchToScreen({ type: "board" });
          resolve(passed);
        },
      );

      // Add view group and show overlay
      this.layer.add(this.gameScreenController.getView().getGroup());
      // Show overlay without calling switchToScreen("game") which would recreate
      // the controller and drop the onComplete callback. Instead, disable board
      // interactions and start the question view directly.
      try {
        this.boardScreenController.getView().getGroup().listening(false);
      } catch {
        // ignore
      }
      this.gameScreenController.startQuestion();
      this.current = "game";
      this.layer.draw();
    });
  }
}

// Initialize the application
// eslint-disable-next-line no-new
new App("app");
