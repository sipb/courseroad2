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
        itemAdding: undefined,
        addingFromCard: false,
        year: 0
      },
      getters: {
        userYear: (state) => { return state.year }
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
  it('calculates semesterYear correctly', () => {
    let wrapper;
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
        wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': j, 'roadID': 1, 'isOpen': true }, store, localVue });
        wrapper.vm.baseYear;
        if (Number(month - 1) >= 5) {
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
  it('calculates noLongerOffered correctly', () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    let index = 1;
    store.state.year = 1;
    let wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'spring-2013' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': false, 'source_semester': 'spring-2013' })).toEqual(false);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2013' })).toEqual(false);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2012' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'spring-2014' })).toEqual(false);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2014' })).toEqual(false);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 3;
    store.state.year = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'spring-2013' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': false, 'source_semester': 'spring-2013' })).toEqual(false);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2013' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2012' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'spring-2014' })).toEqual(false);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2014' })).toEqual(false);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 4;
    store.state.year = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    store.state.year = 1;
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'spring-2013' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': false, 'source_semester': 'spring-2013' })).toEqual(false);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2013' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2012' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'spring-2014' })).toEqual(true);
    expect(wrapper.vm.noLongerOffered({ 'is_historical': true, 'source_semester': 'fall-2014' })).toEqual(false);
  });
  it('calculates notCurrentlyOffered correctly', () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    let index = 1;
    store.state.year = 1;
    let wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2012-2013' })).toEqual(false);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2013-2014' })).toEqual(true);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2014-2015' })).toEqual(false);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 2;
    store.state.year = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2012-2013' })).toEqual(false);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2013-2014' })).toEqual(true);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2014-2015' })).toEqual(false);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 3;
    store.state.year = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2012-2013' })).toEqual(false);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2013-2014' })).toEqual(true);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2014-2015' })).toEqual(false);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 4;
    store.state.year = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2012-2013' })).toEqual(false);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2013-2014' })).toEqual(false);
    expect(wrapper.vm.notCurrentlyOffered({ 'not_offered_year': '2014-2015' })).toEqual(true);
  });
  it('calculates isSameYear correctly', () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    let index = 1;
    store.state.currentSemester = 1;
    let wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.isSameYear).toEqual(true);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 3;
    store.state.currentSemester = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.isSameYear).toEqual(true);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 4;
    store.state.currentSemester = 1;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.isSameYear).toEqual(false);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2014-11-14T11:01:58.135Z').valueOf()
      );
    index = 1;
    store.state.currentSemester = 4;
    wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': index, 'roadID': 1, 'isOpen': true }, store, localVue });
    expect(wrapper.vm.isSameYear).toEqual(false);
  });
  it('calculates offferedNow correctly', () => {
    const wrapper = mount(Semester, { stubs: { 'class': true }, propsData: { 'selectedSubjects': [1], 'semesterSubjects': [1], 'index': 1, 'roadID': 1, 'isOpen': true }, store, localVue });
    store.state.addingFromCard = true;
    expect(wrapper.vm.offeredNow).toEqual(false);
    store.state.itemAdding = { 'is_historical': true, 'source_semester': '2010-2011', 'not_offered_year': '2014-2015', 'offered_fall': true };
    expect(wrapper.vm.offeredNow).toEqual(false);
    store.state.itemAdding = { 'is_historical': false, 'source_semester': '2010-2011', 'not_offered_year': '2010-2011', 'offered_fall': true };
    expect(wrapper.vm.offeredNow).toEqual(true);
  });
});
