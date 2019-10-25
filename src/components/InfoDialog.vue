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
            <v-autocomplete v-model="activePetitionedReqs"
              :items="removeSharedCourses(selectedSubjects.flat(), dialogReq['sat_courses']).sort(sortCourses)"
              item-text="id"
              return-object
              label="Select Class"
              no-data-text="No Courses Found"
              v-on:change="updatePetitionedReqs"
              chips
              deletable-chips
              multiple
              >
            </v-autocomplete>
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
              @click="deleteReq(dialogReq); viewDialogChild = false; dialogReq=undefined;"
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
            viewDialogChild: false,
            petitionedReqs: {}
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
            return courses.filter(function(el) {
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
            let courseOneId = courseOne.id;
            let courseTwoId = courseTwo.id;
            if (isNaN(parseFloat(courseOneId)) && isNaN(parseFloat(courseTwoId))) {
                let majorOneId = courseOneId.substring(0, 2);
                let majorTwoId = courseTwoId.substring(0, 2);
                if (majorOneId.localeCompare(majorTwoId) === 0) {
                let courseNumberOne = courseOneId.substring(courseOneId.lastIndexOf(".")+1);
                let courseNumberTwo = courseTwoId.substring(courseTwoId.lastIndexOf(".")+1);
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
        },
        updatePetitionedReqs: function (items) {
            this.petitionedReqs[this.dialogReq.uniqueKey] = items;
        }
    },
    computed: {
        activePetitionedReqs: {
            get: function () {
                return this.petitionedReqs[this.dialogReq.uniqueKey];
            },
            set: function (newReqs) {
                this.petitionedReqs[this.dialogReq.uniqueKey] = newReqs;
            }
        }
    },
    watch: {
        viewDialogChild(newVal) {
            this.$emit("update:view-dialog", newVal);
        },
        viewDialog(newVal) {
            this.viewDialogChild = newVal;
        }
    }
}
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