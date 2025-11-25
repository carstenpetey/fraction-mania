// writing unit tests for the minigame model
import { beforeEach, describe, expect, it } from "vitest";

// importing fraction and minigame model
import { Fraction } from "../../models/Fraction";
import { SpaceRescueModel } from "../../screens/Minigame2Screen/SpaceRescueModel";

describe("spaceRescueModel", () => {
  let model: SpaceRescueModel;

  beforeEach(() => {
    model = new SpaceRescueModel();
  });

  // making sure we always get 5 asteroids
  it("should generate 5 unique fractions", () => {
    expect(model.asteroids.length).toBe(5);
    const unique = new Set(model.asteroids.map((f) => f.toString()));
    expect(unique.size).toBe(5);
  });

  // making sure the sort function sorts correctly depending on the direction of the sort
  it("should sort fractions correctly ascending", () => {
    model.asteroids = [new Fraction(5, 2), new Fraction(1, 4), new Fraction(3, 2)];

    model.sortOrder = "ascending";

    // sort the fraction
    const sorted = model.sortFractions(model.asteroids, "ascending");

    // manually check if it was sorted correcctly
    expect(sorted.map((f) => f.toDecimal())).toEqual([0.25, 1.5, 2.5]);
  });

  // if we click the correct asteroid, the target index should increment by 1
  it("should increment target index on correct click", () => {
    const correct = model.getTargetOrder()[0];
    expect(model.checkClick(correct)).toBe(true);
    expect(model.getNextTargetIndex()).toBe(1);
  });

  // conversely, clicking the wrong asteroid should keep index the same
  it("should not increment target index on wrong click", () => {
    const wrong = new Fraction(99, 100);
    expect(model.checkClick(wrong)).toBe(false);
    expect(model.getNextTargetIndex()).toBe(0);
  });

  // making sure the add strikes method works properly
  it("should track strikes", () => {
    expect(model.getStrikes()).toBe(0);
    model.addStrike();
    expect(model.getStrikes()).toBe(1);
  });

  // after 3 strikes, the function isOutOfStrikes should return true
  it("should trigger strike-out after 3 strikes", () => {
    model.addStrike();
    model.addStrike();
    model.addStrike();
    expect(model.isOutOfStrikes()).toBe(true);
  });

  // isRoundComplete should return true if all asteroids have been clicked
  it("should detect round completion", () => {
    const order = model.getTargetOrder();
    order.forEach((frac) => model.checkClick(frac));
    expect(model.isRoundComplete()).toBe(true);
  });
});
