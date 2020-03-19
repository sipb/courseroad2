import { FilterGroup, Filter, RegexFilter, MathFilter, BooleanFilter } from '../../src/utilities/filters.js';

function testFilter(FilterType, args, matching, nonmatching) {
  const m1 = matching[0];
  const m2 = matching[1%matching.length]
  const m3 = matching[2%matching.length]
  const m4 = matching[3%matching.length]
  const m5 = matching[4%matching.length]

  const n1 = nonmatching[0];
  const n2 = nonmatching[1%nonmatching.length];
  const n3 = nonmatching[2%nonmatching.length];
  const n4 = nonmatching[3%nonmatching.length];
  const n5 = nonmatching[4%nonmatching.length];

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
      expect(f.matches({y: n1})).toBe(false);
    });

    // covers this.attributeNames.length = 0, 'AND', matches, 0 failing attributes
    it('lets all subjects match a zero-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, [], 'AND');
      expect(f.matches({x: n1, y: m1, z: n2})).toBe(true);
    });

    // covers this.attributeNames.length = 1, 'OR', doesn't match, all failing attributes
    it('fails non-matching subjects against a one-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x'], 'OR');
      expect(f.matches({x: n3, y: n4})).toBe(false);
    });

    // covers this.attributeNames.length = 1, 'OR', matches, 0 failing attributes
    it('passes matching subjects against a one-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['y'], 'OR');
      expect(f.matches({x: n5, y: m2})).toBe(true);
    });

    // covers this.attributeNames.length = 1, 'AND', doesn't match, all failing attributes
    it('fails non-matching subjects against a one-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['z'], 'AND');
      expect(f.matches({x: n1, z: n2})).toBe(false);
    });

    // covers this.attributeNames.length = 1, 'AND', matches, 0 failing attributes
    it('passes matching subjects against a one-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x'], 'AND');
      expect(f.matches({x: m3, y: n3})).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'OR', doesn't match, all failing attributes
    it('fails non-matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x', 'y', 'z'], 'OR');
      expect(f.matches({x: n4, y: n5, z: n1, u: n2})).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'OR', matches, some failing attributes
    it('passes semi-matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x', 'y', 'z', 'w'], 'OR');
      expect(f.matches({x: n3, y: m4, z: n4, w: n5})).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'OR', matches, 0 failing attributes
    it('passes matching subjects against a multi-attribute OR ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['a', 'b', 'c'], 'OR');
      expect(f.matches({a: m5, b: m1, c: m2, d: n1})).toBe(true);
    });

    // covers this.attributeNames.length > 1, 'AND', doesn't match, all failing attributes
    it('fails non-matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['x', 'y', 'z'], 'AND');
      expect(f.matches({x: n2, y: n3, z: n4})).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'AND', doesn't match, some failing attributes
    it('fails semi-matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['a', 'b', 'c', 'd'], 'AND');
      expect(f.matches({a: m3, b: n5, c: m4, d: n1})).toBe(false);
    });

    // covers this.attributeNames.length > 1, 'AND', matches, 0 failing attributes
    it('passes matching subjects against a multi-attribute AND ' + FilterType.name, () => {
      let f = new FilterType("test", "t", ...args, ['p', 'q', 'r', 's'], 'AND');
      expect(f.matches({p: m5, q: m1, r: m2, s: m3, t: n2})).toBe(true);
    });
  });
}

testFilter(Filter, [(x) => x === 7], [7], [4, 6, 13, 'cat', 'dog']);
testFilter(RegexFilter, ['^ca.+'], ['cat', 'car', 'camera', 'cab', 'candid'], ['arcade', 'ca', 'coat', 'orca', 'act']);
testFilter(MathFilter, [[4, 8], false], [5, 6, 7, 6.5], [4, 8, 9, 10, 2]);
testFilter(BooleanFilter, [false], [true], [false]);

describe('FilterGroup', () => {
  /*
  Testing strategy for FilterGroup:

  partition on this.filters: length = 0, length > 0
  partition on active: 0 active, some but not all active, all active (!=0)
  partition on this.mode: OR, AND
  partition on return value: true, false
  */

  // covers filters.length = 0, 0 active, mode OR, returns true
  it('fails OR group with 0 filters', () => {
    let g = new FilterGroup('test', [], 'OR');
    expect(g.matches({a: 8, b: 10}, [], {})).toBe(true);
  });

  // covers filters.length = 0, 0 active, mode AND, returns true
  it('passes AND group with 0 filters', () => {
    let g = new FilterGroup('test', [], 'AND');
    expect(g.matches({x: 9, y: 10, z: 'hi'}, [], {'in': 10})).toBe(true);
  });

  // covers filters.length > 0, 0 active, mode OR, returns true
  it('passes OR groups with 0 active filters', () => {
    let a = new Filter('testa', 'a', (x) => x.includes('a'), ['a', 'c'], 'AND');
    let b = new Filter('testb', 'b', (x) => x.length > 2, ['a', 'b'], 'OR');
    let c = new Filter('testc', 'c', (x) => x === 8, ['d'], 'AND');
    let g = new FilterGroup('test', [a, b, c], 'OR');
    expect(g.matches({a: 'cat', b: 'scoot', c: 'a', d: 10}, [false, false, false], {})).toBe(true);
  });

  // covers filters.length > 0, 0 active, mode AND, returns true
  it('passes AND groups with 0 active filters', () => {
    let a = new Filter('testa', 'a', (x) => x % 2 === 0, ['a'], 'AND');
    let b = new Filter('testb', 'b', (x) => x * 2 > 10, ['a', 'b'], 'OR');
    let c = new Filter('testc', 'c', (x) => x < 3, ['b', 'c'], 'AND');
    let g = new FilterGroup('test', [a, b, c], 'AND');
    expect(g.matches({a: 6, b: 2, c: 4, d: 4}, [false, false, false], {})).toBe(true);
  });

  // covers filters.length > 0, some active, mode OR, returns true
  it('passes matching OR groups with some active filters', () => {
    let a = new Filter('testa', 'a', (x) => x === 4, ['a', 'b', 'c'], 'OR');
    let b = new Filter('testb', 'b', (x) => x % 3 === 1, ['a', 'c'], 'AND');
    let c = new Filter('testc', 'c', (x) => x > 0, ['a', 'd'], 'AND');
    let d = new Filter('testd', 'd', (x) => x % 4 === 0, ['c'], 'AND');
    let g = new FilterGroup('test', [a, b, c, d], 'OR');
    expect(g.matches({a: 1, b: 3, c: 7, d: -3}, [true, true, false, false], {})).toBe(true);
  });

  // covers filters.length > 0, some active, mode OR, returns false
  it('fails non-matching OR groups with some active filters', () => {
    let a = new Filter('testa', 'a', (x) => x.includes('ca'), ['b', 'c'], 'AND');
    let b = new Filter('testb', 'b', (x) => x.length === 3, ['a', 'c'], 'OR');
    let c = new Filter('testc', 'c', (x) => x.includes('at'), ['a', 'b'], 'AND');
    let d = new Filter('testd', 'd', (x) => x.length % 2 === 0, ['d'], 'OR');
    let g = new FilterGroup('test', [a, b, c, d], 'OR');
    expect(g.matches({a: 'cat', b: 'corn', c: 'big', d: 'bat'}, [true, false, true, true], {})).toBe(false);
  });

  // covers filters.length > 0, some active, mode AND, returns true
  it('passes matching AND groups with some active filters', () => {
    let a = new Filter('testa', 'a', (x) => x.indexOf("a") > 2, ['a', 'b'], 'AND');
    let b = new Filter('testb', 'b', (x) => x.includes("sm"), ['a', 'c'], 'OR');
    let c = new Filter('testc', 'c', (x) => x.length > 10, ['b'], 'AND');
    let d = new Filter('testd', 'd', (x) => x.split(' ').length >= 2, ['a', 'd'], 'AND');
    let g = new FilterGroup('test', [a, b, c, d], 'AND');
    expect(g.matches({a: 'c b a', b: 'special', c: 'chasm', d: 'green eggs and ham'}, [true, true, false, true], {})).toBe(true);
  });

  // covers filters.length > 0, some active, mode AND, returns false
  it('fails non-matching AND groups with some active filters', () => {
    let a = new Filter('testa', 'a', (x) => x.endsWith('ed'), ['a'], 'OR');
    let b = new Filter('testb', 'b', (x) => x.toUpperCase() === x, ['b', 'd'], 'OR');
    let c = new Filter('testc', 'c', (x) => x.includes('m'), ['a', 'c'], 'AND');
    let d = new Filter('testd', 'd', (x) => x.length === 3, ['d'], 'AND');
    let g = new FilterGroup('test', [a, b, c, d], 'AND');
    expect(g.matches({a: 'red', b: 'green', c: 'blue', d: 'yellow'}, [true, false, false, true], {})).toBe(false);
  });

  // covers filters.length > 0, all active, mode OR, returns true
  it('passes matching OR groups with all filters active', () => {
    let a = new Filter('testa', 'a', (x) => x % 3 === 2, ['a', 'b'], 'AND');
    let b = new Filter('testb', 'b', (x) => x > 7, ['b', 'c'], 'OR');
    let c = new Filter('testc', 'c', (x) => x <= 5, ['a', 'b', 'c', 'd'], 'AND');
    let g = new FilterGroup('test', [a, b, c], 'OR');
    expect(g.matches({a: 0, b: 1, c: 3, d: 4}, [true, true, true], {})).toBe(true);
  });

  // covers filters.length > 0, all active, mode OR, returns false
  it('fails non-matching OR groups with all filters active', () => {
    let a = new Filter('testa', 'a', (x) => x.indexOf('cat') > 0, ['a', 'c', 'd'], 'AND');
    let b = new Filter('testb', 'b', (x) => x.includes('b'), ['c'], 'OR');
    let c = new Filter('testc', 'c', (x) => x.length > 2, ['b', 'd'], 'AND');
    let g = new FilterGroup('test', [a, b, c], 'OR');
    expect(g.matches({a: 'cat', b: 'bat', c: 'rat', d: 'at'}, [true, true, true], {})).toBe(false);
  });

  // covers filters.length > 0, all active, mode AND, returns true
  it('passes matching AND groups with all filters active', () => {
    let a = new Filter('testa', 'a', (x) => x.includes("0"), ['a', 'c'], 'AND');
    let b = new Filter('testb', 'b', (x) => x.indexOf("3") > 0, ['b', 'c'], 'OR');
    let c = new Filter('testc', 'c', (x) => parseInt(x) === 63, ['c', 'd'], 'AND');
    let g = new FilterGroup('test', [a, b, c], 'AND');
    expect(g.matches({a: ':0', b: '24', c: '063', d: '63'}, [true, true, true], {})).toBe(true);
  });

  // covers filters.length > 0, all active, mode AND, returns false
  it('fails non-matching AND groups with all filters active', () => {
    let a = new Filter('testa', 'a', (x) => x > 0, ['a', 'd'], 'OR');
    let b = new Filter('testb', 'b', (x) => x % 10 === 4, ['b'], 'AND');
    let c = new Filter('testc', 'c', (x) => x % 7 === 3, ['b', 'c', 'd'], 'OR');
    let g = new FilterGroup('test', [a, b, c], 'AND');
    expect(g.matches({a: -4, b: 14, c: 10, d: -1}, [true, true, true], {})).toBe(false);
  });
});
