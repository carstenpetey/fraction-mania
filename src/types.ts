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
 */
export type Screen = { type: "menu" } | { type: "game" } | { type: "help" } | { type: "pause" };

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
};
