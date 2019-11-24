import Semester from '../../src/components/Semester.vue';
import { PassThrough } from 'stream';

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);

describe('Semester', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        subjectsIndex: [0, 1],
        genericIndex: [0, 1, 2],
        subjectsInfo: ['a', 'b'],
        genericCourses: [0, 1, 2],
        activeRoad: 'a',
        currentSemester: 1,
        itemAdding: false,
        addingFromCard: false
      },
      getters: {
        userYear: () => { return 0 }
      },
      mutations: {
        addClass: () => {
          return true;
        },
        moveClass: () => {
          return true;
        }
      }
    });
  });
  it('is a Vue instance', () => {
    const wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': 1, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
  it('calculates base year correctly', () => {
    // probably I shouldn't actually test this because we might change how semesterYear is calculated
    for (let i = 0; i < 12; i++) {
      let month;
      if (i < 9) {
        month = '0' + String(i + 1);
      } else {
        month = String(i + 1);
      };
      jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2014-' + month + '-14T11:01:58.135Z').valueOf()
        ); // only works once, then Date.now() goes back to meaning now
      const wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': 1, 'roadID': 1, 'isOpen': true }, store, localVue });
      if (Number(month) < 6 || Number(month) === 12) {
        expect(wrapper.vm.baseYear).toEqual(2014);
      } else {
        expect(wrapper.vm.baseYear).toEqual(2015);
      }
    }
  });
  it('calculates semesterYear correctly', () => {
    let a = true;
    for (let i = 0; i < 12; i++) {
      let month;
      if (i < 9) {
        month = '0' + String(i + 1);
      } else {
        month = String(i + 1);
      };
      // only works once, then Date.now() goes back to meaning now
      for (let j = 0; j < 16; j++) {
        jest
          .spyOn(global.Date, 'now')
          .mockImplementationOnce(() =>
            new Date('2014-' + month + '-14T11:01:58.135Z').valueOf()
          );
        const wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': j, 'roadID': 1, 'isOpen': true }, store, localVue });
        if (wrapper.vm.baseYear === 'test') {
            print('hi')
        };
        if (Number(month) > 5 && Number(month) < 12) {
          if (j === 0) {
            expect(wrapper.vm.semesterYear).toEqual('');
          } else if (j === 1) {
            expect(wrapper.vm.semesterYear).toEqual(2014);
          } else if (j < 5) {
            expect(wrapper.vm.semesterYear).toEqual(2015);
          } else if (j < 8) {
            expect(wrapper.vm.semesterYear).toEqual(2016);
          } else if (j < 11) {
            expect(wrapper.vm.semesterYear).toEqual(2017);
          } else if (j < 14) {
            expect(wrapper.vm.semesterYear).toEqual(2018);
          } else {
            expect(wrapper.vm.semesterYear).toEqual(2019);
          }
        } else {
          if (j === 0) {
            expect(wrapper.vm.semesterYear).toEqual('');
          } else if (j === 1) {
            expect(wrapper.vm.semesterYear).toEqual(2013);
          } else if (j < 5) {
            expect(wrapper.vm.semesterYear).toEqual(2014);
          } else if (j < 8) {
            expect(wrapper.vm.semesterYear).toEqual(2015);
          } else if (j < 11) {
            expect(wrapper.vm.semesterYear).toEqual(2016);
          } else if (j < 14) {
            expect(wrapper.vm.semesterYear).toEqual(2017);
          } else {
            expect(wrapper.vm.semesterYear).toEqual(2018);
          }
        }
      }
    };
  });
});
