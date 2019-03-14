<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <!-- *** USE THIS for multiple roads! https://vuetifyjs.com/en/components/tabs#icons-and-text -->
  <v-app id="app-wrapper"
  >
    <v-toolbar fixed app dense class="elevation-2">
      <road-tabs
        v-bind:roads = "roads"
        v-bind:activeRoad = "activeRoad"
        @delete-road = "$refs.authcomponent.deleteRoad($event)"
        @set-name = "setRoadName($event.road, $event.name)"
        @add-road = "addRoad"
        @change-active = "changeActiveRoad($event)"
        slot = "extension"
      >
      </road-tabs>

      <import-export
        v-bind:roads="roads"
        v-bind:activeRoad="activeRoad"
        @add-road = "addRoad"
      >
      </import-export>

      <v-spacer></v-spacer>

      <auth
        ref = "authcomponent"
        v-bind:roads = "roads"
        v-bind:justLoaded = "justLoaded"
        v-bind:activeRoad = "activeRoad"
        v-bind:conflictInfo = "conflictInfo"
        @delete-road = "deleteRoad"
        @set-road = "setRoad(...arguments)"
        @set-roads = "roads = $event"
        @set-active = "setActive"
        @conflict = "conflict"
        @resolve-conflict = "resolveConflict"
        @set-road-prop = "setRoadProp(...arguments)"
        @reset-id = "resetID(...arguments)"
        @allow-cookies = "allowCookies"
      >
      </auth>

      <v-spacer></v-spacer>

      <v-menu
        attach
        v-model = "showSearch"
        :close-on-content-click="false"
        :close-on-click = "false"
        fixed
        offset-y
        input-activator
      >
        <v-text-field
          id = "searchInputTF"
          autocomplete = "false"
          class = "expanded-search"
          prepend-icon="search"
          v-model = "searchInput"
          placeholder = "Add classes"
          slot = "activator"
        >
        </v-text-field>
        <class-search
          id = "searchMenu"
          ref = "searchMenu"
          class = "search-menu"
          v-bind:searchInput = "searchInput"
          v-bind:subjects="subjectsInfo"
          v-bind:classInfoStack = "classInfoStack"
          v-bind:cookiesAllowed = "cookiesAllowed"
          @add-class="addClass"
          @move-class="moveClass"
          @drop-class="dropClass"
          @drag-class="testClass"
          @view-class-info="pushClassStack"
        >
        </class-search>
      </v-menu>

    </v-toolbar>


    <v-navigation-drawer
      id="left-panel"
      width="350"
      mobile-break-point="800"
      class="side-panel elevation-2 scroller"
      app
    >
      <audit
        v-if = "activeRoad !== ''"
        v-bind:reqTrees="reqTrees"
        v-bind:selectedReqs="roads[activeRoad].contents.coursesOfStudy"
        v-bind:selectedSubjects = "roads[activeRoad].contents.selectedSubjects"
        v-bind:reqList="reqList"
        @add-req = "addReq"
        @remove-req = "removeReq"
      ></audit>
      <!-- TODO: will need to add event for when the child can edit selectedReqs probably -->
    </v-navigation-drawer>


    <v-content app id="center-panel">

      <v-tabs-items v-model = "activeRoad">
        <v-tab-item
          v-for = "roadid in Object.keys(roads)"
          :key = "roadid"
          :value = "roadid"
          >
          <road
            v-bind:selectedSubjects="roads[roadid].contents.selectedSubjects"
            v-bind:subjects = "subjectsInfo"
            v-bind:roadID = "roadid"
            @drop-class="dropClass"
            @drag-class="testClass"
            @remove-class = "removeClass"
            @click-class = "pushClassStack($event.id)"
          ></road>
        </v-tab-item>
      </v-tabs-items>

      <conflict-dialog
        ref = "conflictdialog"
        v-bind:conflictInfo = "conflictInfo"
        v-bind:conflictDialog = "conflictDialog"
        v-bind:roads = "roads"
        @update-local = "updateLocal"
        @update-remote = "updateRemote"
      >
      </conflict-dialog>

    </v-content>

    <class-info
      v-if = "classInfoStack.length"
      v-bind:classInfoStack = "classInfoStack"
      v-bind:subjects = "subjectsInfo"
      @pop-stack = "popClassStack"
      @push-stack = "pushClassStack"
      @close-classinfo = "classInfoStack = []"
      v-on:click.native = "$event.stopPropagation()"
      >
    </class-info>


    <v-footer v-if = "!cookiesAllowed" fixed class = "pa-2">
      This site uses cookies and session storage to store your data and login information.  Click OK to consent to the use of cookies.
      <v-btn small depressed color = "primary" @click = "allowCookies">
        OK
      </v-btn>
    </v-footer>
  </v-app>
</template>


<script>
import Audit from './components/Audit.vue'
import ClassSearch from './components/ClassSearch.vue'
import Road from './components/Road.vue'
import FilterSet from "./components/FilterSet.vue"
import RoadTabs from "./components/RoadTabs.vue"
import ConflictDialog from "./components/ConflictDialog.vue"
import Auth from "./components/Auth.vue"
import $ from 'jquery'
import Vue from 'vue'
import ClassInfo from "./components/ClassInfo.vue"
import ImportExport from "./components/ImportExport.vue"

var MAIN_URL = "http://localhost:8080"
var DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z"

export default {
  components: {
    'audit': Audit,
    'class-search': ClassSearch,
    'road': Road,
    'filter-set': FilterSet,
    'road-tabs': RoadTabs,
    'conflict-dialog': ConflictDialog,
    'auth': Auth,
    'class-info': ClassInfo,
    'import-export': ImportExport,
  },
  data: function(){ return {
    reqTrees: {},
    reqList: [],
    dragSemesterNum: -1,
    subjectsLoaded: false,
    gettingUserData: false,
    cookieName: "Default Cookie",
    accessInfo: undefined,
    // A list of dictionaries containing info on current mit subjects. (actually filled in correctly below)
    subjectsInfo: [],
    rightDrawer: true,
    activeRoad: "$defaultroad$",
    newRoadName: "",
    justLoaded: true,
    currentlySaving: false,
    saveWarnings: [],
    conflictDialog: false,
    conflictInfo: undefined,
    cookiesAllowed: false,
    searchInput: "",
    showSearch: false,
    classInfoStack: [],
    // TODO: Really we should grab this from a global datastore
    // now in the same format as FireRoad

    //note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
    roads: {
      "$defaultroad$": {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: "My First Road",
        agent: "",
        contents: {
          coursesOfStudy: ['girs'],
          selectedSubjects: []
        }
      }
    },
    // Store last dragover event's x and y position so we can fallback to that for getting the right drop location.
    lastX: 0,
    lastY: 0,
  }},
  computed: {
    roadref: function() {
      return "#road" + this.activeRoad
    }
  },
  methods: {
    addClass: function(newClass) {
      this.roads[this.activeRoad].contents.selectedSubjects.push(newClass);
      Vue.set(this.roads[this.activeRoad], "changed", moment().format(DATE_FORMAT));
    },
    moveClass: function(classIndex, newSem) {
      this.roads[this.activeRoad].contents.selectedSubjects[classIndex].semester = newSem;
      Vue.set(this.roads[this.activeRoad], "changed", moment().format(DATE_FORMAT));
    },
    removeClass: function(classInfo) {
      var classIndex = this.roads[this.activeRoad].contents.selectedSubjects.indexOf(classInfo);
      this.roads[this.activeRoad].contents.selectedSubjects.splice(classIndex,1);
      Vue.set(this.roads[this.activeRoad], "changed", moment().format(DATE_FORMAT));
    },
    resetID: function(oldid, newid) {
      newid = newid.toString();
      Vue.set(this.roads, newid, this.roads[oldid]);
      if(this.activeRoad===oldid) {
        this.activeRoad = newid;
      }
      Vue.delete(this.roads, oldid);
    },
    getRelevantObjects: function(position) {
      let semesterElem
      if (position.x === 0 && position.y === 0) {
        semesterElem = document.elementFromPoint(this.lastX, this.lastY)
      } else {
        semesterElem = document.elementFromPoint(position.x,position.y);
      }
      var semesterParent = $(semesterElem).parents(".semester-container");
      var semesterBox = semesterParent.find(".semester-drop-container");
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
        if(semesterID.split("_")[2]==="semester") {
          var semesterNum = parseInt(semesterID.split("_")[3]);
          var semesterType = semesterNum % 2;
          var classInfo = event.classInfo;
          if(classInfo === undefined) {
            if(this.subjectsLoaded) {
              var filteredSubjects = this.subjectsInfo.filter(function(s) {
                return s.subject_id === event.basicClass.id
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
          if(classInfo !== undefined) {
            isOffered = (semesterType === 0 && classInfo.offered_fall)
                            || (semesterType === 1 && classInfo.offered_spring);
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
          var currentIndex = this.roads[this.activeRoad].contents.selectedSubjects.indexOf(event.basicClass);
          this.moveClass(currentIndex, semInfo.semesterNum)
        }
      }
      this.dragSemesterNum = -1;
    },
    testClass: function(event) {
      var semesterObjects = this.getRelevantObjects(event.drag);
      var semInfo = this.classIsOffered(semesterObjects, event);
      if(semInfo.isOffered !== undefined) {
        if (!semInfo.isOffered) {
          semesterObjects.semesterBox.removeClass("grey");
          semesterObjects.semesterBox.addClass("red");
        } else {
          semesterObjects.semesterBox.removeClass("grey");
          semesterObjects.semesterBox.addClass("green");
        }
      }
      if(this.dragSemesterNum !== semInfo.semesterNum && this.dragSemesterNum != -1) {
        var lastSemester = $("#road_"+$.escapeSelector(this.activeRoad)+"_semester_" + this.dragSemesterNum);
        var lastSemesterBox = lastSemester.find(".semester-drop-container");
        this.resetSemesterBox(lastSemesterBox)
      }
      if(semInfo.semesterNum !== undefined) {
        this.dragSemesterNum = semInfo.semesterNum;
      }
    },
    updateFulfillment: function() {
      var subjectIDs = this.roads[this.activeRoad].contents.selectedSubjects.map((s)=>s.id.toString()).join(",")
      for (var r = 0; r < this.roads[this.activeRoad].contents.coursesOfStudy.length; r++) {
        var req = this.roads[this.activeRoad].contents.coursesOfStudy[r];
        axios.get(`https://fireroad-dev.mit.edu/requirements/progress/`+req+`/`+subjectIDs).then(function(response) {
          //This is necessary so Vue knows about the new property on reqTrees
          Vue.set(this.data.reqTrees, this.req, response.data);
        }.bind({data: this, req:req}))
      }
    },
    addReq: function(event) {
      this.roads[this.activeRoad].contents.coursesOfStudy.push(event);
      Vue.set(this.roads, this.activeRoad, this.roads[this.activeRoad]);
    },
    removeReq: function(event) {
      var reqIndex = this.roads[this.activeRoad].contents.coursesOfStudy.indexOf(event);
      this.roads[this.activeRoad].contents.coursesOfStudy.splice(reqIndex,1);
    },
    setActiveRoad: function() {
      var roadHash = window.location.hash;
      if(roadHash.length&&roadHash.substring(0,5)==="#road") {
        var roadRequested = roadHash.substring(5);
        if(roadRequested in this.roads) {
          this.activeRoad = roadHash.substring(5);
          return true;
        }
      }
      window.location.hash = "#road" + this.activeRoad;
      return false;
    },
    addRoad: function(roadName, cos=["girs"], ss=[]) {
      var tempRoadID = "$" + this.$refs.authcomponent.newRoads.length + "$";
      var newContents;
      if(!this.duplicateRoad) {
        newContents = {
          coursesOfStudy: cos,
          selectedSubjects: ss,
        }
      } else {
        newContents = JSON.parse(JSON.stringify(this.roads[this.duplicateRoadSource].contents));
      }

      var newRoad = {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: roadName,
        agent: "",
        contents: newContents
      }
      Vue.set(this.roads, tempRoadID, newRoad);
      this.$refs.authcomponent.newRoads.push(tempRoadID);
      this.activeRoad = tempRoadID;
    },


    setRoadName: function(roadID, roadName) {
      Vue.set(this.roads[roadID], "name", roadName);
    },
    changeActiveRoad: function(event) {
      this.activeRoad = event;
    },
    deleteRoad: function(roadID) {
      Vue.delete(this.roads, roadID);
    },
    setRoad: function(roadID, newRoad) {
      Vue.set(this.roads, roadID, newRoad);
    },
    setActive: function(roadID) {
      this.activeRoad = roadID;
    },
    conflict: function(conflictInfo) {
      this.$refs.conflictdialog.startConflict();
      this.conflictInfo = conflictInfo;
    },
    resolveConflict: function() {
      this.$refs.conflictdialog.resolveConflict();
      this.conflictInfo = undefined;
    },
    setRoadProp: function(roadID, roadProp, propValue) {
      Vue.set(this.roads[roadID], roadProp, propValue);
    },
    allowCookies: function() {
      this.$refs.authcomponent.allowCookies();
      this.cookiesAllowed = true;
    },
    updateLocal: function(id) {
      this.$refs.authcomponent.updateLocal(id);
    },
    updateRemote: function(id) {
      this.$refs.authcomponent.updateRemote(id);
    },
    pushClassStack: function(id) {
      var subjectIndex = this.subjectsInfo.map((s)=>s.subject_id).indexOf(id);
      this.classInfoStack.push(subjectIndex);
    },
    popClassStack: function() {
      this.classInfoStack.pop();
    }
  },
  watch: {
    //call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function(newRoad,oldRoad) {
      window.activeRoad = newRoad;
      this.justLoaded = false;
      this.duplicateRoadSource = newRoad;
      if(newRoad !== "") {
        window.history.pushState({},this.roads[newRoad].name,"/#road"+newRoad);
        this.updateFulfillment();
      }
    },
    roads: {
      handler: function(newRoads,oldRoads) {
        this.justLoaded = false;
        if(this.activeRoad != "") {
          this.updateFulfillment();
        }
        this.$refs.authcomponent.save();
      },
      deep: true
    },
    searchInput: function(newSearch, oldSearch) {
      if(newSearch.length > 0) {
        this.showSearch = true;
      }
    }
  },
  mounted() {
    window.$refs = this.$refs;
    window.activeRoad = this.activeRoad;

    document.ondragover = (event) => {
      this.lastX = event.x
      this.lastY = event.y
    }

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

    $(window).on("hashchange", function() {
      this.setActiveRoad();
    }.bind(this));

    this.setActiveRoad();

    axios.get(`https://fireroad-dev.mit.edu/requirements/list_reqs/`)
      .then(response => {
        const ordered = {};
        Object.keys(response.data).sort().forEach(function(key) {
          ordered[key] = response.data[key];
        });
        this.reqList = ordered;
      });

    this.updateFulfillment();

    document.body.addEventListener("click", function(e) {
      this.showSearch = false;
    }.bind(this));
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
  .search-menu {
    background: white;
  }
  .expanded-search {
    width: 22em;
  }
</style>
