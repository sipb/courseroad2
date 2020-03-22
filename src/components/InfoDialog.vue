<template>
  <v-dialog v-model="viewDialogChild" max-width="600">
    <div v-if="dialogReq !== undefined">
      <v-card>
        <v-btn icon flat style="float:right" @click="viewDialogChild = false">
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
        <div style="display:flex">
          <v-card-text style="width:auto" class="center-text">
            <b>Petition this Requirement:</b>
          </v-card-text>
          <v-autocomplete
            v-model="activeProgressAssertions"
            menu-props="lazy"
            :items="removeSharedCourses(selectedSubjects.flat(), dialogReq['sat_courses']).sort(sortCourses)"
            item-text="id"
            label="Select Class"
            no-data-text="No Courses Found"
            chips
            deletable-chips
            multiple
          />
        </div>
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
            @click="deleteReq(dialogReq); viewDialogChild = false;"
          >
            <v-icon>delete</v-icon>
            Remove Requirement
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
export default {
  name: 'InfoDialog',
  props: [
    'selectedSubjects',
    'viewDialog',
    'dialogReq'
  ],
  data: function () {
    return {
      viewDialogChild: false
    };
  },
  computed: {
    activeProgressAssertions: {
      get: function () {
        const dialogReqPA = this.$store.state.roads[this.$store.state.activeRoad].contents.progressAssertions[this.dialogReq.uniqueKey];
        // Checks if unique key in progressAssert, if it is, searches for substitution key
        if (dialogReqPA === undefined) {
          return dialogReqPA;
        } else {
          return dialogReqPA['substitutions'];
        }
      },
      set: function (newReqs) {
        this.$store.commit('setProgressAssertions', { uniqueKey: this.dialogReq.uniqueKey, newReqs: newReqs });
      }
    },
    progressAssertions: {
      get: function () {
        return this.$store.state.roads[this.$store.state.activeRoad].contents.progressAssertions;
      }
    }
  },
  watch: {
    viewDialogChild (newVal) {
      this.$emit('update:view-dialog', newVal);
      if (newVal === false) {
        this.$emit('update:dialog-req', undefined);
      }
    },
    viewDialog (newVal) {
      this.viewDialogChild = newVal;
    }
  },
  methods: {
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
    removeSharedCourses: function (courses, coursesToFilter) {
      // Takes two arrays of courses and returns an array without the courses in coursesToFilter
      return courses.filter(function (el) {
        for (let i = 0; i < coursesToFilter.length; i++) {
          if (el.id === coursesToFilter[i]) {
            return false;
          }
        }
        return true;
      });
    },
    sortCourses: function (courseOne, courseTwo) {
      // Sorts courses into major order. With courses with letters within the id it will be ordered based on semester placed in.
      const courseOneId = courseOne.id;
      const courseTwoId = courseTwo.id;
      if (isNaN(parseFloat(courseOneId)) && isNaN(parseFloat(courseTwoId))) {
        const majorOneId = courseOneId.substring(0, 2);
        const majorTwoId = courseTwoId.substring(0, 2);
        if (majorOneId.localeCompare(majorTwoId) === 0) {
          const courseNumberOne = courseOneId.substring(courseOneId.lastIndexOf('.') + 1);
          const courseNumberTwo = courseTwoId.substring(courseTwoId.lastIndexOf('.') + 1);
          return parseInt(courseNumberOne) - parseInt(courseNumberTwo);
        }
        return majorOneId.localeCompare(majorTwoId);
      } else if (isNaN(parseFloat(courseOneId))) {
        return 1;
      } else if (isNaN(parseFloat(courseTwoId))) {
        return -1;
      } else {
        return parseFloat(courseOneId) - parseFloat(courseTwoId);
      }
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
</style>
