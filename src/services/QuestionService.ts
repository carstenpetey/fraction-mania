import { Fraction } from "../models/Fraction";

import { DiceService } from "./DiceService";

export type Operation = "+" | "-" | "*" | "/";

export type QuestionConfig = {
  operations: Operation[];
  numOperations: number;
  maxNumeratorDigits: number;
  maxDenominatorDigits: number;
  numChoices?: number;
  commonDenominator?: boolean;
};

export type Question = {
  expression: string;
  choices: Fraction[];
  correctAnswerIndex: number;
};

export class QuestionService {
  private static readonly defaultConfig: QuestionConfig = {
    operations: ["+", "-", "*", "/"],
    numOperations: 1,
    maxNumeratorDigits: 1,
    maxDenominatorDigits: 1,
    numChoices: 4,
    commonDenominator: true,
  };

  /**
   * Generate a random fraction arithmetic question with answer choices
   */
  public static generateQuestion = (config: Partial<QuestionConfig> = {}): Question => {
    const fullConfig = { ...this.defaultConfig, ...config };

    // generate the expression and compute correct answer
    const { expression, result } = this.generateExpression(fullConfig);

    // generate answer choices
    const choices = this.generateChoices(result, fullConfig.numChoices ?? 4);

    // find where the correct answer ended up after shuffling
    const correctAnswerIndex = choices.findIndex((f) => f.equals(result));

    return {
      expression,
      choices,
      correctAnswerIndex,
    };
  };

  /**
   * Generate a random proper fraction
   */
  private static generateFraction(config: QuestionConfig): Fraction {
    const maxNum = 10 ** config.maxNumeratorDigits - 1;
    const maxDenom = 10 ** config.maxDenominatorDigits - 1;

    // generate denominator first (minimum 2 to allow proper fractions)
    const denominator = Math.max(2, DiceService.rollDice(maxDenom));

    // generate numerator that's smaller than denominator (minimum 1)
    const maxPossibleNum = Math.max(1, Math.min(maxNum, denominator - 1));
    const numerator = DiceService.rollDice(maxPossibleNum);

    return new Fraction(numerator, denominator).simplify();
  }

  /**
   * Generate a random proper fraction with a specific denominator
   */
  private static generateFractionWithDenominator(
    config: QuestionConfig,
    denominator: number,
  ): Fraction {
    // denominator should be at least 2 to allow proper fractions
    denominator = Math.max(2, denominator);

    // maxNum should be at least 1 and less than denominator
    const maxNum = Math.max(1, Math.min(10 ** config.maxNumeratorDigits - 1, denominator - 1));

    const numerator = DiceService.rollDice(maxNum);
    return new Fraction(numerator, denominator).simplify();
  }

  private static generateExpression(config: QuestionConfig): {
    expression: string;
    result: Fraction;
  } {
    const fractions: Fraction[] = [];
    const operations: Operation[] = [];

    // generate common denominator if needed
    let commonDenom: number | undefined;
    if (config.commonDenominator && config.operations.some((op) => op === "+" || op === "-")) {
      const maxDenom = 10 ** config.maxDenominatorDigits - 1;
      commonDenom = DiceService.rollDice(maxDenom);
    }

    // generate required number of operations
    for (let i = 0; i <= config.numOperations; i++) {
      // use common denominator if previous operation is +/- and commonDenominator is true
      const prevOp = i > 0 ? operations[i - 1] : undefined;
      const useCommonDenom =
        config.commonDenominator && (i === 0 || prevOp === "+" || prevOp === "-");

      // generate fraction
      fractions.push(
        useCommonDenom && commonDenom !== undefined
          ? this.generateFractionWithDenominator(config, commonDenom)
          : this.generateFraction(config),
      );

      // generate operation if not the last fraction
      if (i < config.numOperations) {
        const opIndex = DiceService.rollDice(config.operations.length) - 1;
        operations.push(config.operations[opIndex]);
      }
    }

    // build expression string and compute result
    let result = fractions[0];
    let expression = result.toString();

    for (let i = 0; i < operations.length; i++) {
      const next = fractions[i + 1];
      expression += ` ${operations[i]} ${next.toString()}`;

      switch (operations[i]) {
        case "+":
          result = result.add(next);
          break;
        case "-":
          result = result.subtract(next);
          break;
        case "*":
          result = result.multiply(next);
          break;
        case "/":
          result = result.divide(next);
          break;
      }
    }

    return { expression, result };
  }

  /**
   * Generate plausible wrong answers and shuffle with correct answer
   */
  private static generateChoices(correctAnswer: Fraction, numChoices: number): Fraction[] {
    const choices = [correctAnswer];
    let attempts = 0;
    const maxAttempts = 20;

    // generate wrong answers by modifying the correct answer
    while (choices.length < numChoices && attempts < maxAttempts) {
      attempts++;

      // If we've tried too many times with modifications, generate a new fraction
      if (attempts > 10 && choices.length < numChoices) {
        // Ensure denominator is at least 2 and numerator is between 1 and denominator-1
        const denom = Math.max(2, correctAnswer.denominator + choices.length);
        const num = Math.max(1, Math.min(denom - 1, correctAnswer.numerator));
        const newChoice = new Fraction(num, denom).simplify();

        if (!choices.some((c) => c.equals(newChoice))) {
          choices.push(newChoice);
          attempts = 0; // Reset attempts for next choice
          continue;
        }
      }

      const mod = this.generateModification();
      const wrongAnswer = mod(correctAnswer).simplify();

      // Ensure this wrong answer isn't accidentally equal to any existing choice
      if (!choices.some((c) => c.equals(wrongAnswer))) {
        choices.push(wrongAnswer);
        attempts = 0; // Reset attempts for next choice
      }
    }

    // Shuffle the choices
    const shuffled = [...choices];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = DiceService.rollDice(i + 1) - 1;
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    return shuffled;
  }

  /**
   * Generate a function that will modify a fraction to create a wrong answer that is still less than 1
   */
  private static generateModification(): (f: Fraction) => Fraction {
    const modifications = [
      // Increase absolute value of numerator while keeping proper fraction
      (f: Fraction) => {
        const sign = Math.sign(f.numerator);
        const absNum = Math.abs(f.numerator);
        return new Fraction(sign * Math.min(absNum + 1, f.denominator - 1), f.denominator);
      },
      // Decrease absolute value of numerator while avoiding zero
      (f: Fraction) => {
        const sign = Math.sign(f.numerator);
        const absNum = Math.abs(f.numerator);
        return new Fraction(sign * Math.max(1, absNum - 1), f.denominator);
      },
      // Increase denominator
      (f: Fraction) => new Fraction(f.numerator, f.denominator + 1),
      // Use next viable denominator based on absolute numerator
      (f: Fraction) => {
        const absNum = Math.abs(f.numerator);
        return new Fraction(
          f.numerator,
          absNum + 1, // ensures |numerator| < denominator
        );
      },
      // Create equivalent fraction with larger numbers
      (f: Fraction) => new Fraction(f.numerator * 2, f.denominator * 2),
    ];

    const index = DiceService.rollDice(modifications.length) - 1;
    return modifications[index];
  }
}
