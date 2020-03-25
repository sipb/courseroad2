import { RegexFilter } from '../../../src/utilities/filters.js';

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
    partition on input: valid regex, invalid regex
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
  // setupInputs: requires undefined, valid regex
  it('passes matching subjects with empty requires set up', () => {
    const r = new RegexFilter('test', 't', 'n[^n]{2,3}n', ['a']);
    r.setupInputs({ input: 'value', a: 'x' });
    expect(r.matches({ a: 'some noun' })).toBe(true);
  });

  // covers
  // matches: result=true, inputs set up
  // setupInputs: requires undefined, invalid regex
  it('passes matching subject with empty requires set up with invalid regex', () => {
    const r = new RegexFilter('test', 't', 'ab', ['a']);
    r.setupInputs({ in: '[' });
    expect(r.matches({a: 'abc'})).toBe(true);
  });

  // covers
  // matches: result=false, inputs set up
  // setupInputs: requires undefined, valid regex
  it('fails non-matching subjects with empty requires set up', () => {
    const r = new RegexFilter('test', 't', 'x\\d{3}x', ['a']);
    r.setupInputs({ a: 'hi', b: 5 });
    expect(r.matches({ a: 'x2020x' })).toBe(false);
  });

  // covers
  // matches: result=false, inputs set up
  // setupInputs: requires undefined, invalid regex
  it('fails non-matching subjects with empty requires set up with invalid regex', () => {
    const r = new RegexFilter('test', 't', 'a\\db', ['a']);
    r.setupInputs({ in: '(g'})
    expect(r.matches({ a: 'acbd'})).toBe(false);
  });

  // covers
  // matches: result=true, inputs set up
  // setupInputs: requires defined, valid regex
  it('passes matching subjects with inputs set up', () => {
    const r = new RegexFilter('test', 't', '20\\d\\d-05-', ['a'], 'OR', 'day');
    r.setupInputs({ month: 6, day: 24 });
    expect(r.matches({ a: '2015-05-24' })).toBe(true);
  });

  // covers
  // matches: result=true, inputs set up
  // setupInputs: requires defined, invalid regex
  it('passes matching subject with inputs set up using invalid regex', () => {
    const r = new RegexFilter('test', 't', 'h.t', ['a'], 'OR', 'hi');
    r.setupInputs({ hi: '\\' });
    console.log("\\");
    expect(r.matches({ a: 'hat\\coat' })).toBe(true);
  });

  // covers
  // matches: result=false, inputs set up
  // setupInputs: requires defined, valid regex
  it('fails non-matching subjects with inputs set up', () => {
    const r = new RegexFilter('test', 't', 'i like \\d+ ', ['a'], 'OR', 'pets');
    r.setupInputs({ random: 1, pets: 'cats' });
    expect(r.matches({ a: 'i like 7 ' })).toBe(false);
  });

  // covers
  // matches: result=false, inputs set up
  // setupInputs: requires defined, invalid regex
  it('fails non-matching subjects with inputs set up using invalid regex', () => {
    const r = new RegexFilter('test', 'r', 'ch.+s\\s+', ['a'], 'OR', 'x');
    r.setupInputs({ x: '+8'});
    expect(r.matches({ a: 'choices 78'})).toBe(false);
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
