import { Fraction } from "../../models/Fraction";

// define the number of asteroids (fractions) for a single rescue path
const ASTEROID_COUNT = 5;

export class SpaceRescueModel {
  // array of fractions displayed on the asteroids
  public asteroids: Fraction[] = [];

  // sequence in which the fractions should be clicked
  private targetOrder: Fraction[] = [];

  // correct index of which asteroid should be clicked
  private currentTargetIndex: number = 0;

  // defining what order the asteroids should be clicked
  public sortOrder: "ascending" | "descending" = "ascending";

  // strike system
  private strikes: number = 0;
  private readonly maxStrikes: number = 3;

  // the constructor is defined to do the same as the reset function below
  constructor() {
    this.reset();
  }

  /**
   * reseting the model to restart the game
   */
  public reset(): void {
    // choosing new order
    this.sortOrder = Math.random() > 0.5 ? "ascending" : "descending";

    // creating new fractions
    this.asteroids = this.generateRandomFractions(ASTEROID_COUNT);
    this.targetOrder = this.sortFractions(this.asteroids, this.sortOrder);

    // reseting the progress so game can be played again
    this.currentTargetIndex = 0;

    this.resetStrikes();
  }

  /**
   * generating a list of random fractions
   * @param count the number of fractions (asteroids) we want
   * @returns list of fraction objects
   */
  private generateRandomFractions(count: number): Fraction[] {
    // storing UNIQUE fractions in a list
    const uniqueFractions: Fraction[] = [];

    // looping until we have count number of unique fractions
    while (uniqueFractions.length < count) {
      // numerator (N): 1 to 18
      const N = Math.floor(Math.random() * 18) + 1;
      // denominator (D): 2 to 9
      const D = Math.floor(Math.random() * 8) + 2;

      // we don't want fractions bigger than 2
      if (N / D > 2) {
        // skip if too large
        continue;
      }

      // create new unique fraction
      const newFraction = new Fraction(N, D).simplify();

      // checking if duplicate
      const isDuplicate = uniqueFractions.some((existingFraction) =>
        existingFraction.equals(newFraction),
      );

      // is unique, push it
      if (!isDuplicate) {
        uniqueFractions.push(newFraction);
      }
    }

    // return unique fractions
    return uniqueFractions;
  }

  /**
   * sorting fractions to create an order in which they should be clicked
   * @param fractions list of randomized fractions
   * @param order which order should they be sorted in
   * @returns sorted list of fractions
   */
  public sortFractions(fractions: Fraction[], order: "ascending" | "descending"): Fraction[] {
    // sorting depending on order
    const sorted = [...fractions].sort((a, b) => {
      const valA = a.toDecimal();
      const valB = b.toDecimal();
      return order === "ascending" ? valA - valB : valB - valA;
    });
    return sorted;
  }

  /**
   * checks if the clicked fraction is the next correct one in the sequence.
   * @param clickedFraction the fraction that is being clicked. will check if it is the correct one
   */
  public checkClick(clickedFraction: Fraction): boolean {
    // taking the expected fraction
    const expectedFraction = this.targetOrder[this.currentTargetIndex];

    //check if parameter is equal to the expected
    if (clickedFraction.equals(expectedFraction)) {
      this.currentTargetIndex++;
      return true;
    }
    return false;
  }

  /**
   * returns the order in which fractions should be clicked
   * @returns list of sorted fractions
   */
  public getTargetOrder(): Fraction[] {
    return this.targetOrder; // Safely exposes the private array
  }

  /**
   * checks if we have gone through all fractions in the list
   * @returns boolean determining if all asteroids have been clicked
   */
  public isRoundComplete(): boolean {
    return this.currentTargetIndex >= this.targetOrder.length;
  }

  /**
   * determines the index of the next asteroid that should be clicked
   * @returns index
   */
  public getNextTargetIndex(): number {
    return this.currentTargetIndex;
  }

  // methods for functioning strike system
  /**
   * adds a strike if clicked on the wrong fraction
   * @returns updated strike number
   */
  public addStrike(): number {
    this.strikes++;
    return this.strikes;
  }

  /**
   * retrieves how many strikes the user currently has
   * @returns how many strikes the user currently has
   */
  public getStrikes(): number {
    return this.strikes;
  }

  /**
   * resets strikes to 0
   */
  public resetStrikes(): void {
    this.strikes = 0;
  }

  /**
   * determines if the user is out of strikes or not
   * @returns true if out of strikes, false otherwise
   */
  public isOutOfStrikes(): boolean {
    return this.strikes >= this.maxStrikes;
  }
}
