import moment from 'moment';
import Auth from '../../src/components/Auth.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueCookies from 'vue-cookies';
library.add(faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt);

import users from './data/users';
const axios = require('axios');

jest.mock('axios');

import $cookies from './__mocks__/cookies';

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.use(VueCookies);



const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

const fakeAuth = users[0];

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

const storeCookies = new Vuex.Store({
  state: {
    cookiesAllowed: true
  }
});

const storeNoCookies = new Vuex.Store({
  state: {
    cookiesAllowed: false
  }
});

const storeBasic = new Vuex.Store({
  state: {
    activeRoad: "45",
    cookiesAllowed: true,
    roads: {
      "45": {
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
  },
  mutations: {
    allowCookies (state) {
      state.cookiesAllowed = true;
    }
  }
})

describe('Auth', () => {
  afterEach(() => {
    axios.get.mockClear();
    axios.post.mockClear();
  }),
  it('mirrors store properties', () => {
    const store1 = new Vuex.Store({
      state: {
        activeRoad: 45,
        cookiesAllowed: false,
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
    })
    const propsData = {
      justLoaded: false,
      conflictInfo: conflictInfo
    }
    const wrapper1 = mount(Auth, { store: store1, localVue, propsData });
    expect(wrapper1.vm.activeRoad).toBe(store1.state.activeRoad);
    expect(wrapper1.vm.cookiesAllowed).toBe(store1.state.cookiesAllowed);
    expect(wrapper1.vm.roads).toMatchObject(store1.state.roads);
    const store2 = new Vuex.Store({
      state: {
        activeRoad: '$4$',
        cookiesAllowed: true,
        roads: {
          '$4$': {
            downloaded: moment().format(DATE_FORMAT),
            changed: moment().format(DATE_FORMAT),
            name: 'My Second Road',
            agent: 'Some agent',
            contents: {
              coursesOfStudy: ['girs', 'major6-1'],
              selectedSubjects: [[{ 'title': 'Introduction to Algorithms', 'id': '6.006', 'units': 12, 'overrideWarnings': false, 'index': 0, 'semester': 0 }, { 'title': 'Computation Structures', 'id': '6.004', 'units': 12, 'overrideWarnings': false, 'index': 1, 'semester': 0 }, { 'title': 'Principles of Chemical Science', 'id': '3.091', 'units': 12, 'overrideWarnings': false, 'index': 2, 'semester': 0 }], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
              progressOverrides: {}
            }
          }
        }
      }
    })
    const wrapper2 = mount(Auth, { store: store2, localVue, propsData });
    expect(wrapper2.vm.activeRoad).toBe(store2.state.activeRoad);
    expect(wrapper2.vm.cookiesAllowed).toBe(store2.state.cookiesAllowed);
    expect(wrapper2.vm.roads).toMatchObject(store2.state.roads);
  });
  it('displays the save button correctly', () => {
    const wrapper1 = mount(Auth, { store: storeNoCookies, localVue });
    const saveIcon1 = wrapper1.find('#save-icon');
    expect(saveIcon1.classes('gray--text')).toBe(true);
    expect(saveIcon1.find("i").text()).toMatch("save");
    wrapper1.setData({ accessInfo: {academic_id: 'test@mit.edu'},loggedIn: true });
    expect(saveIcon1.classes('primary--text')).toBe(true);
    expect(saveIcon1.find("i").text()).toMatch("save");

    const wrapper2 = mount(Auth, { store: storeCookies, localVue });
    const saveIcon2 = wrapper2.find('#save-icon');
    expect(saveIcon2.classes('primary--text')).toBe(true);
    expect(saveIcon2.find("i").text()).toMatch("save");
    wrapper2.setData({ saveWarnings: ['some warning']});
    expect(saveIcon2.classes('warning--text')).toBe(true);
    expect(saveIcon2.find("i").text()).toMatch("warning");
  });
  it('sets the correct tab IDs', () => {
     const wrapper = shallowMount(Auth, { store: storeCookies, localVue });
     
     // Initialize tab ID with no existing tab IDs
     wrapper.vm.setTabID();
     expect(sessionStorage.tabID).toBe('1');
     expect(wrapper.vm.tabID).toBe('1');
     expect(JSON.parse(wrapper.vm.$cookies.get('tabs'))).toEqual([1]);
     sessionStorage.removeItem('tabID');

     //Initialize tab ID with sequential existing tab IDs
     const initialTabsSeq = [1, 2, 3, 4];
     const expectedTabsSeq = initialTabsSeq.concat([5])
     wrapper.vm.$cookies.set('tabs', JSON.stringify(initialTabsSeq));
     wrapper.vm.setTabID();
     expect(sessionStorage.tabID).toBe('5');
     expect(wrapper.vm.tabID).toBe('5');
     expect(JSON.parse(wrapper.vm.$cookies.get('tabs'))).toEqual(expectedTabsSeq);
     sessionStorage.removeItem('tabID');

     //Initialize tab ID with gap in tab IDs
     const initialTabsGap = [1, 2, 4, 8];
     const expectedTabsGap = initialTabsGap.concat([9]);
     wrapper.vm.$cookies.set('tabs', JSON.stringify(initialTabsGap));
     wrapper.vm.setTabID();
     expect(sessionStorage.tabID).toBe('9');
     expect(wrapper.vm.tabID).toBe('9');
     expect(JSON.parse(wrapper.vm.$cookies.get('tabs'))).toEqual(expectedTabsGap);

     //Tab ID taken from session storage
     wrapper.setData({tabID: '27'});
     wrapper.vm.setTabID();
     expect(wrapper.vm.tabID).toBe('9');
     expect(JSON.parse(wrapper.vm.$cookies.get('tabs'))).toEqual(expectedTabsGap);

     //Tab ID set in cookies if absent
     wrapper.vm.$cookies.set('tabs', JSON.stringify(initialTabsGap));
     wrapper.setData({tabID: '27'});
     wrapper.vm.setTabID();
     expect(wrapper.vm.tabID).toBe('9');
     expect(JSON.parse(wrapper.vm.$cookies.get('tabs'))).toEqual(expectedTabsGap);

     //Tab ID set in cookies if no cookie set
     wrapper.vm.$cookies.remove('tabs');
     wrapper.setData({tabID: '27'});
     wrapper.vm.setTabID();
     expect(wrapper.vm.tabID).toBe('9');
     expect(JSON.parse(wrapper.vm.$cookies.get('tabs'))).toEqual([9]);

     sessionStorage.removeItem('tabID');
  });
  it('sends the correct tab ID when saving a road', () => {
    console.log('final test');
    $cookies.set('tabs', [1, 2, 4, 8]);
    $cookies.set('accessInfo', fakeAuth);
    const wrapper = shallowMount(Auth, { store: storeBasic, localVue , mocks: { $cookies }});
    wrapper.vm.saveRemote('45');
    console.log(axios.post.mock.calls);
  })
})
