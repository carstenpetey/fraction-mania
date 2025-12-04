import { Fraction } from "../../models/Fraction.ts";

/**
 * Pure game state for the pizza minigame.
 * No Konva, no DOM, only Fractions and simple numbers.
 */
export class PizzaMinigameModel {
  private readonly options: Fraction[];
  private current: Fraction;
  private pizzasCompleted = 0;

  constructor(options: Fraction[]) {
    this.options = options;
    this.current = new Fraction(0, 1);
  }

  getOptions(): Fraction[] {
    return this.options;
  }

  getCurrent(): Fraction {
    return this.current;
  }

  getPizzasCompleted(): number {
    return this.pizzasCompleted;
  }

  resetCounters(): void {
    this.pizzasCompleted = 0;
  }

  /**
   * Reset for a new pizza with a random starting slice.
   * Returns that starting fraction.
   * note: starting pizza size will alwaya be less than 1/4
   */
  resetWithRandomStart(): Fraction {
    this.current = new Fraction(0, 1);
    const quarter = new Fraction(1, 4);
    // Filter options to only include fractions less than 1/4
    const validStarts = this.options.filter((opt) => opt.toDecimal() < quarter.toDecimal());
    const start = validStarts[Math.floor(Math.random() * validStarts.length)];
    this.current = start;
    return start;
  }

  /**
   * Check if adding `slice` would push us over 1.
   * Uses exact Fraction arithmetic.
   */
  canAdd(slice: Fraction): boolean {
    const one = new Fraction(1, 1);
    const next = this.current.add(slice);
    const diff = next.subtract(one); // diff = next - 1, already simplified with positive denom
    return diff.numerator <= 0; // <= 0 means next <= 1
  }

  /**
   * Apply adding a slice (we assume canAdd(slice) was true).
   * Returns previous/next totals and state info.
   */
  addSlice(slice: Fraction): {
    previous: Fraction;
    next: Fraction;
    completed: boolean;
  } {
    const previous = this.current;
    const next = this.current.add(slice);
    this.current = next;

    const one = new Fraction(1, 1);
    const completed = next.equals(one);

    if (completed) {
      this.pizzasCompleted += 1;
    }

    return { previous, next, completed };
  }
}
