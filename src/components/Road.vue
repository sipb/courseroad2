<template>
  <!-- more on expansion panels (and more examples): https://vuetifyjs.com/en/components/expansion-panels -->
  <!-- this is the example I copied: https://vuetifyjs.com/en/components/expansion-panels#expand -->
  <v-expansion-panel
    v-model="visibleList"
    expand
  >
    <!-- v-for index in N starts at 1... -->
    <v-expansion-panel-content
      v-for="index in 8"
      :key="index-1"
    >
      <!-- not sure why but I can't put this in the semester file, darn -->
      <div slot="header">Semester {{index-1}}</div>
      <!-- FYI can't use key as prop: https://stackoverflow.com/questions/47783396/access-key-from-child-component-in-vue -->
      <semester 
        v-bind:index="index-1"
        v-bind:selectedSubjects="selectedSubjects">
      </semester>
    </v-expansion-panel-content>
  </v-expansion-panel>
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
      ],
      visibleList: Array(8).fill(true),
    }
  },
}
</script>


<style scoped>

</style>