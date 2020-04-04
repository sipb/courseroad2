import ClassSearch from '../../src/components/ClassSearch.vue';

Vue.use(Vuetify);
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueCookies);

const textSearch = document.createElement('div');
textSearch.id = 'searchInputTF';
document.body.appendChild(textSearch);

const infoCard = document.createElement('div');
infoCard.id = 'classInfoCard';
document.body.appendChild(infoCard);

function expectSearchResults(wrapper, subjects) {
  const cells = wrapper.find('.v-datatable').find('tbody').findAll('tr');
  expect(cells.length).toBe(subjects.length);
  for (var i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const cellText = cells.at(i).text();
    expect(cellText).toEqual(expect.stringContaining(subject.title));
    expect(cellText).toEqual(expect.stringContaining(subject.subject_id));
  }
}

function expectNoSearchResults(wrapper, store) {
  const menu = wrapper.find('.v-datatable');
  const cells = menu.find('tbody').findAll('td');
  if (cells.length === 1) {
    const text = cells.at(0).text();
    store.state.subjectsInfo.forEach((subject) => {
      expect(text).toEqual(expect.not.stringContaining(subject.title));
      expect(text).toEqual(expect.not.stringContaining(subject.subject_id));
    });
  } else {
    expect(cells.length).toBe(0);
  }
}

describe('ClassSearch', () => {
  /*
  Testing strategy for autocomplete

  partition on filters selected: no filters, filters in one group,
                                filters in multiple groups
  partition on searchInput length: = 0, > 0
  partition on searchInput: regex, not intended to be regex
  partition on searchInput: class title, class number, neither
  */

  // covers no filters, searchInput length = 0, not regex, neither
  it('shows no results with empty search', () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{title: 'Global Change Science', subject_id: '1.071'},
                       {title: 'Seminar in Atomistic Simulation', subject_id: '10.956'},
                       {title: 'The City in Film', subject_id: '11.139'}],
        classInfoStack: []
      }
    });
    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    expect(wrapper.vm.autocomplete).toEqual([]);
    expectNoSearchResults(wrapper, store);
  });

  // covers no filters, searchInput length > 0, regex, class title
  it('displays correct results with regex title search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{title: 'Introductory Biology', subject_id: '7.016'},
                       {title: 'French Photography', subject_id: '21G.049'},
                       {title: 'Understanding Contemporary French Politics', subject_id: '21G.053'},
                       {title: 'France: Enlightenment and Revolution', subject_id: '21G.054'},
                       {title: 'French I', subject_id: '21G.301'},
                       {title: 'Writing (Like the) French', subject_id: '21G.308'},
                       {title: 'Shakespeare on Film and Media', subject_id: '21L.431'},
                       {title: 'Freight Transportation', subject_id: 'SCM.266'},
                       {title: 'New Culture of Gender: Queer France', subject_id: 'WGS.233'}],
        classInfoStack: []
      }
    });

    const expectedResults = [{title: 'French Photography', subject_id: '21G.049'},
                             {title: 'France: Enlightenment and Revolution', subject_id: '21G.054'},
                             {title: 'French I', subject_id: '21G.301'},
                             {title: 'Understanding Contemporary French Politics', subject_id: '21G.053'},
                             {title: 'Writing (Like the) French', subject_id: '21G.308'},
                             {title: 'New Culture of Gender: Queer France', subject_id: 'WGS.233'}];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: '(French|France)'});
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });
});
