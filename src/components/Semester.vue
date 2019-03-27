<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-expansion-panel-content dropzone = "copy" class = "semester-container" :id = "'road_'+roadID+'_semester_' + index" v-on:dragover.native.prevent>
    <!-- <div slot="header"> -->
    <v-container grid-list-xs slot = "header" style = "padding: 0;">
      <v-layout row>
        <v-flex xs6>
          <b>{{semesterType}}
            <v-hover>
              <span slot-scope = "{ hover }" @click = "changeYear" :class = "hover ? 'hovering' : ''">
                {{semesterYear}}
              </span>
            </v-hover>
          </b>
          Units: {{semesterInformation.totalUnits}}
          Hours: {{Math.round(semesterInformation.expectedHours,1)}}
        </v-flex>
        <v-layout row xs6 v-if = "!isOpen">
          <v-flex xs3 v-for = "subject in semesterSubjects" :key = "subject.id">
            <v-card>
              <div :class = "courseColor(subject.id)">
                <v-card-text class = "mini-course">
                  <b>{{subject.id}}</b>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-container>

    <v-container
      class="lighten-3 semester-drop-container"
      fluid
      grid-list-md
      :class="[semesterStyles,semColor]"
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
          @add-at-placeholder = "$emit('add-at-placeholder', $event)"
          @drag-start-class = "$emit('drag-start-class', $event)"
        />
      </v-layout>
    </v-container>
  </v-expansion-panel-content>
</template>


<script>
import Class from './Class.vue'
import $ from "jquery"
import colorMixin from "./../mixins/colorMixin.js"

// $(".semester-container").on("dragover", function(event) {
//   event.preventDefault();
//   event.dataTransfer.dropEffect = "copy";
// })


export default {
  name: "semester",
  props:['selectedSubjects','index',"allSubjects","roadID","isOpen","baseYear", "subjectsIndex", "genericCourses", "genericIndex", "addingFromCard", "itemAdding","currentSemester","draggingOver"],
  mixins: [colorMixin],
  data: function() {return {
    newYear: this.semesterYear,
  }},
  components: {
    'class': Class
  },
  computed: {
    semColor: function() {
      if(this.addingFromCard||this.draggingOver) {
        if(this.index==0||this.offeredNow) {
          return "green";
        } else if(this.isSameYear) {
          return "red";
        } else {
          return "yellow";
        }
      } else {
        return "grey";
      }
    },
    isSameYear: function() {
      return Math.floor((this.index-1)/3) === Math.floor((this.currentSemester-1)/3);
    },
    offeredNow: function() {
      var semType = (this.index-1)%3;
      if(semType >= 0 && (this.addingFromCard||this.draggingOver)) {
        return [this.itemAdding.offered_fall, this.itemAdding.offered_IAP, this.itemAdding.offered_spring][semType];
      } else if(this.addingFromCard) {
        return true;
      } else {
        return false;
      }
    },
    semesterStyles: function() {
      return {
        semesterBin: true,
        dark: this.index % 2 == 0,
        light: this.index % 2 == 1,
      }
    },
    semesterSubjects: function() {
      var semSubjs =  this.selectedSubjects.filter(subj => {
        return this.index === subj.semester;
      });
      if(this.addingFromCard && (this.offeredNow || !this.isSameYear)) {
        semSubjs.push("placeholder");
      }
      return semSubjs;
    },
    semesterInformation: function() {
      var classesInfo = this.semesterSubjects.map(function(subj) {
        if(subj.id in this.subjectsIndex) {
          return this.allSubjects[this.subjectsIndex[subj.id]];
        } else if(subj.id in this.genericIndex) {
          return this.genericCourses[this.genericIndex[subj.id]];
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
    semesterYear: function() {
      if(this.index===0) {
        return "";
      } else {
        return Math.floor((this.index-2)/3) + this.baseYear;
      }
    },
    semesterType: function() {
      if(this.index===0) {
        return "Prior Credit"
      } else {
        return ["Fall", "IAP", "Spring"][(this.index-1)%3];
      }
    }
  },
  methods: {
    changeYear: function(event) {
      event.stopPropagation();
      this.$emit("change-year")
    }
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
  .hovering {
    background: radial-gradient(lightgreen, rgba(0,0,0,0));
  }
  .mini-course {
    padding: 0.3em;
    overflow: hidden;
    white-space: nowrap;
    color: white;
  }
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
