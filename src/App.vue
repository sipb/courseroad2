<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <v-app id="app-wrapper"
  >
    <v-toolbar fixed app dense class="elevation-2">
      <road-tabs
        v-bind:roads = "roads"
        v-bind:activeRoad = "activeRoad"
        v-bind:subjects = "subjectsInfo"
        @delete-road = "$refs.authcomponent.deleteRoad($event)"
        @set-name = "setRoadName($event.road, $event.name)"
        @add-road = "addRoad(...arguments)"
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
        @set-sem = "setSemester"
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
          v-bind:genericCourses = "genericCourses"
          v-bind:classInfoStack = "classInfoStack"
          v-bind:cookiesAllowed = "cookiesAllowed"
          @add-class="addClass"
          @view-class-info="pushClassStack"
          @drag-start-class = "dragStartClass"
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
      <v-container fill-height style = "padding: 0;">
        <v-layout fill-height column>
          <audit
            v-if = "activeRoad !== ''"
            v-bind:reqTrees="reqTrees"
            v-bind:selectedReqs="roads[activeRoad].contents.coursesOfStudy"
            v-bind:selectedSubjects = "roads[activeRoad].contents.selectedSubjects"
            v-bind:reqList="reqList"
            v-bind:subjects = "subjectsInfo"
            v-bind:subjectIndex = "subjectsIndexDict"
            v-bind:genericCourses = "genericCourses"
            v-bind:genericIndex = "genericIndexDict"
            v-bind:progressOverrides = "roads[activeRoad].progressOverrides"
            @drag-start-class = "dragStartClass"
            @add-req = "addReq"
            @remove-req = "removeReq"
            @push-stack = "pushClassStack"
            @update-progress = "updateProgress"
          ></audit>
          <v-flex shrink style="padding: 14px; padding-bottom: 0;">
            <p>Problems with the course requirements? Request edits
              <a href="https://fireroad.mit.edu/requirements/">here</a> or
              send an email to <a href="mailto:courseroad@mit.edu">courseroad@mit.edu</a>.
            </p>
          </v-flex>
        </v-layout>
      </v-container>
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
            v-bind:currentSemester = "currentSemester"
            v-bind:addingFromCard = "addingFromCard && activeRoad===roadid"
            v-bind:itemAdding = "itemAdding"
            v-bind:subjectsIndex = "subjectsIndexDict"
            v-bind:genericCourses = "genericCourses"
            v-bind:genericIndex = "genericIndexDict"
            v-bind:dragSemesterNum = "(activeRoad===roadid) ? dragSemesterNum : -1"
            @add-at-placeholder = "addAtPlaceholder"
            @add-class = "addClass"
            @move-class = "moveClass($event.classIndex,$event.semester)"
            @remove-class = "removeClass"
            @click-class = "pushClassStack($event.id)"
            @change-year = "$refs.authcomponent.changeSemester($event)"
            @drag-start-class = "dragStartClass"
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
      v-bind:subjectsIndex = "subjectsIndexDict"
      v-bind:addingFromCard = "addingFromCard"
      v-bind:genericCourses = "genericCourses"
      v-bind:genericIndex = "genericIndexDict"
      @pop-stack = "popClassStack"
      @push-stack = "pushClassStack"
      @add-class = "addFromCard"
      @cancel-add-class = "cancelAddFromCard"
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
    subjectsIndexDict: {},
    genericCourses: [],
    genericIndexDict: {},
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
    currentSemester: 0,
    addingFromCard: false,
    itemAdding: undefined,
    // TODO: Really we should grab this from a global datastore
    // now in the same format as FireRoad

    //note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
    roads: {
      "$defaultroad$": {
        progressOverrides: {},
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
    dragStartClass: function(event) {
      var classInfo = event.classInfo;
      if(classInfo === undefined) {
        if (event.basicClass.id in this.subjectsIndexDict) {
          classInfo = this.subjectsInfo[this.subjectsIndexDict[event.basicClass.id]];
        } else if (event.basicClass.id in this.genericIndexDict) {
          classInfo = this.genericCourses[this.genericIndexDict[event.basicClass.id]];
        }
      }
      this.itemAdding = classInfo;
    },
    updateFulfillment: function() {
      for (var r = 0; r < this.roads[this.activeRoad].contents.coursesOfStudy.length; r++) {
        var req = this.roads[this.activeRoad].contents.coursesOfStudy[r];
        if(!this.$refs.authcomponent.loggedIn) {
          var subjectIDs = this.roads[this.activeRoad].contents.selectedSubjects.map((s)=>s.id.toString()).join(",")+",";
          axios.get(`https://fireroad-dev.mit.edu/requirements/progress/`+req+`/`+subjectIDs).then(function(response) {
            //This is necessary so Vue knows about the new property on reqTrees
            Vue.set(this.data.reqTrees, this.req, response.data);
          }.bind({data: this, req:req}));
        } else {
          this.$refs.authcomponent.getSecure(`/requirements/progress/`+req+`/?road=`+this.activeRoad).then(function(response) {
            //This is necessary so Vue knows about the new property on reqTrees
            Vue.set(this.data.reqTrees, this.req, response.data);
          }.bind({data: this, req:req}))
        }
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
      var newContents = {
          coursesOfStudy: cos,
          selectedSubjects: ss,
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
    setSemester: function(sem) {
      this.currentSemester = sem;
    },
    pushClassStack: function(id) {
      if(id in this.subjectsIndexDict || id in this.genericIndexDict) {
        this.classInfoStack.push(id);
      }
    },
    popClassStack: function() {
      this.classInfoStack.pop();
    },
    addFromCard: function(classItem) {
      this.addingFromCard = true;
      this.itemAdding = classItem;
    },
    cancelAddFromCard: function() {
      this.addingFromCard = false;
      this.itemAdding = undefined;
    },
    addAtPlaceholder: function(index) {
      var newClass = {
        overrideWarnings : false,
        semester : index,
        title : this.itemAdding.title,
        id : this.itemAdding.subject_id,
        units : this.itemAdding.total_units
      }
      this.addClass(newClass);
      this.addingFromCard = false;
      this.itemAdding = undefined;
    },
    getOfferedAttributes: function(gir, hass, ci) {
      var matchingClasses = this.subjectsInfo.filter(function(subject) {
        if(gir !== undefined && subject.gir_attribute !== gir) {
          return false;
        }
        if(hass !== undefined && subject.hass_attribute !== hass) {
          return false;
        }
        if(ci !== undefined && subject.communication_requirement !== ci) {
          return false;
        }
        return true;
      });
      return matchingClasses.reduce(function(offeredObject, nextClass) {
        return {
          offered_spring: offeredObject.offered_spring || nextClass.offered_spring,
          offered_summer: offeredObject.offered_summer || nextClass.offered_summer,
          offered_IAP: offeredObject.offered_IAP || nextClass.offered_IAP,
          offered_fall: offeredObject.offered_fall || nextClass.offered_fall
        }
      }, {offered_spring: false, offered_summer: false, offered_IAP: false, offered_fall: false})
    },
    makeGenericCourses: function() {
      var girAttributes = {"PHY1": ["Physics 1 GIR","p1"], "PHY2": ["Physics 2 GIR","p2"], "CHEM": ["Chemistry GIR","c"], "BIOL": ["Biology GIR","b"], "CAL1": ["Calculus I GIR","m1"], "CAL2": ["Calculus II GIR","m2"], "LAB": ["Lab GIR","l1"], "REST": ["REST GIR","r"]};
      //the titles of the hass and ci attributes are currently not used in the description on fireroad
      //I think they might be nice to display with the description, but as of now they are unused
      var hassAttributes = {"HASS-A": ["HASS Arts","ha"], "HASS-S": ["HASS Social Sciences","hs"], "HASS-H": ["Hass Humanities","hh"]};
      var ciAttributes = {"CI-H": ["Communication Intensive","hc"], "CI-HW": ["Communication Intensive with Writing","hw"]};
      var genericCourses = [];
      var baseGeneric = {
        description: "Use this generic subject to indicate that you are fulfilling a requirement, but do not yet have a specific subject selected.",
        total_units: 12
      };
      // biol:b, chem: c, lab: l1, partial lab: l2, rest: r, calc1: m1, calc2: m2, phys1: p1, phys2: p2
      // hass-a: ha, hass-h: hh, hass-s: hs, hass elective: ht, hass subject: h%5Bahst%5D
      // commun_int - cih: hc, cihw: hw
      var baseurl = "http://student.mit.edu/catalog/search.cgi?search=&style=verbatim&when=*&termleng=4&days_offered=*&start_time=*&duration=*&total_units=*"
      for(var gir in girAttributes) {
        var offeredGir = this.getOfferedAttributes(gir, undefined, undefined);
        genericCourses.push(Object.assign({},baseGeneric,offeredGir,{
          gir_attribute: gir,
          title: "Generic " + girAttributes[gir][0],
          subject_id: gir,
          url: baseurl + "&cred="+girAttributes[gir][1]+"&commun_int=*"
        }));
      }
      for(var hass in hassAttributes) {
        var offeredHass = this.getOfferedAttributes(undefined, hass, undefined);
        genericCourses.push(Object.assign({},baseGeneric,offeredHass,{
          hass_attribute: hass,
          title: "Generic " + hass,
          subject_id: hass,
          url: baseurl + "&cred="+hassAttributes[hass][1]+"&commun_int=*"
        }));
        var offeredHassCI = this.getOfferedAttributes(undefined, hass, "CI-H");
        genericCourses.push(Object.assign({},baseGeneric,offeredHassCI,{
          hass_attribute: hass,
          communication_requirement: "CI-H",
          title: "Generic CI-H " + hass,
          subject_id: "CI-H " + hass,
          url: baseurl + "&cred="+hassAttributes[hass][1]+"&commun_int="+ciAttributes["CI-H"][1]
        }));
      }
      for(var ci in ciAttributes) {
        var offeredCI = this.getOfferedAttributes(undefined, undefined, ci);
        genericCourses.push(Object.assign({},baseGeneric, offeredCI, {
          communication_requirement: ci,
          title: "Generic " + ci,
          hass_attribute: "HASS",
          subject_id: ci,
          url: baseurl + "&cred=*&commun_int="+ciAttributes[ci][1]
        }));
      }
      return genericCourses;
    },
    updateProgress: function(newProgress) {
      Vue.set(this.roads[this.activeRoad].progressOverrides, newProgress.listID, newProgress.progress);
    }
  },
  watch: {
    //call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function(newRoad,oldRoad) {
      window.activeRoad = newRoad;
      this.justLoaded = false;
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
        this.genericCourses = this.makeGenericCourses();
        this.subjectsIndexDict = this.subjectsInfo.reduce(function(obj, item, index) {
          obj[item.subject_id] = index;
          return obj;
        },{});
        this.genericIndexDict = this.genericCourses.reduce(function(obj, item, index) {
          obj[item.subject_id] = index;
          return obj;
        },{});
        this.subjectsLoaded = true;
      });

  },
};
</script>


<style scoped>
  .scroller {
    overflow-x: auto;
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
