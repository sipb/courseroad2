<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card class = "class-info-card" id = "classInfoCard" style = "display: flex; flex-direction:column;" >
          <v-card-title class = "card-header">
            <v-flex style = "display: flex; flex-direction: row;">
              <div  style = "padding: 0; margin: 0; display: block;">
                <v-btn v-if = "classInfoStack.length > 1"@click = "$emit('pop-stack')" style = "padding: 0; margin: 0" icon>
                  <v-icon>navigate_before</v-icon>
                </v-btn>
              </div>
              <div style = "padding: 0 0.5em 0 0;">
                <h3>{{currentSubject.subject_id}}</h3>
              </div>
              <div style = "padding: 0 0.5em 0 0;"><span>{{currentSubject.title}}</span></div>
              <div style = "margin-left:auto">
                <v-btn @click = "$emit('close-classinfo')" icon style = "margin: 0;">
                  <v-icon style = "margin:0; padding: 0;">
                    close
                  </v-icon>
                </v-btn>
              </div>
            </v-flex>
          </v-card-title>
          <v-card-text class = "card-body">
            <div class = "card-body-container" id = "cardBody">
              <table cellspacing= "4">
                <tr>
                  <td><b>Units</b></td>
                  <td>{{currentSubject.total_units}} total ({{currentSubject.lecture_units}}-{{currentSubject.lab_units}}-{{currentSubject.preparation_units}})</td>
                </tr>
                <tr>
                  <td><b>Offered</b></td>
                  <td>
                    <ul class = "comma-separated">
                      <li v-if = "currentSubject.offered_fall">Fall</li>
                      <li v-if = "currentSubject.offered_IAP">IAP</li>
                      <li v-if = "currentSubject.offered_spring">Spring</li>
                      <li v-if = "currentSubject.offered_summer">Summer</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td><b>Instructor</b></td>
                  <td><ul class = "comma-separated"><li v-for = "instructor in currentSubject.instructors">{{instructor}}</li></ul></td>
                </tr>
                <tr>
                  <td><b>Average Enrollment</b></td>
                  <td>{{currentSubject.enrollment_number}}</td>
                </tr>
                <tr>
                  <td><b>Average Rating</b></td>
                  <td>{{currentSubject.rating}}</td>
                </tr>
                <tr>
                  <td><b>Hours</b></td>
                  <td>
                    <table cellspacing = "0">
                      <tr v-if = "currentSubject.in_class_hours !== undefined">{{currentSubject.in_class_hours}} in class</tr>
                      <tr v-if = "currentSubject.out_of_class_hours !== undefined">{{currentSubject.out_of_class_hours}} out of class</tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h3>Description</h3>
              <p>{{currentSubject.description}}</p>
              <p><a :href = "currentSubject.url" target="_blank">View in Course Catalog</a></p>
              <p><a :href = "'https://sisapp.mit.edu/ose-rpt/subjectEvaluationSearch.htm?search=Search&subjectCode='+currentSubject.subject_id" target="_blank">View Course Evaluations</a></p>
              <div v-if = "currentSubject.equivalent_subjects !== undefined">
                <h3>Equivalent Subjects</h3>
                <div style = "overflow-x: scroll;">
                  <table cellspacing = "10">
                    <tr style = "height: 1px;">
                      <td style = "min-width: 8em; height: inherit;" v-for = "subjectID in currentSubject.equivalent_subjects">
                        <div class = "related-subject" @click = "clickRelatedSubject(subjectID)">
                          <div><b>{{subjectID}}</b></div>
                          {{classInfo(subjectID).title}}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div v-if = "currentSubject.prerequisites !== undefined">
                <h3>Prerequisites</h3>
                <div style = "overflow-x: scroll;">
                  <table cellspacing = "10">
                    <tr style = "height: 1px;">
                      <td style = "min-width: 8em; height: inherit;" v-for = "subjectID in parseRequirements(currentSubject.prerequisites)">
                        <div class = "related-subject" @click = "clickRelatedSubject(subjectID)">
                          <div><b>{{subjectID}}</b></div>
                          {{classInfo(subjectID).title}}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div v-if = "currentSubject.corequisites !== undefined">
                <h3>Corequisites</h3>
                <div style = "overflow-x: scroll;">
                  <table cellspacing = "10">
                    <tr style = "height: 1px;">
                      <td style = "min-width: 8em; height: inherit;" v-for = "subjectID in parseRequirements(currentSubject.corequisites)">
                        <div class = "related-subject" @click = "clickRelatedSubject(subjectID)">
                          <div><b>{{subjectID}}</b></div>
                          {{classInfo(subjectID).title}}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div v-if = "currentSubject.related_subjects !== undefined">
                <h3>Related subjects</h3>
                <div style = "overflow-x: scroll;">
                  <table cellspacing = "10">
                    <tr style = "height: 1px;">
                      <td style = "min-width: 8em; height: inherit;" v-for = "subjectID in currentSubject.related_subjects">
                        <div class = "related-subject" @click = "clickRelatedSubject(subjectID)">
                          <div><b>{{subjectID}}</b></div>
                          {{classInfo(subjectID).title}}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import $ from "jquery";
export default {
  name: "ClassInfo",
  components: {},
  props: ["subjects", "classInfoStack"],
  data: function() {return {}},
  computed: {
    currentSubject: function() {
      return this.subjects[this.classInfoStack[this.classInfoStack.length-1]];
    }
  },
  methods: {
    classInfo: function(subjectID) {
      var subjectIndex = this.subjects.map((s)=>s.subject_id).indexOf(subjectID);
      if(subjectIndex === -1) {
        return {
          subject_id: subjectID,
          title: ""
        }
      } else {
        return this.subjects[subjectIndex];
      }
    },
    clickRelatedSubject: function(subjectID) {
      this.$emit('push-stack', subjectID);
      $("#cardBody").animate({scrollTop:0});
    },
    parseRequirements: function(requirements) {
      if(requirements) {
        var allReqs = requirements.split(/, |\(|\)|\//);
        var filteredReqs = allReqs.filter(function(req) {
          return req.length > 0 && req.indexOf("'") === -1;
        });
        return filteredReqs;
      } else {
        return [];
      }
    }
  }
}
</script>
<style>
.card-header {
  padding: 0.5em 1em;
  background-color: lightblue;
  display: inline-block;
}
.class-info-card {
  height: 35vh;
  position: fixed;
  bottom: 1em;
  right: 0;
  width: 20em;
}
.card-body {
  display: flex;
  flex: 1;
  min-height: 0px;
}
.card-body-container {
  flex: 1;
  overflow: auto;
}
.related-subject {
  height:100%;
  max-height: 6em;
  min-width: 8em;
  text-overflow: ellipsis;
  overflow: hidden;
  background-color: lightblue;
  border-radius: 3px;
  padding: 0.5em;
  display: inline-block;
}
.comma-separated {
  padding: 0;
}
.comma-separated li {
  display: inline;
  list-style: none;
}
.comma-separated li:after {
  content: ", ";
}
.comma-separated li:last-child:after {
  content: "";
}
</style>
