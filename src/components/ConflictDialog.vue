<template>
  <v-dialog
    v-if="conflictInfo != undefined"
    v-model="conflictDialog"
    max-width="600"
  >
    {{ conflictDialog }}
    <v-card>
      <v-btn icon text style="float: right" @click="conflictDialog = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-card-title>Save Conflict</v-card-title>
      <v-layout>
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
              <p>
                Courses of Study:
                <span
                  v-for="req in conflictInfo.other_contents.coursesOfStudy"
                  :key="req"
                >
                  {{ req }}
                </span>
              </p>
              <p id="selected-subjects-cloud">
                Selected Subjects:
                <span
                  v-for="(course, index) in conflictInfo.other_contents
                    .selectedSubjects"
                  :key="JSON.stringify(course)"
                  :class="colorSubject(index, 'remote')"
                >
                  {{ course.subject_id }}
                </span>
              </p>
            </v-card>
          </v-list>
          <v-btn
            color="primary"
            @click="$emit('update-local', conflictInfo.id)"
          >
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
              <p>
                Courses of Study:
                <span
                  v-for="req in roads[conflictInfo.id].contents.coursesOfStudy"
                  :key="req"
                >
                  {{ req }}
                </span>
              </p>
              <p id="selected-subjects-local">
                Selected Subjects:
                <span
                  v-for="(course, index) in flatten(
                    roads[conflictInfo.id].contents.selectedSubjects,
                  )"
                  :key="JSON.stringify(course)"
                  :class="colorSubject(index, 'local')"
                >
                  {{ course.subject_id }}
                </span>
              </p>
            </v-card>
          </v-list>
          <v-btn
            color="primary"
            @click="$emit('update-remote', conflictInfo.id)"
          >
            Keep Local
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "../plugins/composition.js";
import { flatten } from "../plugins/browserSupport.js";

const store = useStore();

const props = defineProps({
  conflictInfo: {
    type: Object,
    default: undefined,
  },
});

const emit = defineEmits(["update-local", "update-remote"]);

const conflictDialog = ref(false);

const roads = computed(() => store.state.roads);

const startConflict = function () {
  conflictDialog.value = true;
};

const resolveConflict = function () {
  conflictDialog.value = false;
};

const colorSubject = (subjectIndex, subjectList) => {
  const remoteSubjects = renumberDuplicates(
    props.conflictInfo.other_contents.selectedSubjects.map(
      (s) => s.subject_id + " " + s.semester,
    ),
  );
  const localSubjects = renumberDuplicates(
    flatten(roads[props.conflictInfo.id].contents.selectedSubjects).map(
      (s) => s.subject_id + " " + s.semester,
    ),
  );
  let currentSubject;
  if (subjectList === "remote") {
    currentSubject = remoteSubjects[subjectIndex];
    if (diff(remoteSubjects, localSubjects).indexOf(currentSubject) >= 0) {
      return "blue--text";
    }
  } else if (subjectList === "local") {
    currentSubject = localSubjects[subjectIndex];
    if (diff(localSubjects, remoteSubjects).indexOf(currentSubject) >= 0) {
      return "blue--text";
    }
  }
  return "";
};

const diff = (a1, a2) => {
  return a1.filter((i) => a2.indexOf(i) === -1);
};

const count = (arr, elem) => {
  let countElem = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === elem) {
      countElem++;
    }
  }
  return countElem;
};

const renumberDuplicates = (arr) => {
  return arr.map((elem, index) => {
    if (count(arr, elem) > 1) {
      const appendNumber = count(arr.slice(0, index), elem);
      if (appendNumber > 0) {
        return elem + "-" + appendNumber.toString();
      } else {
        return elem;
      }
    } else {
      return elem;
    }
  });
};
</script>

<style scoped></style>
