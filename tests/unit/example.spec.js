import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import moment from 'moment';
import ConflictDialog from '../../src/components/ConflictDialog.vue'

const localVue = createLocalVue();
localVue.use(Vuex);

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

const conflictInfo = {
  id: 45,
  other_name: 'Hello World (Edited)',
  other_agent: 'MacIntel Chrome Tab 2',
  other_date: '2019-09-10T00:51:29+00:00',
  other_contents:  {
    coursesOfStudy: ['girs'],
    selectedSubjects: [[{'title': 'Introduction to Algorithms', 'id': '6.006', 'units': 12, 'overrideWarnings': false, 'index': 0, 'semester': 0}],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    progressOverrides: {}
  },
  this_agent: 'MacIntel Chrome Tab 1',
  this_date: '2019-06-18T01:00:32+00:00'
}

describe('ConflictDialog', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        roads: {
          '$defaultroad$': {
            downloaded: moment().format(DATE_FORMAT),
            changed: moment().format(DATE_FORMAT),
            name: 'My First Road',
            agent: '',
            contents: {
              coursesOfStudy: ['girs'],
              selectedSubjects: Array.from(Array(16), () => []),
              progressOverrides: {}
            }
          }
        }
      }
    })
  })
  it('is a Vue instance', () => {
    const wrapper = shallowMount(ConflictDialog, { store, localVue });
    expect(wrapper.isVueInstance()).toBeTruthy();
  })
  it('opens the conflict dialog when a conflict is started', () => {
    const wrapper = shallowMount(ConflictDialog, { store, localVue, propData: conflictInfo });
    wrapper.vm.startConflict();
    // console.log(wrapper.find('.v-dialog'))
    expect(wrapper.vm.conflictDialog).toBe(true);
  })
})
