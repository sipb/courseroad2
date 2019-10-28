import moment from 'moment';
import Road from '../../src/components/Road.vue'
import Semester from '../../src/components/Semester.vue'

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);

describe('Road', () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            /*state: {
                subjectsIndex: [0, 1],
                genericIndex: [0, 1, 2],
                subjectsInfo: ['a', 'b'],
                genericCourses: [0, 1, 2],
                activeRoad: 'a',
                currentSemester: 1,
                itemAdding: false,
                addingFromCard: false,
            },
            getters: {
                userYear: () => {return 1}
            },
            mutations: {
                addClass: () => {
                    return true
                },
                moveClass: () => {
                    return true
                }
            }*/
        })
    });
    it('is a Vue instance', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        expect(wrapper.isVueInstance()).toBeTruthy();
    }),
    it('opens the change-year dialog', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        expect(wrapper.vm.changeYearDialog).toBe(false);
        wrapper.vm.changeYearDialog = true;
        expect(wrapper.vm.changeYearDialog).toBe(true);
    })
    /*it('emits change-year when a year is selected', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        wrapper.vm.newYear = 2;
        const emitEvent = wrapper.emitted()['change-year'][0];
        expect(emitEvent).toBeTruthy();
    })*/
})