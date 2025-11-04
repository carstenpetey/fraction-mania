/**
 * Represents a fraction with numerator and denominator
 */
export class Fraction {
  readonly numerator: number;
  readonly denominator: number;

  constructor(numerator: number, denominator: number) {
    if (denominator === 0) throw new Error("Denominator cannot be zero");

    this.numerator = numerator;
    this.denominator = denominator;
  }

  /**
   * Returns a new fraction simplified to lowest terms
   */
  public simplify(): Fraction {
    const gcd = this.gcd(Math.abs(this.numerator), Math.abs(this.denominator));
    const sign = this.denominator < 0 ? -1 : 1;
    return new Fraction((sign * this.numerator) / gcd, (sign * this.denominator) / gcd);
  }

  /**
   * Add another fraction to this one
   */
  public add(other: Fraction): Fraction {
    const newNumerator = this.numerator * other.denominator + other.numerator * this.denominator;
    const newDenominator = this.denominator * other.denominator;
    return new Fraction(newNumerator, newDenominator).simplify();
  }

  /**
   * Subtract another fraction from this one
   */
  public subtract(other: Fraction): Fraction {
    const newNumerator = this.numerator * other.denominator - other.numerator * this.denominator;
    const newDenominator = this.denominator * other.denominator;
    return new Fraction(newNumerator, newDenominator).simplify();
  }

  /**
   * Multiply this fraction by another
   */
  public multiply(other: Fraction) {
    const newNumerator = this.numerator * other.numerator;
    const newDenominator = this.denominator * other.denominator;
    return new Fraction(newNumerator, newDenominator).simplify();
  }

  /**
   * Divide this fraction by another
   */
  public divide(other: Fraction): Fraction {
    if (other.numerator === 0) throw new Error("Cannot divide by zero");

    const newNumerator = this.numerator * other.denominator;
    const newDenominator = this.denominator * other.numerator;
    return new Fraction(newNumerator, newDenominator).simplify();
  }

  /**
   * Convert fraction to decimal (for comparison)
   */
  public toDecimal(): number {
    return this.numerator / this.denominator;
  }

  /**
   * Check if this fraction equals another
   */
  public equals(other: Fraction): boolean {
    const a = this.simplify();
    const b = other.simplify();
    return a.numerator === b.numerator && a.denominator === b.denominator;
  }

  /**
   * Convert fraction to string representation
   */
  public toString(): string {
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * Utility to compute greatest common divisor (GCD) of two numbers
   */
  private gcd(a: number, b: number): number {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }
}
