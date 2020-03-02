<template>
  <v-layout>
    <v-flex>
      <v-card
        id="classInfoCard"
        class="class-info-card"
        style="display: flex; flex-direction:column;"
        width="30%"
        height="40%"
        min-width="23em"
      >
        <v-card-title :class="['card-header',courseColor(currentSubject)]">
          <v-flex style="display: flex; flex-direction: row; align-items: center;">
            <div style="padding: 0; margin: 0; display: block;">
              <v-btn v-if="classInfoStack.length > 1" style="padding: 0; margin: 0; color:white;" icon @click="$store.commit('popClassStack')">
                <v-icon>navigate_before</v-icon>
              </v-btn>
            </div>
            <div style="padding: 0 0.5em 0 0;">
              <h3>{{ currentSubject.subject_id }}</h3>
            </div>
            <div style="margin-left:auto">
              <v-btn icon style="margin: 0;" @click="$store.commit('clearClassInfoStack')">
                <v-icon style="margin:0; padding: 0; color:white;">
                  close
                </v-icon>
              </v-btn>
            </div>
          </v-flex>
        </v-card-title>

        <v-card-text class="card-body">
          <div id="cardBody" class="card-body-container">
            <v-layout row>
              <div style="padding: 0 0 0.5em 0;">
                <h3>{{ currentSubject.title }}</h3>
              </div>

              <v-btn
                v-if="!addingFromCard"
                fab
                small
                style="margin-left:auto;"
                class="secondary"
                @click="addClass"
              >
                <v-icon>add</v-icon>
              </v-btn>
              <v-btn
                v-if="addingFromCard"
                fab
                small
                style="margin-left:auto;"
                class="secondary"
                @click="$store.commit('cancelAddFromCard')"
              >
                <v-icon>block</v-icon>
              </v-btn>
            </v-layout>
            <h4 v-if="currentSubject.is_historical">
              <v-icon small>
                warning
              </v-icon>
              This subject is no longer offered (last offered {{ currentSubject.source_semester.split("-").join(" ") }})
            </h4>
            <h4 v-else-if="currentSubject.not_offered_year">
              <v-icon small>
                warning
              </v-icon>
              This subject is not offered during the {{ currentSubject.not_offered_year }} school year.
            </h4>
            <table cellspacing="4">
              <tr v-if="currentSubject.total_units!==undefined">
                <td><b>Units</b></td>
                <td>
                  {{ currentSubject.total_units }}
                  <span
                    v-if="currentSubject.lecture_units !== undefined
                      && currentSubject.lab_units !== undefined
                      && currentSubject.preparation_units !== undefined
                    "
                  >
                    total ({{ currentSubject.lecture_units }}-{{ currentSubject.lab_units }}-{{ currentSubject.preparation_units }})
                  </span>
                </td>
              </tr>
              <tr
                v-if="currentSubject.offeredFall !== undefined
                  || currentSubject.offered_IAP !== undefined
                  || currentSubject.offered_spring !== undefined
                  || currentSubject.offered_summer !== undefined
                "
              >
                <td><b>Offered</b></td>
                <td>
                  <ul class="comma-separated">
                    <li v-if="currentSubject.offered_fall">
                      Fall
                    </li>
                    <li v-if="currentSubject.offered_IAP">
                      IAP
                    </li>
                    <li v-if="currentSubject.offered_spring">
                      Spring
                    </li>
                    <li v-if="currentSubject.offered_summer">
                      Summer
                    </li>
                  </ul>
                  <span
                    v-if="!currentSubject.offered_fall
                      && !currentSubject.offered_IAP
                      && !currentSubject.offered_spring
                      && !currentSubject.offered_summer
                    "
                  >
                    None
                  </span>
                </td>
              </tr>
              <tr v-if="currentSubject.instructors !== undefined">
                <td><b>Instructor</b></td>
                <td>
                  <ul class="comma-separated">
                    <li v-for="instructor in currentSubject.instructors" :key="instructor">
                      {{ instructor }}
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="currentSubject.enrollment_number !== undefined">
                <td><b>Average Enrollment</b></td>
                <td>{{ currentSubject.enrollment_number }}</td>
              </tr>
              <tr v-if="currentSubject.rating !== undefined">
                <td><b>Average Rating</b></td>
                <td>
                  <a target="_blank" :href="'https://sisapp.mit.edu/ose-rpt/subjectEvaluationSearch.htm?search=Search&subjectCode='+currentSubject.subject_id">
                    {{ currentSubject.rating }}
                  </a>
                </td>
              </tr>
              <tr v-if="currentSubject.in_class_hours !== undefined || currentSubject.out_of_class_hours !== undefined">
                <td><b>{{ currentSubject.subject_id in $store.state.genericIndex ? "Average* hours" : "Hours" }}</b></td>
                <td>
                  <table cellspacing="0">
                    <tr v-if="currentSubject.in_class_hours !== undefined">
                      {{ currentSubject.in_class_hours.toFixed(2) }} in class
                    </tr>
                    <tr v-if="currentSubject.out_of_class_hours !== undefined">
                      {{ currentSubject.out_of_class_hours.toFixed(2) }} out of class
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p v-if="currentSubject.subject_id in $store.state.genericIndex">
              *Hours averaged over all {{ currentSubject.subject_id }} classes
            </p>
            <h3>Description</h3>
            <p> {{ currentSubject.description }} </p>
            <p v-if="currentSubject.url !== undefined">
              <a target="_blank" :href="currentSubject.url">View in course catalog</a>
            </p>
            <p v-if="currentSubject.subject_id in $store.state.subjectsIndex">
              <a target="_blank" :href="'https://sisapp.mit.edu/ose-rpt/subjectEvaluationSearch.htm?search=Search&subjectCode='+currentSubject.subject_id">
                View Course Evaluations
              </a>
            </p>
            <div v-if="currentSubject.equivalent_subjects !== undefined">
              <h3>Equivalent Subjects</h3>
              <subject-scroll :subjects="currentSubject.equivalent_subjects.map(classInfo)" @click-subject="clickRelatedSubject" />
            </div>
            <div v-if="parsedPrereqs.reqs.length > 0">
              <h3 id="prereq0">
                Prerequisites
              </h3>
              <expansion-reqs
                :requirement="parsedPrereqs"
                :req-i-d="currentSubject.subject_id+'prereq0'"
                @click-subject="clickRelatedSubject"
              />
            </div>
            <h4 v-if="currentSubject.either_prereq_or_coreq">
              OR
            </h4>
            <div v-if="parsedCoreqs.reqs.length > 0">
              <h3 id="coreq0">
                Corequisites
              </h3>
              <expansion-reqs
                :requirement="parsedCoreqs"
                :req-i-d="currentSubject.subject_id+'coreq0'"
                @click-subject="clickRelatedSubject"
              />
            </div>
            <div v-if="currentSubject.related_subjects !== undefined">
              <h3>Related subjects</h3>
              <subject-scroll :subjects="currentSubject.related_subjects.map(classInfo)" @click-subject="clickRelatedSubject" />
            </div>
            <div v-if="subjectsWithPrereq.length > 0">
              <h3>Subjects with {{ currentSubject.subject_id }} as Prerequisite</h3>
              <subject-scroll :subjects="subjectsWithPrereq" @click-subject="clickRelatedSubject" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import $ from 'jquery';
import SubjectScroll from '../components/SubjectScroll.vue';
import ExpansionReqs from '../components/ExpansionReqs.vue';
import colorMixin from './../mixins/colorMixin.js';
import schedule from './../mixins/schedule.js';
import reqFulfillment from './../mixins/reqFulfillment.js';

export default {
  name: 'ClassInfo',
  components: {
    'subject-scroll': SubjectScroll,
    'expansion-reqs': ExpansionReqs
  },
  mixins: [colorMixin, schedule, reqFulfillment],
  data: function () { return {} },
  computed: {
    addingFromCard () {
      return this.$store.state.addingFromCard;
    },
    classInfoStack () {
      return this.$store.state.classInfoStack;
    },
    currentSubject: function () {
      const currentID = this.classInfoStack[this.classInfoStack.length - 1];
      return currentID in this.$store.state.subjectsIndex
        ? this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[currentID]]
        : this.$store.state.genericCourses[this.$store.state.genericIndex[currentID]];
    },
    parsedPrereqs: function () {
      return this.currentSubject.prerequisites !== undefined
        ? this.parseRequirements(this.currentSubject.prerequisites)
        : { reqs: [] };
    },
    parsedCoreqs: function () {
      return this.currentSubject.corequisites !== undefined
        ? this.parseRequirements(this.currentSubject.corequisites)
        : { reqs: [] };
    },
    subjectsWithPrereq: function () {
      const currentID = this.currentSubject.subject_id;
      const currentDept = currentID.substring(0, currentID.indexOf('.'));
      var IDMatcher = new RegExp('(^|[^\\da-zA-Z])' + currentID.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\da-zA-Z])');
      return this.$store.state.subjectsInfo.filter(function (s) {
        return s.prerequisites !== undefined && IDMatcher.test(s.prerequisites);
      }).sort(function (s1, s2) {
        // show subjects in same department first
        var dept1 = s1.subject_id.substring(0, s1.subject_id.indexOf('.'));
        var dept2 = s2.subject_id.substring(0, s2.subject_id.indexOf('.'));
        if (dept1 === currentDept && dept2 !== currentDept) {
          return -1;
        } else {
          return 0;
        }
      });
    },
    firstAppearance: function () {
      const currentSubjects = this.$store.state.roads[this.$store.state.activeRoad].contents.selectedSubjects;
      const currentID = this.currentSubject.subject_id;

      const subjectInSemesters = currentSubjects.map((semesterSubjects) => {
        return semesterSubjects.map((subj) => subj.id).indexOf(currentID) >= 0;
      });

      return subjectInSemesters.indexOf(true);
    }
  },
  methods: {
    classInfo: function (subjectID) {
      const subj = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subjectID]];
      return subj || {
        subject_id: subjectID,
        title: ''
      };
    },
    clickRelatedSubject: function (subject) {
      this.$store.commit('pushClassStack', subject.id);
      $('#cardBody').animate({ scrollTop: 0 });
    },
    parseRequirements: function (requirements) {
      // TODO: a way to make this more ETU?
      // remove spaces after commas and slashes
      requirements = requirements.replace(/([,/])\s+/g, '$1');
      function getParenGroup (str) {
        if (str[0] === '(') {
          let retString = '';
          str = str.substring(1);
          let nextParen;
          let numParens = 1;
          while (((nextParen = /[()]/.exec(str)) !== null) && numParens > 0) {
            const parenIndex = nextParen.index;
            const parenType = nextParen[0];
            if (parenType === '(') {
              numParens++;
            } else {
              numParens--;
            }
            retString += str.substring(0, parenIndex + 1);
            str = str.substring(parenIndex + 1);
          }
          return [retString.substring(0, retString.length - 1), str.substring(1), str.length > 0 ? str.substring(0, 1) : undefined];
        } else {
          return undefined;
        }
      }

      function getNextReq (reqString) {
        if (reqString[0] === '(') {
          return getParenGroup(reqString);
        } else {
          const nextMatch = /^([^/,]+)([/,])(.*)/g.exec(reqString);
          if (nextMatch !== null) {
            const nextReq = nextMatch[1];
            const restOfString = nextMatch[3];
            const delimiter = nextMatch[2];
            return [nextReq, restOfString, delimiter];
          } else {
            return [reqString, '', undefined];
          }
        }
      }

      function isBaseReq (req) {
        return /[/(),]/g.exec(req) === null;
      }

      const getClassInfo = this.classInfo;

      const parseReqs = (reqString) => {
        const parsedReq = { reqs: [], subject_id: '', connectionType: '', title: '', expansionDesc: '', topLevel: false, fulfilled: false };
        let onereq;
        let connectionType;
        let nextConnectionType;
        while (reqString.length > 0) {
          [onereq, reqString, nextConnectionType] = getNextReq(reqString);
          if (nextConnectionType !== undefined) {
            connectionType = nextConnectionType;
          }
          if (isBaseReq(onereq)) {
            let subRequirement;
            if (onereq.indexOf("'") >= 0) {
              subRequirement = { subject_id: onereq.replace(/'/g, ''), title: '' };
            } else {
              subRequirement = Object.assign({}, getClassInfo(onereq));
            }
            if (this.firstAppearance >= -1) {
              const allPreviousSubjects = this.flatten(
                this.$store.state.roads[this.$store.state.activeRoad].contents.selectedSubjects
                  .slice(0, this.firstAppearance)
              );
              subRequirement.fulfilled = this.reqsFulfilled(onereq, allPreviousSubjects);
            } else {
              subRequirement.fulfilled = true;
            }
            parsedReq.reqs.push(subRequirement);
          } else {
            parsedReq.reqs.push(parseReqs(onereq));
          }
        }

        if (connectionType === '/') {
          parsedReq.connectionType = 'any';
          parsedReq.fulfilled = parsedReq.reqs.some((req) => req.fulfilled);
        } else if (connectionType === ',') {
          parsedReq.connectionType = 'all';
          parsedReq.fulfilled = parsedReq.reqs.every((req) => req.fulfilled);
        }

        function sortOrder (req) {
          if (req.reqs !== undefined) {
            return 0;
          } else if (req.total_units !== undefined) {
            return -1;
          } else {
            return 1;
          }
        }

        parsedReq.reqs.sort(function (a, b) {
          return sortOrder(a) - sortOrder(b);
        });

        function getReqTitle (req) {
          if (req.total_units !== undefined) {
            return req.subject_id;
          } else if (typeof req === 'string') {
            return req;
          } else {
            return req.subject_id + ' ' + req.title;
          }
        }

        if (parsedReq.reqs.length === 2) {
          if (parsedReq.connectionType === 'any') {
            parsedReq.subject_id = getReqTitle(parsedReq.reqs[0]);
            parsedReq.title = 'or ' + getReqTitle(parsedReq.reqs[1]);
            parsedReq.expansionDesc = 'Select either:';
          } else {
            parsedReq.subject_id = getReqTitle(parsedReq.reqs[0]);
            parsedReq.title = 'and ' + getReqTitle(parsedReq.reqs[1]);
            parsedReq.expansionDesc = 'Select both:';
          }
        } else if (parsedReq.reqs.length > 2) {
          parsedReq.subject_id = getReqTitle(parsedReq.reqs[0]);
          if (parsedReq.connectionType === 'any') {
            parsedReq.title = 'or ' + (parsedReq.reqs.length - 1) + ' others';
            parsedReq.expansionDesc = 'Select any:';
          } else {
            parsedReq.title = 'and ' + (parsedReq.reqs.length - 1) + ' others';
            parsedReq.expansionDesc = 'Select all:';
          }
        }

        const connectionMatch = /(and|or)/.exec(parsedReq.subject_id);

        if (connectionMatch !== null) {
          const connectionIndex = connectionMatch.index;
          const firstPart = parsedReq.subject_id.substring(0, connectionIndex).replace(/\s/g, '');
          const secondPart = parsedReq.subject_id.substring(connectionIndex);
          parsedReq.subject_id = firstPart;
          parsedReq.title = secondPart + ' ' + parsedReq.title;
        }

        return parsedReq;
      };

      const rList = parseReqs(requirements);
      rList.topLevel = true;
      return rList;
    },
    addClass: function () {
      this.$store.commit('addFromCard', this.currentSubject);
    }
  }
};
</script>

<style scoped>
#classInfoCard {
  right: 24px;
}

@media only screen and (max-width:959px) {
  #classInfoCard {
    right: 16px;
  }
}

.card-header {
  padding: 0.5em 1em;
  display: inline-block;
  color: white;
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

table td:first-child {
  padding-right: 1em;
}

</style>
