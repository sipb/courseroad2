import { BooleanFilter } from "../../../src/utilities/filters.js";

describe("BooleanFilter", () => {
  /*
  Testing strategy

  partition on negated: true, false
  partition on matches: true, false
  */

  // covers negated, matches
  it("passes false values with negated filter", () => {
    const b = new BooleanFilter("test", "t", true, ["a"]);
    expect(b.matches({ a: false })).toBe(true);
  });

  // covers negated, doesn't match
  it("fails true values with negated filter", () => {
    const b = new BooleanFilter("test", "t", true, ["a"]);
    expect(b.matches({ a: true })).toBe(false);
  });

  // covers not negated, matches
  it("passes true values with non-negated filter", () => {
    const b = new BooleanFilter("test", "t", false, ["a"]);
    expect(b.matches({ a: true })).toBe(true);
  });

  // covers not negated, doesn't match
  it("fails false values with non-negated filter", () => {
    const b = new BooleanFilter("test", "t", false, ["a"]);
    expect(b.matches({ a: false })).toBe(false);
  });
});
