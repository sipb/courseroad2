export default {
  files: {
    123: {
      changed: '2020-12-23T12:04:01+00:00',
      name: 'Best Road Ever',
      agent: 'MacIntel Chrome Tab 1'
    },
    456: {
      changed: '2020-11-20T11:34:27+00:00',
      name: 'A Good Road',
      agent: 'Android'
    },
    1089: {
      changed: '2020-01-05T17:46:11+00:00',
      name: 'Example',
      agent: 'MacIntel Firefox Tab 2'
    }
  },
  file123: {
    changed: '2020-12-23T12:04:01+00:00',
    downloaded: '2020-12-28T15:00:17+00:00',
    name: 'Best Road Ever',
    agent: 'MacIntel Chrome Tab 1',
    id: '123',
    contents: {
      coursesOfStudy: ['girs'],
      selectedSubjects: [
        { title: 'Microeconomic Theory and Public Policy', level: 'U', overrideWarnings: false, semester: 1, units: 12, subject_id: '14.03' }
      ],
      progressOverrides: {},
      progressAssertions: {}
    }
  },
  file456: {
    changed: '2020-11-20T11:34:27+00:00',
    downloaded: '2020-11-20T11:35:30+00:00',
    name: 'A Good Road',
    agent: 'Android',
    id: '456',
    contents: {
      coursesOfStudy: ['girs', 'major21M-1'],
      selectedSubjects: [
        { title: 'Introduction to Music Technology', level: 'U', overrideWarnings: false, semester: 4, units: 12, subject_id: '21M.080' },
        { title: 'Mathematics for Computer Science', level: 'U', overrideWarnings: false, semester: 3, units: 12, subject_id: '6.042' }
      ],
      progressOverrides: {},
      progressAssertions: {}
    }
  },
  file1089: {
    downloaded: '2020-01-13T20:43:55+00:00',
    changed: '2020-01-05T17:46:11+00:00',
    name: 'Example',
    agent: 'MacIntel Firefox Tab 2',
    id: '789',
    contents: {
      coursesOfStudy: ['girs', 'major16'],
      selectedSubjects: [
        { title: 'Calculus', level: 'U', overrideWarnings: false, semester: 1, units: 12, subject_id: '18.02' },
        { title: 'Physics I', level: 'U', overrideWarnings: false, semester: 2, units: 12, subject_id: '8.01' }
      ],
      progressOverrides: {},
      progressAssertions: {}
    }
  }
};
