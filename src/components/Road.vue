<template>
  <div>
    <!-- FYI can't use key as prop: https://stackoverflow.com/questions/47783396/access-key-from-child-component-in-vue -->
    <!-- v-for index in N starts at 1... -->
    <semester v-for="index in 8"
              :key="index-1"
              v-bind:index="index-1"
              v-bind:selectedSubjects="selectedSubjects">
    </semester>
  </div>
</template>


<script>
import Semester from './Semester.vue'

export default {
  name: 'Semester',
  components: {
    'semester': Semester
  },
  data: function () { return {
      // TODO: Really we should grab this from a global datastore
      // now in the same format as FireRoad
      selectedSubjects : [
        {
          overrideWarnings : false,
          semester : 0,
          title : "Generic Physics I GIR",
          id : "PHY1",
          units : 12
        },
        {
          overrideWarnings : false,
          semester : 1,
          title : "Principles of Chemical Science",
          id : "5.112",
          units : 12
        },
        {
          overrideWarnings : false,
          semester : 4,
          title : "Fundamentals of Programming",
          id : "6.009",
          units : 12
        },
        {
          overrideWarnings : false,
          semester : 0,
          title : "Intro to EECS",
          id : "6.01",
          units : 12
        },
        {
          overrideWarnings : false,
          semester : 4,
          title : "Advanced Music Performance",
          id : "21M.480",
          units : 6
        },
        {
          overrideWarnings : false,
          semester : 6,
          title : "Advanced Music Performance",
          id : "21M.480",
          units : 6
        }
      ]
    }
  }
}
</script>
