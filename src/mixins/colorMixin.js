export default {
  data: function() {
    return {
      validCourses: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '14', '15', '16', '17', '18', '20', '21', '21A', '21W',
        'CMS', '21G', '21H', '21L', '21M', 'WGS', '22', '24', 'CC', 'CSB',
        'EC', 'EM', 'ES', 'HST', 'IDS', 'MAS', 'SCM', 'STS', 'SWE', 'SP'
      ]
    }
  },
  methods: {
    courseColor(id) {
      let course  = id.split('.')[0]
      if (this.validCourses.indexOf(course) !== -1) {
        return 'course-' + course
      } else {
        return 'course-none'
      }
    }
  }
}
