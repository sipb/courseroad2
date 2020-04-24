import { Filter, RegexFilter, MathFilter, BooleanFilter } from '../../../src/utilities/filters.js';

function testFilter (FilterType, args, matching, nonmatching) {
  const m1 = matching[0];
  const m2 = matching[1 % matching.length];
  const m3 = matching[2 % matching.length];
  const m4 = matching[3 % matching.length];
  const m5 = matching[4 % matching.length];

  const n1 = nonmatching[0];
  const n2 = nonmatching[1 % nonmatching.length];
  const n3 = nonmatching[2 % nonmatching.length];
  const n4 = nonmatching[3 % nonmatching.length];
  const n5 = nonmatching[4 % nonmatching.length];

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
      const f = new FilterType('test', 't', ...args, [], 'OR');
      expect(f.matches({ y: n1 })).toBe(false);
    });

    // covers this.attributeNames.length = 0, 'AND', matches, 0 failing attributes
    it('lets all subjects match a zero-attribute AND ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, [], 'AND');
      expect(f.matches({ x: n1, y: m1, z: n2 })).toBe(true);
    });

    // covers this.attributeNames.length = 1, 'OR', doesn't match, all failing attributes
    it('fails non-matching subjects against a one-attribute OR ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['x'], 'OR');
      expect(f.matches({ x: n3, y: n4 })).toBe(false);
    });

    // covers this.attributeNames.length = 1, 'OR', matches, 0 failing attributes
    it('passes matching subjects against a one-attribute OR ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['y'], 'OR');
      expect(f.matches({ x: n5, y: m2 })).toBe(true);
    });

    // covers this.attributeNames.length = 1, 'AND', doesn't match, all failing attributes
    it('fails non-matching subjects against a one-attribute AND ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['z'], 'AND');
      expect(f.matches({ x: n1, z: n2 })).toBe(false);
    });

    // covers this.attributeNames.length = 1, 'AND', matches, 0 failing attributes
    it('passes matching subjects against a one-attribute AND ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['x'], 'AND');
      expect(f.matches({ x: m3, y: n3 })).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'OR', doesn't match, all failing attributes
    it('fails non-matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['x', 'y', 'z'], 'OR');
      expect(f.matches({ x: n4, y: n5, z: n1, u: n2 })).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'OR', matches, some failing attributes
    it('passes semi-matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['x', 'y', 'z', 'w'], 'OR');
      expect(f.matches({ x: n3, y: m4, z: n4, w: n5 })).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'OR', matches, 0 failing attributes
    it('passes matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['a', 'b', 'c'], 'OR');
      expect(f.matches({ a: m5, b: m1, c: m2, d: n1 })).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'AND', doesn't match, all failing attributes
    it('fails non-matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['x', 'y', 'z'], 'AND');
      expect(f.matches({ x: n2, y: n3, z: n4 })).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'AND', doesn't match, some failing attributes
    it('fails semi-matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['a', 'b', 'c', 'd'], 'AND');
      expect(f.matches({ a: m3, b: n5, c: m4, d: n1 })).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'AND', matches, 0 failing attributes
    it('passes matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      const f = new FilterType('test', 't', ...args, ['p', 'q', 'r', 's'], 'AND');
      expect(f.matches({ p: m5, q: m1, r: m2, s: m3, t: n2 })).toBe(true);
    });
  });
}

testFilter(Filter, [(x) => x === 7], [7], [4, 6, 13, 'cat', 'dog']);
testFilter(RegexFilter, ['^ca.+'], ['cat', 'car', 'camera', 'cab', 'candid'], ['arcade', 'ca', 'coat', 'orca', 'act']);
testFilter(MathFilter, [[4, 8], false], [5, 6, 7, 6.5], [4, 8, 9, 10, 2]);
testFilter(BooleanFilter, [false], [true], [false]);
