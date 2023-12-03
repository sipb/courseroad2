// Colors are at assets/css/coursecolors.css
export default {
  data: function () {
    return {
      validCourses: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '14', '15', '16', '17', '18', '20', '21', '21A', '21G',
        '21H', '21L', '21M', '21W', '22', '24', 'CC', 'CMS', 'CSB', 'EC', 'EM',
        'ES', 'HST', 'IDS', 'MAS', 'SCM', 'STS', 'WGS', 'SP', 'SWE', 'AS',
        'MS', 'NS'
      ],
      validGeneric: ['PHY1', 'PHY2', 'CHEM', 'BIOL', 'CAL1', 'CAL2', 'LAB', 'REST',
        'HASS-A', 'HASS-H', 'HASS-S', 'CI-H', 'CI-HW'
      ]
    };
  },
  methods: {
    // courseColor takes in subject
    courseColor: function (subject) {
      // Custom course have custom_color component
      if (subject.custom_color) {
        return 'custom_color-' + subject.custom_color.slice(1);
      }
      // Otherwise it's normal class which id determines color
      return this.courseColorFromId(subject.id || subject.subject_id);
    },
    // Takes a subject ID directly
    courseColorFromId: function (id) {
      if (id !== undefined) {
        let course = id.split('.')[0];
        if (course.indexOf('GIR:') >= 0) {
          course = course.substring(0, course.indexOf('GIR:')) + course.substring(course.indexOf('GIR:') + 4);
        }
        const girAttrs = course.split(' ').filter((c) => (this.validGeneric.indexOf(c) >= 0));
        if (this.validCourses.indexOf(course) !== -1) {
          return 'course-' + course;
        } else if (girAttrs.length > 0) {
          if (girAttrs.length === 1) {
            const attr = girAttrs[0];
            if (attr.indexOf('HASS') === 0) {
              return 'generic-' + course;
            } else if (attr.indexOf('CI') === 0) {
              return 'generic-' + course;
            }
          }
          return 'generic-GIR';
        }
      }
      return 'course-none';
    }
  }
};
