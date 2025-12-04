import { type QuestionConfig, QuestionService } from "../../services/QuestionService.ts";
import { ScreenController } from "../../types.ts";

import { QuestionScreenModel } from "./QuestionScreenModel.ts";
import { QuestionScreenView } from "./QuestionScreenView.ts";

import type { GameState } from "../../models/GameState.ts";
import type { ScreenSwitcher } from "../../types.ts";

export class QuestionScreenController extends ScreenController {
  private readonly model: QuestionScreenModel;
  private readonly view: QuestionScreenView;
  private readonly questionConfig: QuestionConfig;
  private readonly screenSwitcher: ScreenSwitcher;
  private readonly gameState: GameState;
  private readonly onComplete?: (passed: boolean) => void;

  // private readonly screenSwitcher: ScreenSwitcher;

  constructor(
    screenSwitcher: ScreenSwitcher,
    questionConfig: QuestionConfig,
    gameState: GameState,
    onComplete?: (passed: boolean) => void,
  ) {
    super(); // must use this cause GameScreenController extends ScreenController
    // this.screenSwitcher = screenSwitcher;
    this.questionConfig = questionConfig;
    this.screenSwitcher = screenSwitcher;
    this.gameState = gameState;
    this.onComplete = onComplete;

    // generate new question and initialize model
    this.model = new QuestionScreenModel(QuestionService.generateQuestion(this.questionConfig));
    this.view = new QuestionScreenView(
      (index) => this.handleAnswerClick(index),
      () => this.handleHelpClick(),
    );
    //index is the button that was clicked
    //the line (index)  => this.handleClick(intex) gets passed into GameScreenView, where it is executed
    //note, the constructor is already called in the main.ts so this calls it again when the answer is clicked
  }

  private handleAnswerClick(index: number): void {
    const isCorrect = this.model.checkAnswer(index);

    // record result
    this.gameState.setPassedQuestion(isCorrect);

    this.view.flashFeedback(isCorrect, index);

    // hide popup after feedback and notify caller if provided
    setTimeout(() => {
      this.view.hide();
      if (this.onComplete) {
        this.onComplete(isCorrect);
      }
    }, 500);
  }

  // making sure that help button leads to right place
  private handleHelpClick(): void {
    this.screenSwitcher.switchToScreen({ type: "equation_help" });
  }

  startQuestion(): void {
    this.updateView();
    this.show();
  }

  private updateView(): void {
    const expression = this.model.getCurrentExpression();
    const choices = this.model.getAnswerChoices();

    this.view.updateExpression(expression);
    this.view.updateAnswerChoices(choices);
  }

  getView(): QuestionScreenView {
    return this.view;
  }
}
