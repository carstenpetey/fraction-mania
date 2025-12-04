import { QuestionService } from "../../services/QuestionService.ts";

import type { Fraction } from "../../models/Fraction.ts";
import type { Question, QuestionConfig } from "../../services/QuestionService";

/**
 * Model manages question state and can generate new questions
 */
export class QuestionScreenModel {
  private currentQuestion: Question;

  /**
   * constructs a new QuestionScreenModel with an initial question
   */
  constructor(question: Question) {
    this.currentQuestion = question;
  }

  /**
   * generates a new question using the provided configuration
   */
  generateNewQuestion(config: QuestionConfig): void {
    this.currentQuestion = QuestionService.generateQuestion(config);
  }

  /**
   * checks if the answer is correct
   */
  checkAnswer(selectedIndex: number): boolean {
    return selectedIndex === this.currentQuestion.correctAnswerIndex;
  }

  /**
   * gets string representation of the current question
   */
  getCurrentExpression(): string {
    return this.currentQuestion.expression;
  }

  /**
   * gets an array of answer choices (fractions) for the current question
   */
  getAnswerChoices(): Fraction[] {
    return this.currentQuestion.choices;
  }
}
