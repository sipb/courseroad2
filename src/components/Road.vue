<template>
  <!-- more on expansion panels (and more examples): https://vuetifyjs.com/en/components/expansion-panels -->
  <!-- this is the example I copied: https://vuetifyjs.com/en/components/expansion-panels#expand -->
  <v-expansion-panel
    v-model="visibleList"
    expand
  >
    <!-- v-for index in N starts at 1... -->
    <!-- FYI can't use key as prop: https://stackoverflow.com/questions/47783396/access-key-from-child-component-in-vue -->
    <semester
      v-for="index in 8"
      :key="index-1"
      v-bind:index="index-1"
      v-bind:selectedSubjects="selectedSubjects"
      v-bind:allSubjects = "subjects"
      @drag-class = "$emit('drag-class',$event)"
      @drop-class = "$emit('drop-class',$event)"
      >
    </semester>
  </v-expansion-panel>
</template>


<script>
import Semester from './Semester.vue'

export default {
  name: 'Semester',
  components: {
    'semester': Semester
  },
  props: ['selectedSubjects',"subjects"],
  data: function () { return {
      visibleList: Array(8).fill(true),
    }
  },
  methods: {
  }
}
</script>


<style scoped>

</style>
