// importing describe, expect (same as lab)
import { describe, expect, it } from "vitest";

// importing fraction for testing
import { Fraction } from "../../models/Fraction";

describe("fraction Model Arithmetic", () => {
  // testing toString function
  it("should correctly initialize and represent the fraction as a string", () => {
    // initializing new fraction
    const f = new Fraction(1, 2);

    // making sure numerator and denominator were correctly set
    expect(f.numerator).toBe(1);
    expect(f.denominator).toBe(2);

    // making sure the string formed correctly
    expect(f.toString()).toBe("1/2");
  });

  // testing simplification method
  it("should simplify fractions to their lowest terms (4/6 becomes 2/3)", () => {
    // creating new fraction object
    const f = new Fraction(4, 6);

    // calling simplify method
    const simplified = f.simplify();

    // making sure simplify correctly sets numerator and denominator
    expect(simplified.numerator).toBe(2);
    expect(simplified.denominator).toBe(3);

    // making sure fraction was correctly simplified to 2/3
    expect(simplified.toString()).toBe("2/3");
  });

  // testing add method
  it("should correctly add fractions with common denominators", () => {
    // creating 2 new functions (like denominators)
    const f1 = new Fraction(1, 5);
    const f2 = new Fraction(3, 5);

    // adding the two fractions
    const result = f1.add(f2);

    // we should expect 4/5
    expect(result.toString()).toBe("4/5");
  });

  // testing add, but the answer needs to be simplified
  it("should add and simplify the result (1/4 + 1/4 = 1/2)", () => {
    // creating two fraction objects
    const f1 = new Fraction(1, 4);
    const f2 = new Fraction(1, 4);

    // adding the two fractions (2/4)
    const result = f1.add(f2);

    // checking if 2/4 was simplified to 1/2
    expect(result.toString()).toBe("1/2");
  });

  // testing add, but the answer needs to be simplified
  it("should add and simplify the result (2/6 + 1/3 = 2/3)", () => {
    // creating two fraction objects
    const f1 = new Fraction(2, 6);
    const f2 = new Fraction(1, 3);

    // adding the two fractions should be (4/6)
    const result = f1.add(f2);

    // checking if 4/6 was simplified to 2/3
    expect(result.toString()).toBe("2/3");
  });

  // testing the subtract method
  it("should correctly subtract and simplify the result (5/6 - 1/6 = 2/3)", () => {
    // creating two fraction objects
    const f1 = new Fraction(5, 6);
    const f2 = new Fraction(1, 6);

    // calling the subtract should be (4/6)
    const result = f1.subtract(f2);

    // checking if 4/6 was simplified to 2/3
    expect(result.toString()).toBe("2/3");
  });

  // testing the multiplication method
  it("should correctly multiply fractions (2/3 * 3/4 = 1/2)", () => {
    // creating two fraction objects
    const f1 = new Fraction(2, 3);
    const f2 = new Fraction(3, 4);

    // caling multiply, should be (6/12)
    const result = f1.multiply(f2);

    // checking if 6/12 was simplified to 1/2
    expect(result.toString()).toBe("1/2");
  });

  // testing the divide method
  it("should correctly divide fractions (2/3 / 1/2 = 4/3)", () => {
    // creating two fraction objects
    const f1 = new Fraction(2, 3);
    const f2 = new Fraction(1, 2);

    // calling divide. should be (4/3)
    const result = f1.divide(f2);

    // checking if 4/3 was correctly achieved
    expect(result.toString()).toBe("4/3");
  });

  // testing equals method
  it("should return true for equal, simplified, or unsimplified equivalent fractions", () => {
    // creating 3 fractions
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(2, 4);
    const f3 = new Fraction(1, 3);

    // checking if fractions are equal
    expect(f1.equals(f2)).toBe(true);
    expect(f1.equals(f3)).toBe(false);
  });

  // checking incorrect fraction initiailization
  it("should throw an error when initialized with a zero denominator", () => {
    // Use a function wrapper for expect.toThrow()
    expect(() => new Fraction(1, 0)).toThrow("Denominator cannot be zero");
  });
});
