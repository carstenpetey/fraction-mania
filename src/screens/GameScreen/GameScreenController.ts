import { ScreenController } from "../../types.ts";

import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";

import type { ScreenSwitcher } from "../../types.ts";

export class GameScreenController extends ScreenController {
  private readonly model: GameScreenModel;
  private readonly view: GameScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super(); // must use this cause GameScreenController extends ScreenController
    this.screenSwitcher = screenSwitcher;
    this.model = new GameScreenModel(); //calls gameScreenModel constructor, gameScreenView constructor
    this.view = new GameScreenView((index) => this.handleAnswerClick(index)); //index is the button that was clicked
    //the line (index)  => this.handleClick(intex) gets passed into GameScreenView, where it is executed
    //note, the constructor is already called in the main.ts so this calls it again when the answer is clicked
  }

  private handleAnswerClick(index: number): void {
    const isCorrect = this.model.checkAnswer(index);

    if (isCorrect) {
      this.model.incrementScore();
    }

    this.view.flashFeedback(isCorrect, index);
  }

  startQuestion(): void {
    this.model.generateNewProblem();
    this.updateView();
    this.show();
  }

  //just for testing
  startGame(): void {
    this.updateView();
    this.show();
  }

  private updateView(): void {
    //for testing
    const expression = this.model.getCurrentExpression();
    const choices = this.model.getAnswerChoices();

    this.view.updateExpression(expression);
    this.view.updateAnswerChoices(choices); //calls methods in view
  }

  getView(): GameScreenView {
    return this.view;
  }
}
