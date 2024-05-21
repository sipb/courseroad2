import Road from "../../src/components/Road.vue";

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);

describe("Road", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        subjectsIndex: [0, 1],
        genericIndex: [0, 1, 2],
        subjectsInfo: ["a", "b"],
        genericCourses: [0, 1, 2],
        activeRoad: "a",
        currentSemester: 1,
        itemAdding: false,
        addingFromCard: false,
        userYear: 1,
        hideIAP: false,
      },
      getters: {
        userYear: (state) => {
          return state.userYear;
        },
        hideIAP: (state) => false,
      },
      mutations: {
        addClass: (state) => {
          return true;
        },
        moveClass: (state) => {
          return true;
        },
        setUserYear: (state, newYear) => {
          state.userYear = newYear;
        },
      },
    });
  });
  it("opens the changeYearDialog", () => {
    const wrapper = mount(Road, {
      stubs: ["semester"],
      propsData: {
        selectedSubjects: [
          [{ subject_id: 1 }],
          [{ subject_id: 2 }],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
        roadID: "1",
        addingFromCard: false,
        dragSemesterNum: 1,
      },
      store,
      localVue,
      mocks: { $cookies: { get: () => false, remove: () => false } },
    });
    expect(wrapper.vm.openRoadSettings).toBe(false);
    wrapper.vm.openRoadSettings = true;
    expect(wrapper.vm.openRoadSettings).toBe(true);
  });
  it("emits change-year when submit is selected", () => {
    const wrapper = mount(Road, {
      stubs: ["semester"],
      propsData: {
        selectedSubjects: [
          [{ subject_id: 1 }],
          [{ subject_id: 2 }],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
        roadID: "1",
        addingFromCard: false,
        dragSemesterNum: 1,
      },
      store,
      localVue,
      mocks: { $cookies: { get: () => false, remove: () => false } },
    });
    wrapper.vm.changeYearDialog = true;
    const myButton = wrapper.find("#change-year");
    myButton.trigger("click");
    const emitEvent = wrapper.emitted()["change-year"][0];
    expect(emitEvent).toBeTruthy();
  });
  it("updates year when year is changed in the store", () => {
    const wrapper = mount(Road, {
      stubs: ["semester"],
      propsData: {
        selectedSubjects: [
          [{ subject_id: 1 }],
          [{ subject_id: 2 }],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
        roadID: "1",
        addingFromCard: false,
        dragSemesterNum: 1,
      },
      store,
      localVue,
      mocks: { $cookies: { get: () => false, remove: () => false } },
    });
    expect(wrapper.vm.year).toBe(1);
    wrapper.vm.$store.commit("setUserYear", 2);
    expect(wrapper.vm.year).toBe(2);
  });
});
