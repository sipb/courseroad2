// import moment from 'moment';
import ClassInfo from '../../src/components/ClassInfo.vue';

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);

describe('ClassInfo', () => {
  /*
  Testing strategy for class info stack

  partition on # things in stack: = 1, > 1
  */
  it('shows correctly when there is only one thing on the stack', () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Hi', subject_id: '5.405' },
          { title: 'Test', subject_id: '15.709' },
          { title: 'Hello', subject_id: '20.60' }],
        subjectsIndex: {
          '5.405': 0,
          '15.709': 1,
          '20.60': 2
        },
        genericIndex: {},
        classInfoStack: ['5.405']
      }
    });
    const wrapper = mount(ClassInfo, { store, localVue });
    const card = wrapper.find('.class-info-card');
    const titleBar = card.find('.v-card__title');
    const cardBody = card.find('.v-card__text');
    expect(titleBar.text()).toEqual(expect.stringContaining('5.405'));
    expect(cardBody.text()).toEqual(expect.stringContaining('Hi'));
    expect(card.contains('#class_info_back_btn')).toBe(false);
  });

  it('shows correctly when there is more than one thing on the stack', () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [
          { title: 'Biology', subject_id: '7.013' },
          { title: 'Chemistry', subject_id: '5.111' },
          { title: 'Calculus', subject_id: '18.01' },
          { title: 'Physics', subject_id: '8.02' }
        ],
        subjectsIndex: {
          '5.111': 1,
          '8.02': 3,
          '18.01': 2,
          '7,013': 0
        },
        genericIndex: {},
        classInfoStack: ['5.111', '7.013', '8.02']
      }
    });
    const wrapper = mount(ClassInfo, { store, localVue });
    const card = wrapper.find('.class-info-card');
    const titleBar = card.find('.v-card__title');
    const cardBody = card.find('.v-card__text');
    const backButton = card.find('#class_info_back_btn');

    expect(titleBar.text()).toEqual(expect.stringContaining('8.02'));
    expect(cardBody.text()).toEqual(expect.stringContaining('Physics'));
    expect(card.contains("#class_info_back_btn")).toBe(true);
    backButton.trigger('click');

    expect(titleBar.text()).toEqual(expect.stringContaining('7.013'));
    expect(cardBody.text()).toEqual(expect.stringContaining('Biology'));
    expect(card.contains('#class_info_back_btn')).toBe(true);
    backButton.trigger('click');

    expect(titleBar.text()).toEqual(expect.stringContaining('5.111'));
    expect(cardBody.text()).toEqual(expect.stringContaining('Chemistry'));
    expect(card.contains('#class_info_back_btn')).toBe(false);
  });
});
