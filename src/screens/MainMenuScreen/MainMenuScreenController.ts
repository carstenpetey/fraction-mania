/**
 * WILL BE COPYING IDEAS AND LAYOUTS FROM LAB
 * AND BUILDING UPON IT
 */
import { ScreenController } from "../../types.ts";

import { MainMenuScreenView } from "./MainMenuScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MainMenuScreenController extends ScreenController {
  private readonly view: MainMenuScreenView;
  private readonly screenSwitcher: ScreenSwitcher;
  private difficulty: string = "EASY";

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.view = new MainMenuScreenView(
      () => this.handleStartClick(),
      () => this.handleHelpClick(),
      (level: string) => this.handleDifficultySelect(level),
      () => this.handleMinigameClick(), // NEW
    );
  }

  /**
   * Handle start button click
   */
  private handleStartClick(): void {
    // once start is pressed, switch to game screen
    this.screenSwitcher.switchToScreen({ type: "game", difficulty: this.difficulty });
  }

  private handleHelpClick(): void {
    // once help is clicked, send user to learn more
    this.screenSwitcher.switchToScreen({ type: "help" });
  }

  private handleMinigameClick(): void {
    // switch to the minigame screen
    this.screenSwitcher.switchToScreen({ type: "minigame1" });
  }

  private handleDifficultySelect(level: string): void {
    this.difficulty = level;
    this.view.updateDifficultyDisplay(level);
  }

  public getDifficulty(): string {
    return this.difficulty;
  }

  /**
   * Get the view
   */
  getView(): MainMenuScreenView {
    return this.view;
  }
}
