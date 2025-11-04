import type { Question } from "../../services/QuestionService";

export class QuestionScreenModel {
  private score: number = 0;

  private currentQuestion: Question;

  constructor(question: Question) {
    this.currentQuestion = question;
  }

  checkAnswer(selectedIndex: number): boolean {
    return selectedIndex === this.currentQuestion.correctAnswerIndex;
  }

  incrementScore(): void {
    this.score++;
  }

  setQuestion(question: Question): void {
    this.currentQuestion = question;
  }

  getCurrentExpression() {
    return this.currentQuestion.expression;
  }
  getAnswerChoices() {
    return this.currentQuestion.choices;
  }
  getScore() {
    return this.score;
  }
}
