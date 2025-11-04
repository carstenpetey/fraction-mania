import { type QuestionConfig, QuestionService } from "../../services/QuestionService.ts";
import { ScreenController } from "../../types.ts";

import { QuestionScreenModel } from "./QuestionScreenModel.ts";
import { QuestionScreenView } from "./QuestionScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

export class QuestionScreenController extends ScreenController {
  private readonly model: QuestionScreenModel;
  private readonly view: QuestionScreenView;
  private readonly questionConfig: QuestionConfig;
  // private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, questionConfig: QuestionConfig) {
    super(); // must use this cause GameScreenController extends ScreenController
    // this.screenSwitcher = screenSwitcher;
    this.questionConfig = questionConfig;

    // generate new question and initialize model
    this.model = new QuestionScreenModel(QuestionService.generateQuestion(this.questionConfig));
    this.view = new QuestionScreenView((index) => this.handleAnswerClick(index)); //index is the button that was clicked
    //the line (index)  => this.handleClick(intex) gets passed into GameScreenView, where it is executed
    //note, the constructor is already called in the main.ts so this calls it again when the answer is clicked
  }

  private handleAnswerClick(index: number): void {
    const isCorrect = this.model.checkAnswer(index);

    if (isCorrect) {
      this.model.incrementScore();
      // After feedback, switch to score screen
      setTimeout(() => {
        this.model.setQuestion(QuestionService.generateQuestion(this.questionConfig));
        this.updateView();
      }, 500);
    }

    this.view.flashFeedback(isCorrect, index);
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
