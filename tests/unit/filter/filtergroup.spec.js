import { FilterGroup, Filter } from '../../../src/utilities/filters.js';

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
