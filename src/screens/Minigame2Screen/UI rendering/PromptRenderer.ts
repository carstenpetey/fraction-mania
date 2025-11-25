// THIS FILE RENDERS THE MAIN PROMPT TEXT SHOWN AT THE TOP OF THE SCREEN
import Konva from "konva";

import { STAGE_WIDTH } from "../../../constants";

/**
 * Renders the prompt/instruction text shown during gameplay.
 * SRP: This class creates a single styled text node.
 */
export class PromptRenderer {
  /**
   * Creates the prompt text node.
   * @returns Konva.Text configured for centered top display.
   */
  public static create(): Konva.Text {
    return new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: 50,
      width: STAGE_WIDTH,
      align: "center",
      fontSize: 32,
      fontFamily: "Courier New",
      fill: "white",
      listening: false,
    });
  }
}
