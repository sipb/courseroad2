import moment from 'moment';
import Road from '../../src/components/Road.vue'
import Semester from '../../src/components/Semester.vue'
import { isMainThread } from 'worker_threads';

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
                },
            }
        })
    });

    it('is a Vue instance', () => {
        const wrapper = mount(Semester, {stubs: {'class': true}, propsData: {'selectedSubjects': [1], 'semesterSubjects': [1], 'index': 1, 'roadID': 1, 'isOpen' : true,}, store, localVue});
        expect(wrapper.isVueInstance()).toBeTruthy();
    })
})