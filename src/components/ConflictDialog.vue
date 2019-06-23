<template>
  <v-dialog v-if="conflictInfo != undefined" v-model="conflictDialog" max-width="600">
    <v-card>
      <v-btn icon flat style="float:right" @click="conflictDialog = false">
        <v-icon>close</v-icon>
      </v-btn>
      <v-card-title>Save Conflict</v-card-title>
      <v-layout row>
        <!-- TODO: remove duplicate code? -->
        <v-flex xs6 style="padding: 2em">
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
              <p>Selected Subjects: <span v-for="(course, index) in conflictInfo.other_contents.selectedSubjects" :key="course" :class="colorSubject(index, 'remote')"> {{ course.id }} </span></p>
            </v-card>
          </v-list>
          <v-btn color="primary" @click="$emit('update-local', conflictInfo.id) ">
            Keep Remote
          </v-btn>
        </v-flex>
        <v-flex xs6 style="padding: 2em">
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
              <p>Selected Subjects: <span v-for="(course, index) in roads[conflictInfo.id].contents.selectedSubjects" :key="course" :class="colorSubject(index, 'local')"> {{ course.id }} </span></p>
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
Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) === -1;
  });
};

Array.prototype.count = function (elem) {
  let countElem = 0;
  for (let i = 0; i < this.length; i++) {
    if (this[i] === elem) {
      countElem++;
    }
  }
  return countElem;
};

Array.prototype.renumberDuplicates = function () {
  return this.map(function (elem, index) {
    if (this.count(elem) > 1) {
      const appendNumber = this.slice(0, index).count(elem);
      return elem + '-' + appendNumber.toString();
    } else {
      return elem;
    }
  }.bind(this));
};
window.Array = Array;

export default {
  name: 'ConflictDialog',
  props: ['conflictInfo'],
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
      const remoteSubjects = this.conflictInfo.other_contents.selectedSubjects.map(
        s => s.id + ' ' + s.semester
      ).renumberDuplicates();
      const localSubjects = this.roads[this.conflictInfo.id].contents.selectedSubjects.map(
        s => s.id + ' ' + s.semester
      ).renumberDuplicates();
      let currentSubject;
      if (subjectList === 'remote') {
        currentSubject = remoteSubjects[subjectIndex];
        if (remoteSubjects.diff(localSubjects).indexOf(currentSubject) >= 0) {
          return 'blue--text';
        }
      } else if (subjectList === 'local') {
        currentSubject = localSubjects[subjectIndex];
        if (localSubjects.diff(remoteSubjects).indexOf(currentSubject) >= 0) {
          return 'blue--text';
        }
      }
      return '';
    }
  }
};
</script>

<style scoped>
</style>
