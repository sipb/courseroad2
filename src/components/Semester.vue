<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-expansion-panel-content dropzone = "copy" class = "semester-container" :id = "'road_'+roadID+'_semester_' + index">
    <div slot="header">Semester {{index}}</div>
    <v-container
      class="grey lighten-3 semester-drop-container"
      fluid
      grid-list-md
      :class="semesterStyles"
    >
      <v-layout wrap align-center justify-center row>
        <class
          v-for="(subject, subjindex) in semesterSubjects"
          v-bind:classInfo="subject"
          v-bind:semesterIndex="index"
          :key="subject.id + '-' + subjindex + '-' + index"
          @drag-class="$emit('drag-class',$event)"
          @drop-class="$emit('drop-class',$event)"
          @remove-class = "$emit('remove-class', $event)"
        />
      </v-layout>
    </v-container>
  </v-expansion-panel-content>
</template>


<script>
import Class from './Class.vue'
import $ from "jquery"

// $(".semester-container").on("dragover", function(event) {
//   event.preventDefault();
//   event.dataTransfer.dropEffect = "copy";
// })

export default {
  name: "semester",
  props:['selectedSubjects','index',"allSubjects","roadID"],
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
  },
  methods: {
    dropRoadSubject: function(event, subject) {
      console.log("drop road subject");
      console.log(event);
    },

    // dropped: function(event) {
    //   // console.log("dropped");
    //   // console.log(event);
    // },
    // dragenter: function(event) {
    //   // console.log("drag enter");
    //   // console.log(event);
    //   // event.preventDefault();
    // }
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
