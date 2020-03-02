import { FilterGroup, Filter, RegexFilter, MathFilter, BooleanFilter } from '../../src/utilities/filters.js';

describe('Filters', () => {
  it('does one thing right', () => {
    let f = new Filter("test", "t", ((x) => x === 7), ['y'], 'AND');
    expect(f.matches({y: 7})).toBeTruthy();
    expect(f.matches({y: 8})).toBeFalsy();
  })
});
