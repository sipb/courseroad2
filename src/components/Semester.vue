<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-expansion-panel
    v-show="!hideIap || semesterType !== 'IAP'"
    :id="'road_' + roadID + '_semester_' + index"
    :data-cy="'road_' + roadID + '__semester_' + index"
    dropzone="copy"
    :class="semData.bgColorHeader"
    @dragover.native.prevent
  >
    <v-expansion-panel-header>
      <v-container
        grid-list-xs
        style="padding: 0px; margin-left: 0px"
        data-cy="semesterHeader"
        @dragenter="dragenter"
        @dragleave="dragleave"
        @drop="ondrop"
      >
        <v-layout align-center style="user-select: none">
          <v-flex xs6>
            <span style="width: 12em; display: inline-block">
              <b>
                <v-hover>
                  <span
                    slot-scope="{ hover }"
                    :class="hover && 'hovering'"
                    data-cy="semester_title"
                    @click="openRoadSettingsDialog"
                  >
                    {{ semesterYearName }}
                    {{ semesterType }}
                    <span v-if="index > 0">{{
                      "'" + semesterYear.toString().substring(2)
                    }}</span>
                  </span>
                </v-hover>
              </b>
            </span>
            <span
              style="min-width: 4.5em; display: inline-block"
              data-cy="semesterUnits"
            >
              Units: {{ semesterInformation.totalUnits }}
            </span>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <span v-on="on"
                  >Hours:
                  {{ semesterInformation.totalExpectedHours.toFixed(1) }}</span
                >
              </template>
              <div id="tooltipTable">
                <table v-if="semesterSubjects.length">
                  <tr v-if="semesterInformation.expectedHoursQuarter1.length">
                    <th
                      v-if="semesterInformation.anyClassInSingleQuarter"
                      rowspan="2"
                    >
                      Quarter 1 <br />
                      <span style="font-weight: normal">
                        {{
                          semesterInformation.totalExpectedHoursQuarter1.toFixed(
                            1,
                          )
                        }}h
                      </span>
                    </th>
                    <th class="rightbar">Class</th>
                    <td
                      v-for="subj in semesterInformation.expectedHoursQuarter1"
                      :key="subj.subject_id"
                    >
                      <b>{{ subj.subject_id }}</b>
                    </td>
                  </tr>
                  <tr v-if="semesterInformation.expectedHoursQuarter1.length">
                    <th class="rightbar">Hours</th>
                    <td
                      v-for="subj in semesterInformation.expectedHoursQuarter1"
                      :key="subj.subject_id"
                    >
                      {{ subj.hours.toFixed(1) }}h
                    </td>
                  </tr>
                  <tr
                    v-if="
                      semesterInformation.anyClassInSingleQuarter &&
                      semesterInformation.expectedHoursQuarter2.length
                    "
                    class="topbar"
                  >
                    <th rowspan="2">
                      Quarter 2 <br />
                      <span style="font-weight: normal">
                        {{
                          semesterInformation.totalExpectedHoursQuarter2.toFixed(
                            1,
                          )
                        }}h
                      </span>
                    </th>
                    <th class="rightbar">Class</th>
                    <td
                      v-for="subj in semesterInformation.expectedHoursQuarter2"
                      :key="subj.subject_id"
                    >
                      <b>{{ subj.subject_id }}</b>
                    </td>
                  </tr>
                  <tr
                    v-if="
                      semesterInformation.anyClassInSingleQuarter &&
                      semesterInformation.expectedHoursQuarter2.length
                    "
                  >
                    <th class="rightbar">Hours</th>
                    <td
                      v-for="subj in semesterInformation.expectedHoursQuarter2"
                      :key="subj.subject_id"
                    >
                      {{ subj.hours.toFixed(1) }}h
                    </td>
                  </tr>
                </table>
                <span v-else>No Classes</span>
              </div>
            </v-tooltip>
          </v-flex>
          <v-layout v-if="!isOpen" xs6 style="max-width: 50%; overflow-x: auto">
            <v-flex xs10 :style="{ color: semData.textColor }">
              {{ semData.message }}
            </v-flex>
            <v-flex
              v-for="(subject, subjindex) in semesterSubjects"
              :key="subject.subject_id + '-' + subjindex + '-' + index"
              xs3
            >
              <v-card :color="getRawColor(courseColor(subject))">
                <div v-if="subject !== 'placeholder'">
                  <v-card-text
                    class="mini-course"
                    :style="{ color: getRawTextColor(courseColor(subject)) }"
                  >
                    <b>{{ subject.subject_id }}</b>
                  </v-card-text>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
          <v-layout v-else>
            <v-flex xs10 :style="{ color: semData.textColor }">
              {{ semData.message }}
            </v-flex>
          </v-layout>
        </v-layout>
      </v-container>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-container
        :class="[
          $vuetify.theme.dark ? 'darken-3' : 'lighten-3',
          semData.bgColor,
        ]"
        fluid
        grid-list-md
        :data-cy="'road_' + roadID + '__semester_' + index + '_dropZone'"
        @dragenter="dragenter"
        @dragleave="dragleave"
        @drop="ondrop"
      >
        <v-layout wrap align-center justify-center>
          <class
            v-for="(subject, subjindex) in semesterSubjects"
            :key="subject.subject_id + '-' + subjindex + '-' + index"
            :class-info="subject"
            :semester-index="index"
            :warnings="warnings[subjindex]"
            :class-index="subjindex"
          />
          <class
            v-if="isActiveRoad && addingFromCard && (offeredNow || !isSameYear)"
            key="placeholder"
            class-info="placeholder"
            :semester-index="index"
            :warnings="[]"
            :class-index="semesterSubjects.length"
          />
        </v-layout>
      </v-container>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SemesterComponent",
});
</script>

<script setup>
import Class from "./Class.vue";
import {
  validCourses,
  validGeneric,
  colors,
  getRawColor,
  getRawTextColor,
  courseColor,
  courseColorFromId,
} from "./../mixins/colorMixin.js";
import {
  classSatisfies,
  reqsFulfilled,
  convertReqToID,
  checkForNumRequired,
} from "./../mixins/reqFulfillment.js";
import { flatten } from "./../plugins/browserSupport.js";
import { lateSchedule } from "./../mixins/schedule.js";
import { useStore, useVuetify } from "../plugins/composition.js";
import { ref, computed } from "vue";

const store = useStore();
const vuetify = useVuetify();

const props = defineProps({
  selectedSubjects: {
    type: Array,
    required: true,
  },
  semesterSubjects: {
    type: Array,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  roadID: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
  hideIap: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["open-road-settings-dialog"]);

const draggingOver = ref(false);
const dragCount = ref(0);

const isActiveRoad = computed(() => store.state.activeRoad === props.roadID);
const baseYear = computed(() => {
  const today = new Date(Date.now());
  const currentYear = today.getFullYear();
  const baseYear = today.getMonth() >= 5 ? currentYear + 1 : currentYear;
  return baseYear - store.getters.userYear;
});
const currentSemester = computed(() => store.state.currentSemester);
const itemAdding = computed(() => store.state.itemAdding);
const addingFromCard = computed(() => store.state.addingFromCard);
const subjectsLoaded = computed(
  () => Object.keys(store.state.subjectsIndex).length > 0,
);

const warnings = computed(() => {
  const allWarnings = Array(props.semesterSubjects.length).fill([]);
  for (let i = 0; i < props.semesterSubjects.length; i++) {
    const subjectWarnings = [];
    if (props.semesterSubjects[i].public === false) {
      // Suppress warnings for custom subject
      continue;
    }
    const subjID = props.semesterSubjects[i].subject_id;
    let subj;
    if (subjID in store.state.subjectsIndex) {
      subj = store.state.subjectsInfo[store.state.subjectsIndex[subjID]];
      const prereqString =
        store.state.subjectsInfo[store.state.subjectsIndex[subjID]]
          .prerequisites;
      const coreqString =
        store.state.subjectsInfo[store.state.subjectsIndex[subjID]]
          .corequisites;
      let prereqsfulfilled = true;
      let coreqsfulfilled = true;
      if (prereqString !== undefined) {
        prereqsfulfilled = reqsFulfilled(
          prereqString,
          props.index > 0 ? previousSubjects(subj) : concurrentSubjects.value,
        );
      }
      if (coreqString !== undefined) {
        coreqsfulfilled = reqsFulfilled(coreqString, concurrentSubjects.value);
      }
      if (subj.either_prereq_or_coreq) {
        if (!(prereqsfulfilled || coreqsfulfilled)) {
          subjectWarnings.push(
            "<b>Unsatisfied corequisite or prerequisite</b> - You must satisfy either the prerequisites or corequisites for this course.",
          );
        }
      } else {
        if (!prereqsfulfilled) {
          subjectWarnings.push(
            "<b>Unsatisfied prerequisite</b> — One or more prerequisites are not yet fulfilled.",
          );
        }
        if (!coreqsfulfilled) {
          subjectWarnings.push(
            "<b>Unsatisfied corequisite</b> — One or more corequisites are not yet fulfilled.",
          );
        }
      }
      if (
        isScheduledSemester.value &&
        lateSchedule(subj, store.state.genericIndex)
      ) {
        subjectWarnings.push(
          "<b>No schedule</b> - Classes that do not yet have a schedule may not be offered.",
        );
      }
    } else if (subjID in store.state.genericIndex) {
      subj = store.state.genericCourses[store.state.genericIndex[subjID]];
    }
    if (subj !== undefined) {
      const semType = (props.index - 1) % 3;

      // WARNING: be careful with injecting info from the subject like this
      //  -- if we ever take user input, it could lead to XSS attacks from custom classes
      //  (but right now we only ever insert info from FireRoad subjects)
      if (noLongerOffered(subj)) {
        const lastSemester = subj.source_semester.split("-");
        subjectWarnings.push(
          "<b>Not offered</b> - This subject is no longer offered (last offered " +
            lastSemester.join(" ") +
            ").",
        );
      } else if (notCurrentlyOffered(subj)) {
        subjectWarnings.push(
          `<b>Not offered</b> - This subject is not offered for the ${subj.not_offered_year} school year.`,
        );
      } else if (semType >= 0) {
        const isUsuallyOffered = [
          subj.offered_fall,
          subj.offered_IAP,
          subj.offered_spring,
        ][semType];
        if (!isUsuallyOffered) {
          subjectWarnings.push(
            "<b>Not offered</b> — According to the course catalog, " +
              subjID +
              " is not usually offered in " +
              semesterType.value +
              ".",
          );
        }
      }
    }
    allWarnings[i] = subjectWarnings;
  }
  return allWarnings;
});

const concurrentSubjects = computed(() => {
  return flatten(props.selectedSubjects.slice(0, props.index + 1));
});

const semData = computed(() => {
  if (addingFromCard.value || draggingOver.value) {
    if (!subjectsLoaded.value) {
      return {
        bgColor: "red",
        message: "Loading subjects... give us a minute",
        textColor: "DarkRed",
        bgColorHeader: "red " + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    } else if (itemAdding.value === undefined) {
      return {
        bgColor: "red",
        message:
          'If you see this message, contact courseroad@mit.edu and tell them "710".',
        textColor: "DarkRed",
        bgColorHeader: "red" + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    } else if (props.index === 0 || offeredNow.value) {
      return {
        bgColor: "green",
        message: "Add class here",
        textColor: "DarkGreen",
        bgColorHeader:
          "green " + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    } else if (itemAddingNoLongerOffered.value) {
      return {
        bgColor: "yellow",
        message: "Subject no longer offered",
        textColor: "DarkGoldenRod",
        bgColorHeader:
          "yellow " + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    } else if (itemAddingNotCurrentlyOffered.value) {
      return {
        bgColor: "yellow",
        message: "Subject not offered this year",
        textColor: "DarkGoldenRod",
        bgColorHeader:
          "yellow " + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    } else if (isSameYear.value) {
      return {
        bgColor: "red",
        message: "Subject not available this semester",
        textColor: "DarkRed",
        bgColorHeader: "red " + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    } else {
      return {
        bgColor: "yellow",
        message: "Subject may not be available this semester",
        textColor: "DarkGoldenRod",
        bgColorHeader:
          "yellow " + (vuetify.theme.dark ? "darken-5" : "lighten-5"),
      };
    }
  }
  return {
    bgColor: "grey",
    message: "",
    textColor: "",
    bgColorHeader: "",
  };
});

const isSameYear = computed(() => {
  return (
    Math.floor((props.index - 1) / 3) ===
    Math.floor((currentSemester.value - 1) / 3)
  );
});

const isScheduledSemester = computed(() => {
  const today = new Date();
  const month = today.getMonth();
  const scheduledSemester =
    month === 4 ? currentSemester.value + 1 : currentSemester.value;
  return props.index === scheduledSemester;
});
const itemAddingNoLongerOffered = computed(() => {
  return noLongerOffered(itemAdding.value);
});
const itemAddingNotCurrentlyOffered = computed(() => {
  return notCurrentlyOffered(itemAdding.value);
});
const offeredNow = computed(() => {
  if (
    !subjectsLoaded.value ||
    itemAdding.value === undefined ||
    itemAddingNoLongerOffered.value ||
    itemAddingNotCurrentlyOffered.value
  ) {
    return false;
  }

  const semType = (props.index - 1) % 3;
  if (semType >= 0 && (addingFromCard.value || draggingOver.value)) {
    return [
      itemAdding.value.offered_fall,
      itemAdding.value.offered_IAP,
      itemAdding.value.offered_spring,
    ][semType];
  } else {
    return addingFromCard.value;
  }
});

const semesterInformation = computed(() => {
  const classesInfo = props.semesterSubjects
    .map(
      function (subj) {
        if (subj.public === false) {
          return Object.assign({}, subj, {
            total_units: subj.units,
          });
        } else if (subj.subject_id in store.state.subjectsIndex) {
          return store.state.subjectsInfo[
            store.state.subjectsIndex[subj.subject_id]
          ];
        } else if (subj.subject_id in store.state.genericIndex) {
          return store.state.genericCourses[
            store.state.genericIndex[subj.subject_id]
          ];
        } else {
          return undefined;
        }
      }.bind(this),
    )
    .filter(function (subj) {
      return subj !== undefined;
    });
  const totalUnits = classesInfo.reduce(function (units, subj) {
    let tu = subj.total_units;
    tu = isNaN(tu) ? 0 : tu;
    return units + tu;
  }, 0);
  const expectedHours = function (subj) {
    let hours = subj.in_class_hours + subj.out_of_class_hours;
    hours = isNaN(hours) ? subj.total_units : hours;
    hours = isNaN(hours) ? 0 : hours;
    return {
      hours,
      subject_id: subj.subject_id,
    };
  };
  const sumExpectedHours = function (hours, subj) {
    return hours + subj.hours;
  };
  const isInQuarter = function (subj, quarter) {
    return (
      subj.quarter_information === undefined ||
      parseInt(subj.quarter_information.split(",")[0]) === quarter
    );
  };
  const expectedHoursQuarter1 = classesInfo
    .filter((s) => isInQuarter(s, 0))
    .map(expectedHours);
  const totalExpectedHoursQuarter1 = expectedHoursQuarter1.reduce(
    sumExpectedHours,
    0,
  );
  const expectedHoursQuarter2 = classesInfo
    .filter((s) => isInQuarter(s, 1))
    .map(expectedHours);
  const totalExpectedHoursQuarter2 = expectedHoursQuarter2.reduce(
    sumExpectedHours,
    0,
  );
  const totalExpectedHours = Math.max(
    totalExpectedHoursQuarter1,
    totalExpectedHoursQuarter2,
  );
  const anyClassInSingleQuarter = classesInfo.some(
    (s) => s.quarter_information !== undefined,
  );

  return {
    totalUnits,
    totalExpectedHours,
    anyClassInSingleQuarter,
    expectedHoursQuarter1,
    expectedHoursQuarter2,
    totalExpectedHoursQuarter1,
    totalExpectedHoursQuarter2,
  };
});
const semesterYearName = computed(() => {
  const yearNames = ["Freshman", "Sophomore", "Junior", "Senior", "Fifth Year"];
  if (props.index === 0) {
    return "";
  } else {
    const yearIndex = Math.floor((props.index - 1) / 3);
    return yearNames[yearIndex];
  }
});
const semesterYear = computed(() => {
  return props.index === 0
    ? ""
    : Math.floor((props.index - 2) / 3) + baseYear.value;
});
const semesterType = computed(() => {
  return props.index === 0
    ? "Prior Credit"
    : ["Fall", "IAP", "Spring"][(props.index - 1) % 3];
});

const openRoadSettingsDialog = (event) => {
  event.stopPropagation();
  emit("open-road-settings-dialog");
};

const noLongerOffered = (course) => {
  if (course.is_historical) {
    const lastSemester = course.source_semester.split("-");
    const sourceSemester = ["fall", "IAP", "spring"].indexOf(lastSemester[0]);
    // which class year the last year offered corresponds to; +1 if fall because fall semester year is off by 1
    const sourceYear =
      parseInt(lastSemester[1]) -
      baseYear.value +
      (sourceSemester === 0 ? 1 : 0);
    const lastSemesterNumber = sourceYear * 3 + sourceSemester + 1;
    if (props.index > lastSemesterNumber) {
      return true;
    }
  }
  return false;
};
const notCurrentlyOffered = (course) => {
  if (course.not_offered_year) {
    const year = parseInt(course.not_offered_year.slice(0, 4));

    return (
      (semesterYear.value === year && semesterType.value === "Fall") ||
      (semesterYear.value === year + 1 &&
        ["IAP", "Spring"].includes(semesterType.value))
    );
  }
  return false;
};
const previousSubjects = (subj) => {
  const subjInQuarter2 =
    subj.quarter_information !== undefined &&
    subj.quarter_information.split(",")[0] === "1";
  const beforeThisSemester = flatten(
    props.selectedSubjects.slice(0, props.index),
  );
  const previousQuarter = props.selectedSubjects[props.index].filter((s) => {
    const subj2 =
      store.state.subjectsInfo[store.state.subjectsIndex[s.subject_id]];
    let inPreviousQuarter = false;
    if (subj2 !== undefined) {
      inPreviousQuarter =
        s.semester === props.index &&
        subjInQuarter2 &&
        subj2.quarter_information !== undefined &&
        subj2.quarter_information.split(",")[0] === "0";
    }
    return inPreviousQuarter;
  });
  return beforeThisSemester.concat(previousQuarter);
};
const dragenter = () => {
  draggingOver.value = true;
  dragCount.value++;
};
const dragleave = () => {
  dragCount.value--;
  if (dragCount.value === 0) {
    draggingOver.value = false;
  }
};
const ondrop = (event) => {
  if (
    subjectsLoaded.value &&
    itemAdding.value !== undefined &&
    (offeredNow.value ||
      itemAddingNoLongerOffered.value ||
      itemAddingNotCurrentlyOffered.value ||
      !isSameYear.value ||
      props.index === 0)
  ) {
    const eventData = JSON.parse(event.dataTransfer.getData("classData"));
    if (eventData.isNew) {
      const newClass = {
        overrideWarnings: false,
        semester: props.index,
        title: itemAdding.value.title,
        subject_id: itemAdding.value.subject_id,
        units: itemAdding.value.total_units,
      };
      store.commit("addClass", newClass);
    } else {
      store.commit("moveClass", {
        currentClass: eventData.classInfo,
        classIndex: eventData.classIndex,
        semester: props.index,
      });
    }
  }
  draggingOver.value = false;
  dragCount.value = 0;
};
</script>

<style scoped>
.hovering {
  text-decoration: underline dashed;
}
.mini-course {
  padding: 0.3em 0.5em;
  overflow: hidden;
  white-space: nowrap;
  color: white;
}
/* tooltip table styling */
#tooltipTable table {
  border-collapse: collapse;
  margin: 0;
}
#tooltipTable table,
#tooltipTable th,
#tooltipTable td {
  border: 3px solid grey;
}
#tooltipTable th,
#tooltipTable td {
  padding: 0.4em;
}
#tooltipTable .rightbar {
  border-right-width: 5px;
}
#tooltipTable .topbar th,
#tooltipTable .topbar td {
  border-top-width: 5px;
}
</style>
