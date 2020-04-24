import FilterSet from '../../src/components/FilterSet.vue';
import { Filter } from '../../src/utilities/filters.js';

const localVue = createLocalVue();
Vue.use(Vuetify);

describe('Filter Set', () => {
  it('emits an event when filter buttons are pressed', () => {
    const propsData = {
      value: [false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr'])]
    };

    // Add fake search input so it is not null when it tries to focus on it
    const fakeSearchInput = document.createElement('input');
    fakeSearchInput.id = 'searchInputTF';
    document.body.appendChild(fakeSearchInput);

    const wrapper = mount(FilterSet, { localVue, propsData, attachToDocument: true });

    const buttons = wrapper.findAll('.v-btn');
    const button0 = wrapper.find('.v-btn[value="0"]');
    const button2 = wrapper.find('.v-btn[value="2"]');

    // Click some buttons and check output
    expect(buttons.length).toBe(3);
    button0.trigger('click');
    expect(wrapper.emitted().input[0][0]).toEqual([true, false, false]);
    button2.trigger('click');
    expect(wrapper.emitted().input[1][0]).toEqual([true, false, true]);
    wrapper.destroy();
  });

  it('returns focus to searchbar after filter buttons are pressed', () => {
    const propsData = {
      value: [false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr'])]
    };

    // Construct fake search input with correct ID
    const fakeSearchInput = document.createElement('input');
    fakeSearchInput.id = 'searchInputTF';
    document.body.appendChild(fakeSearchInput);

    const wrapper = mount(FilterSet, { localVue, propsData, attachToDocument: true });

    // Click some button
    const button = wrapper.findAll('.v-btn').at(0);
    button.trigger('click');

    // Make sure search input still has focus
    expect(document.activeElement).toEqual(fakeSearchInput);

    wrapper.destroy();
  });

  /*
  Testing strategy for changeFilter
  partition on filters: length = 0, length > 0

  partition on selectionIndices: length = 0, 0 < length < filters.length,
                                  length = filters.length (!= 0)
  partition on selectionIndices: indices in order, indices out of order
  partition on selectionIndices: indices have gap, indices have no gap
  */

  // covers filters.length = 0, selectionIndices.length = 0, indices in order,
  // indices have no gap
  it('responds correctly to empty filter set', () => {
    // filters = [], selectionIndices = []
    // expected result = []
    const propsData = {
      value: [],
      label: 'test',
      filters: []
    };
    const wrapper = shallowMount(FilterSet, { localVue, propsData });
    wrapper.vm.changeFilter([]);

    const result = wrapper.emitted().input[0][0];
    const expectedResult = [];
    expect(result).toEqual(expectedResult);
  });

  // covers filters.length > 0, selectionIndices.length = 0, indices in order,
  // indices have no gap
  it('responds correctly when no filters are selected', () => {
    // filters = [1, 2, 3], selectionIndices = [],
    // expected result = [false, false, false]
    const propsData = {
      value: [false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr'])]
    };
    const wrapper = shallowMount(FilterSet, { localVue, propsData });
    wrapper.vm.changeFilter([]);

    const expectedResult = [false, false, false];
    const result = wrapper.emitted().input[0][0];
    expect(result).toEqual(expectedResult);
  });

  // covers filters.length > 0, selectionIndices.length > 0, indices in order,
  // indices have no gap
  it('responds correctly to range of in-order filters selected', () => {
    // filters = [1, 2, 3, 4, 5], selectionIndices = [2, 3, 4]
    // expected result = [false, false, true, true, true]
    const propsData = {
      value: [false, false, false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr']),
        new Filter('Test 4', '4', () => {}, ['attr']),
        new Filter('Test 5', '5', () => {}, ['attr'])]
    };
    const wrapper = shallowMount(FilterSet, { localVue, propsData });
    wrapper.vm.changeFilter([2, 3, 4]);

    const expectedResult = [false, false, true, true, true];
    const result = wrapper.emitted().input[0][0];
    expect(result).toEqual(expectedResult);
  });

  // covers filters.length > 0, selectionIndices.length > 0, indices out of order,
  // indices have no gap
  it('responds correctly to range of out-of-order filters selected', () => {
    // filters = [1, 2, 3, 4, 5, 6], selectionIndices = [2, 4, 1, 3]
    // expected = [false, true, true, true, true, false]
    const propsData = {
      value: [false, false, false, false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr']),
        new Filter('Test 4', '4', () => {}, ['attr']),
        new Filter('Test 5', '5', () => {}, ['attr']),
        new Filter('Test 6', '6', () => {}, ['attr'])]
    };
    const wrapper = shallowMount(FilterSet, { localVue, propsData });
    wrapper.vm.changeFilter([2, 4, 1, 3]);

    const expectedResult = [false, true, true, true, true, false];
    const result = wrapper.emitted().input[0][0];
    expect(result).toEqual(expectedResult);
  });

  // covers filters.length > 0, selectionIndices.length > 0, indices in order,
  // indices have gap
  it('responds correctly to non-adjacent in-order filters selected', () => {
    // filters = [1, 2, 3, 4, 5], selectionIndices = [0, 2, 3]
    // expected = [true, false, true, true, false]
    const propsData = {
      value: [false, false, false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr']),
        new Filter('Test 4', '4', () => {}, ['attr']),
        new Filter('Test 5', '5', () => {}, ['attr'])]
    };
    const wrapper = shallowMount(FilterSet, { localVue, propsData });
    wrapper.vm.changeFilter([0, 2, 3]);

    const expectedResult = [true, false, true, true, false];
    const result = wrapper.emitted().input[0][0];
    expect(result).toEqual(expectedResult);
  });

  // covers filters.length > 0, selectionIndices.length > 0, indices out of order,
  // indices have gap
  it('responds correctly to non-adjacent out-of-order filters selected', () => {
    // filters = [1, 2, 3, 4, 5, 6], selectionIndices = [4, 0, 2, 5]
    // expected = [true, false, true, false, true, true]
    const propsData = {
      value: [false, false, false, false, false, false],
      label: 'test',
      filters: [new Filter('Test 1', '1', () => {}, ['attr']),
        new Filter('Test 2', '2', () => {}, ['attr']),
        new Filter('Test 3', '3', () => {}, ['attr']),
        new Filter('Test 4', '4', () => {}, ['attr']),
        new Filter('Test 5', '5', () => {}, ['attr']),
        new Filter('Test 6', '6', () => {}, ['attr'])]
    };
    const wrapper = shallowMount(FilterSet, { localVue, propsData });
    wrapper.vm.changeFilter([4, 0, 2, 5]);

    const expectedResult = [true, false, true, false, true, true];
    const result = wrapper.emitted().input[0][0];
    expect(result).toEqual(expectedResult);
  });
});
