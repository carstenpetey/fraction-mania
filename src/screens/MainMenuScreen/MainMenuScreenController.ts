/**
 * WILL BE COPYING IDEAS AND LAYOUTS FROM LAB
 * AND BUILDING UPON IT
 */
import { ScreenController } from "../../types.ts";

import { MainMenuScreenView } from "./MainMenuScreenView.ts";

import type { Difficulty, GameState } from "../../models/GameState.ts";
import type { ScreenSwitcher } from "../../types.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MainMenuScreenController extends ScreenController {
  private readonly view: MainMenuScreenView;
  private readonly screenSwitcher: ScreenSwitcher;
  private readonly gameState: GameState;

  constructor(screenSwitcher: ScreenSwitcher, gameState: GameState) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.gameState = gameState;
    this.view = new MainMenuScreenView(
      () => this.handleStartClick(),
      () => this.handleHelpClick(),
      (level: string) => this.handleDifficultySelect(level as Difficulty),
      () => this.handleMinigameClick(), // NEW
    );
  }

  /**
   * Handle start button click
   */
  private handleStartClick(): void {
    // once start is pressed, switch to game screen
    this.screenSwitcher.switchToScreen({ type: "board" });
  }

  private handleHelpClick(): void {
    // once help is clicked, send user to learn more
    this.screenSwitcher.switchToScreen({ type: "tutorial" });
  }

  private handleMinigameClick(): void {
    // switch to the minigame screen
    this.screenSwitcher.switchToScreen({ type: "minigame2" });
  }

  private handleDifficultySelect(level: Difficulty): void {
    this.gameState.setDifficulty(level);
    this.view.updateDifficultyDisplay(level);
  }

  public getDifficulty(): Difficulty {
    return this.gameState.getDifficulty();
  }

  /**
   * Get the view
   */
  getView(): MainMenuScreenView {
    return this.view;
  }
}
