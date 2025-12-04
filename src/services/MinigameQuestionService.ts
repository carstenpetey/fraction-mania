import { Fraction } from "../models/Fraction.ts";

import { DiceService } from "./DiceService.ts";

/**
 * service for generating answer choices for the pizza minigame
 */
export class MinigameQuestionService {
  private static readonly NUM_CHOICES = 4;

  /**
   * generates 4 answer choices for each selection turn in the pizza minigame
   * when current pizza size > 5/8, the exact fraction needed to complete the pizza will be included
   */
  public static generateChoices(
    currentFraction: Fraction,
    availableOptions: Fraction[],
  ): Fraction[] {
    const choices: Fraction[] = [];
    const one = new Fraction(1, 1);

    // for logic to ensure that at some point, the necessary fraction is displayed
    const fiveEighths = new Fraction(5, 8);
    const isMoreThanFiveEighths = currentFraction.toDecimal() > fiveEighths.toDecimal();

    // if more than 5/8 full, guarantee the correct fraction is included
    if (isMoreThanFiveEighths) {
      const remaining = one.subtract(currentFraction);
      choices.push(remaining);
    }

    // fill remaining slots with random options from availableOptions
    while (choices.length < this.NUM_CHOICES) {
      const randomIndex = DiceService.rollDice(availableOptions.length) - 1;
      choices.push(availableOptions[randomIndex]);
    }

    return this.shuffle(choices);
  }

  /**
   * shuffle answer helper method
   * must be called, otherwise the correct answer is always first
   */
  private static shuffle(fractions: Fraction[]): Fraction[] {
    const shuffled = [...fractions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = DiceService.rollDice(i + 1) - 1;
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
}
