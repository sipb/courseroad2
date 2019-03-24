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
          <v-flex xs3 v-for = "subject in semesterSubjects">
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
          v-bind:warnings = "warnings[subjindex]"
          :key="subject.id + '-' + subjindex + '-' + index"
          @drag-class="$emit('drag-class',$event)"
          @drop-class="$emit('drop-class',$event)"
          @remove-class = "$emit('remove-class', $event)"
          @click-class = "$emit('click-class',$event)"
          @override-warnings = "$emit('override-warnings',$event)"
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
  props:['selectedSubjects','index',"allSubjects","subjectsIndex","roadID","isOpen","baseYear", "genericCourses", "genericIndex"],
  mixins: [colorMixin],
  data: function() {return {
    newYear: this.semesterYear,
  }},
  components: {
    'class': Class
  },
  computed: {
    warnings: function() {
      var allWarnings = Array(this.semesterSubjects.length).fill([]);
      for(var i = 0; i < this.semesterSubjects.length; i++) {
        var subjectWarnings = [];
        var subjID = this.semesterSubjects[i].id;
        var subj;
        if(subjID in this.subjectsIndex) {
          subj = this.allSubjects[this.subjectsIndex[subjID]]
          var prereqString = this.allSubjects[this.subjectsIndex[subjID]].prerequisites;
          var coreqString = this.allSubjects[this.subjectsIndex[subjID]].corequisites;
          if(prereqString !== undefined) {
            var prereqsfulfilled = this.reqFulfilled(prereqString, this.index > 0 ? this.previousSubjects : this.concurrentSubjects);
            if(!prereqsfulfilled) {
              subjectWarnings.push("<b>Unsatisfied Prerequisite</b> - One or more prerequisites are not yet fulfilled.");
            }
          }
          if(coreqString !== undefined) {
            var coreqsfulfilled = this.reqFulfilled(coreqString, this.concurrentSubjects);
            if(!coreqsfulfilled) {
              subjectWarnings.push("<b>Unsatisfied Corequisite</b> - One or more corequisites are not yet fulfilled.");
            }
          }
        } else if(subjID in this.genericIndex){
          subj = this.genericCourses[this.genericIndex[subjID]];
        }
        if(subj !== undefined) {
          var semType = (this.index-1)%3;
          if(semType >= 0) {
            var isUsuallyOffered = [subj.offered_fall, subj.offered_IAP, subj.offered_spring][semType];
            if(!isUsuallyOffered) {
              subjectWarnings.push("<b>Not offered</b> - According to the course catalog, " + subjID + " is not usually offered in " + this.semesterType + ".");
            }
          }
        }
        allWarnings[i] = subjectWarnings;
      }
      return allWarnings;
    },
    previousSubjects: function() {
      return this.selectedSubjects.filter(subj => {
        return subj.semester < this.index;
      });
    },
    concurrentSubjects: function() {
      return this.selectedSubjects.filter(subj => {
        return subj.semester <= this.index;
      })
    },
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
    },
    classSatisfies: function(req, id) {
      if(req === id) {
        return true;
      }
      if(req.indexOf(".")===-1) {
        var subj;
        if(id in this.subjectsIndex) {
          subj = this.allSubjects[this.subjectsIndex[id]];
        } else if(id in this.genericIndex) {
          subj = this.genericCourses[this.genericIndex[id]];
        }
        if(req.indexOf("GIR:")>=0) {
          req = req.substring(4);
          return subj.gir_attribute == req;
        } else if(req.indexOf("HASS")>=0) {
          return subj.hass_attribute == req;
        } else if(req.indexOf("CI")>=0) {
          return subj.communication_requirement == req;
        }
      }
      return false;
    },
    reqFulfilled: function(reqString, subjects) {
      var allIDs = subjects.map((s)=>s.id);
      reqString = reqString.replace(/''/g, "\"").replace(/,[\s]+/g,",");
      var splitReq = reqString.split(/(,|\(|\)|\/)/);
      for(var i = 0; i < splitReq.length; i++) {
        if(splitReq[i].indexOf("\"")>=0) {
          splitReq[i] = "true";
        }
        if("()/, ".indexOf(splitReq[i])<0) {
          if(allIDs.indexOf(splitReq[i])>=0) {
            splitReq[i] = "true";
          } else {
            var anyClassSatisfies  = subjects.map((s)=>this.classSatisfies(splitReq[i],s.id)).reduce((a,b)=>a||b,false);
            if(anyClassSatisfies) {
              splitReq[i] = "true";
            } else {
              splitReq[i] = "false"
            }
          }
        }
      }
      var reqExpression = splitReq.join("").replace(/\//g,"||").replace(/,/g,"&&");
      //i know this seems scary, but the above code guarantees there will only be ()/, true false in this string
      return eval(reqExpression);
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
