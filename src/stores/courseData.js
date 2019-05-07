import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    activeRoad: '$defaultroad$',
    cookiesAllowed: undefined,
    genericCourses: [],
    genericIndex: {},
    // note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
    roads: {
      '$defaultroad$': {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: 'My First Road',
        agent: '',
        contents: {
          coursesOfStudy: ['girs'],
          selectedSubjects: [],
          progressOverrides: {}
        }
      }
    },
    subjectsIndex: {},
    subjectsInfo: []
  },
  mutations: {
    addClass (state, newClass) {
      state.roads[state.activeRoad].contents.selectedSubjects.push(newClass);
      Vue.set(state.roads[state.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    addReq (state, event) {
      state.roads[state.activeRoad].contents.coursesOfStudy.push(event);
      this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
      Vue.set(state.roads, state.activeRoad, state.roads[state.activeRoad]);
    },
    allowCookies (state) {
      state.cookiesAllowed = true;
    },
    disallowCookies (state) {
      state.cookiesAllowed = false;
    },
    deleteRoad (state, id) {
      Vue.delete(state.roads, id);
    },
    moveClass (state, { classIndex, semester }) {
      state.roads[state.activeRoad].contents.selectedSubjects[classIndex].semester = semester;
      Vue.set(state.roads[state.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    overrideWarnings (state, payload) {
      const classIndex = state.roads[state.activeRoad].contents.selectedSubjects.indexOf(payload.classInfo);
      Vue.set(state.roads[state.activeRoad].contents.selectedSubjects[classIndex], 'overrideWarnings', payload.override);
    },
    parseGenericCourses (state) {
      const girAttributes = {
        'PHY1': ['Physics 1 GIR', 'p1'],
        'PHY2': ['Physics 2 GIR', 'p2'],
        'CHEM': ['Chemistry GIR', 'c'],
        'BIOL': ['Biology GIR', 'b'],
        'CAL1': ['Calculus I GIR', 'm1'],
        'CAL2': ['Calculus II GIR', 'm2'],
        'LAB': ['Lab GIR', 'l1'],
        'REST': ['REST GIR', 'r']
      };
      // the titles of the hass and ci attributes are currently not used in the description on fireroad
      // I think they might be nice to display with the description, but as of now they are unused
      const hassAttributes = {
        'HASS-A': ['HASS Arts', 'ha'],
        'HASS-S': ['HASS Social Sciences', 'hs'],
        'HASS-H': ['Hass Humanities', 'hh']
      };
      const ciAttributes = {
        'CI-H': ['Communication Intensive', 'hc'],
        'CI-HW': ['Communication Intensive with Writing', 'hw']
      };
      const genericCourses = [];
      const baseGeneric = {
        description: 'Use this generic subject to indicate that you are fulfilling a requirement, but do not yet have a specific subject selected.',
        total_units: 12
      };
      const baseurl = 'http://student.mit.edu/catalog/search.cgi?search=&style=verbatim&when=*&termleng=4&days_offered=*&start_time=*&duration=*&total_units=*';
      for (const gir in girAttributes) {
        const offeredGir = getMatchingAttributes(gir, undefined, undefined);
        genericCourses.push(Object.assign({}, baseGeneric, offeredGir, {
          gir_attribute: gir,
          title: 'Generic ' + girAttributes[gir][0],
          subject_id: gir,
          url: baseurl + '&cred=' + girAttributes[gir][1] + '&commun_int=*'
        }));
      }
      for (const hass in hassAttributes) {
        const offeredHass = getMatchingAttributes(undefined, hass, undefined);
        genericCourses.push(Object.assign({}, baseGeneric, offeredHass, {
          hass_attribute: hass,
          title: 'Generic ' + hass,
          subject_id: hass,
          url: baseurl + '&cred=' + hassAttributes[hass][1] + '&commun_int=*'
        }));
        const offeredHassCI = getMatchingAttributes(undefined, hass, 'CI-H');
        genericCourses.push(Object.assign({}, baseGeneric, offeredHassCI, {
          hass_attribute: hass,
          communication_requirement: 'CI-H',
          title: 'Generic CI-H ' + hass,
          subject_id: 'CI-H ' + hass,
          url: baseurl + '&cred=' + hassAttributes[hass][1] + '&commun_int=' + ciAttributes['CI-H'][1]
        }));
      }
      for (const ci in ciAttributes) {
        const offeredCI = getMatchingAttributes(undefined, undefined, ci);
        genericCourses.push(Object.assign({}, baseGeneric, offeredCI, {
          communication_requirement: ci,
          title: 'Generic ' + ci,
          hass_attribute: 'HASS',
          subject_id: ci,
          url: baseurl + '&cred=*&commun_int=' + ciAttributes[ci][1]
        }));
      }
      state.genericCourses = genericCourses;
    },
    parseGenericIndex (state) {
      state.genericIndex = state.genericCourses.reduce(function (obj, item, index) {
        obj[item.subject_id] = index;
        return obj;
      }, {});
    },
    parseSubjectsIndex (state) {
      state.subjectsIndex = state.subjectsInfo.reduce(function (obj, item, index) {
        obj[item.subject_id] = index;
        return obj;
      }, {});
    },
    removeClass (state, classInfo) {
      const classIndex = state.roads[state.activeRoad].contents.selectedSubjects.indexOf(classInfo);
      state.roads[state.activeRoad].contents.selectedSubjects.splice(classIndex, 1);
      Vue.set(state.roads[state.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    removeReq (state, event) {
      const reqIndex = state.roads[state.activeRoad].contents.coursesOfStudy.indexOf(event);
      state.roads[state.activeRoad].contents.coursesOfStudy.splice(reqIndex, 1);
      Vue.set(this.roads[this.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    resetID (state, { oldid, newid }) {
      newid = newid.toString();
      Vue.set(state.roads, newid, state.roads[oldid]);
      if (state.activeRoad === oldid) {
        state.activeRoad = newid;
      }
      Vue.delete(state.roads, oldid);
    },
    setActiveRoad (state, activeRoad) {
      state.activeRoad = activeRoad;
    },
    setRoadProp (state, { id, prop, value }) {
      Vue.set(state.roads[id], prop, value);
    },
    setRoad (state, { id, road }) {
      Vue.set(state.roads, id, road);
    },
    setRoads (state, roads) {
      state.roads = roads;
    },
    setRoadName (state, { id, name }) {
      Vue.set(state.roads[id], 'name', name);
    },
    setSubjectsInfo (state, data) {
      state.subjectsInfo = data;
    },
    updateProgress (state, progress) {
      Vue.set(state.roads[state.activeRoad].contents.progressOverrides, progress.listID, progress.progress);
      Vue.set(state.roads[state.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    updateRoad (state, id, road) {
      Object.assign(state.roads[id], road);
    }
  },
  actions: {
    async loadAllSubjects ({ commit }) {
      const response = await axios.get(process.env.FIREROAD_URL + `/courses/all?full=true`);
      commit('setSubjectsInfo', response.data);
      commit('parseGenericCourses');
      commit('parseGenericIndex');
      commit('parseSubjectsIndex');
    }
  }
});

function getMatchingAttributes (gir, hass, ci) {
  const matchingClasses = store.state.subjectsInfo.filter(function (subject) {
    if (gir !== undefined && subject.gir_attribute !== gir) {
      return false;
    }
    if (hass !== undefined && subject.hass_attribute !== hass) {
      return false;
    }
    return !(ci !== undefined && subject.communication_requirement !== ci);
  });
  const totalObject = matchingClasses.reduce(function (accumObject, nextClass) {
    return {
      offered_spring: accumObject.offered_spring || nextClass.offered_spring,
      offered_summer: accumObject.offered_summer || nextClass.offered_summer,
      offered_IAP: accumObject.offered_IAP || nextClass.offered_IAP,
      offered_fall: accumObject.offered_fall || nextClass.offered_fall,
      in_class_hours: accumObject.in_class_hours + (nextClass.in_class_hours !== undefined ? nextClass.in_class_hours : 0),
      out_of_class_hours: accumObject.out_of_class_hours + (nextClass.out_of_class_hours !== undefined ? nextClass.out_of_class_hours : 0)
    };
  }, { offered_spring: false, offered_summer: false, offered_IAP: false, offered_fall: false, in_class_hours: 0, out_of_class_hours: 0 });
  totalObject.in_class_hours /= matchingClasses.length;
  totalObject.out_of_class_hours /= matchingClasses.length;
  return totalObject;
}

export default store;
