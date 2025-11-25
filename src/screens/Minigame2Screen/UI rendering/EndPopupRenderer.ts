// THIS FILE WILL RENDER THE POPUP THAT APPEARS ONCE GAME IS OVER
import Konva from "konva";

// need to know dimensions for design
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants.ts";
// using Mikita's button factory
import { ButtonFactory } from "../../../util/ButtonFactory.ts";

/**
 * class that renders the popup once game ends
 */
export class EndPopupRenderer {
  /**
   * method that creates the popup group
   * @param title title of popup
   * @param message the main message (fail or success)
   * @param onReturn handler that determines what happens when the return button is pressed
   * @param theme determines whether the user beat the game, or the timer ran out
   * @returns popup group to be displayed
   */
  public static createPopup({
    // parameters passed through
    title,
    message,
    onReturn,
    theme = "failure",
  }: {
    // types of the parameters being passed
    title: string;
    message: string;
    onReturn: () => void;
    theme?: "success" | "failure";
    // return type
  }): Konva.Group {
    // defining pop up size
    const W = 600;
    const H = 260;
    const X = STAGE_WIDTH / 2 - W / 2;
    const Y = STAGE_HEIGHT / 2 - H / 2;

    // defining colors
    // if game was beat, colors are green
    const successColors = {
      bg: "#1e3320",
      stroke: "#55ff55",
      title: "#66ff66",
      button: "#00aa00",
      buttonHover: "#008800",
    };

    // if time runs out before game is beat, colors are red
    const failureColors = {
      bg: "#331a1a",
      stroke: "#ff5555",
      title: "#ff6666",
      button: "#cc0000",
      buttonHover: "#990000",
    };

    // if the theme is sucess, popup will see green color palette
    const c = theme === "success" ? successColors : failureColors;

    // creating the group
    const popupGroup = new Konva.Group({
      x: X,
      y: Y,
      visible: true,
      listening: true,
    });

    // background for the popup (size is already determined above)
    const bgRect = new Konva.Rect({
      width: W,
      height: H,
      fill: c.bg,
      stroke: c.stroke,
      strokeWidth: 4,
      cornerRadius: 12,
    });

    // text that displays the title of the game
    const titleText = new Konva.Text({
      x: W / 2,
      y: 20,
      text: title,
      fontSize: 30,
      fontFamily: "Courier New",
      fill: c.title,
      align: "center",
    });

    // centering the text
    titleText.offsetX(titleText.width() / 2);

    // the summary that will be displayed (good if passed, bad if failed)
    const bodyText = new Konva.Text({
      x: W / 2,
      y: 80,
      width: W - 40,
      text: message,
      fontSize: 20,
      fontFamily: "Courier New",
      fill: "white",
      align: "center",
    });
    bodyText.offsetX(bodyText.width() / 2);

    // creating a return button using the button factory
    const returnButton = ButtonFactory.construct()
      .pos(W / 2, H - 40)
      .text("RETURN TO MENU")
      .width(200)
      .height(45)
      .fontSize(22)
      .backColor(c.button)
      .hoverColor(c.buttonHover)
      .onClick(onReturn)
      .build();

    // adding all elements to popup Group
    popupGroup.add(bgRect, titleText, bodyText, returnButton);
    return popupGroup;
  }
}
