// THIS FILE RENDERS THE POPUP THAT APPEARS UPON ENTERING THE GAME
import Konva from "konva";

// importing dimensions and button factory
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants.ts";
import { ButtonFactory } from "../../../util/ButtonFactory.ts";

/**
 * renders the popup that displays upon entering game
 */
export class IntroPopupRenderer {
  /**
   * creates popup to be displayed
   * @param onStart defines what happens when the start button is pressed
   * @returns the group that defines the popup to be displayed
   */
  public static createPopup(onStart: () => void): Konva.Group {
    // use the same dimensions for popup
    const W = 600;
    const H = 300;
    const X = STAGE_WIDTH / 2 - W / 2;
    const Y = STAGE_HEIGHT / 2 - H / 2;

    // creating group to place text
    const dialogueGroup = new Konva.Group({
      x: X,
      y: Y,
      visible: true,
      listening: true,
    });

    // creating background
    const bgRect = new Konva.Rect({
      width: W,
      height: H,
      fill: "#333366",
      stroke: "#FFFFFF",
      strokeWidth: 4,
      cornerRadius: 10,
    });

    // adding title
    const missionText = new Konva.Text({
      x: W / 2,
      y: 20,
      text: "MISSION: ASTEROID CLEARANCE",
      fontSize: 28,
      fontFamily: "Courier New",
      fill: "#FFD700",
      align: "center",
    });
    missionText.offsetX(missionText.width() / 2);

    // adding instructions
    const instructionText = new Konva.Text({
      x: W / 2,
      y: 80,
      text: "Mission control here! Your ship can’t move because a squad of fussy asteroids is hogging the space lanes. They claim they’ll let you pass only if you click them in the proper order. Humor them, clear the path, and save the mission before the time runs out!",
      width: W - 40,
      fontSize: 20,
      fontFamily: "Courier New",
      fill: "white",
      align: "center",
    });
    instructionText.offsetX(instructionText.width() / 2);

    // creating start button using button factory
    const startButton = ButtonFactory.construct()
      .pos(W / 2, H - 30)
      .text("BEGIN RESCUE")
      .backColor("#00CC00")
      .hoverColor("#009900")
      .width(180)
      .height(40)
      .fontSize(20)
      .onClick(onStart)
      .build();

    // adding all elements to the dialogue group
    dialogueGroup.add(bgRect, missionText, instructionText, startButton);

    // returning the group
    return dialogueGroup;
  }
}
