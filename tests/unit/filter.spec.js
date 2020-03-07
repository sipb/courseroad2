import { FilterGroup, Filter, RegexFilter, MathFilter, BooleanFilter } from '../../src/utilities/filters.js';

function testFilter(FilterType, args) {
  describe('Filters', () => {
    /*
    Testing strategy for matches:

    partition on this.attributeNames.length: = 0, = 1, > 1
    partition on this.mode: 'OR', 'AND'
    partition on subject: matches filter, doesn't match filter
    partition on failing attributes: 0, some, all (!=0)
    */

    // covers this.attributeNames.length = 0, 'OR', doesn't match, 0 failing attributes
    it('lets no subjects match a zero-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, [], 'OR');
      expect(f.matches({y: 8})).toBe(false);
    });

    // covers this.attributeNames.length = 0, 'AND', matches, 0 failing attributes
    it('lets all subjects match a zero-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, [], 'AND');
      expect(f.matches({x: 8, y: 7, z: 9})).toBe(true);
    });

    // covers this.attributeNames.length = 1, 'OR', doesn't match, all failing attributes
    it('fails non-matching subjects against a one-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x'], 'OR');
      expect(f.matches({x: 20, y: 4})).toBe(false);
    });

    // covers this.attributeNames.length = 1, 'OR', matches, 0 failing attributes
    it('passes matching subjects against a one-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['y'], 'OR');
      expect(f.matches({x: 10, y: 7})).toBe(true);
    });

    // covers this.attributeNames.length = 1, 'AND', doesn't match, all failing attributes
    it('fails non-matching subjects against a one-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['z'], 'AND');
      expect(f.matches({x: 'hi', z: 8})).toBe(false);
    });

    // covers this.attributeNames.length = 1, 'AND', matches, 0 failing attributes
    it('passes matching subjects against a one-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x'], 'AND');
      expect(f.matches({x: 7, y: 9})).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'OR', doesn't match, all failing attributes
    it('fails non-matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x', 'y', 'z'], 'OR');
      expect(f.matches({x: 8, y: 10, z: 6, u: 20})).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'OR', matches, some failing attributes
    it('passes semi-matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x', 'y', 'z', 'w'], 'OR');
      expect(f.matches({x: 8, y: 7, z: 10, w: 6})).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'OR', matches, 0 failing attributes
    it('passes matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['a', 'b', 'c'], 'OR');
      expect(f.matches({a: 7, b: 7, c: 7, d: 12})).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'AND', doesn't match, all failing attributes
    it('fails non-matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x', 'y', 'z'], 'AND');
      expect(f.matches({x: 'one', y: 'two', z: 'three'})).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'AND', doesn't match, some failing attributes
    it('fails semi-matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['a', 'b', 'c', 'd'], 'AND');
      expect(f.matches({a: 7, b: 6, c: 7, d: 8})).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'AND', matches, 0 failing attributes
    it('passes matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['p', 'q', 'r', 's'], 'AND');
      expect(f.matches({p: 7, q: 7, r: 7, s: 7, t: 10})).toBe(true);
    });
  });
}

testFilter(Filter, [(x) => x === 7]);
testFilter(RegexFilter, ['^'])


describe('FilterGroup', () => {
  /*
  Hello there
  */
  it('does one thing right', () => {
    let f = new Filter("test", "t", ((x) => x === 7), ['y'], 'AND');
    expect(f.matches({y: 7})).toBeTruthy();
    expect(f.matches({y: 8})).toBeFalsy();
  })
})
