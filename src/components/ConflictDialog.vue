<template>
  <v-dialog v-if="conflictInfo != undefined" v-model="conflictDialog" max-width="600">
    <v-card>
      <v-btn icon flat style="float:right" @click="conflictDialog = false">
        <v-icon>close</v-icon>
      </v-btn>
      <v-card-title>Save Conflict</v-card-title>
      <v-layout row>
        <!-- TODO: remove duplicate code? -->
        <v-flex id="cloud-column" xs6 style="padding: 2em">
          <b>Cloud</b>
          <v-list>
            <v-card style="padding: 1em">
              Name: {{ conflictInfo.other_name }}
            </v-card>
            <v-card style="padding: 1em">
              Agent: {{ conflictInfo.other_agent }}
            </v-card>
            <v-card style="padding: 1em">
              Date: {{ conflictInfo.other_date }}
            </v-card>
            <v-card style="padding: 1em">
              <b><p>Contents:</p></b>
              <p>Courses of Study: <span v-for="req in conflictInfo.other_contents.coursesOfStudy" :key="req"> {{ req }} </span></p>
              <p id="selected-subjects-cloud">
                Selected Subjects: <span v-for="(course, index) in conflictInfo.other_contents.selectedSubjects" :key="JSON.stringify(course)" :class="colorSubject(index, 'remote')"> {{ course.id }} </span>
              </p>
            </v-card>
          </v-list>
          <v-btn color="primary" @click="$emit('update-local', conflictInfo.id) ">
            Keep Remote
          </v-btn>
        </v-flex>
        <v-flex id="local-column" xs6 style="padding: 2em">
          <b>Local</b>
          <v-list>
            <v-card style="padding: 1em">
              Name: {{ roads[conflictInfo.id].name }}
            </v-card>
            <v-card style="padding: 1em">
              Agent: {{ roads[conflictInfo.id].agent }}
            </v-card>
            <v-card style="padding: 1em">
              Date: {{ roads[conflictInfo.id].changed }}
            </v-card>
            <v-card style="padding: 1em">
              <b><p>Contents:</p></b>
              <p>Courses of Study: <span v-for="req in roads[conflictInfo.id].contents.coursesOfStudy" :key="req"> {{ req }} </span></p>
              <p id="selected-subjects-local">
                Selected Subjects: <span v-for="(course, index) in roads[conflictInfo.id].contents.selectedSubjects.flat()" :key="JSON.stringify(course)" :class="colorSubject(index, 'local')"> {{ course.id }} </span>
              </p>
            </v-card>
          </v-list>
          <v-btn color="primary" @click="$emit('update-remote', conflictInfo.id)">
            Keep Local
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConflictDialog',
  props: {
    conflictInfo: {
      type: Object,
      default: function() {
        return undefined;
      }
    }
  },
  data: function () {
    return {
      conflictDialog: false
    };
  },
  computed: {
    roads () {
      return this.$store.state.roads;
    }
  },
  methods: {
    startConflict: function () {
      this.conflictDialog = true;
    },
    resolveConflict: function () {
      this.conflictDialog = false;
    },
    colorSubject: function (subjectIndex, subjectList) {
      const remoteSubjects = this.renumberDuplicates(this.conflictInfo.other_contents.selectedSubjects.map(
        s => s.id + ' ' + s.semester
      ));
      const localSubjects = this.renumberDuplicates(this.roads[this.conflictInfo.id].contents.selectedSubjects.flat().map(
        s => s.id + ' ' + s.semester
      ));
      let currentSubject;
      if (subjectList === 'remote') {
        currentSubject = remoteSubjects[subjectIndex];
        if (this.diff(remoteSubjects, localSubjects).indexOf(currentSubject) >= 0) {
          return 'blue--text';
        }
      } else if (subjectList === 'local') {
        currentSubject = localSubjects[subjectIndex];
        if (this.diff(localSubjects, remoteSubjects).indexOf(currentSubject) >= 0) {
          return 'blue--text';
        }
      }
      return '';
    },
    diff: function (a1, a2) {
      return a1.filter(function (i) {
        return a2.indexOf(i) === -1;
      });
    },
    count: function (arr, elem) {
      let countElem = 0;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === elem) {
          countElem++;
        }
      }
      return countElem;
    },
    renumberDuplicates: function (arr) {
      return arr.map((elem, index) => {
        if (this.count(arr, elem) > 1) {
          const appendNumber = this.count(arr.slice(0, index), elem);
          if (appendNumber > 0) {
            return elem + '-' + appendNumber.toString();
          } else {
            return elem;
          }
        } else {
          return elem;
        }
      });
    }
  }
};
</script>

<style scoped>
</style>
