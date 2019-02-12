<!-- Style notes from meeting with FireRoad team 2/6/19

when doing the search thing, have a little bar like [favorites | recents | search ] (serach selected by default)

add requirements editor link at bottom of audit

don't have different colors for the collapsable semesters

road choosing is a dropdown maybe...

colors: dept-based colors like fireRoad -- android repo has class called "color manager"

see photo but here it is in english

audit always on the left side panel. logo and about link at the top, feedback/edit reqs at the bottom

courses in the middle as usual, stuff on the top bar, still collapsable but ditch the multiple colors

*SEARCH* is now a little bar on the right of the toolbar that brings up a floaty search window thing on the right side,
that window has:
- [favorites | recents | search ] (serach selected by default)
- shortlist of filters, which can be made bigger
- all the search results
also search remembers what you've searched so when you click back you see the same results you were looking at
search disappears if you click on the up arrow at the top or click on the road
definitely want a smooth animation for this (dropping down from top)

*CLASS INFO* is a floaty box in the bottom right, comes up whenever you click a class, goes away when you click the X
- also has a back button, so must keep track of all previously viewed class info (since last X)

search and class info go on top of the road


show percentage next to majors when choosing a new one

 -->



<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <!-- *** USE THIS for multiple roads! https://vuetifyjs.com/en/components/tabs#icons-and-text -->
  <v-app id="app-wrapper"
  >
    <v-toolbar fixed app dense>
        <v-toolbar-side-icon @click.stop="leftDrawer = !leftDrawer"></v-toolbar-side-icon>
        <v-toolbar-title>Audit</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-btn-toggle v-model="activeRoad" mandatory>
          <v-btn v-for="(road, name) in roads"
            :value="name"
          >
            {{name}}
          </v-btn>
        </v-btn-toggle>
      <v-spacer></v-spacer>
        <v-toolbar-title>Class Search</v-toolbar-title>
        <v-toolbar-side-icon @click.stop="rightDrawer = !rightDrawer"></v-toolbar-side-icon>
    </v-toolbar>

    <v-navigation-drawer
      id="left-panel"
      width="350"
      mobile-break-point="800"
      class="side-panel elevation-5 scroller"
      v-model="leftDrawer"
      app
    >
      <audit
        v-bind:reqTrees="reqTrees"
        v-bind:selectedReqs="roads[activeRoad].selectedReqs"
        v-bind:selectedSubjects = "roads[activeRoad].selectedSubjects"
        v-bind:reqList="reqList"
        @add-req = "addReq"
      ></audit>
      <!-- TODO: will need to add event for when the child can edit selectedReqs probably -->
    </v-navigation-drawer>

    <v-content app id="center-panel">
      <div class = "text-xs-center" v-if = "!subjectsLoaded">
        <v-progress-circular indeterminate>
        </v-progress-circular>
      </div>
      <road
        v-bind:selectedSubjects="roads[activeRoad].selectedSubjects"
        v-bind:subjects = "subjectsInfo"
        @drop-class="dropClass"
        @drag-class="testClass"
        @remove-class = "removeClass"
      ></road>
    </v-content>

    <v-navigation-drawer
      id="right-panel"
      width="350"
      mobile-break-point="800"
      class="side-panel elevation-5"
      v-model="rightDrawer"
      right
      app
    >
      <class-search v-bind:subjects="subjectsInfo" @add-class="addClass" @move-class="moveClass"   @drop-class="dropClass" @drag-class="testClass"></class-search>
    </v-navigation-drawer>
  </v-app>
</template>


<style scoped>
  #app-wrapper {
/*    display: flex;
    flex-direction: row;
    height: 100%;*/
  }

  .side-panel {
    /*height: 100%;*/
  }

</style>


<script>
import Audit from './components/Audit.vue'
import ClassSearch from './components/ClassSearch.vue'
import Road from './components/Road.vue'
import FilterSet from "./components/FilterSet.vue"
import $ from 'jquery'
import Vue from 'vue'

$(document).ready(function() {
  var borders = $(".v-navigation-drawer__border")
  var scrollers = $(".scroller")
  var scrollWidth = scrollers.width()
  //moves nav drawer border with scroll
  //if the effect proves too annoying we can remove the borders instead
  //(commented out below)
  scrollers.scroll(function() {
    var scrollPosition = scrollers.scrollLeft()
    borders.css({top: 0, left: scrollWidth-1+scrollPosition})
  })
  // borders.remove()
})


export default {
  components: {
    'audit': Audit,
    'class-search': ClassSearch,
    'road': Road,
    'filter-set': FilterSet
  },
  data: function(){ return {
    reqTrees: {},
    reqList: [],
    dragSemesterNum: -1,
    subjectsLoaded: false,
    // A list of dictionaries containing info on current mit subjects. (actually filled in correctly below)
    subjectsInfo: [],
    leftDrawer: true,
    rightDrawer: true,
    activeRoad: "road-one",
    // TODO: Really we should grab this from a global datastore
    // now in the same format as FireRoad

    //note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
    roads: {
      'road-one': {
        selectedReqs: ['girs',],
        selectedSubjects: [],
      },
      'test_road1': {
        selectedReqs: ['girs','major6-3','minor2',],
        selectedSubjects : [
          {
            overrideWarnings : false,
            semester : 0,
            title : "Generic Physics I GIR",
            id : "PHY1",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 1,
            title : "Principles of Chemical Science",
            id : "5.112",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 4,
            title : "Fundamentals of Programming",
            id : "6.009",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 0,
            title : "Intro to EECS",
            id : "6.01",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 4,
            title : "Advanced Music Performance",
            id : "21M.480",
            units : 6
          },
          {
            overrideWarnings : false,
            semester : 6,
            title : "Advanced Music Performance",
            id : "21M.480",
            units : 6
          }
        ],
      },
    }
  }},
  // computed: { // tried this to fix the thing above but it didn't update reactively
  //   loadedReqs: function () {
  //     return this.selectedReqs.filter(function(r) {
  //       return this.reqTrees && (r in this.reqTrees);
  //     })
  //   }
  // },
  methods: {
    addClass: function(newClass) {
      this.roads[this.activeRoad].selectedSubjects.push(newClass);
    },
    moveClass: function(classIndex, newSem) {
      this.roads[this.activeRoad].selectedSubjects[classIndex].semester = newSem;
      Vue.set(this.roads[this.activeRoad].selectedSubjects, classIndex, this.roads[this.activeRoad].selectedSubjects[classIndex]);
    },
    removeClass: function(classInfo) {
      var classIndex = this.roads[this.activeRoad].selectedSubjects.indexOf(classInfo);
      this.roads[this.activeRoad].selectedSubjects.splice(classIndex,1);
    },
    getRelevantObjects: function(position) {
      var semesterElem = document.elementFromPoint(position.x,position.y);
      var semesterParent = $(semesterElem).parents(".semester-container");
      var semesterBox = $("#semester_"+this.dragSemesterNum).find(".semester-drop-container");
      return {
        semesterParent: semesterParent,
        semesterBox: semesterBox
      }
    },
    resetSemesterBox: function(semesterBox) {
      semesterBox.addClass("grey");
      semesterBox.removeClass("red");
      semesterBox.removeClass("green");
    },
    classIsOffered: function(semesterObjects, event) {
      if(semesterObjects.semesterParent.length) {
        var semesterID = semesterObjects.semesterParent.attr("id");
        if(semesterID.substring(0,9)=="semester_") {
          var semesterNum = parseInt(semesterID.substring(9))
          var semesterType = semesterNum % 2;
          var classInfo = event.classInfo;
          if(classInfo == undefined) {
            if(this.subjectsLoaded) {
              var filteredSubjects = this.subjectsInfo.filter(function(s) {
                return s.subject_id == event.basicClass.id
              });
              if(filteredSubjects.length) {
                classInfo = filteredSubjects[0];
              } else {
                //not in catalog, might be a generic course (like PHY1 or HASS)
                var matchingClasses = this.subjectsInfo.filter(function(subject) {
                  var possible_attributes = [subject.gir_attribute, subject.hass_attribute, subject.communication_requirement];
                  return possible_attributes.includes(event.basicClass.id);
                });
                if(matchingClasses.length) {
                  classInfo = matchingClasses.reduce(function(subjectA, subjectB) {
                    return {
                      offered_fall: subjectA.offered_fall || subjectB.offeredFall,
                      offered_spring: subjectA.offered_spring || subjectB.offered_spring
                    }
                  });
                } else {
                  classInfo = {
                    offered_fall: false,
                    offered_spring: false
                  }
                }
              }
            } else {
              classInfo = undefined;
            }

          }
          var isOffered;
          if(classInfo != undefined) {
            isOffered = (semesterType == 0 && classInfo.offered_fall)
                            || (semesterType == 1 && classInfo.offered_spring);
          }
          return {
            isOffered: isOffered,
            semesterNum: semesterNum
          }
        }
      }
      return {
        isOffered: undefined
      }
    },
    dropClass: function(event) {
      var semesterObjects = this.getRelevantObjects(event.drop);
      this.resetSemesterBox(semesterObjects.semesterBox);
      var semInfo = this.classIsOffered(semesterObjects, event);
      if(semInfo.isOffered) {
        event.drop.preventDefault();
        if(event.isNew) {
          var newClass = {
            overrideWarnings : false,
            semester : semInfo.semesterNum,
            title : event.classInfo.title,
            id : event.classInfo.subject_id,
            units : event.classInfo.total_units
          }
          this.addClass(newClass);
        } else {
          var currentIndex = this.roads[this.activeRoad].selectedSubjects.indexOf(event.basicClass);
          this.moveClass(currentIndex, semInfo.semesterNum)
        }
      }
      this.dragSemesterNum = -1;
    },
    testClass: function(event) {
      var semesterObjects = this.getRelevantObjects(event.drag);
      var semInfo = this.classIsOffered(semesterObjects, event);
      if(semInfo.isOffered != undefined) {
        if (!semInfo.isOffered) {
          semesterObjects.semesterBox.removeClass("grey");
          semesterObjects.semesterBox.addClass("red");
        } else {
          semesterObjects.semesterBox.removeClass("grey");
          semesterObjects.semesterBox.addClass("green");
        }
      }
      if(this.dragSemesterNum != semInfo.semesterNum) {
        var lastSemester = $("#semester_" + this.dragSemesterNum);
        var lastSemesterBox = lastSemester.find(".semester-drop-container");
        this.resetSemesterBox(lastSemesterBox)
      }
      this.dragSemesterNum = semInfo.semesterNum;
    },
    updateFulfillment: function() {
      var subjectIDs = this.roads[this.activeRoad].selectedSubjects.map((s)=>s.id.toString()).join(",")
      for (var r = 0; r < this.roads[this.activeRoad].selectedReqs.length; r++) {
        var req = this.roads[this.activeRoad].selectedReqs[r];
        axios.get(`https://fireroad-dev.mit.edu/requirements/progress/`+req+`/`+subjectIDs).then(function(response) {
          //This is necessary so Vue knows about the new property on reqTrees
          Vue.set(this.data.reqTrees, this.req, response.data);
        }.bind({data: this, req:req}))
      }
    },
    addReq: function(event) {
      this.roads[this.activeRoad].selectedReqs.push(event);
      Vue.set(this.roads, this.activeRoad, this.roads[this.activeRoad]);
    }
  },
  watch: {
    //call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function(newRoad,oldRoad) {
      this.updateFulfillment();
    },
    roads: {
      handler: function(newRoads,oldRoads) {
        console.log("updating road");
        this.updateFulfillment();
      },
      deep: true
    }
  },
  mounted() {
    // TODO: this is kind of janky, and should not happen ideally:
    //  I'm bouncing the request through this proxy to avoid some issue with CORS
    // see this issue for more: https://github.com/axios/axios/issues/853

    axios.get(`https://fireroad-dev.mit.edu/requirements/list_reqs/`)
      .then(response => {
        this.reqList = response.data;
        for(var r in this.reqList) {
          Vue.set(this.reqList, r, this.reqList[r]);
        }
      })



    this.updateFulfillment();

    // developer.mit.edu version commented out because I couldn't get it to work. filed an issue to resolve it.
    // axios.get('https://mit-course-catalog-v2.cloudhub.io/coursecatalog/v2/terms/2018FA/subjects', {headers:{client_id:'01fce9ed7f9d4d26939a68a4126add9b', client_secret:'D4ce51aA6A32421DA9AddF4188b93255'}})
    // , 'Accept': 'application/json'} ?
    // full=true is ~3x bigger but has some great info like "in_class_hours" and "rating"
    axios.get(`https://fireroad-dev.mit.edu/courses/all?full=true`)
      .then(response => {
        this.subjectsInfo = response.data
        this.subjectsLoaded = true;
      });
  },
};
</script>
<style scoped>
  .scroller {
    overflow-x: scroll;
  }
  .v-navigation-drawer__border {
    display: none !important;
  }
</style>
