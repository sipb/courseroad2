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
            state: {
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
            }
        })
    });
    it('is a Vue instance', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        expect(wrapper.isVueInstance()).toBeTruthy();
    }),
    it('opens the changeYearDialog', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        expect(wrapper.vm.changeYearDialog).toBe(false);
        wrapper.vm.changeYearDialog = true;
        expect(wrapper.vm.changeYearDialog).toBe(true);
    }),
    it('emits change-year when submit is selected', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        wrapper.vm.changeYearDialog = true;
        const myButton = wrapper.find('#change-year');
        myButton.trigger('click');
        const emitEvent = wrapper.emitted()['change-year'][0];
        expect(emitEvent).toBeTruthy();
    }),
    it('changes year when a year is selected', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
        expect(wrapper.vm.year).toBe(1);
        //expect(wrapper.vm.$data.items).toHaveLength(2);
        let yearChoices = wrapper.find('#year-choices');
        const menu = yearChoices.find('.v-input__slot') // doesn't find anything
        //menu.trigger('click');
        //expect(yearChoices.selectedItems).toHaveLength(4);
       // yearChoices.at(0).setSelected(2);
    }),
    it('does not emit change-year or change new-year when cancel is submitted', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
    }),
    it('displays open semesters', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
    }),
    it('does not display closed semesters', () => {
        const wrapper = mount(Road, {stubs: {'semester': true}, propsData: {'selectedSubjects': [1, 2], 'roadID': 1, 'addingFromCard': false, 'dragSemesterNum': false, }, store, localVue});
    })
})