import Konva from "konva";

import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";

import type { Fraction } from "../../models/Fraction.ts";
import type { View } from "../../types.ts";

export class QuestionScreenView implements View {
  private readonly group: Konva.Group;
  private expressionText: Konva.Text | undefined;
  private readonly answerButtons: Konva.Group[] = [];
  private readonly answerTexts: Konva.Text[] = [];

  constructor(onAnswerClick: (index: number) => void, onHelpClick: () => void) {
    this.group = new Konva.Group({ visible: false });

    this.createExpressionBox();
    this.createAnswerButtons(onAnswerClick);

    this.createHelpButton(onHelpClick);
  }

  //creates a white box for the expression
  private createExpressionBox(): void {
    const box = new Konva.Rect({
      x: STAGE_WIDTH / 2 - 200,
      y: STAGE_HEIGHT / 5 - 50,
      width: 400,
      height: 150,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
    });
    this.group.add(box);

    //placeholder, this will be changed by generate question
    this.expressionText = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 5,
      fontSize: 32,
      fontFamily: "Arial",
      fill: "black",
      align: "center",
    });

    this.expressionText.offsetX(this.expressionText.width() / 2);
    this.group.add(this.expressionText);
  }

  private createAnswerButtons(onAnswerClick: (index: number) => void): void {
    const buttonWidth = 150;
    const buttonHeight = 100;
    const spacing = 20;
    const startX = (STAGE_WIDTH - (4 * buttonWidth + 3 * spacing)) / 2;
    const yPos = (STAGE_HEIGHT * 3) / 5;

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
      });
      buttonGroup.add(button);

      // Placeholder text for answer
      const answerText = new Konva.Text({
        x: startX + i * (buttonWidth + spacing) + buttonWidth / 2,
        y: yPos + buttonHeight / 2 - 10,
        text: "?/?",
        fontSize: 24,
        fontFamily: "Arial",
        fill: "black",
        align: "center",
      });
      answerText.offsetX(answerText.width() / 2);
      buttonGroup.add(answerText);
      this.answerTexts.push(answerText);

      buttonGroup.on("click", () => onAnswerClick(i)); // creates a handlder for each OnAnswerClick(i)

      this.answerButtons.push(buttonGroup); //adds buttons to empty array defined at top
      this.group.add(buttonGroup);
    }
  }

  // creating a help button so that users can get a refresher as to how to solve certain equations
  // meant to teach users process, not give answers away
  private createHelpButton(onHelpClick: () => void): void {
    // determining dimensions for help button
    const HELP_BUTTON_WIDTH = 150;
    const HELP_BUTTON_HEIGHT = 70;
    const helpButtonGroup = new Konva.Group();

    // desigining the button
    const helpButton = new Konva.Rect({
      x: STAGE_WIDTH / 2 + HELP_BUTTON_WIDTH / 2,
      y: (STAGE_HEIGHT * 4) / 5,
      width: HELP_BUTTON_WIDTH,
      height: HELP_BUTTON_HEIGHT,
      fill: "#EEE",
      stroke: "black",
      cornerRadius: 5,
    });

    helpButton.offsetX(HELP_BUTTON_WIDTH);

    // text that goes inside the button
    const helpText = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: (STAGE_HEIGHT * 4) / 5 + HELP_BUTTON_HEIGHT / 4, // Vertically centered
      text: "HELP",
      fontSize: 36,
      fill: "black",
      align: "center",
    });
    helpText.offsetX(helpText.width() / 2);

    // adding button to the group
    helpButtonGroup.add(helpButton, helpText);

    // attaching handler
    helpButtonGroup.on("click", onHelpClick);

    this.group.add(helpButtonGroup);
  }

  updateExpression(expression: string): void {
    //parameters for updateExpression function
    this.expressionText?.text(expression); //makes expression text
    this.expressionText?.offsetX(this.expressionText.width() / 2);
  }

  updateAnswerChoices(choices: Fraction[]): void {
    //takes in array of answer choices
    choices.forEach((choice, i) => {
      if (this.answerTexts[i]) {
        this.answerTexts[i].text(`${choice.numerator}/${choice.denominator}`); //updates accordingly
        this.answerTexts[i].offsetX(this.answerTexts[i].width() / 2);
      }
    });
  }

  flashFeedback(isCorrect: boolean, buttonIndex: number): void {
    const button = this.answerButtons[buttonIndex]; //get button that was pressed
    const rect = button.findOne("Rect") as Konva.Rect; //finds konva rectangle inside the button

    if (rect) {
      //only proceed if rectangle exists

      const originalFill = rect.fill(); //save original color
      rect.fill(isCorrect ? "lightgreen" : "lightcoral");
      rect.getLayer()?.draw(); //re-renders the rectangle in correct/incorrect color(if it exists, which it should)

      setTimeout(() => {
        rect.fill(originalFill);
        rect.getLayer()?.draw();
      }, 500); //after 500ms changes back to original color
    }
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
