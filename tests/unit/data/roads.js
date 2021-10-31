import moment from 'moment';
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

export default {
  627816884: {
    55: {
      downloaded: moment().format(DATE_FORMAT),
      changed: moment().format(DATE_FORMAT),
      name: 'My Second Road',
      agent: '',
      contents: {
        coursesOfStudy: ['girs'],
        selectedSubjects: [
          { title: 'Introduction to Algorithms', subject_id: '6.006', units: 12, overrideWarnings: false, index: 0, semester: 0 },
          { title: 'Computation Structures', subject_id: '6.004', units: 12, overrideWarnings: false, index: 1, semester: 0 },
          { title: 'Principles of Chemical Science', subject_id: '5.111', units: 12, overrideWarnings: false, index: 2, semester: 1 },
          { title: 'Introduction to Algorithms', subject_id: '6.006', units: 12, overrideWarnings: false, index: 3, semester: 2 },
          { title: 'Generic Biology GIR', subject_id: 'GIR:BIOL', units: 12, overrideWarnings: false, index: 4, semester: 3 }
        ],
        progressOverrides: {}
      }
    }
  }
};
