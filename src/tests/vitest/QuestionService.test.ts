// importing describe, expect, it (same as lab)
import { describe, expect, it } from "vitest";

// importing fraction and question service to test equation generation
import { Fraction } from "../../models/Fraction";
import { QuestionService } from "../../services/QuestionService";

import type { QuestionConfig } from "../../services/QuestionService";

// defining number of times we will randomly generate a question
const NUM_TEST_ITERATIONS = 100;

// validating the to make sure the service runs properly
describe("questionService Integration Tests (Validation)", () => {
  const runTestRepeatedly = (name: string, testFn: () => void) => {
    for (let i = 0; i < NUM_TEST_ITERATIONS; i++) {
      it(`${name} (Run ${i + 1})`, testFn);
    }
  };

  // checking that the service generates a correct answer
  runTestRepeatedly("should always include the correct answer among the choices", () => {
    // generating a random question
    const question = QuestionService.generateQuestion({});

    // extracting the correct answer
    const actualCorrectAnswer = question.choices[question.correctAnswerIndex];

    // edge case: making sure the index to the correct answer is a valid index
    expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0);
    expect(question.correctAnswerIndex).toBeLessThan(question.choices.length);

    // by nature of our equation screen, we want the number of choices to be 4
    expect(question.choices.length).toBe(4);

    // making sure the correct answer is a fraction object
    expect(actualCorrectAnswer).toBeInstanceOf(Fraction);
  });

  // making sure the choices are unique
  runTestRepeatedly("should generate unique incorrect answers", () => {
    // creating a new question object
    const question = QuestionService.generateQuestion({});

    // extracting the choices
    const choices = question.choices;

    // creating a set to keep track of all unique choices
    const uniqueFractions = new Set();

    // convert each fraction in the choices to its simplified version, and add it to unique fractions
    choices.forEach((f) => uniqueFractions.add(f.simplify().toString()));

    // checking is the size of the set is equal to the size of the number of choices
    expect(uniqueFractions.size).toBe(choices.length);
  });

  // making sure format of the expression is valid
  runTestRepeatedly("should generate a valid single-operation expression format", () => {
    // creating question and generating random question
    const question = QuestionService.generateQuestion({ numOperations: 1 });

    // Expected format: "X/Y [+-*/] Z/W"
    // This regex checks for two fractions separated by an operation
    const expressionRegex = /^\d+\/\d+ [+\-*/] \d+\/\d+$/;

    expect(question.expression).toMatch(expressionRegex);
  });

  // testing if configuration works as expected
  it("should generate a question using custom configuration (only multiplication)", () => {
    // configuration to force multiplication
    const config: Partial<QuestionConfig> = {
      operations: ["*"],
      numOperations: 1,
      commonDenominator: false,
    };

    // running multiple times to ensure operation is always multiply
    for (let i = 0; i < 20; i++) {
      // generating new question based on config
      const question = QuestionService.generateQuestion(config);

      // making sure expression contains multiply
      expect(question.expression).toContain("*");

      // making sure we don't see a different operation
      expect(question.expression).not.toContain("+");
      expect(question.expression).not.toContain("-");
    }
  });

  // making sure no errors are thrown
  // it("should throw an error if there is ever an error (division by 0)", () => {
  //   // since the QuestionService relies on the robust Fraction model,
  //   // this test primarily checks that the QuestionService doesn't accidentally violate Fraction's rules.

  //   // making sure that no error is thrown
  //   expect(() => {
  //     // Run many times to rely on randomness potentially triggering edge cases
  //     for (let i = 0; i < 50; i++) {
  //       QuestionService.generateQuestion({
  //         operations: ["/"],
  //         maxNumeratorDigits: 1,
  //         maxDenominatorDigits: 1,
  //       });
  //     }
  //   }).not.toThrow();
  // });

  // making sure all choices are simplified and not the same as the correct answer
  it("should ensure all choices are simplified and not equal to the correct answer", () => {
    // looping multiple times to ensure extra security
    for (let i = 0; i < 50; i++) {
      // generating new question object
      const question = QuestionService.generateQuestion({});

      // extracting correct answer
      const correctAnswer = question.choices[question.correctAnswerIndex];

      // checking each of the choices
      question.choices.forEach((choice, index) => {
        // checking if choice is simplified
        const simplifiedChoice = choice.simplify();
        expect(choice.numerator).toBe(simplifiedChoice.numerator);
        expect(choice.denominator).toBe(simplifiedChoice.denominator);

        // checking if all other choices are not equal to the correct answer
        if (index !== question.correctAnswerIndex) {
          expect(choice.equals(correctAnswer)).toBe(false);
        }
      });
    }
  });
});
