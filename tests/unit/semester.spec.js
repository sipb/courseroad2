import Semester from '../../src/components/Semester.vue';

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
        userYear: () => { return 1 }
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
        expect(wrapper.vm.baseYear).toEqual(2013);
      } else {
        expect(wrapper.vm.baseYear).toEqual(2014);
      }
    }
  });
});
