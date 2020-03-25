import { FilterGroup, Filter, RegexFilter, MathFilter, BooleanFilter } from '../../src/utilities/filters.js';

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
    const g = new FilterGroup('test', [], 'OR');
    expect(g.matches({ a: 8, b: 10 }, [], {})).toBe(true);
  });

  // covers filters.length = 0, 0 active, mode AND, returns true
  it('passes AND group with 0 filters', () => {
    const g = new FilterGroup('test', [], 'AND');
    expect(g.matches({ x: 9, y: 10, z: 'hi' }, [], { 'in': 10 })).toBe(true);
  });

  // covers filters.length > 0, 0 active, mode OR, returns true
  it('passes OR groups with 0 active filters', () => {
    const a = new Filter('testa', 'a', (x) => x.includes('a'), ['a', 'c'], 'AND');
    const b = new Filter('testb', 'b', (x) => x.length > 2, ['a', 'b'], 'OR');
    const c = new Filter('testc', 'c', (x) => x === 8, ['d'], 'AND');
    const g = new FilterGroup('test', [a, b, c], 'OR');
    expect(g.matches({ a: 'cat', b: 'scoot', c: 'a', d: 10 }, [false, false, false], {})).toBe(true);
  });

  // covers filters.length > 0, 0 active, mode AND, returns true
  it('passes AND groups with 0 active filters', () => {
    const a = new Filter('testa', 'a', (x) => x % 2 === 0, ['a'], 'AND');
    const b = new Filter('testb', 'b', (x) => x * 2 > 10, ['a', 'b'], 'OR');
    const c = new Filter('testc', 'c', (x) => x < 3, ['b', 'c'], 'AND');
    const g = new FilterGroup('test', [a, b, c], 'AND');
    expect(g.matches({ a: 6, b: 2, c: 4, d: 4 }, [false, false, false], {})).toBe(true);
  });

  // covers filters.length > 0, some active, mode OR, returns true
  it('passes matching OR groups with some active filters', () => {
    const a = new Filter('testa', 'a', (x) => x === 4, ['a', 'b', 'c'], 'OR');
    const b = new Filter('testb', 'b', (x) => x % 3 === 1, ['a', 'c'], 'AND');
    const c = new Filter('testc', 'c', (x) => x > 0, ['a', 'd'], 'AND');
    const d = new Filter('testd', 'd', (x) => x % 4 === 0, ['c'], 'AND');
    const g = new FilterGroup('test', [a, b, c, d], 'OR');
    expect(g.matches({ a: 1, b: 3, c: 7, d: -3 }, [true, true, false, false], {})).toBe(true);
  });

  // covers filters.length > 0, some active, mode OR, returns false
  it('fails non-matching OR groups with some active filters', () => {
    const a = new Filter('testa', 'a', (x) => x.includes('ca'), ['b', 'c'], 'AND');
    const b = new Filter('testb', 'b', (x) => x.length === 3, ['a', 'c'], 'OR');
    const c = new Filter('testc', 'c', (x) => x.includes('at'), ['a', 'b'], 'AND');
    const d = new Filter('testd', 'd', (x) => x.length % 2 === 0, ['d'], 'OR');
    const g = new FilterGroup('test', [a, b, c, d], 'OR');
    expect(g.matches({ a: 'cat', b: 'corn', c: 'big', d: 'bat' }, [true, false, true, true], {})).toBe(false);
  });

  // covers filters.length > 0, some active, mode AND, returns true
  it('passes matching AND groups with some active filters', () => {
    const a = new Filter('testa', 'a', (x) => x.indexOf('a') > 2, ['a', 'b'], 'AND');
    const b = new Filter('testb', 'b', (x) => x.includes('sm'), ['a', 'c'], 'OR');
    const c = new Filter('testc', 'c', (x) => x.length > 10, ['b'], 'AND');
    const d = new Filter('testd', 'd', (x) => x.split(' ').length >= 2, ['a', 'd'], 'AND');
    const g = new FilterGroup('test', [a, b, c, d], 'AND');
    expect(g.matches({ a: 'c b a', b: 'special', c: 'chasm', d: 'green eggs and ham' }, [true, true, false, true], {})).toBe(true);
  });

  // covers filters.length > 0, some active, mode AND, returns false
  it('fails non-matching AND groups with some active filters', () => {
    const a = new Filter('testa', 'a', (x) => x.endsWith('ed'), ['a'], 'OR');
    const b = new Filter('testb', 'b', (x) => x.toUpperCase() === x, ['b', 'd'], 'OR');
    const c = new Filter('testc', 'c', (x) => x.includes('m'), ['a', 'c'], 'AND');
    const d = new Filter('testd', 'd', (x) => x.length === 3, ['d'], 'AND');
    const g = new FilterGroup('test', [a, b, c, d], 'AND');
    expect(g.matches({ a: 'red', b: 'green', c: 'blue', d: 'yellow' }, [true, false, false, true], {})).toBe(false);
  });

  // covers filters.length > 0, all active, mode OR, returns true
  it('passes matching OR groups with all filters active', () => {
    const a = new Filter('testa', 'a', (x) => x % 3 === 2, ['a', 'b'], 'AND');
    const b = new Filter('testb', 'b', (x) => x > 7, ['b', 'c'], 'OR');
    const c = new Filter('testc', 'c', (x) => x <= 5, ['a', 'b', 'c', 'd'], 'AND');
    const g = new FilterGroup('test', [a, b, c], 'OR');
    expect(g.matches({ a: 0, b: 1, c: 3, d: 4 }, [true, true, true], {})).toBe(true);
  });

  // covers filters.length > 0, all active, mode OR, returns false
  it('fails non-matching OR groups with all filters active', () => {
    const a = new Filter('testa', 'a', (x) => x.indexOf('cat') > 0, ['a', 'c', 'd'], 'AND');
    const b = new Filter('testb', 'b', (x) => x.includes('b'), ['c'], 'OR');
    const c = new Filter('testc', 'c', (x) => x.length > 2, ['b', 'd'], 'AND');
    const g = new FilterGroup('test', [a, b, c], 'OR');
    expect(g.matches({ a: 'cat', b: 'bat', c: 'rat', d: 'at' }, [true, true, true], {})).toBe(false);
  });

  // covers filters.length > 0, all active, mode AND, returns true
  it('passes matching AND groups with all filters active', () => {
    const a = new Filter('testa', 'a', (x) => x.includes('0'), ['a', 'c'], 'AND');
    const b = new Filter('testb', 'b', (x) => x.indexOf('3') > 0, ['b', 'c'], 'OR');
    const c = new Filter('testc', 'c', (x) => parseInt(x) === 63, ['c', 'd'], 'AND');
    const g = new FilterGroup('test', [a, b, c], 'AND');
    expect(g.matches({ a: ':0', b: '24', c: '063', d: '63' }, [true, true, true], {})).toBe(true);
  });

  // covers filters.length > 0, all active, mode AND, returns false
  it('fails non-matching AND groups with all filters active', () => {
    const a = new Filter('testa', 'a', (x) => x > 0, ['a', 'd'], 'OR');
    const b = new Filter('testb', 'b', (x) => x % 10 === 4, ['b'], 'AND');
    const c = new Filter('testc', 'c', (x) => x % 7 === 3, ['b', 'c', 'd'], 'OR');
    const g = new FilterGroup('test', [a, b, c], 'AND');
    expect(g.matches({ a: -4, b: 14, c: 10, d: -1 }, [true, true, true], {})).toBe(false);
  });
});

function expectRegexFilterOrder (strings, filter) {
  const stringRanks = strings.map((s) => filter.compareByVariants({ a: s }));
  for (var i = 0; i < stringRanks.length - 1; i++) {
    expect(stringRanks[i]).toBeLessThan(stringRanks[i + 1]);
  }
}

describe('RegexFilter', () => {
  /*
  Testing strategy

  matches(subject):
    partition on result: true, false
    partition on inputs: setup, not set up
  setupInputs(inputs):
    partition on this.requires: undefined, defined
  setupVariants(inputs, priorityDirections, priorityOrder):
    partition on this.requires: undefined, defined
    partition on # priorities: = 0, = 1, > 1
    partition on priorityDirections: all true, mix, all false (> 0 length)
  compareByVariants(subject):
    partition priority: non-matching, low-priority, mid-priority, high-priority (!= low)
  */

  // covers
  // matches: result=true, inputs not set up
  it('passes matching subjects', () => {
    const r = new RegexFilter('test', 't', 'b..e', ['a']);
    expect(r.matches({ a: 'i bake cakes' })).toBe(true);
  });

  // covers
  // matches: result=false, inputs not set up
  it('fails non-matching subjects', () => {
    const r = new RegexFilter('test', 't', 'g.*[nt]', ['a']);
    expect(r.matches({ a: 'grab' })).toBe(false);
  });

  // covers
  // matches: result=true, inputs set up
  // setupInputs: requires undefined
  it('passes matching subjects with empty requires set up', () => {
    const r = new RegexFilter('test', 't', 'n[^n]{2,3}n', ['a']);
    r.setupInputs({ input: 'value', a: 'x' });
    expect(r.matches({ a: 'some noun' })).toBe(true);
  });

  // covers
  // matches: result=false, inputs set up
  // setupInputs: requires undefined
  it('fails non-matching subjects with empty requires set up', () => {
    const r = new RegexFilter('test', 't', 'x\\d{3}x', ['a']);
    r.setupInputs({ a: 'hi', b: 5 });
    expect(r.matches({ a: 'x2020x' })).toBe(false);
  });

  // covers
  // matches: result=true, inputs set up
  // setupInputs: requires defined
  it('passes matching subjects with inputs set up', () => {
    const r = new RegexFilter('test', 't', '20\\d\\d-05-', ['a'], 'OR', 'day');
    r.setupInputs({ month: 6, day: 24 });
    expect(r.matches({ a: '2015-05-24' })).toBe(true);
  });

  // covers
  // matches: result=false, inputs set up
  // setupInputs: requires defined
  it('fails non-matching subjects with inputs set up', () => {
    const r = new RegexFilter('test', 't', 'i like \\d+ ', ['a'], 'OR', 'pets');
    r.setupInputs({ random: 1, pets: 'cats' });
    expect(r.matches({ a: 'i like 7 ' })).toBe(false);
  });

  // covers
  // setupVariants: requires undefined, 0 priorities, all true
  // compareByVariants: non-matching, low priority
  it('ranks subjects correctly with 0 priorities', () => {
    const r = new RegexFilter('test', 't', 's.{3}e', ['a']);
    r.setupVariants({ x: 'y' }, {}, []);
    expectRegexFilterOrder(['miles', 'smiled'], r);
  });

  // covers
  // setupVariants: requires undefined, 1 priority, all true
  // compareByVariants: non-matching, low-priority, high-priority
  it('ranks subjects correctly for 1 positive priority', () => {
    const r = new RegexFilter('test', 't', '(.+)\\1', ['a']);
    r.setupVariants({}, { 'atStart': true }, ['atStart']);
    expectRegexFilterOrder(['five', 'smoot', 'oops'], r);
  });

  // covers
  // setupVariants: requires undefined, 1 priority, all false
  // compareByVariants: non-matching, low-priority, high-priority
  it('ranks subjects correctly for 1 negative priority', () => {
    const r = new RegexFilter('test', 't', '\\d\\d', ['a']);
    r.setupVariants({}, { 'asLiteral': false }, ['asLiteral']);
    expectRegexFilterOrder(['hello', '\\a\\b\\c\\d\\d', '444'], r);
  });

  // covers
  // setupVariants: requires undefined, >1 priorities, all true
  // compareByVariants: non-matching, low-priority, mid-priority, high-priority
  it('ranks subjects correctly for positive priorities', () => {
    const r = new RegexFilter('test', 't', '(.)(.)\\2\\1', ['a']);
    r.setupVariants({}, { 'atStart': true, 'asLiteral': true }, ['asLiteral', 'atStart']);
    expectRegexFilterOrder(['sun', 'afternoon', 'noon', 'abc(.)(.)\\2\\1', '(.)(.)\\2\\1xyz'], r);
  });

  // covers
  // setupVariants: requires undefined, >1 priorities, mix
  // compareByVariants: non-matching, low-priority, mid-priority, high-priority
  it('ranks subjects correctly for mixed priorities', () => {
    const r = new RegexFilter('test', 't', '2.', ['a']);
    r.setupVariants({}, { 'atStart': true, 'asLiteral': false }, ['atStart', 'asLiteral']);
    expectRegexFilterOrder(['16.400', '12.742', '17.270', '2.00B', '21G.701'], r);
  });

  // covers
  // setupVariants: requires undefined, >1 priorities, all false
  // compareByVariants: non-matching, low-priority, mid-priority, high-priority
  it('ranks subjects correctly for negative priorities', () => {
    const r = new RegexFilter('test', 't', 'b.t', ['a']);
    r.setupVariants({}, { 'atStart': false, 'asLiteral': false }, ['asLiteral', 'atStart']);
    expectRegexFilterOrder(['house', 'b.th', 'aab.tcc', 'bits', 'robots'], r);
  });

  // covers
  // setupVariants: requires defined, 0 priorities, all true
  // compareByVariants: non-matching, low-priority
  it('ranks subjects correctly for 0 priorities with inputs', () => {
    const r = new RegexFilter('test', 't', 'a.b.c.', ['a'], 'OR', 'b');
    r.setupVariants({ b: 'd' }, {}, []);
    expectRegexFilterOrder(['a1b2c3', 'axbyczdw'], r);
  });

  // covers
  // setupVariants: requires defined, 1 priority, all true
  // compareByVariants: non-matching, low-priority, high-priority
  it('ranks subjects correctly for one positive priority with inputs', () => {
    const r = new RegexFilter('test', 't', '\\w+:.+', ['a'], 'OR', 'in');
    r.setupVariants({ in: 'cat' }, { 'asLiteral': true }, ['asLiteral']);
    expectRegexFilterOrder(['hello', 'pet: cat', 'world\\w+:.+cat'], r);
  });

  // covers
  // setupVariants: requires defined, 1 priority, all false
  // compareByVariants: non-matching, low-priority, high-priority
  it('ranks subjects correctly for one negative priority with inputs', () => {
    const r = new RegexFilter('test', 't', 'sm.{3,}', ['a'], 'OR', 'x');
    r.setupVariants({ x: 's' }, { 'atStart': false }, ['atStart']);
    expectRegexFilterOrder(['small', 'small fries', 'chasm abyss'], r);
  });

  // covers
  // setupVariants: requires defined, > 1 priority, all true
  // compareByVariants: non-matching, low-priority, medium-priority, high-priority
  it('ranks subjects correctly for positive priorities with inputs', () => {
    const r = new RegexFilter('test', 't', '.', ['a'], 'OR', 'a');
    r.setupVariants({ a: 'at' }, { 'atStart': true, 'asLiteral': true }, ['atStart', 'asLiteral']);
    expectRegexFilterOrder(['ball', 'flat', '...at', 'bat', '.at'], r);
  });

  // covers
  // setupVariants: requires defined, > 1 priority, mix
  // compareByVariants: non-matching, low-priority, medium-priority, high-priority
  it('ranks subjects correctly for mixed priorities with inputs', () => {
    const r = new RegexFilter('test', 't', 'p.+t', ['a'], 'OR', 'y');
    r.setupVariants({ y: '.*s' }, { 'atStart': false, 'asLiteral': true }, ['asLiteral', 'atStart']);
    expectRegexFilterOrder(['acorn', 'paths', 'apartments', 'p.+t.*s', 'all p.+t.*s'], r);
  });

  // covers
  // setupVariants: requires defined, > 1 priority, all false
  // compareByVariants: non-matching, low-priority, medium-priority, high-priority
  it('ranks subjects correctly for negative priorities with inputs', () => {
    const r = new RegexFilter('test', 't', 'e..e', ['a'], 'OR', 'in');
    r.setupVariants({ in: 'r' }, { 'atStart': false, 'asLiteral': false }, ['atStart', 'asLiteral']);
    expectRegexFilterOrder(['blank', 'e..er :(', 'experts', 'fore..er', 'centers'], r);
  });
});

describe('MathFilter', () => {
  /*
  Testing strategy

  partition on range: no ∞, left -∞ only, right ∞ only, -∞ to ∞
  partition on range [a, b]: b-a = 0, b-a > 0
  partition on inclusive: true, false
  partition on subject attribute value: < a, = a, a < _ < b, = b (!=a), > b
  */

  // covers no ∞, b-a = 0, inclusive, < a
  it('fails smaller value on single point range', () => {
    const m = new MathFilter('test', 't', [3, 3], true, ['a']);
    expect(m.matches({ a: -1 })).toBe(false);
  });

  // covers no ∞, b-a = 0, inclusive, = a
  it('passes matching value on single point range', () => {
    const m = new MathFilter('test', 't', [-4, -4], true, ['a']);
    expect(m.matches({ a: -4 })).toBe(true);
  });

  // covers no ∞, b-a = 0, inclusive, > b
  it('fails larger value on single point range', () => {
    const m = new MathFilter('test', 't', [5, 5], true, ['a']);
    expect(m.matches({ a: 10 })).toBe(false);
  });

  // covers no ∞, b-a = 0, exclusive, < a
  it('fails smaller value on empty range', () => {
    const m = new MathFilter('test', 't', [10, 10], false, ['a']);
    expect(m.matches({ a: 3 })).toBe(false);
  });

  // covers no ∞, b-a = 0, exclusive, = a
  it('fails equal value on empty range', () => {
    const m = new MathFilter('test', 't', [0, 0], false, ['a']);
    expect(m.matches({ a: 0 })).toBe(false);
  });

  // covers no ∞, b-a = 0, exclusive, > b
  it('fails larger value on empty range', () => {
    const m = new MathFilter('test', 't', [2.5, 2.5], false, ['a']);
    expect(m.matches({ a: 2.5 })).toBe(false);
  });

  // covers no ∞, b-a > 0, inclusive, < a
  it('fails smaller value on finite inclusive range', () => {
    const m = new MathFilter('test', 't', [5, 15], true, ['a']);
    expect(m.matches({ a: 3 })).toBe(false);
  });

  // covers no ∞, b-a > 0, inclusive, = a
  it('passes left bound value on finite inclusive range', () => {
    const m = new MathFilter('test', 't', [-5, 5], true, ['a']);
    expect(m.matches({ a: -5 })).toBe(true);
  });

  // covers no ∞, b-a > 0, inclusive, a < _ < b
  it('passes in-between value on finite inclusive range', () => {
    const m = new MathFilter('test', 't', [3, 13], true, ['a']);
    expect(m.matches({ a: 4 })).toBe(true);
  });

  // covers no ∞, b-a > 0, inclusive, = b
  it('passes right bound value on finite inclusive range', () => {
    const m = new MathFilter('test', 't', [2, 4], true, ['a']);
    expect(m.matches({ a: 4 })).toBe(true);
  });

  // covers no ∞, b-a > 0, inclusive, > b
  it('fails larger value on finite inclusive range', () => {
    const m = new MathFilter('test', 't', [5, 6], true, ['a']);
    expect(m.matches({ a: 9 })).toBe(false);
  });

  // covers no ∞, b-a > 0, exclusive, < a
  it('fails smaller value on finite exclusive range', () => {
    const m = new MathFilter('test', 't', [30, 40], false, ['a']);
    expect(m.matches({ a: 10.5 })).toBe(false);
  });

  // covers no ∞, b-a > 0, exclusive, = a
  it('fails left bound value on finite exclusive range', () => {
    const m = new MathFilter('test', 't', [9, 10], false, ['a']);
    expect(m.matches({ a: 9 })).toBe(false);
  });

  // covers no ∞, b-a > 0, exclusive, a < _ < b
  it('passes in-between value on finite exclusive range', () => {
    const m = new MathFilter('test', 't', [-8, -7], false, ['a']);
    expect(m.matches({ a: -7.4 })).toBe(true);
  });

  // covers no ∞, b-a > 0, exclusive, = b
  it('fails right bound value on finite exclusive range', () => {
    const m = new MathFilter('test', 't', [2, 8], false, ['a']);
    expect(m.matches({ a: 8 })).toBe(false);
  });

  // covers no ∞, b-a > 0, exclusive, > b
  it('fails larger value on finite exclusive range', () => {
    const m = new MathFilter('test', 't', [5, 9], false, ['a']);
    expect(m.matches({ a: 20 })).toBe(false);
  });

  // covers left -∞, b-a > 0, inclusive, a < _ < b
  it('passes in-between value on inclusive left range', () => {
    const m = new MathFilter('test', 't', [undefined, 6], true, ['a']);
    expect(m.matches({ a: 3 })).toBe(true);
  });

  // covers left -∞, b-a > 0, inclusive, = b
  it('passes right bound value on inclusive left range', () => {
    const m = new MathFilter('test', 't', [undefined, -2], true, ['a']);
    expect(m.matches({ a: -2 })).toBe(true);
  });

  // covers left -∞, b-a > 0, inclusive, > b
  it('fails larger value on inclusive left range', () => {
    const m = new MathFilter('test', 't', [undefined, 3], true, ['a']);
    expect(m.matches({ a: 7 })).toBe(false);
  });

  // covers left -∞, b-a > 0, exclusive, a < _ < b
  it('passes in-between value on exclusive left range', () => {
    const m = new MathFilter('test', 't', [undefined, 9], false, ['a']);
    expect(m.matches({ a: -1 })).toBe(true);
  });

  // covers left -∞, b-a > 0, exclusive, = b
  it('fails right bound value on exclusive left range', () => {
    const m = new MathFilter('test', 't', [undefined, 4], false, ['a']);
    expect(m.matches({ a: 4 })).toBe(false);
  });

  // covers left -∞, b-a > 0, exclusive, > b
  it('fails larger value on exclusive left range', () => {
    const m = new MathFilter('test', 't', [undefined, 0], false, ['a']);
    expect(m.matches({ a: 2 })).toBe(false);
  });

  // covers right ∞, b-a > 0, inclusive, < a
  it('fails smaller value on inclusive right range', () => {
    const m = new MathFilter('test', 't', [-4, undefined], true, ['a']);
    expect(m.matches({ a: -10 })).toBe(false);
  });

  // covers right ∞, b-a > 0, inclusive, = a
  it('passes left bound on inclusive right range', () => {
    const m = new MathFilter('test', 't', [3, undefined], true, ['a']);
    expect(m.matches({ a: 3 })).toBe(true);
  });

  // covers right ∞, b-a > 0, inclusive, a < _ < b
  it('passes in-between values on inclusive right range', () => {
    const m = new MathFilter('test', 't', [1, undefined], true, ['a']);
    expect(m.matches({ a: 6 })).toBe(true);
  });

  // covers right ∞, b-a > 0, exclusive, < a
  it('fails smaller value on exclusive right range', () => {
    const m = new MathFilter('test', 't', [0, undefined], false, ['a']);
    expect(m.matches({ a: -4 })).toBe(false);
  });

  // covers right ∞, b-a > 0, exclusive, = a
  it('fails left bound on exclusive right range', () => {
    const m = new MathFilter('test', 't', [8, undefined], false, ['a']);
    expect(m.matches({ a: 8 })).toBe(false);
  });

  // covers right ∞, b-a > 0, exclusive, a < _ < b
  it('passes in-between values on exclusive right range', () => {
    const m = new MathFilter('test', 't', [6, undefined], false, ['a']);
    expect(m.matches({ a: 9 })).toBe(true);
  });

  // covers -∞ to ∞, b-a > 0, inclusive, a < _ < b
  it('passes any value on inclusive full range', () => {
    const m = new MathFilter('test', 't', [undefined, undefined], true, ['a']);
    expect(m.matches({ a: 5 })).toBe(true);
  });

  // covers -∞ to ∞, b-a > 0, exclusive, a < _ < b
  it('passes any value on exclusive full range', () => {
    const m = new MathFilter('test', 't', [undefined, undefined], false, ['a']);
    expect(m.matches({ a: -3 })).toBe(true);
  });
});
