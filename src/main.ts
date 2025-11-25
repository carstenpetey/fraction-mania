import Konva from "konva";

import { GameState } from "./models/GameState.ts";
import { BoardScreenController } from "./screens/BoardScreen/BoardScreenController.ts";
import { EndScreenController } from "./screens/EndScreen/EndScreenController.ts";
import { EquationHelpScreenController } from "./screens/EquationHelpScreen/EquationHelpController.ts";
import { MainMenuScreenController } from "./screens/MainMenuScreen/MainMenuScreenController.ts";
import { Minigame1ScreenController } from "./screens/Minigame1Screen/Minigame1ScreenController.ts";
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
  private readonly boardScreenControoler: BoardScreenController;
  private readonly pauseScreenController: PauseScreenController;
  private readonly minigame1Controller: Minigame1ScreenController;
  private readonly endScreenController: EndScreenController;
  private readonly equationHelpScreenController: EquationHelpScreenController;
  private readonly minigame2Controller: SpaceRescueController;
  private readonly tutorialScreenController: TutorialScreenController;

  private gameScreenController: QuestionScreenController;
  private storedGameController: QuestionScreenController | null = null;

  // track current screen so Esc can toggle game <-> pause
  private current: Screen["type"] = "menu";
  private readonly currentDifficulty: string = "Easy";

  constructor(container: string) {
    // Initialize Konva stage (the main canvas)
    this.stage = new Konva.Stage({
      container,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Initiailize difficulty
    this.currentDifficulty = "Easy";

    // Create a layer (screens will be added to this layer)
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Initialize Game state
    this.gameState = new GameState();

    // Initialize all screen controllers
    // Each controller manages a Model, View, and handles user interactions
    this.mainMenuController = new MainMenuScreenController(this, this.gameState);
    this.boardScreenControoler = new BoardScreenController(this);
    this.pauseScreenController = new PauseScreenController(this, this.currentDifficulty);
    this.gameScreenController = new QuestionScreenController(
      this,
      this.getDifficultyConfig("Easy"),
    );
    this.minigame1Controller = new Minigame1ScreenController(this);
    this.endScreenController = new EndScreenController(this);
    this.equationHelpScreenController = new EquationHelpScreenController(this);
    this.minigame2Controller = new SpaceRescueController(this);
    this.tutorialScreenController = new TutorialScreenController(this);

    // Add all screen groups to the layer
    // All screens exist simultaneously but only one is visible at a time
    this.layer.add(this.mainMenuController.getView().getGroup());
    this.layer.add(this.boardScreenControoler.getView().getGroup());
    this.layer.add(this.pauseScreenController.getView().getGroup());
    this.layer.add(this.gameScreenController.getView().getGroup());
    this.layer.add(this.minigame1Controller.getView().getGroup());
    this.layer.add(this.endScreenController.getView().getGroup());
    this.layer.add(this.equationHelpScreenController.getView().getGroup());
    this.layer.add(this.minigame2Controller.getView().getGroup());
    this.layer.add(this.tutorialScreenController.getView().getGroup());

    // start on main menu
    this.mainMenuController.show();
    this.pauseScreenController.hide();
    this.boardScreenControoler.hide();
    this.minigame1Controller.hide();
    this.endScreenController.hide();
    this.minigame2Controller.hide();
    this.current = "menu";

    // Draw the layer (render everything to the canvas)
    this.layer.draw();

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.current === "game") {
          this.switchToScreen({ type: "pause" });
        } else if (this.current === "pause") {
          this.switchToScreen({ type: "game" });
        }
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
          maxNumerator: 12,
          maxDenominator: 12,
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

  // TODO: figure out how we decide when game ends, link endScreen to this event

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
    this.boardScreenControoler.hide();
    this.gameScreenController.hide();
    this.pauseScreenController.hide();
    this.minigame1Controller.hide();
    this.endScreenController.hide();

    // Show the requested screen based on the screen type
    switch (screen.type) {
      case "menu":
        this.mainMenuController.show();
        break;
      case "board":
        this.boardScreenControoler.show();
        break;
      case "pause":
        this.pauseScreenController.show();
        break;
      case "game":
        // Check if we're returning from help and should restore previous state
        if (this.storedGameController) {
          // Restore the stored game controller
          this.gameScreenController = this.storedGameController;
          this.storedGameController = null;
          this.gameScreenController.show();
        } else {
          // Get the configuration for the selected difficulty
          const config = this.getDifficultyConfig(this.gameState.getDifficulty());
          this.gameScreenController.getView().getGroup().remove();
          // creates a new controller with the correct difficulty config
          this.gameScreenController = new QuestionScreenController(this, config);
          // add the new view to the layer
          this.layer.add(this.gameScreenController.getView().getGroup());
          // start the question (updates view and shows the screen)
          this.gameScreenController.startQuestion();
        }
        break;
      case "minigame1":
        this.minigame1Controller.show();
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
        this.tutorialScreenController.show();
        break;
    }

    this.current = screen.type;
    this.layer.draw();
  }
}

// Initialize the application
// eslint-disable-next-line no-new
new App("app");
