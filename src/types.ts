// stripped from lab 3. The idea is that as we add screens, we can update this file,
// so that switching screens becomes easy.
import type { Group } from "konva/lib/Group";

// interface for view
export type View = {
  getGroup: () => Group;
  show: () => void;
  hide: () => void;
};

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "game": Gameplay screen
 * - "help": Tutorial Help screen
 * - "pause": Pause screen
 * - "end": Game over screen
 * - "equation_help": Help with minigame
 * - "tutorial": Beginning tutorial
 */
export type Screen =
  | { type: "menu" }
  | { type: "board" }
  | { type: "game" }
  | { type: "help" }
  | { type: "pause" }
  | { type: "end" }
  | { type: "equation_help" }
  | { type: "minigame1" }
  | { type: "minigame2" }
  | { type: "tutorial" };

export abstract class ScreenController {
  abstract getView(): View;

  show(): void {
    this.getView().show();
  }

  hide(): void {
    this.getView().hide();
  }
}

export type ScreenSwitcher = {
  switchToScreen: (screen: Screen) => void;
  // Returns the currently visible screen type (e.g. 'board', 'game')
  getCurrentScreen: () => Screen["type"];
  // Present the question overlay and return a promise resolved with whether the player passed
  presentQuestion?: () => Promise<boolean>;
};
