<template>
  <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->

  <v-flex style="padding: 0px 18px 0px 18px; overflow: auto;">
    <div style="display: flex; align-content: space-between; margin: 12px 0px;">
      <v-icon
        :key="`icon-${isEditing}`"
        v-slot:prepend
        :color="isEditing ? 'success' : 'info'"
        style="margin-right: 8px;"
        @click="isEditing = !isEditing"
        v-text="isEditing ? 'save' : 'edit'"
      />
      <v-autocomplete
        v-model="changeReqs"
        :hint="!isEditing ? 'Click the icon to edit' : 'Click the icon to save'"
        :items="getCourses"
        item-text="medium-title"
        item-value="key"
        :readonly="!isEditing"
        :label="`${isEditing ? 'Edit your courses' : 'Your courses'}`"
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
      <template slot="prepend" slot-scope="{ item }">
        <v-icon
          v-if="!('reqs' in item)"
          :style="fulfilledIcon(item)"
          @click="clickRequirement(item)"
        >
          {{ item['plain-string'] ?
            (item["list-id"] in progressOverrides ?
              (item.fulfilled ? "assignment_turned_in" : "assignment") :
              "assignment_late" ) :
            item.fulfilled ? "done" : "remove" }}
        </v-icon>
      </template>
      <template slot="label" slot-scope="{ item, leaf}">
        <requirement
          :req="item"
          :leaf="leaf"
          @drag-start-class="$emit('drag-start-class',$event)"
          @click.native="clickRequirement(item)"
          @click-info="reqInfo($event, item)"
        />
      </template>
    </v-treeview>

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
              <v-text-field v-model="newManualProgress" type="number" />
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
          <v-btn icon flat style="float:right" @click="viewDialog=false">
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
            <b>Satisfying courses</b>
            <div v-for="course in dialogReq['sat_courses']" :key="course">
              {{ course }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-if="'title-no-degree' in dialogReq"
              color="error"
              @click="deleteReq(dialogReq); viewDialog=false; dialogReq=undefined;"
            >
              <v-icon>delete</v-icon>
              Remove Requirement
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </v-flex>
</template>

<script>
import Requirement from './Requirement.vue';
export default {
  name: 'Audit',
  components: {
    requirement: Requirement
  },
  props: [
    'selectedReqs',
    'reqTrees',
    'reqList',
    'progressOverrides'
  ],
  data: function () {
    return {
      tree: [],
      viewDialog: false,
      dialogReq: undefined,
      progressDialog: false,
      progressReq: undefined,
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
          this.$emit('remove-req', diff);
        } else {
          const newReq = newReqs[newReqs.length - 1];
          this.$emit('add-req', newReq);
        }
      }
    },
    getCourses: function () {
      const list = this.reqList;
      const courses = Object.keys(list).map(x => Object.assign(list[x], { key: x }));
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
      this.$emit('remove-req', reqName);
    },
    clickRequirement: function (item) {
      if (item.req !== undefined) {
        if (!item['plain-string']) {
          let usedReq = item.req;
          if (usedReq.indexOf('GIR:') === 0) {
            usedReq = usedReq.substring(4);
          }
          this.$emit('push-stack', usedReq);
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
        this.$emit('update-progress', {
          listID: this.progressReq['list-id'],
          progress: this.newManualProgress
        });
      }
      this.progressReq = undefined;
      this.progressDialog = false;
      this.newManualProgress = 0;
    }
  }
};
</script>

<style scoped>
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
.terminal {
  cursor: default;
}
</style>
<style>
/* Makes the leaf margin consistent with the margin of expandable reqs */
div.v-treeview-node.v-treeview-node--leaf {
  margin-left: 26px;
}
</style>
