import Konva from "konva";

import { EndScreenController } from "./screens/EndScreen/EndScreenController.ts";
import { EquationHelpScreenController } from "./screens/EquationHelpScreen/EquationHelpController.ts";
import { MainMenuScreenController } from "./screens/MainMenuScreen/MainMenuScreenController.ts";
import { PauseScreenController } from "./screens/PauseScreen/PauseScreenController.ts";
import { QuestionScreenController } from "./screens/QuestionScreen/QuestionScreenController.ts";
import { Minigame1ScreenController } from "./screens/Minigame1Screen/Minigame1ScreenController.ts";

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

  private readonly mainMenuController: MainMenuScreenController;
  private readonly pauseScreenController: PauseScreenController;
  private readonly gameScreenController: QuestionScreenController;
  private readonly minigame1Controller: Minigame1ScreenController;
  private readonly endScreenController: EndScreenController;
  private readonly equationHelpScreenController: EquationHelpScreenController;

  // track current screen so Esc can toggle game <-> pause
  private current: Screen["type"] = "menu";

  constructor(container: string) {
    // Initialize Konva stage (the main canvas)
    this.stage = new Konva.Stage({
      container,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Create a layer (screens will be added to this layer)
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Initialize all screen controllers
    // Each controller manages a Model, View, and handles user interactions
    this.mainMenuController = new MainMenuScreenController(this);
    this.pauseScreenController = new PauseScreenController(this);
    this.gameScreenController = new QuestionScreenController(this, {
      numOperations: 1,
      maxDenominatorDigits: 2,
      maxNumeratorDigits: 1,
      numChoices: 4,
      operations: ["+", "-"],
    } as QuestionConfig);
    this.minigame1Controller = new Minigame1ScreenController(this);
    this.endScreenController = new EndScreenController(this);
    this.equationHelpScreenController = new EquationHelpScreenController(this);

    // Add all screen groups to the layer
    // All screens exist simultaneously but only one is visible at a time
    this.layer.add(this.mainMenuController.getView().getGroup());
    this.layer.add(this.pauseScreenController.getView().getGroup());
    this.layer.add(this.gameScreenController.getView().getGroup());
    this.layer.add(this.minigame1Controller.getView().getGroup());
    this.layer.add(this.endScreenController.getView().getGroup());
    this.layer.add(this.equationHelpScreenController.getView().getGroup());

    // start on main menu
    this.mainMenuController.show();
    this.pauseScreenController.hide();
    this.minigame1Controller.hide();
    this.endScreenController.hide();
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
    this.gameScreenController.hide();
    this.pauseScreenController.hide();
    this.minigame1Controller.hide();
    this.endScreenController.hide();

    // Show the requested screen based on the screen type
    switch (screen.type) {
      case "menu":
        this.mainMenuController.show();
        break;
      case "pause":
        this.pauseScreenController.show();
        break;
      case "game":
        this.gameScreenController.startQuestion();
        break;
      case "minigame1":
        this.minigame1Controller.show();
        break;
      case "end":
        this.endScreenController.show();
        break;
      case "equation_help":
        this.equationHelpScreenController.show();
    }

    this.current = screen.type;
    this.layer.draw();
  }
}

// Initialize the application
// eslint-disable-next-line no-new
new App("app");
