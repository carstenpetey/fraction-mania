import { type QuestionConfig, QuestionService } from "../../services/QuestionService.ts";
import { ScreenController } from "../../types.ts";

import { QuestionScreenModel } from "./QuestionScreenModel.ts";
import { QuestionScreenView } from "./QuestionScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

export class QuestionScreenController extends ScreenController {
  private readonly model: QuestionScreenModel;
  private readonly view: QuestionScreenView;
  private readonly questionConfig: QuestionConfig;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, questionConfig: QuestionConfig) {
    super();
    this.questionConfig = questionConfig;
    this.screenSwitcher = screenSwitcher;

    // initialize model with first question
    this.model = new QuestionScreenModel(QuestionService.generateQuestion(this.questionConfig));
    // intializes the view with callback handlers for user interactions
    this.view = new QuestionScreenView(
      (index) => this.handleAnswerClick(index),
      () => this.handleHelpClick(),
    );
  }

  /**
   * handles click on answer choice
   */
  private handleAnswerClick(index: number): void {
    // index represents the answer choice that was clicked
    const isCorrect = this.model.checkAnswer(index);

    if (isCorrect) {
      // delays switching screens so the user can see feedback
      setTimeout(() => {
        this.screenSwitcher.switchToScreen({ type: "board" });
      }, 500);
    }

    this.view.flashFeedback(isCorrect, index);
  }

  /**
   * handles click on help button
   */
  private handleHelpClick(): void {
    this.screenSwitcher.switchToScreen({ type: "equation_help" });
  }

  /**
   * generates a new question and updates the view
   */
  generateNewQuestion(config: QuestionConfig): void {
    this.model.generateNewQuestion(config);
    this.updateView();
  }

  /**
   * calls updateView() which updates the question, then shows the view
   */
  startQuestion(): void {
    this.updateView();
    this.show();
  }

  /**
   * updates the view with the current question
   */
  private updateView(): void {
    const expression = this.model.getCurrentExpression();
    const choices = this.model.getAnswerChoices();

    this.view.updateExpression(expression);
    this.view.updateAnswerChoices(choices);
  }

  /**
   * returns the view instance
   */
  getView(): QuestionScreenView {
    return this.view;
  }
}
