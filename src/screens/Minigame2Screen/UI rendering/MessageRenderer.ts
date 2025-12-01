// THIS FILE RENDERS THE MESSAGE 'ALERTS' PLAYED ON THE SCREEN DURING THE GAME
import Konva from "konva";

// importing proper dimensions
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants.ts";

/**
 * this class renders alert messages that serve as active feedback while the game is being played
 */
export class MessageRenderer {
  private readonly messageText: Konva.Text;
  private timerId: number | undefined;

  /**
   * creates the message text node and initializes its properties.
   * @param parentGroup the group that we will be adding the text to so it can be displayed
   */
  constructor(parentGroup: Konva.Group) {
    // creating new message group
    this.messageText = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 2,
      fontSize: 48,
      fontFamily: "Courier New",
      fill: "#FFD700",
      fontStyle: "bold",
      align: "center",
      visible: false,
      shadowColor: "black",
      shadowBlur: 10,
    });

    // adding to the parent group for display
    parentGroup.add(this.messageText);
  }

  /**
   * displays a message for a specified duration, managing its visibility and timer.
   * @param message the text content to display.
   * @param duration the time in milliseconds to display the message.
   */
  public displayMessage(message: string, duration: number): void {
    // clearing any timer
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
    }

    // updating the text content
    this.messageText.text(message);

    // centering
    this.messageText.offsetX(this.messageText.width() / 2);
    this.messageText.offsetY(this.messageText.height() / 2);

    // making sure the text is visible
    this.messageText.visible(true);
    this.messageText.getLayer()?.draw();

    // we don't want the message to appear permanently, so set up a timer for its lifespan
    this.timerId = window.setTimeout(() => {
      this.messageText.visible(false);
      this.messageText.getLayer()?.draw();
      this.timerId = undefined;
    }, duration);
  }

  /**
   * @returns the Konva Text node managed by this renderer.
   */
  public getNode(): Konva.Text {
    return this.messageText;
  }
}
