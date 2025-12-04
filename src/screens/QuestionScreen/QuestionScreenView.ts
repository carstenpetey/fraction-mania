import Konva from "konva";

import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";

import type { Fraction } from "../../models/Fraction.ts";
import type { View } from "../../types.ts";

export class QuestionScreenView implements View {
  private readonly group: Konva.Group;
  private readonly backdrop: Konva.Rect;
  private readonly popupContainer: Konva.Group;
  private expressionText: Konva.Text | undefined;
  private readonly answerButtons: Konva.Group[] = [];
  private readonly answerTexts: Konva.Text[] = [];

  // popup dimensions
  private readonly POPUP_WIDTH = STAGE_WIDTH * 0.7;
  private readonly POPUP_HEIGHT = STAGE_HEIGHT * 0.6;
  private readonly POPUP_X = (STAGE_WIDTH - this.POPUP_WIDTH) / 2;
  private readonly POPUP_Y = (STAGE_HEIGHT - this.POPUP_HEIGHT) / 2;

  /**
   * constructs new QuestionScreenView
   */
  constructor(onAnswerClick: (index: number) => void, onHelpClick: () => void) {
    // initializes the main group (hidden by default)
    this.group = new Konva.Group({ visible: false });

    // calls createBackdrop function to dim the board behimd the popup
    this.backdrop = this.createBackdrop();

    // create container for the popup
    this.popupContainer = this.createPopupContainer();

    // adds backdrop and popup to main group
    this.group.add(this.backdrop);
    this.group.add(this.popupContainer);

    // adds view components to question popup
    this.createExpressionBox();
    this.createAnswerButtons(onAnswerClick);
    this.createHelpButton(onHelpClick);
  }

  /**
   * creates the backdrop overlay that dims the board behind the popup
   */
  private createBackdrop(): Konva.Rect {
    const backdrop = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "black",
      opacity: 0.5, // semi-transparent to dim the board
      listening: true, // block clicks to board behind popup
    });
    return backdrop;
  }

  /**
   * creates the main container for the question popup
   */
  private createPopupContainer(): Konva.Group {
    const container = new Konva.Group({
      x: this.POPUP_X,
      y: this.POPUP_Y,
    });

    // create background for question popup
    const popupBackground = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.POPUP_WIDTH,
      height: this.POPUP_HEIGHT,
      fill: "white",
      stroke: "black",
      strokeWidth: 3,
      cornerRadius: 10,
      shadowColor: "black",
      shadowBlur: 20,
      shadowOpacity: 0.5,
      shadowOffset: { x: 0, y: 5 },
    });

    container.add(popupBackground);
    return container;
  }

  /**
   * creates display box for the question
   */
  private createExpressionBox(): void {
    const boxWidth = this.POPUP_WIDTH * 0.5;
    const boxHeight = 120;
    const boxX = (this.POPUP_WIDTH - boxWidth) / 2;
    const boxY = this.POPUP_HEIGHT * 0.15;

    const box = new Konva.Rect({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      cornerRadius: 10,
    });
    this.popupContainer.add(box);

    this.expressionText = new Konva.Text({
      x: this.POPUP_WIDTH / 2,
      y: boxY + boxHeight / 2,
      fontSize: 32,
      fontFamily: "Arial",
      fill: "black",
      align: "center",
    });

    this.expressionText.offsetX(this.expressionText.width() / 2);
    this.expressionText.offsetY(this.expressionText.height() / 2);
    this.popupContainer.add(this.expressionText);
  }

  /**
   * creates four answer choice buttons, each button displays a fraction and
   * triggers the onAnswerClick callback when clicked
   */
  private createAnswerButtons(onAnswerClick: (index: number) => void): void {
    const buttonWidth = this.POPUP_WIDTH * 0.18;
    const buttonHeight = 80;
    const spacing = this.POPUP_WIDTH * 0.02;

    // calculate starting X position to center all buttons within popup
    const totalWidth = 4 * buttonWidth + 3 * spacing;
    const startX = (this.POPUP_WIDTH - totalWidth) / 2;
    const yPos = this.POPUP_HEIGHT * 0.55;

    for (let i = 0; i < 4; i++) {
      const buttonGroup = new Konva.Group();

      const button = new Konva.Rect({
        x: startX + i * (buttonWidth + spacing),
        y: yPos,
        width: buttonWidth,
        height: buttonHeight,
        fill: "white",
        stroke: "black",
        strokeWidth: 2,
        cornerRadius: 10,
      });
      buttonGroup.add(button);

      const answerText = new Konva.Text({
        x: startX + i * (buttonWidth + spacing) + buttonWidth / 2,
        y: yPos + buttonHeight / 2,
        text: "?/?",
        fontSize: 24,
        fontFamily: "Arial",
        fill: "black",
        align: "center",
      });
      answerText.offsetX(answerText.width() / 2);
      answerText.offsetY(answerText.height() / 2);
      buttonGroup.add(answerText);
      this.answerTexts.push(answerText);

      // attach click handler that calls the callback with this button's index
      buttonGroup.on("click", () => onAnswerClick(i));

      // store button group for later reference (feedback flashing)
      this.answerButtons.push(buttonGroup);
      this.popupContainer.add(buttonGroup);
    }
  }

  // creating a help button so that users can get a refresher as to how to solve certain equations
  // meant to teach users process, not give answers away
  private createHelpButton(onHelpClick: () => void): void {
    const HELP_BUTTON_WIDTH = 150;
    const HELP_BUTTON_HEIGHT = 60;
    const helpButtonGroup = new Konva.Group();

    // position button at bottom center of popup
    const buttonX = (this.POPUP_WIDTH - HELP_BUTTON_WIDTH) / 2;
    const buttonY = this.POPUP_HEIGHT * 0.85;

    const helpButton = new Konva.Rect({
      x: buttonX,
      y: buttonY,
      width: HELP_BUTTON_WIDTH,
      height: HELP_BUTTON_HEIGHT,
      fill: "#EEE",
      stroke: "black",
      strokeWidth: 2,
      cornerRadius: 10,
    });

    const helpText = new Konva.Text({
      x: buttonX + HELP_BUTTON_WIDTH / 2,
      y: buttonY + HELP_BUTTON_HEIGHT / 2,
      text: "HELP",
      fontSize: 28,
      fill: "black",
      align: "center",
    });
    helpText.offsetX(helpText.width() / 2);
    helpText.offsetY(helpText.height() / 2);

    helpButtonGroup.add(helpButton, helpText);

    // attaching handler
    helpButtonGroup.on("click", onHelpClick);

    this.popupContainer.add(helpButtonGroup);
  }

  /**
   * updates the displayed question
   */
  updateExpression(expression: string): void {
    if (this.expressionText) {
      this.expressionText.text(expression);
      // re-center the text after updating in case width changed
      this.expressionText.offsetX(this.expressionText.width() / 2);
      this.expressionText.offsetY(this.expressionText.height() / 2);
    }
  }

  /**
   * updates the answer choices
   */
  updateAnswerChoices(choices: Fraction[]): void {
    choices.forEach((choice, i) => {
      if (this.answerTexts[i]) {
        this.answerTexts[i].text(choice.toString());
        this.answerTexts[i].offsetX(this.answerTexts[i].width() / 2);
        this.answerTexts[i].offsetY(this.answerTexts[i].height() / 2);
      }
    });
  }

  /**
   * flashes the answer choice green for correct answers or red for incorrect
   */
  flashFeedback(isCorrect: boolean, buttonIndex: number): void {
    const button = this.answerButtons[buttonIndex];
    const rect = button.findOne("Rect") as Konva.Rect;

    if (rect) {
      // save the original color
      const originalFill = rect.fill();
      // change to green or red
      rect.fill(isCorrect ? "lightgreen" : "lightcoral");
      rect.getLayer()?.draw();

      // restore original color after 500ms
      setTimeout(() => {
        rect.fill(originalFill);
        rect.getLayer()?.draw();
      }, 500);
    }
  }

  /**
   * makes question screen visible, required by the View interface
   */
  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  /**
   * hides the question screen, required by the View interface
   */
  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }

  /**
   * returns the konva group containing all view elements, equired by the View interface
   */
  getGroup(): Konva.Group {
    return this.group;
  }
}
