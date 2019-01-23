<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-card class="grey lighten-3">
    <v-container
      fluid
      grid-list-md
      :class="semesterStyles"
    >
      <v-layout row wrap>
        <v-flex
          v-for="subject in semesterSubjects"
          :key="subject.id + index"
        >
          <class
            v-bind:classInfo="subject"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
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
    background-color: #bcdeea;
  }

  .dark {
    /*background-color: #bcdeea;*/
  }

  .light {
    /*background-color: #cde7f0;*/
  }
</style>
