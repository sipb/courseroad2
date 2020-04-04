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

function expectSearchResults (wrapper, subjects) {
  const cells = wrapper.find('.v-datatable').find('tbody').findAll('tr');
  expect(cells.length).toBe(subjects.length);
  for (var i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const cellText = cells.at(i).text();
    expect(cellText).toEqual(expect.stringContaining(subject.title));
    expect(cellText).toEqual(expect.stringContaining(subject.subject_id));
  }
}

function expectNoSearchResults (wrapper, store) {
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
  partition on searchInput: regex, not intended to be regex
  partition on searchInput: class title, class number, empty search
  partition on search results: 0 results, > 0 results
  */

  // covers no filters, not regex, empty search, 0 results
  it('shows no results with empty search', () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Global Change Science', subject_id: '1.071' },
          { title: 'Seminar in Atomistic Simulation', subject_id: '10.956' },
          { title: 'The City in Film', subject_id: '11.139' }],
        classInfoStack: []
      }
    });
    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    expect(wrapper.vm.autocomplete).toEqual([]);
    expectNoSearchResults(wrapper, store);
  });

  // covers no filters, regex, class title, > 0 results
  it('displays correct results with regex title search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Introductory Biology', subject_id: '7.016' },
          { title: 'French Photography', subject_id: '21G.049' },
          { title: 'Understanding Contemporary French Politics', subject_id: '21G.053' },
          { title: 'France: Enlightenment and Revolution', subject_id: '21G.054' },
          { title: 'French I', subject_id: '21G.301' },
          { title: 'Writing (Like the) French', subject_id: '21G.308' },
          { title: 'Shakespeare on Film and Media', subject_id: '21L.431' },
          { title: 'Freight Transportation', subject_id: 'SCM.266' },
          { title: 'New Culture of Gender: Queer France', subject_id: 'WGS.233' }],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'French Photography', subject_id: '21G.049' },
      { title: 'France: Enlightenment and Revolution', subject_id: '21G.054' },
      { title: 'French I', subject_id: '21G.301' },
      { title: 'Understanding Contemporary French Politics', subject_id: '21G.053' },
      { title: 'Writing (Like the) French', subject_id: '21G.308' },
      { title: 'New Culture of Gender: Queer France', subject_id: 'WGS.233' }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: '(French|France)' });
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers no filters, regex, class number, > 0 results
  it('displays correct results with regex class number search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Photonic Materials', subject_id: '2.718' },
          { title: 'Sustainable Chemical Metallurgy', subject_id: '3.19' },
          { title: 'Signals and Systems', subject_id: '6.003' },
          { title: 'Strobe Project Laboratory', subject_id: '6.163' },
          { title: 'Computer Graphics', subject_id: '6.837' },
          { title: 'System Safety', subject_id: '16.63' },
          { title: 'Real Analysis', subject_id: '18.100A' },
          { title: 'Combinatorial Analysis', subject_id: '18.211' },
          { title: 'Algebra I', subject_id: '18.701' },
          { title: 'Introduction to Topology', subject_id: '18.904' },
          { title: 'What is Capitalism?', subject_id: '21A.461' },
          { title: 'French I', subject_id: '21G.301' }],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'Signals and Systems', subject_id: '6.003' },
      { title: 'Strobe Project Laboratory', subject_id: '6.163' },
      { title: 'Computer Graphics', subject_id: '6.837' },
      { title: 'Real Analysis', subject_id: '18.100A' },
      { title: 'Combinatorial Analysis', subject_id: '18.211' },
      { title: 'Algebra I', subject_id: '18.701' },
      { title: 'Introduction to Topology', subject_id: '18.904' },
      { title: 'Photonic Materials', subject_id: '2.718' },
      { title: 'System Safety', subject_id: '16.63' },
      { title: 'What is Capitalism?', subject_id: '21A.461' }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: '(6|18)' });
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers no filters, not intended to be regex, class title, > 0 results
  it('displays correct results with class title search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Engineering Computation and Data Science', subject_id: '1.00' },
          { title: 'Solving Big Engineering Problems', subject_id: '1.008' },
          { title: 'Engineering Sustainability: Analysis and Design', subject_id: '1.020' },
          { title: 'Mechanics of Materials', subject_id: '1.035' },
          { title: 'Ethics for Engineerings', subject_id: '1.082' },
          { title: 'Thermal-Fluids Engineering I', subject_id: '2.005' },
          { title: 'Engineering Innovation and Design', subject_id: '6.902' },
          { title: 'Engineering Leadership Lab', subject_id: '6.913' },
          { title: 'Venture Engineering', subject_id: '15.373' },
          { title: 'Human Systems Engineering', subject_id: '16.400' },
          { title: 'System Safety', subject_id: '16.63' },
          { title: 'Algebraic Combinatorics', subject_id: '18.212' },
          { title: 'Old English and Beowulf', subject_id: '21L.601' }
        ],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'Engineering Computation and Data Science', subject_id: '1.00' },
      { title: 'Engineering Sustainability: Analysis and Design', subject_id: '1.020' },
      { title: 'Engineering Innovation and Design', subject_id: '6.902' },
      { title: 'Engineering Leadership Lab', subject_id: '6.913' },
      { title: 'Solving Big Engineering Problems', subject_id: '1.008' },
      { title: 'Ethics for Engineerings', subject_id: '1.082' },
      { title: 'Thermal-Fluids Engineering I', subject_id: '2.005' },
      { title: 'Venture Engineering', subject_id: '15.373' },
      { title: 'Human Systems Engineering', subject_id: '16.400' }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: 'Engineer' });
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers no filters, not intended to be regex, class number, > 0 results
  it('displays correct results with class number search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Introduction to Design', subject_id: '2.00' },
          { title: 'Design of Ocean Systems', subject_id: '2.019' },
          { title: 'Stochastic Systems', subject_id: '2.122' },
          { title: 'Introduction to Modeling and Simulation', subject_id: '3.021' },
          { title: 'Medical Device Design', subject_id: '6.026' },
          { title: 'Rock Physics', subject_id: '12.533' },
          { title: 'Solar System Dynamics', subject_id: '12.603' },
          { title: 'Principles of Automatic Control', subject_id: '16.06' },
          { title: 'Causes and Prevention of War', subject_id: '17.42' },
          { title: 'Immunology', subject_id: '20.630' },
          { title: 'Cultures of East Asia', subject_id: '21A.140' },
          { title: 'Motion Theater', subject_id: '21M.645' },
          { title: 'Nuclear Engineering Design', subject_id: '22.33' },
          { title: 'Radiation Biophysics', subject_id: '22.55' },
          { title: 'Sustainable Energy', subject_id: '22.811' }],
        classInfoStack: []
      }
    });
    const expectedResults = [{ title: 'Introduction to Design', subject_id: '2.00' },
      { title: 'Design of Ocean Systems', subject_id: '2.019' },
      { title: 'Stochastic Systems', subject_id: '2.122' },
      { title: 'Rock Physics', subject_id: '12.533' },
      { title: 'Solar System Dynamics', subject_id: '12.603' },
      { title: 'Nuclear Engineering Design', subject_id: '22.33' },
      { title: 'Radiation Biophysics', subject_id: '22.55' },
      { title: 'Sustainable Energy', subject_id: '22.811' },
      { title: 'Immunology', subject_id: '20.630' },
      { title: 'Cultures of East Asia', subject_id: '21A.140' },
      { title: 'Motion Theater', subject_id: '21M.645' },
      { title: 'Introduction to Modeling and Simulation', subject_id: '3.021' },
      { title: 'Medical Device Design', subject_id: '6.026' }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: '2.' });
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers filters in one group, not regex, empty search, > 0 results
  it('displays correct results with filter search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Climate Change', subject_id: '1.009', total_units: 3 },
          { title: 'Probability and Causal Inference', subject_id: '1.010', total_units: 12 },
          { title: 'Fundamentals of Ecology', subject_id: '1.018', total_units: 12 },
          { title: 'Fundamentals of Ecology I', subject_id: '1.018A', total_units: 6 },
          { title: 'Stochastic Systems', subject_id: '2.121', total_units: 12 },
          { title: 'Creative Computation', subject_id: '4.118', total_units: 12 },
          { title: 'How to Design (Almost) Anything', subject_id: '4.141', total_units: 18 },
          { title: 'The City in Film', subject_id: '11.139', total_units: 9 },
          { title: 'Youth Political Participation', subject_id: '11.151', total_units: 12 },
          { title: 'Petrology', subject_id: '12.109', total_units: 15 },
          { title: 'Entrepreneurship Lab', subject_id: '15.3991', total_units: 12 },
          { title: 'MIT Symphony', subject_id: '21M.421', total_units: 6 },
          { title: 'Music Theater Workshop', subject_id: '21M.704', total_units: 9 },
          { title: 'Script Analysis', subject_id: '21M.710', total_units: 12 }],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'Probability and Causal Inference', subject_id: '1.010', total_units: 12 },
      { title: 'Fundamentals of Ecology', subject_id: '1.018', total_units: 12 },
      { title: 'Stochastic Systems', subject_id: '2.121', total_units: 12 },
      { title: 'Creative Computation', subject_id: '4.118', total_units: 12 },
      { title: 'Youth Political Participation', subject_id: '11.151', total_units: 12 },
      { title: 'Entrepreneurship Lab', subject_id: '15.3991', total_units: 12 },
      { title: 'Script Analysis', subject_id: '21M.710', total_units: 12 }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    const btn = wrapper.find('#filter-12');
    btn.trigger('click');
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers filters in one group, not regex, class number, > 0 results
  it('displays correct results with filter class number search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'The Anthropology of Biology', subject_id: '21A.303', offered_fall: true, offered_spring: false },
          { title: 'Ethnography', subject_id: '21A.829', offered_fall: true, offered_spring: false },
          { title: 'Chinese I (Regular)', subject_id: '21G.101', offered_fall: true, offered_spring: false },
          { title: 'French I', subject_id: '21G.301', offered_fall: true, offered_spring: true },
          { title: 'Italian I', subject_id: '21G.651', offered_fall: false, offered_spring: false },
          { title: 'Spanish III in Madrid', subject_id: '21G.793', offered_fall: false, offered_spring: false },
          { title: 'Portuguese I', subject_id: '21G.801', offered_fall: false, offered_spring: false },
          { title: 'Japanese I', subject_id: '21G.501', offered_fall: true, offered_spring: false },
          { title: 'Downtown', subject_id: '21H.321', offered_fall: false, offered_spring: true },
          { title: 'Music and Technology', subject_id: '21M.380', offered_fall: true, offered_spring: true }],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'Chinese I (Regular)', subject_id: '21G.101', offered_fall: true, offered_spring: false },
      { title: 'French I', subject_id: '21G.301', offered_fall: true, offered_spring: true },
      { title: 'Japanese I', subject_id: '21G.501', offered_fall: true, offered_spring: false }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: '21G.' });
    wrapper.find('#filter-Fall').trigger('click');
    wrapper.find('#filter-Spring').trigger('click');
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers filters in multiple groups, not regex, empty search, > 0 results
  it('displays correct results with multiple filter group search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Groundwater Hydrology', subject_id: '1.072' },
          { title: 'Pharmaceutical Engineering', subject_id: '10.424' },
          { title: 'The Politics of Crime and Policing', subject_id: '17.56', communication_requirement: 'CI-H' },
          { title: 'French Photography', subject_id: '21G.049', communication_requirement: 'CI-H', hass_attribute: 'HASS-A' },
          { title: 'Cinema in Japan and Korea', subject_id: '21G.094', hass_attribute: 'HASS-A' },
          { title: 'Black Matters: Introduction to Black Studies', subject_id: '21H.106', communication_requirement: 'CI-H', hass_attribute: 'HASS-A,HASS-H' },
          { title: 'Chinese Calligraphy', subject_id: '21G.111', hass_attribute: 'HASS-A' },
          { title: 'The Ancient World: Greece', subject_id: '21H.130', communication_requirement: 'CI-H' },
          { title: 'Folk Music of the British Isles and North America', subject_id: '21L.023', communication_requirement: 'CI-H', hass_attribute: 'HASS-A' },
          { title: 'Big Books', subject_id: '21L.320' },
          { title: 'Costume Design', subject_id: '21M.732', hass_attribute: 'HASS-A' },
          { title: 'Contemporary American Theater', subject_id: '21M.714', communication_requirement: 'CI-H', hass_attribute: 'HASS-A' },
          { title: 'News Writing', subject_id: '21W.736', hass_attribue: 'HASS-H' }],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'French Photography', subject_id: '21G.049', communication_requirement: 'CI-H', hass_attribute: 'HASS-A' },
      { title: 'Black Matters: Introduction to Black Studies', subject_id: '21H.106', communication_requirement: 'CI-H', hass_attribute: 'HASS-A,HASS-H' },
      { title: 'Folk Music of the British Isles and North America', subject_id: '21L.023', communication_requirement: 'CI-H', hass_attribute: 'HASS-A' },
      { title: 'Contemporary American Theater', subject_id: '21M.714', communication_requirement: 'CI-H', hass_attribute: 'HASS-A' }];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.find('#filter-HASS-A').trigger('click');
    wrapper.find('#filter-CI-Any').trigger('click');
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });

  // covers filters in multiple groups, not regex, class title, > 0 results
  it('displays correct results with multiple filter group class title search', async () => {
    const store = new Vuex.Store({
      state: {
        genericCourses: [],
        subjectsInfo: [{ title: 'Fundamentals of Ecology', subject_id: '1.018', offered_fall: true, total_units: 12 },
          { title: 'Advanced Soil Mechanics', subject_id: '1.032', offered_fall: true, total_units: 9 },
          { title: 'Fundamentals of Energy in Buildings', subject_id: '1.044', offered_fall: true, total_units: 12 },
          { title: 'Fundamentals of Engineering Design', subject_id: '2.00A', offered_fall: false, total_units: 9 },
          { title: 'Fundamentals of Nanoengineering', subject_id: '2.370', offered_fall: false, total_units: 12 },
          { title: 'Fundamentals of Smart and Resilient Grids', subject_id: '2.603', offered_fall: true, total_units: 12 },
          { title: 'Fundamentals of Energy in Buildings', subject_id: '2.66', offered_fall: true, total_units: 12 },
          { title: 'Visual Communication Fundamentals', subject_id: '4.053', offered_fall: true, total_units: 12 },
          { title: 'Fundamentals of Chemical Biology', subject_id: '5.08', offered_fall: false, total_units: 12 },
          { title: 'Principles of Chemical Science', subject_id: '5.111', offered_fall: true, total_units: 12 },
          { title: 'Organic Chemistry I', subject_id: '5.12', offered_fall: true, total_units: 12 },
          { title: 'Archaeological Science', subject_id: '5.24', offered_fall: false, total_units: 9 },
          { title: 'Fundamentals of Spectroscopy', subject_id: '5.351', offered_fall: true, total_units: 4 },
          { title: 'Electrochemical Energy Systems', subject_id: '10.426', offered_fall: false, total_units: 12 },
          { title: 'Computational Chemistry', subject_id: '10.437', offered_fall: true, total_units: 12 },
          { title: 'Patent Law Fundamentals', subject_id: '15.620', offered_fall: true, total_units: 3 },
          { title: 'Playwriting Fundamentals', subject_id: '21M.604', offered_fall: true, total_units: 12 }
        ],
        classInfoStack: []
      }
    });

    const expectedResults = [{ title: 'Fundamentals of Ecology', subject_id: '1.018', offered_fall: true, total_units: 12 },
      { title: 'Fundamentals of Energy in Buildings', subject_id: '1.044', offered_fall: true, total_units: 12 },
      { title: 'Fundamentals of Smart and Resilient Grids', subject_id: '2.603', offered_fall: true, total_units: 12 },
      { title: 'Fundamentals of Energy in Buildings', subject_id: '2.66', offered_fall: true, total_units: 12 },
      { title: 'Visual Communication Fundamentals', subject_id: '4.053', offered_fall: true, total_units: 12 },
      { title: 'Playwriting Fundamentals', subject_id: '21M.604', offered_fall: true, total_units: 12 }
    ];

    const propsData = { searchInput: '' };
    const wrapper = mount(ClassSearch, { store, localVue, propsData, sync: false });
    wrapper.setProps({ searchInput: 'Fundamentals' });
    wrapper.find('#filter-Fall').trigger('click');
    wrapper.find('#filter-6-15').trigger('click');
    await Vue.nextTick();
    expect(wrapper.vm.autocomplete).toEqual(expectedResults);
    expectSearchResults(wrapper, expectedResults);
  });
});
