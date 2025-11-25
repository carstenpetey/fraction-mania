import Konva from "konva";

import { FONT_FAMILY } from "../../constants.ts";

import type { View } from "../../types.ts";

/**
 * TutorialScreenView - Renders the game UI using Konva
 */
export class TutorialScreenView implements View {
  private readonly root: Konva.Group;
  private readonly title: Konva.Text;
  private readonly text: Konva.Text;
  private readonly buttonGroup: Konva.Group;
  private readonly btnRect: Konva.Rect;
  private readonly btnText: Konva.Text;

  constructor(stageWidth: number, stageHeight: number, onReturn: () => void) {
    this.root = new Konva.Group({ visible: false });

    // Game Over
    this.title = new Konva.Text({
      text: "HOW TO PLAY",
      fontFamily: FONT_FAMILY,
      fontSize: 48,
      fontStyle: "bold",
      align: "center",
      x: 0,
      width: stageWidth,
      y: stageHeight / 2 - 200,
    });

    // Tutorial instructions
    this.text = new Konva.Text({
      text:
        "Hello Player!\n\n" +
        "Welcome to Fraction Mania!" +
        " Your mission is to navigate through the paths, and pass the obstacles.\n\n" +
        "At each point you will be tasked with a minigame, complete it to progress.\n\n" +
        "Reach the finish, or be trapped forever!\n\n",
      fontSize: 20,
      fontFamily: FONT_FAMILY,
      align: "center",
      x: 0,
      width: stageWidth,
      y: stageHeight / 2 - 50,
    });

    // Close button
    const btnWidth = 260;
    const btnHeight = 48;
    const btnX = 10;
    const btnY = 10;

    this.btnRect = new Konva.Rect({
      x: btnX,
      y: btnY,
      width: btnWidth,
      height: btnHeight,
      cornerRadius: 8,
      strokeWidth: 1,
      stroke: "black",
      fillEnabled: false,
    });

    this.btnText = new Konva.Text({
      x: btnX,
      y: btnY + (btnHeight - 20) / 2,
      width: btnWidth,
      text: "CLOSE",
      fontSize: 20,
      align: "center",
    });

    this.buttonGroup = new Konva.Group({
      listening: true,
    });
    this.buttonGroup.add(this.btnRect);
    this.buttonGroup.add(this.btnText);

    this.root.add(this.title);
    this.root.add(this.text);
    this.root.add(this.buttonGroup);

    this.buttonGroup.on("click tap", onReturn);
  }

  /**
   * Show the screen
   */
  show(): void {
    this.root.visible(true);
  }

  /**
   * Hide the screen
   */
  hide(): void {
    this.root.visible(false);
  }

  getGroup(): Konva.Group {
    return this.root;
  }
}
