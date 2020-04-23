<template>
  <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->

  <v-flex style="padding: 0px 18px 0px 18px; overflow: auto;">
    <div style="display: flex; align-content: space-between; margin: 12px 0px;">
      <v-autocomplete
        v-model="changeReqs"
        :hint="'Your programs'.concat(changeReqs.length < 2 ? ' -- click to add a major' : '')"
        :items="getCourses"
        item-text="medium-title"
        item-value="key"
        persistent-hint
        multiple
        chips
        deletable-chips
        dense
        no-data-text="'No results found'"
      />
    </div>

    <v-treeview
      v-model="tree"
      :items="selectedTrees"
      item-key="uniqueKey"
      item-children="reqs"
      open-on-click
      :activatable="false"
    >
      <template slot="label" slot-scope="{ item, leaf}">
        <v-hover :disabled="!leaf || !canDrag(item)">
          <div
            slot-scope="{ hover }"
            :class="{ 'elevation-3 grey lighten-3': hover }"
            :style="(leaf && canDrag(item) ? 'cursor: grab' : 'cursor: pointer')"
          >
            <v-icon
              v-if="!('reqs' in item)"
              class="appendLeft"
              :style="fulfilledIcon(item)"
              @click="clickRequirement(item)"
            >
              {{ item['plain-string'] ?
                (item["list-id"] in progressOverrides ?
                  (item.fulfilled ? "assignment_turned_in" : "assignment") :
                  "assignment_late" ) :
                item.fulfilled ? "done" : "remove" }}
            </v-icon>
            <requirement
              :req="item"
              :is-leaf="leaf"
              @click.native="clickRequirement(item)"
              @click-info="reqInfo($event, item)"
              @click-petition="reqPetition($event, item)"
            />
          </div>
        </v-hover>
      </template>
    </v-treeview>

    <p v-if="isCourse6">
      <br>
      <a href="http://eecsappsrv.mit.edu/students/">
        Course 6 Student Portal (+Audit)
      </a>
    </p>

    <v-dialog v-model="progressDialog" max-width="600">
      <v-card v-if="progressReq !== undefined">
        <v-btn icon flat style="float:right" @click="progressDialog=false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
          <h2>Manual Progress: {{ progressReq.title }}</h2>
        </v-card-title>
        <v-card-text>
          <p>
            Because this requirement is custom to the individual, you have to
            manually enter how many of these requirements you have completed for your degree.
          </p>
          <h3>{{ capitalize(progressReq.threshold.criterion) }} Completed: {{ newManualProgress }}/{{ progressReq.threshold.cutoff }}</h3>
          <v-layout row justify-start style="width: 70%; margin: auto;">
            <v-flex shrink style="width: 3em; margin-right: 1em;">
              <v-text-field v-model="newManualProgress" type="number" @keyup.enter="updateManualProgress" />
            </v-flex>
            <v-flex>
              <v-slider
                v-model="newManualProgress"
                :max="progressReq.threshold.cutoff"
                :min="0"
                :step="1"
              />
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat @click="progressDialog=false; progressReq=undefined;">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="updateManualProgress">
            Update Progress
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="600">
      <div v-if="dialogReq !== undefined">
        <v-card>
          <v-btn icon flat style="float:right" @click="viewDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title>{{ dialogReq["title"] }}</v-card-title>
          <v-card-text v-if="'url' in dialogReq">
            <a target="_blank" :href="dialogReq['url']">Link to the real, up to date requirements</a>
          </v-card-text>
          <v-card-text v-if="'desc' in dialogReq">
            {{ dialogReq["desc"] }}
          </v-card-text>
          <v-card-text>
            <div
              class="percentage-bar p-block"
              :style="percentage(dialogReq)"
            >
              {{ dialogReq["percent_fulfilled"] }}% fulfilled
            </div>
          </v-card-text>
          <v-card-text v-if="'req' in dialogReq">
            {{ dialogReq["req"] }}
          </v-card-text>
          <v-card-text>
            <b>Satisfying courses:</b>
            <div v-for="course in dialogReq['sat_courses']" :key="course">
              {{ course }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-if="'title-no-degree' in dialogReq"
              color="error"
              @click="deleteReq(dialogReq); viewDialog = false;"
            >
              <v-icon>delete</v-icon>
              Remove Requirement
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>

    <v-dialog v-model="petitionDialog" max-width="600">
      <v-card>
        <div v-if="petitionReq !== undefined">
          <v-btn icon flat style="float:right" @click="petitionDialog = false; petitionReq = undefined;">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title v-if="'title' in petitionReq">
            <h2> Petition {{ petitionReq["title"] }} </h2>
          </v-card-title>
          <v-card-title v-else>
            <h2> Petition {{ petitionReq["req"] }} </h2>
          </v-card-title>
          <v-card-text v-if="reqProgressAssertions !== undefined" style="padding-left: 5%; padding-right: 5%;">
            Requirement Petitioned by:
            <div v-for="course in reqProgressAssertions" :key="course">
              {{ course }}
            </div>
          </v-card-text>
          <v-select
            v-model="petitionSelectCourses"
            :items="selectedSubjects.flat()"
            item-text="id"
            label="Select Courses to Petition with:"
            no-data-text="No Courses Found"
            multiple
            chips
            style="padding-left: 5%; padding-right: 5%;"
          />
          <v-card-actions style="padding-right: 5%;">
            <v-spacer />
            <v-btn
              color="success"
              @click="submitPetition()"
            >
              Petition
            </v-btn>
            <v-btn
              color="primary"
              @click="ignorePetition()"
            >
              Ignore
            </v-btn>
            <v-btn
              color="error"
              @click="clearPetition()"
            >
              Reset Petition
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import Requirement from './Requirement.vue';
import classInfoMixin from './../mixins/classInfo.js';
export default {
  name: 'Audit',
  components: {
    requirement: Requirement
  },
  mixins: [classInfoMixin],
  props: {
    selectedReqs: {
      type: Array,
      required: true
    },
    reqTrees: {
      type: Object,
      required: true
    },
    reqList: {
      type: Array,
      required: true
    },
    progressOverrides: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      tree: [],
      viewDialog: false,
      dialogReq: undefined,
      progressDialog: false,
      progressReq: undefined,
      petitionDialog: false,
      petitionReq: undefined,
      petitionSelectCourses: [],
      newManualProgress: 0,
      isEditing: false
    };
  },
  computed: {
    changeReqs: {
      get: function () {
        return this.selectedReqs;
      },
      set: function (newReqs) {
        const currentReqs = this.selectedReqs;
        if (currentReqs.length > newReqs.length) {
          const diff = currentReqs.find(x => !newReqs.includes(x));
          this.$store.commit('removeReq', diff);
        } else {
          const newReq = newReqs[newReqs.length - 1];
          this.$store.commit('addReq', newReq);
        }
      }
    },
    isCourse6: function () {
      return this.selectedTrees.some(course => {
        // checks if a course is one of the ones that the course 6 audit page works for
        // if statement needed because otherwise it gives an error if the courses haven't loaded yet
        if (course['short-title']) {
          const major = course['short-title'].slice(0, 3);
          return ['6-1', '6-2', '6-3', '6-7', '6-14', '6', '6-P'].includes(major);
        } else {
          return false;
        }
      });
    },
    getCourses: function () {
      const courses = this.reqList.slice(0);
      const sortKey = 'medium-title';
      // NOTE: brute force way sorting the courses given the fields we have
      courses.sort(function (c1, c2) {
        const a = c1[sortKey].toLowerCase();
        const b = c2[sortKey].toLowerCase();
        if ((a.includes('major') && b.includes('major')) || (a.includes('minor') && b.includes('minor'))) {
          let n1 = a.split(' ')[0].split('-')[0];
          let n2 = b.split(' ')[0].split('-')[0];
          n1 = isNaN(n1) && !isNaN(n1.slice(0, -1)) ? n1.slice(0, -1) : n1;
          n2 = isNaN(n2) && !isNaN(n2.slice(0, -1)) ? n2.slice(0, -1) : n2;
          if (n1 === n2) return a.localeCompare(b);
          return (!isNaN(n1) && !isNaN(n2)) || (isNaN(n1) && isNaN(n2))
            ? n1 - n2
            : (!isNaN(n1) ? -1 : 1);
        } else if (a.includes('major') && b.includes('minor')) return -1;
        else if (b.includes('major') && a.includes('minor')) return 1;
        else if (a.includes('major') || a.includes('minor')) return -1;
        else if (b.includes('major') || b.includes('minor')) return 1;
        else return a.localeCompare(b);
      });
      return courses;
    },
    selectedTrees: function () {
      return this.selectedReqs.map(function (req, index) {
        if (req in this.reqTrees) {
          return this.assignListIDs(
            Object.assign({}, this.reqTrees[req]),
            index
          );
        } else {
          return {
            title: 'loading...',
            reqs: [],
            uniqueKey: index
          };
        }
      }, this);
    },
    reqProgressAssertions: {
      get: function () {
        const petitionReqPA = this.$store.state.roads[this.$store.state.activeRoad].contents.progressAssertions[this.petitionReq['list-id']];
        // Checks if unique key in progressAssert, if it is, searches for substitution key
        if (petitionReqPA !== undefined) {
          return petitionReqPA['substitutions'];
        } else {
          return undefined;
        }
      }
    }
  },
  methods: {
    fulfilledIcon: function (req) {
      return req.fulfilled && (req.req !== undefined || req.sat_courses.length > 0)
        ? 'color: #00b300;'
        : '';
    },
    reqInfo: function (event, req) {
      event.preventDefault();
      event.stopPropagation();
      this.viewDialog = true;
      this.dialogReq = req;
    },
    reqPetition: function (event, req) {
      event.preventDefault();
      event.stopPropagation();
      this.petitionDialog = true;
      this.petitionReq = req;
    },
    clickRequirement: function (item) {
      if (item.req !== undefined) {
        if (!item['plain-string']) {
          let usedReq = item.req;
          if (usedReq.indexOf('GIR:') === 0) {
            usedReq = usedReq.substring(4);
          }
          this.$store.commit('pushClassStack', usedReq);
        } else {
          this.startProgressDialog(item);
        }
      }
    },
    // gives each list and sublist an id
    // progress overrides are a dictionary where the keys are these list ids and the values are the manual progress
    // for example, the 3rd requirement of the 1st requirement of GIRs (CAL1) would have id gir.0.2
    assignListIDs: function (req, index) {
      if ('reqs' in req && 'list-id' in req) {
        let currentListID = req['list-id'];
        if (currentListID.indexOf('.reql') >= 0) {
          // if the requirement is top level, it will have .reql at the end and this needs to be removed
          req['list-id'] = req['list-id'].substring(
            0,
            req['list-id'].indexOf('.reql')
          );
          currentListID = req['list-id'];
        }
        req.uniqueKey = index + '-' + req['list-id'];
        for (let r = 0; r < req.reqs.length; r++) {
          // give each sub-requirement a list id of [parent list id].[index]
          Object.assign(req.reqs[r], { 'list-id': currentListID + '.' + r });
          // assign list ids to each of the children
          req.reqs[r] = this.assignListIDs(req.reqs[r], index);
        }
      }
      return req;
    },
    startProgressDialog: function (req) {
      this.progressReq = Object.assign(
        { threshold: { criterion: 'subject', cutoff: 1, type: 'GTE' } },
        req
      );
      this.progressDialog = true;
      if (this.progressReq['list-id'] in this.progressOverrides) {
        this.newManualProgress = this.progressOverrides[this.progressReq['list-id']];
      }
    },
    capitalize: function (word) {
      return word[0].toUpperCase() + word.substring(1);
    },
    updateManualProgress: function () {
      if (this.progressReq['list-id'] !== undefined) {
        this.$store.commit('updateProgress', {
          listID: this.progressReq['list-id'],
          progress: this.newManualProgress
        });
      }
      this.progressReq = undefined;
      this.progressDialog = false;
      this.newManualProgress = 0;
    },
    percentage: function (req) {
      const pfulfilled = req.percent_fulfilled;
      const pcolor = req.fulfilled
        ? '#00b300'
        : req.percent_fulfilled > 15
          ? '#efce15'
          : '#ef8214';
      return `--percent: ${pfulfilled}%; --bar-color: ${pcolor}; --bg-color: #fff`;
    },
    deleteReq: function (req) {
      const reqName = req['list-id'].substring(0, req['list-id'].indexOf('.reql'));
      this.$store.commit('removeReq', reqName);
    },
    submitPetition: function () {
      this.$store.commit('setPASubstitutions', { uniqueKey: this.petitionReq['list-id'], newReqs: this.petitionSelectCourses });
      this.petitionSelectCourses = [];
    },
    clearPetition: function () {
      this.$store.commit('removeProgressAssertion', this.petitionReq['list-id']);
    },
    ignorePetition: function () {
      this.$store.commit('setPAIgnore', this.petitionReq['list-id']);
    }
  }
};
</script>

<style scoped>
.appendLeft {
  float: left;
  position: relative;
  bottom: 3px;
}
.percentage-bar {
  background: linear-gradient(
    90deg,
    var(--bar-color) var(--percent),
    var(--bg-color) var(--percent)
  );
}
.p-block {
  height: 30px;
  border: 1px solid gray;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
<style>
/* Makes the leaf margin consistent with the margin of expandable reqs */
div.v-treeview-node.v-treeview-node--leaf {
  margin-left: 26px;
}
</style>
