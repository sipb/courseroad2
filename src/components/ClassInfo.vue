<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card class = "class-info-card" id = "classInfoCard" style = "overflow: auto;">
          <v-card-title>
            {{currentSubject.subject_id}} {{currentSubject.title}}
          </v-card-title>
          <v-card-text style = "overflow:auto">
            <p>{{currentSubject.description}}</p>
            <table>
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
                <tr>{{currentSubject.in_class_hours}} in class</tr>
                <tr>{{currentSubject.out_of_class_hours}} out of class</tr>
              </td>
            </tr>
          </table>
          Related subjects
          <div style = "display: flex; flex-direction: row; overflow-x: scroll;">
            <v-card v-for = "subjectID in currentSubject.related_subjects">
              <b>{{subjectID}}</b>
              {{classInfo(subjectID).title}}
            </v-card>
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
.class-info-card {
  height: 30vh;
  position: fixed;
  bottom: 0;
  right: 0;
  width: 20em;
}
</style>
