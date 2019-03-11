<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-expansion-panel-content dropzone = "copy" class = "semester-container" :id = "'road_'+roadID+'_semester_' + index" v-on:dragover.native.prevent>
    <!-- <div slot="header"> -->
    <v-container grid-list-xs slot = "header" style = "padding: 0;">
      <v-layout row>
        <v-flex xs6>
          <b>{{semesterName}}</b>
          Units: {{semesterInformation.totalUnits}}
          Hours: {{Math.round(semesterInformation.expectedHours,1)}}
        </v-flex>
        <v-layout row xs6 v-if = "!isOpen">
          <v-flex xs3 v-for = "subject in semesterSubjects">
            <v-card dark color = "primary">
              <v-card-text style = "padding: 0.3em;">{{subject.id}}</v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-container>

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
          @click-class = "$emit('click-class',$event)"
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
  props:['selectedSubjects','index',"allSubjects","roadID","isOpen","baseYear"],
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
    semesterInformation: function() {
      var classesInfo = this.semesterSubjects.map(function(subj) {
        var subjectIndex = this.allSubjects.map((s)=>s.subject_id).indexOf(subj.id);
        if(subjectIndex >= 0) {
          return this.allSubjects[subjectIndex];
        } else {
          return undefined;
        }
      }.bind(this)).filter(function(subj) {
        return subj !== undefined;
      });
      var addNums = function(a, b) {
        a = isNaN(a) ? 0 : a;
        b = isNaN(b) ? 0 : b;
        return a + b;
      }
      var totalUnits = classesInfo.map((s)=>s.total_units).reduce(addNums, 0);
      var expectedHours = classesInfo.map((s)=>s.in_class_hours+s.out_of_class_hours).reduce(addNums, 0);
      return {
        totalUnits: totalUnits,
        expectedHours: expectedHours,
      }
    },
    semesterName: function() {
      var semesterYear = Math.floor((this.index-1)/3) + this.baseYear;
      var semesterType = ["Fall ", "IAP ", "Spring "][this.index%3];
      return semesterType + semesterYear;
    }
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
