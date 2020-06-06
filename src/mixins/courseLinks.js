export default {
  data: function () {
    return {
      courseLinks: [
        {
          courses: ['major6-1', 'major6-2', 'major6-3', 'major6-7', 'major6-14', 'minor6', 'master6-P'],
          link: 'http://eecsappsrv.mit.edu/students/',
          text: 'Course 6 Student Portal (+Audit)'
        },
        {
          courses: ['neetLM-CB', 'neetLM-IE', 'neetLM-TE', 'neetLM-SB', 'neetLM-MDE', 'neetLM'],
          link: 'https://neet.mit.edu/threads/lm',
          text: 'NEET Living Machines Website'
        },
        {
          courses: ['neetAM'],
          link: 'https://neet.mit.edu/threads/am',
          text: 'NEET Autonomous Machines Website'
        },
        {
          courses: ['neetAAM'],
          link: 'https://neet.mit.edu/threads/amm',
          text: 'NEET Advanced Materials Machines Website'
        },
        {
          courses: ['neetDC'],
          link: 'https://neet.mit.edu/threads/dc',
          text: 'NEET Digital Cities Website'
        },
        {
          courses: ['neetCES'],
          link: 'https://neet.mit.edu/threads/rem',
          text: 'NEET Renewable Energy Machines'
        }
      ]
    };
  },
  methods: {
    getCourseLinks: function (selectedReqs) {
      const links = [];
      for (const { courses, link, text } of this.courseLinks) {
        if (selectedReqs.some((course) => courses.includes(course))) {
          links.push({ link, text });
        }
      }
      console.log(links);
      return links;
    }
  }
};
