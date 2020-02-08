<template>
  <!-- stolen from this example: https://vuetifyjs.com/en/components/cards#grids -->
  <v-expansion-panel-content
    :id="'road_'+roadID+'_semester_' + index"
    dropzone="copy"
    @dragover.native.prevent
  >
    <v-container slot="header" grid-list-xs style="padding: 0px; margin-left: 0px;">
      <v-layout row align-center style="user-select: none;">
        <v-flex xs6>
          <span style="width: 12em; display: inline-block;">
            <b>
              <v-hover>
                <span slot-scope="{ hover }" :class="hover && 'hovering'" @click="openChangeYearDialog">
                  {{ semesterYearName }}
                  {{ semesterType }}
                  <span v-if="index>0">{{ "'" + semesterYear.toString().substring(2) }}</span>
                </span>
              </v-hover>
            </b>
          </span>
          <span style="min-width: 4.5em; display: inline-block;">
            Units: {{ semesterInformation.totalUnits }}
          </span>
          Hours: {{ semesterInformation.expectedHours.toFixed(1) }}
        </v-flex>
        <v-layout v-if="!isOpen" row xs6 style="max-width: 50%;">
          <v-flex v-for="(subject,subjindex) in semesterSubjects" :key="subject.id+'-'+subjindex+'-'+index" xs3>
            <v-card>
              <div v-if="subject!=='placeholder'" :class="courseColor(subject)">
                <v-card-text class="mini-course">
                  <b>{{ subject.id }}</b>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout v-else>
          <v-flex xs10 :style="{ 'color': semData.textColor }">
            {{ semData.message }}
          </v-flex>
        </v-layout>
      </v-layout>
    </v-container>

    <v-container
      class="lighten-3"
      fluid
      grid-list-md
      :class="semData.bgColor"
      @dragenter="dragenter"
      @dragleave="dragleave"
      @drop="ondrop"
    >
      <v-layout wrap align-center justify-center row>
        <class
          v-for="(subject, subjindex) in semesterSubjects"
          :key="subject.id + '-' + subjindex + '-' + index"
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
</template>

<script>
import Class from './Class.vue';
import colorMixin from './../mixins/colorMixin.js';
import schedule from './../mixins/schedule.js';

export default {
  name: 'Semester',
  components: {
    'class': Class
  },
  mixins: [colorMixin, schedule],
  props: {
    selectedSubjects: {
      type: Array,
      required: true
    },
    semesterSubjects: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    roadID: {
      type: String,
      required: true
    },
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      newYear: this.semesterYear,
      draggingOver: false,
      dragCount: 0
    };
  },
  computed: {
    isActiveRoad () {
      return this.$store.state.activeRoad === this.roadID;
    },
    baseYear: function () {
      const today = new Date();
      const currentYear = today.getFullYear();
      const baseYear = (today.getMonth() >= 5) ? currentYear + 1 : currentYear;
      return baseYear - this.$store.getters.userYear;
    },
    currentSemester () {
      return this.$store.state.currentSemester;
    },
    itemAdding () {
      return this.$store.state.itemAdding;
    },
    addingFromCard () {
      return this.$store.state.addingFromCard;
    },
    subjectsLoaded: function () {
      return Object.keys(this.$store.state.subjectsIndex).length > 0;
    },
    warnings: function () {
      const allWarnings = Array(this.semesterSubjects.length).fill([]);
      for (let i = 0; i < this.semesterSubjects.length; i++) {
        const subjectWarnings = [];
        const subjID = this.semesterSubjects[i].id;
        let subj;
        if (subjID in this.$store.state.subjectsIndex) {
          subj = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subjID]];
          var prereqString = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subjID]].prerequisites;
          var coreqString = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subjID]].corequisites;
          var prereqsfulfilled = true;
          var coreqsfulfilled = true;
          if (prereqString !== undefined) {
            prereqsfulfilled = this.reqFulfilled(prereqString, this.index > 0 ? this.previousSubjects(subj) : this.concurrentSubjects);
          }
          if (coreqString !== undefined) {
            coreqsfulfilled = this.reqFulfilled(coreqString, this.concurrentSubjects);
          }
          if (subj.either_prereq_or_coreq) {
            if (!(prereqsfulfilled || coreqsfulfilled)) {
              subjectWarnings.push('<b>Unsatisfied corequisite or prerequisite</b> - You must satisfy either the prerequisites or corequisites for this course.');
            }
          } else {
            if (!prereqsfulfilled) {
              subjectWarnings.push('<b>Unsatisfied prerequisite</b> — One or more prerequisites are not yet fulfilled.');
            }
            if (!coreqsfulfilled) {
              subjectWarnings.push('<b>Unsatisfied corequisite</b> — One or more corequisites are not yet fulfilled.');
            }
          }
          if (this.isScheduledSemester && this.lateSchedule(subj, this.$store.state.genericIndex)) {
            subjectWarnings.push('<b>No schedule</b> - Classes that do not yet have a schedule may not be offered.');
          }
        } else if (subjID in this.$store.state.genericIndex) {
          subj = this.$store.state.genericCourses[this.$store.state.genericIndex[subjID]];
        }
        if (subj !== undefined) {
          const semType = (this.index - 1) % 3;

          // WARNING: be careful with injecting info from the subject like this
          //  -- if we ever take user input, it could lead to XSS attacks from custom classes
          //  (but right now we only ever insert info from FireRoad subjects)
          if (this.noLongerOffered(subj)) {
            const lastSemester = subj.source_semester.split('-');
            subjectWarnings.push('<b>Not offered</b> - This subject is no longer offered (last offered ' + lastSemester.join(' ') + ').');
          } else if (this.notCurrentlyOffered(subj)) {
            subjectWarnings.push(`<b>Not offered</b> - This subject is not offered for the ${subj.not_offered_year} school year.`);
          } else if (semType >= 0) {
            const isUsuallyOffered = [subj.offered_fall, subj.offered_IAP, subj.offered_spring][semType];
            if (!isUsuallyOffered) {
              subjectWarnings.push('<b>Not offered</b> — According to the course catalog, ' + subjID + ' is not usually offered in ' + this.semesterType + '.');
            }
          }
        }
        allWarnings[i] = subjectWarnings;
      }
      return allWarnings;
    },
    concurrentSubjects: function () {
      return this.flatten(this.selectedSubjects.slice(0, this.index + 1));
    },
    semData: function () {
      if (this.addingFromCard || this.draggingOver) {
        if (!this.subjectsLoaded) {
          return {
            bgColor: 'red',
            message: 'Loading subjects... give us a minute',
            textColor: 'DarkRed'
          };
        } else if (this.itemAdding === undefined) {
          return {
            bgColor: 'red',
            message: 'If you see this message, contact courseroad@mit.edu and tell them "710".',
            textColor: 'DarkRed'
          };
        } else if (this.index === 0 || this.offeredNow) {
          return {
            bgColor: 'green',
            message: 'Add class here',
            textColor: 'DarkGreen'
          };
        } else if (this.itemAddingNoLongerOffered) {
          return {
            bgColor: 'yellow',
            message: 'Subject no longer offered',
            textColor: 'DarkGoldenRod'
          };
        } else if (this.itemAddingNotCurrentlyOffered) {
          return {
            bgColor: 'yellow',
            message: 'Subject not offered this year',
            textColor: 'DarkGoldenRod'
          };
        } else if (this.isSameYear) {
          return {
            bgColor: 'red',
            message: 'Subject not available this semester',
            textColor: 'DarkRed'
          };
        } else {
          return {
            bgColor: 'yellow',
            message: 'Subject may not be available this semester',
            textColor: 'DarkGoldenRod'
          };
        }
      }
      return {
        bgColor: 'grey',
        message: '',
        textColor: ''
      };
    },
    isSameYear: function () {
      return Math.floor((this.index - 1) / 3) === Math.floor((this.currentSemester - 1) / 3);
    },
    isScheduledSemester: function () {
      const today = new Date();
      const month = today.getMonth();
      const scheduledSemester = (month === 4) ? this.currentSemester + 1 : this.currentSemester;
      return this.index === scheduledSemester;
    },
    itemAddingNoLongerOffered: function () {
      return this.noLongerOffered(this.itemAdding);
    },
    itemAddingNotCurrentlyOffered: function () {
      return this.notCurrentlyOffered(this.itemAdding);
    },
    offeredNow: function () {
      if (!this.subjectsLoaded ||
          this.itemAdding === undefined ||
          this.itemAddingNoLongerOffered ||
          this.itemAddingNotCurrentlyOffered
      ) {
        return false;
      }

      const semType = (this.index - 1) % 3;
      if (semType >= 0 && (this.addingFromCard || this.draggingOver)) {
        return [this.itemAdding.offered_fall, this.itemAdding.offered_IAP, this.itemAdding.offered_spring][semType];
      } else {
        return this.addingFromCard;
      }
    },
    semesterInformation: function () {
      const classesInfo = this.semesterSubjects.map(function (subj) {
        if (subj.id in this.$store.state.subjectsIndex) {
          return this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subj.id]];
        } else if (subj.id in this.$store.state.genericIndex) {
          return this.$store.state.genericCourses[this.$store.state.genericIndex[subj.id]];
        } else {
          return undefined;
        }
      }.bind(this)).filter(function (subj) {
        return subj !== undefined;
      });
      const totalUnits = classesInfo.reduce(function (units, subj) {
        let tu = subj.total_units;
        tu = isNaN(tu) ? 0 : tu;
        return units + tu;
      }, 0);
      const totalExpectedHours = function (hours, subj) {
        let eh = subj.in_class_hours + subj.out_of_class_hours;
        eh = isNaN(eh) ? subj.total_units : eh;
        eh = isNaN(eh) ? 0 : eh;
        return hours + eh;
      };
      const isInQuarter = function (subj, quarter) {
        return subj.quarter_information === undefined || parseInt(subj.quarter_information.split(',')[0]) === quarter;
      };
      const expectedHoursQuarter1 = classesInfo.filter((s) => isInQuarter(s, 0)).reduce(totalExpectedHours, 0);
      const expectedHoursQuarter2 = classesInfo.filter((s) => isInQuarter(s, 1)).reduce(totalExpectedHours, 0);
      const expectedHours = Math.max(expectedHoursQuarter1, expectedHoursQuarter2);
      return {
        totalUnits: totalUnits,
        expectedHours: expectedHours
      };
    },
    semesterYearName: function () {
      const yearNames = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Fifth Year'];
      if (this.index === 0) {
        return '';
      } else {
        const yearIndex = Math.floor((this.index - 1) / 3);
        return yearNames[yearIndex];
      }
    },
    semesterYear: function () {
      return this.index === 0
        ? ''
        : Math.floor((this.index - 2) / 3) + this.baseYear;
    },
    semesterType: function () {
      return this.index === 0
        ? 'Prior Credit'
        : ['Fall', 'IAP', 'Spring'][(this.index - 1) % 3];
    }
  },
  methods: {
    openChangeYearDialog: function (event) {
      event.stopPropagation();
      this.$emit('open-change-year-dialog');
    },
    noLongerOffered: function (course) {
      if (course.is_historical) {
        const lastSemester = course.source_semester.split('-');
        const sourceSemester = ['fall', 'IAP', 'spring'].indexOf(lastSemester[0]);
        // which class year the last year offered corresponds to; +1 if fall because fall semester year is off by 1
        const sourceYear = parseInt(lastSemester[1]) - this.baseYear + (sourceSemester === 0 ? 1 : 0);
        const lastSemesterNumber = sourceYear * 3 + sourceSemester + 1;
        if (this.index > lastSemesterNumber) {
          return true;
        }
      }
      return false;
    },
    notCurrentlyOffered: function (course) {
      if (course.not_offered_year) {
        const year = parseInt(course.not_offered_year.slice(0, 4));

        return (this.semesterYear === year && this.semesterType === 'Fall') ||
            (this.semesterYear === year + 1 && ['IAP', 'Spring'].includes(this.semesterType));
      }
      return false;
    },
    previousSubjects: function (subj) {
      const subjInQuarter2 = subj.quarter_information !== undefined && subj.quarter_information.split(',')[0] === '1';
      const beforeThisSemester = this.flatten(this.selectedSubjects.slice(0, this.index));
      const previousQuarter = this.selectedSubjects[this.index].filter(s => {
        const subj2 = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[s.id]];
        let inPreviousQuarter = false;
        if (subj2 !== undefined) {
          inPreviousQuarter = s.semester === this.index &&
            subjInQuarter2 &&
            subj2.quarter_information !== undefined &&
            subj2.quarter_information.split(',')[0] === '0';
        }
        return inPreviousQuarter;
      });
      return beforeThisSemester.concat(previousQuarter);
    },
    classSatisfies: function (req, id, allSubjects) {
      if (req === id) {
        return true;
      }

      let subj;
      if (id in this.$store.state.subjectsIndex) {
        subj = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[id]];
      } else if (id in this.$store.state.genericIndex) {
        subj = this.$store.state.genericCourses[this.$store.state.genericIndex[id]];
      } else {
        // subj not found in known courses
        return false;
      }

      if (subj.equivalent_subjects !== undefined && subj.equivalent_subjects.indexOf(req) >= 0) {
        return true;
      }

      // ex: 6.00 satisfies the 6.0001 requirement
      if (subj.children !== undefined && subj.children.indexOf(req) >= 0) {
        return true;
      }

      // ex: 6.0001 and 6.0002 together satisfy the 6.00 requirement
      if (subj.parent !== undefined && req === subj.parent) {
        const parentCourse = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subj.parent]];
        if (parentCourse !== undefined) {
          if (parentCourse.children.every((sid) => allSubjects.indexOf(sid) >= 0)) {
            return true;
          }
        }
      }

      if (req.indexOf('.') === -1) {
        if (req.indexOf('GIR:') >= 0) {
          req = req.substring(4);
          return subj.gir_attribute === req;
        } else if (req.indexOf('HASS') >= 0) {
          return subj.hass_attribute.split(',').indexOf(req) >= 0;
        } else if (req.indexOf('CI') >= 0) {
          return subj.communication_requirement === req;
        }
      }
      return false;
    },
    reqFulfilled: function (reqString, subjects) {
      const allIDs = subjects.map((s) => s.id);
      reqString = reqString.replace(/''/g, '"').replace(/,[\s]+/g, ',');
      const splitReq = reqString.split(/(,|\(|\)|\/)/);
      const _this = this;
      for (let i = 0; i < splitReq.length; i++) {
        if (splitReq[i].indexOf('"') >= 0) {
          // Set strings (like "permission of instructor") automatically to false
          // If required as an alternative to other prereqs, will not affect fulfillment
          // If the string is a required prereq, it must be manually dismissed
          splitReq[i] = 'false';
        } else if ('()/, '.indexOf(splitReq[i]) < 0) {
          if (allIDs.indexOf(splitReq[i]) >= 0) {
            splitReq[i] = 'true';
          } else {
            const anyClassSatisfies = subjects.some((s) => _this.classSatisfies(splitReq[i], s.id, allIDs));
            splitReq[i] = anyClassSatisfies ? 'true' : 'false';
          }
        }
      }
      const reqExpression = splitReq.join('').replace(/\//g, '||').replace(/,/g, '&&');
      // i know this seems scary, but the above code guarantees there will only be ()/, true false in this string
      // eslint-disable-next-line no-eval
      return eval(reqExpression);
    },
    dragenter: function (event) {
      this.draggingOver = true;
      this.dragCount++;
    },
    dragleave: function (event) {
      this.dragCount--;
      if (this.dragCount === 0) {
        this.draggingOver = false;
      }
    },
    ondrop: function (event) {
      if (this.subjectsLoaded &&
          this.itemAdding !== undefined &&
          (this.offeredNow ||
            this.itemAddingNoLongerOffered ||
            this.itemAddingNotCurrentlyOffered ||
            !this.isSameYear ||
            this.index === 0)
      ) {
        const eventData = JSON.parse(event.dataTransfer.getData('classData'));
        if (eventData.isNew) {
          const newClass = {
            overrideWarnings: false,
            semester: this.index,
            title: this.itemAdding.title,
            id: this.itemAdding.subject_id,
            units: this.itemAdding.total_units
          };
          this.$store.commit('addClass', newClass);
        } else {
          this.$store.commit('moveClass', { currentClass: eventData.classInfo, classIndex: eventData.classIndex, semester: this.index });
        }
      }
      this.draggingOver = false;
      this.dragCount = 0;
    }
  }
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
</style>
