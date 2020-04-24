import { MathFilter } from '../../../src/utilities/filters.js';

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
