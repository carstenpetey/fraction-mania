export type RandomGenerator = {
  /**
   * Generate a random number between 0 and 1 (exclusive)
   */
  next: () => number;
};

export class DefaultGenerator implements RandomGenerator {
  next = () => Math.random();
}

export class DiceService {
  static generator: RandomGenerator = new DefaultGenerator();

  /**
   * Set a custom random number generator
   */
  static setGenerator = (generator: RandomGenerator): void => {
    this.generator = generator;
  };

  /**
   * Reset to the default random number generator
   */
  static resetGenerator = (): void => {
    this.generator = new DefaultGenerator();
  };

  /**
   * Roll a dice with the given number of sides
   */
  static rollDice = (sides: number): number => {
    return Math.floor(this.generator.next() * sides) + 1;
  };
}
