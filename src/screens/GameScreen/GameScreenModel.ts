export class GameScreenModel {
  private score: number = 0;

  private readonly currentExpression = {
    fraction1: { numerator: 1, denominator: 2 },
    fraction2: { numerator: 1, denominator: 4 },
    operator: "+" as "+" | "-" | "*" | "/",
  };
  private readonly answerChoices = [
    { numerator: 3, denominator: 4 }, // Correct answer
    { numerator: 1, denominator: 2 },
    { numerator: 2, denominator: 3 },
    { numerator: 1, denominator: 8 },
  ];
  private readonly correctAnswerIndex = 0;

  constructor() {
    // Just dummy data for now
  }

  generateNewProblem(): void {
    // TODO
  }

  checkAnswer(selectedIndex: number): boolean {
    return selectedIndex === this.correctAnswerIndex;
  }

  incrementScore(): void {
    this.score++;
  }

  getCurrentExpression() {
    return this.currentExpression;
  }
  getAnswerChoices() {
    return this.answerChoices;
  }
  getScore() {
    return this.score;
  }
}
