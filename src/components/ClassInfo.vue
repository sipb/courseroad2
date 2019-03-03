<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card class = "class-info-card" id = "classInfoCard" style = "display: flex; flex-direction:column;" >
          <v-card-title class = "card-header">
            <v-flex style = "display: flex; flex-direction: row;">
              <div style = "padding: 0 0.5em 0 0;">
                <h3>{{currentSubject.subject_id}}</h3>
                <div v-if = "classInfoStack.length > 1" style = "padding: 0; margin: 0; display: block;">
                  <v-btn @click = "$emit('pop-stack')" style = "padding: 0; margin: 0" icon>
                    <v-icon>navigate_before</v-icon>
                  </v-btn>
                </div>
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
            <div class = "card-body-container">
              <table cellspacing= "4">
                <tr>
                  <td><b>Units</b></td>
                  <td>{{currentSubject.total_units}} total ({{currentSubject.lecture_units}}-{{currentSubject.lab_units}}-{{currentSubject.preparation_units}})</td>
                </tr>
                <tr>
                  <td><b>Offered</b></td>
                  <td>
                    <span v-if = "currentSubject.offered_fall">Fall</span>
                    <span v-if = "currentSubject.offered_IAP">IAP</span>
                    <span v-if = "currentSubject.offered_spring">Spring</span>
                    <span v-if = "currentSubject.offered_summer">Summer</span>
                  </td>
                </tr>
                <tr>
                  <td><b>Instructor</b></td>
                  <td><span v-for = "instructor in currentSubject.instructors">{{instructor}} </span></td>
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
                      <tr>{{currentSubject.in_class_hours}} in class</tr>
                      <tr>{{currentSubject.out_of_class_hours}} out of class</tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p>{{currentSubject.description}}</p>
              <h3>Related subjects</h3>
              <!-- <div class = "horizontal-scroll">
                <div style = "display: flex; flex-direction: row; overflow-x: scroll;"> -->
                <!-- <v-card class = "scrolling-card" v-for = "subjectID in currentSubject.related_subjects">
                  <b>{{subjectID}}</b>
                  {{classInfo(subjectID).title}}
                </v-card> -->
              <!-- </div>  -->
              <div style = "overflow-x: scroll;">
                <table cellspacing = "10">
                  <tr style = "height: 1px;">
                    <td style = "min-width: 8em; height: inherit;" v-for = "subjectID in currentSubject.related_subjects">
                      <div class = "related-subject" @click = "$emit('push-stack', subjectID)">
                        <div><b>{{subjectID}}</b></div>
                        {{classInfo(subjectID).title}}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
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
      return this.subjects[subjectIndex];
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
  height: 40vh;
  position: fixed;
  bottom: 0;
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
  max-height: 8em;
  text-overflow: ellipsis;
  overflow: hidden;
  background-color: lightblue;
  border-radius: 3px;
  padding: 0.5em;
  display: inline-block;
}
</style>
