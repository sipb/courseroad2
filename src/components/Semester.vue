<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-expansion-panel-content>
    <div slot="header">Semester {{index}}</div>
    <v-container
      class="grey lighten-3" 
      fluid
      grid-list-md
      :class="semesterStyles"
    >
      <v-layout wrap align-center justify-center row fill-height>
        <class
          v-for="subject in semesterSubjects"
          v-bind:classInfo="subject"
          :key="subject.id + index"
        />
      </v-layout>
    </v-container>
  </v-expansion-panel-content>
</template>


<script>
import Class from './Class.vue'

export default {
  name: "semester",
  props:['selectedSubjects','index'],
  components: {
    'class': Class
  },
  computed: {
    semesterStyles: function() {
      return {
        semesterBin: true,
        dark: this.index % 2 == 0,
        light: this.index % 2 == 1,
      }
    },
    semesterSubjects: function() {
      return this.selectedSubjects.filter(subj => {
        return this.index === subj.semester;
      });
    },
  }
}
</script>


<style scoped>
  .semesterBin {
/*    display: flex;
    justify-content: space-between;
    padding: 5% 10% 5% 10%;
*/
    /*background-color: #bcdeea;*/
  }

  .dark {
    /*background-color: #bcdeea;*/
  }

  .light {
    /*background-color: #cde7f0;*/
  }
</style>
