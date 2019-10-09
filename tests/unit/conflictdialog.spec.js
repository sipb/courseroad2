// to satisfy the ever-needy eslint
/* global it, expect, mount, beforeEach, describe, shallowMount Vue, Vuex, Vuetify, createLocalVue */
import moment from 'moment';
import ConflictDialog from '../../src/components/ConflictDialog.vue';

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

const conflictInfo = {
  id: 45,
  other_name: 'Hello World (Edited)',
  other_agent: 'MacIntel Chrome Tab 2',
  other_date: '2019-09-10T00:51:29+00:00',
  other_contents: {
    coursesOfStudy: ['girs'],
    selectedSubjects: [{ 'title': 'Introduction to Algorithms', 'id': '6.006', 'units': 12, 'overrideWarnings': false, 'index': 0, 'semester': 0 }, { 'title': 'Introduction to Algorithms', 'id': '6.006', 'units': 12, 'overrideWarnings': false, 'index': 1, 'semester': 0 }, { 'title': 'Principles of Chemical Science', 'id': '5.111', 'units': 12, 'overrideWarnings': false, 'index': 2, 'semester': 0 }],
    progressOverrides: {}
  },
  this_agent: 'MacIntel Chrome Tab 1',
  this_date: '2019-06-18T01:00:32+00:00'
};

describe('ConflictDialog', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        roads: {
          45: {
            downloaded: moment().format(DATE_FORMAT),
            changed: moment().format(DATE_FORMAT),
            name: 'My First Road',
            agent: '',
            contents: {
              coursesOfStudy: ['girs'],
              selectedSubjects: [[{ 'title': 'Introduction to Algorithms', 'id': '6.006', 'units': 12, 'overrideWarnings': false, 'index': 0, 'semester': 0 }, { 'title': 'Computation Structures', 'id': '6.004', 'units': 12, 'overrideWarnings': false, 'index': 1, 'semester': 0 }, { 'title': 'Principles of Chemical Science', 'id': '5.111', 'units': 12, 'overrideWarnings': false, 'index': 2, 'semester': 0 }], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
              progressOverrides: {}
            }
          }
        }
      }
    });
  });
  it('is a Vue instance', () => {
    const wrapper = shallowMount(ConflictDialog, { store, localVue });
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
  it('opens the conflict dialog when a conflict is started', () => {
    const wrapper = mount(ConflictDialog, { store, localVue, propsData: { conflictInfo } });
    expect(wrapper.vm.conflictDialog).toBe(false);
    wrapper.vm.startConflict();
    expect(wrapper.vm.conflictDialog).toBe(true);
    const dialog = wrapper.find('.v-dialog');
    expect(dialog.exists()).toBe(true);
    expect(dialog.isVisible()).toBe(true);
  });
  it('closes the conflict dialog when a conflict is resolved', () => {
    const wrapper = mount(ConflictDialog, { store, localVue, propsData: { conflictInfo } });
    wrapper.vm.startConflict();
    wrapper.vm.resolveConflict();
    expect(wrapper.vm.conflictDialog).toBe(false);
    const dialog = wrapper.find('.v-dialog');
    expect(dialog.exists()).toBe(true);
    expect(dialog.isVisible()).toBe(false);
  });
  it('does not open the conflict dialog without conflict information', () => {
    const wrapper = mount(ConflictDialog, { store, localVue });
    wrapper.vm.startConflict();
    const dialog = wrapper.find('.v-dialog');
    expect(dialog.exists()).toBe(false);
  });
  it('renders subjects correctly', () => {
    const wrapper = mount(ConflictDialog, { store, localVue, propsData: { conflictInfo } });
    wrapper.vm.startConflict();
    const cloudSubjects = wrapper.find('#selected-subjects-cloud').findAll('span');
    const localSubjects = wrapper.find('#selected-subjects-local').findAll('span');
    for (var i = 0; i < conflictInfo.other_contents.selectedSubjects.length; i++) {
      expect(cloudSubjects.at(i).text()).toBe(conflictInfo.other_contents.selectedSubjects[i].id);
    }
    for (i = 0; i < store.state.roads[45].contents.selectedSubjects.flat().length; i++) {
      expect(localSubjects.at(i).text()).toBe(store.state.roads[45].contents.selectedSubjects.flat()[i].id);
    }
  });
  it('colors subjects correctly', () => {
    const wrapper = mount(ConflictDialog, { store, localVue, propsData: { conflictInfo } });
    wrapper.vm.startConflict();
    const cloudSubjects = wrapper.find('#selected-subjects-cloud').findAll('span');
    const localSubjects = wrapper.find('#selected-subjects-local').findAll('span');
    expect(localSubjects.at(0).classes('blue--text')).toBe(false);
    expect(localSubjects.at(1).classes('blue--text')).toBe(true);
    expect(localSubjects.at(2).classes('blue--text')).toBe(false);
    expect(cloudSubjects.at(0).classes('blue--text')).toBe(false);
    expect(cloudSubjects.at(1).classes('blue--text')).toBe(true);
    expect(cloudSubjects.at(2).classes('blue--text')).toBe(false);
  });
  it('emits event to keep local contents', () => {
    const wrapper = mount(ConflictDialog, { store, localVue, propsData: { conflictInfo } });
    wrapper.vm.startConflict();
    const localColumn = wrapper.find('#local-column');
    const keepLocalButton = localColumn.find('.v-btn');
    keepLocalButton.trigger('click');
    const emitEvent = wrapper.emitted()['update-remote'][0];
    expect(emitEvent).toBeTruthy();
    expect(emitEvent[0]).toEqual(45);
  });
  it('emits event to keep remote contents', () => {
    const wrapper = mount(ConflictDialog, { store, localVue, propsData: { conflictInfo } });
    wrapper.vm.startConflict();
    const cloudColumn = wrapper.find('#cloud-column');
    const keepRemoteButton = cloudColumn.find('.v-btn');
    keepRemoteButton.trigger('click');
    const emitEvent = wrapper.emitted()['update-local'][0];
    expect(emitEvent).toBeTruthy();
    expect(emitEvent[0]).toEqual(45);
  });
});
