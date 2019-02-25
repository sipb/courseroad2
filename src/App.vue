<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <!-- *** USE THIS for multiple roads! https://vuetifyjs.com/en/components/tabs#icons-and-text -->
  <v-app id="app-wrapper"
  >
    <v-toolbar fixed app dense>
        <v-toolbar-side-icon @click.stop="leftDrawer = !leftDrawer"></v-toolbar-side-icon>
        <v-toolbar-title>Audit</v-toolbar-title>
      <v-spacer></v-spacer>
      <road-tabs
        v-bind:roads = "roads"
        v-bind:activeRoad = "activeRoad"
        @delete-road = "deleteRoad"
        @set-name = "setRoadName($event.road, $event.name)"
        @add-road = "addRoad"
        @change-active = "changeActiveRoad($event)"
        slot = "extension"
      >
      </road-tabs>
      <v-btn v-if = "!loggedIn" outline round color = "primary" @click="loginUser">
        Login
      </v-btn>
      <v-btn v-if = "loggedIn" outline round color = "primary" @click = "logoutUser">
        Logout
      </v-btn>
      <v-tooltip bottom :disabled = "saveWarnings.length==0">
        <v-icon slot = "activator" v-if = "!currentlySaving && !gettingUserData" :color = "saveColor">
          {{saveIcon}}
        </v-icon>
        <div>
          <p v-for = "saveWarning in saveWarnings">{{saveWarning.name}}: {{saveWarning.error}}</p>
        </div>
      </v-tooltip>
      <div v-if = "currentlySaving || gettingUserData">
        <v-progress-circular :size = "18" indeterminate>
        </v-progress-circular>
      </div>
      <v-spacer></v-spacer>

      <v-menu  offset-y v-model = "showSearch" :close-on-content-click="false" input-activator fixed>
        <v-text-field class = "expanded-search" prepend-icon="search" v-model = "searchInput" placeholder = "6.0061 Silly Systems" slot = "activator"></v-text-field>
        <div class = "search-menu">
          <class-search v-bind:searchInput = "searchInput" v-bind:subjects="subjectsInfo" @add-class="addClass" @move-class="moveClass"   @drop-class="dropClass" @drag-class="testClass"></class-search>
        </div>
      </v-menu>

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
        v-if = "activeRoad != ''"
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
          ></road>
        </v-tab-item>
      </v-tabs-items>

      <conflict-dialog
        v-if = "conflictInfo != undefined"
        v-bind:conflictInfo = "conflictInfo"
        v-bind:conflictDialog = "conflictDialog"
        @update-local = "updateLocal"
        @update-remote = "updateRemote"
      >
      </conflict-dialog>

    </v-content>

    <v-footer v-if = "!cookiesAllowed" fixed class = "pa-2">
      This site uses cookies to store your data and login information.  Click OK to consent to the use of cookies.
      <v-btn small depressed color = "primary" @click = "allowCookies">
        OK
      </v-btn>
    </v-footer>
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
import RoadTabs from "./components/RoadTabs.vue"
import ConflictDialog from "./components/ConflictDialog.vue"
import $ from 'jquery'
import Vue from 'vue'

var MAIN_URL = "http://localhost:8080"
var DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z"

function getQueryObject() {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  var queryObject = {}
  for(var i = 0; i < vars.length; i++) {
    var keyValuePair = vars[i].split("=");
    queryObject[keyValuePair[0]] = keyValuePair[1];
  }
  return queryObject;
}

export default {
  components: {
    'audit': Audit,
    'class-search': ClassSearch,
    'road': Road,
    'filter-set': FilterSet,
    'road-tabs': RoadTabs,
    'conflict-dialog': ConflictDialog
  },
  data: function(){ return {
    reqTrees: {},
    reqList: [],
    dragSemesterNum: -1,
    subjectsLoaded: false,
    loggedIn: false,
    gettingUserData: false,
    cookieName: "Default Cookie",
    accessInfo: undefined,
    // A list of dictionaries containing info on current mit subjects. (actually filled in correctly below)
    subjectsInfo: [],
    leftDrawer: true,
    rightDrawer: true,
    activeRoad: "$defaultroad$",
    newRoads: ["$defaultroad$"],
    newRoadName: "",
    justLoaded: true,
    currentlySaving: false,
    saveWarnings: [],
    conflictDialog: false,
    conflictInfo: undefined,
    cookiesAllowed: false,
    searchInput: "",
    showSearch: false,
    // TODO: Really we should grab this from a global datastore
    // now in the same format as FireRoad

    //note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
    roads: {
      "$defaultroad$": {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: "My First Road",
        agent: this.getAgent(),
        contents: {
          coursesOfStudy: ['girs'],
          selectedSubjects: []
        }
      }
    }
  }},
  computed: {
    roadref: function() {
      return "#road" + this.activeRoad
    },
    saveColor: function() {
      if(!this.cookiesAllowed && !this.loggedIn) {
        return "gray";
      }
      if(this.saveWarnings.length) {
        return "warning";
      } else {
        return "primary";
      }
    },
    saveIcon: function() {
      if(this.saveWarnings.length) {
        return "warning";
      } else {
        return "save";
      }
    },
    searchbar: function() {
      if(this.showSearch) {
        return "expanded-search";
      } else {
        return "";
      }
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
    getRelevantObjects: function(position) {
      var semesterElem = document.elementFromPoint(position.x,position.y);
      var semesterParent = $(semesterElem).parents(".semester-container");
      var semesterBox = semesterParent.find(".semester-drop-container");
      // var semesterBox = $("#semester_"+this.dragSemesterNum).find(".semester-drop-container");
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
        if(semesterID.split("_")[2]=="semester") {
          var semesterNum = parseInt(semesterID.split("_")[3]);
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
          var currentIndex = this.roads[this.activeRoad].contents.selectedSubjects.indexOf(event.basicClass);
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
      if(this.dragSemesterNum != semInfo.semesterNum && this.dragSemesterNum != -1) {
        var lastSemester = $("#road_"+$.escapeSelector(this.activeRoad)+"_semester_" + this.dragSemesterNum);
        var lastSemesterBox = lastSemester.find(".semester-drop-container");
        this.resetSemesterBox(lastSemesterBox)
      }
      if(semInfo.semesterNum != undefined) {
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
      console.log(event);
      console.log(this.roads[this.activeRoad].contents.coursesOfStudy);
      var reqIndex = this.roads[this.activeRoad].contents.coursesOfStudy.indexOf(event);
      this.roads[this.activeRoad].contents.coursesOfStudy.splice(reqIndex);
    },
    loginUser: function(event) {
      window.location.href = "https://fireroad-dev.mit.edu/login/?redirect=http://localhost:8080"
    },
    logoutUser: function(event) {
      this.$cookies.remove("accessInfo");
      this.loggedIn = false;
      this.accessInfo = undefined;
      window.location.reload();
    },
    doSecure: function(axiosFunc, link, params) {
      if(this.loggedIn && this.accessInfo != undefined) {
        // var CORS_LINK = `https://cors-anywhere.herokuapp.com/`;
        var CORS_LINK = '';
        var FIREROAD_LINK = `https://fireroad-dev.mit.edu`;
        var headerList = {headers: {
          "Authorization": 'Bearer ' + this.accessInfo.access_token,
          }};
        //note: TODO: fix the cors problem
        return axios.get(CORS_LINK+FIREROAD_LINK+"/verify/", headerList)
        .then(function(verifyResponse){
          if(verifyResponse.data.success) {
            if(params==false) {
              return axiosFunc(CORS_LINK+FIREROAD_LINK+link,headerList);
            } else {
              return axiosFunc(CORS_LINK+FIREROAD_LINK+link,params,headerList);
            }
          } else {
            this.logoutUser();
            return Promise.reject("Token not valid")
          }
        });
      } else {
        return Promise.reject("No auth information");
      }

    },
    getSecure: function(link) {
      return this.doSecure(axios.get,link,false);
    },
    postSecure: function(link, params) {
      return this.doSecure(axios.post,link,params);
    },
    getUserData: function() {
      this.gettingUserData = true;
      this.getSecure("/sync/roads/")
      .then(function(response) {
        if(response.status == 200 && response.data.success) {
          return Object.keys(response.data.files)
        } else {
          return Promise.reject();
        }
        return response;
      }).then(function(fileKeys) {
        console.log("fileKeys:");
        console.log(fileKeys);
        if(fileKeys.length) {
          console.log("getting file links")
          var fileLinks = fileKeys.map(function(fk) {
            return this.getSecure("/sync/roads/?id="+fk)
          }.bind(this));
          console.log("got file links");
          return Promise.all(fileLinks).then((fl) => [fileKeys, fl]);
        } else {
          return [fileKeys, undefined];
        }
      }.bind(this)).then(function([roadIDs,roadData]) {
        if(roadData != undefined) {
          this.renumberRoads(roadData);
          if(this.justLoaded) {
            Vue.delete(this.roads, "$defaultroad$");
          }
          for(var r = 0; r < roadIDs.length; r++) {
            if(roadData[r].status==200 && roadData[r].data.success) {
              roadData[r].data.file.downloaded = moment().format(DATE_FORMAT);
              roadData[r].data.file.changed = moment().format(DATE_FORMAT);
              Vue.set(this.roads, roadIDs[r], roadData[r].data.file);
            }
          }
          this.activeRoad = Object.keys(this.roads)[0];
        }
        this.gettingUserData = false;
      }.bind(this)).catch(function(err) {
        alert(err);
        this.gettingUserData = false;
        if(err=="Token not valid") {
          alert("Your token has expired.  Please log in again.");
        }
        this.logoutUser();
      }.bind(this))
    },
    renumber: function(name, otherNames) {
      var newName = undefined;
      var copyIndex = 2;
      while(newName == undefined) {
        var copyName = name + " ("+copyIndex+")";
        if(otherNames.indexOf(copyName)==-1) {
          newName = copyName;
        }
        copyIndex++;
      }
      return newName;
    },
    renumberRoads: function(cloudRoads) {
      var cloudNames = cloudRoads.map(function(cr) {
        try {
          return cr.data.file.name
        } catch (err) {
          return undefined;
        }
      });
      for(var roadID in this.roads) {
        var localName = this.roads[roadID].name;
        if(cloudNames.indexOf(localName)>=0) {
          var renumberedName = this.renumber(localName, cloudNames);
          Vue.set(this.roads[roadID], "name", renumberedName);
        }
      }
    },
    getAuthorizationToken: function(code) {
      axios.get(`https://fireroad-dev.mit.edu/fetch_token/?code=`+code).then(function(response) {
        if(response.data.success) {
          console.log(response);
          if(this.cookiesAllowed) {
            this.data.$cookies.set("accessInfo", response.data.access_info);
          }
          this.data.accessInfo = response.data.access_info;
          console.log("set accessInfo");
          console.log(this.data.accessInfo);
          this.data.loggedIn = true;
          this.data.getUserData();
        }
      }.bind({data:this}))
    },
    attemptLogin: function() {
      var queryObject = getQueryObject();
      if("code" in queryObject) {
        var code = queryObject["code"];
        window.history.pushState("CourseRoad Home","CourseRoad Home","/#"+this.activeRoad);
        this.getAuthorizationToken(code);
      }
    },
    setActiveRoad: function() {
      var roadHash = window.location.hash;
      if(roadHash.length&&roadHash.substring(0,5)=="#road") {
        var roadRequested = roadHash.substring(5);
        if(roadRequested in this.roads) {
          this.activeRoad = roadHash.substring(5);
          return true;
        }
      }
      window.location.hash = "#road" + this.activeRoad;
      return false;
    },
    save: function() {
      this.currentlySaving = true;
      this.saveWarnings = [];
      var savePromises = [];
      for(var roadID in this.roads) {
        var assignKeys = {override: false, agent: this.getAgent()}
        if(!roadID.includes("$")) {
          assignKeys.id = roadID
        }
        var newRoad = Object.assign(assignKeys, this.roads[roadID]);
        var savePromise = this.postSecure("/sync/sync_road/",newRoad)
        .then(function(response) {
          // console.log(response);
          if(response.status!=200) {
            return Promise.reject("Unable to save road " + this.oldid);
          } else {
            console.log(response.data.result);
            var newid = (response.data.id!=undefined ? response.data.id : this.oldid);
            if(response.data.success == false) {
              this.data.saveWarnings.push({id: newid, error: response.data.error_msg, name: this.data.roads[this.oldid].name});
            }
            if(response.data.result == "conflict") {
              this.conflictDialog = true;
              this.conflictInfo = {id: this.oldid, other_name: response.data.other_name, other_agent: response.data.other_agent, other_date:response.data.other_date, other_contents: response.data.other_contents, this_agent:response.data.this_agent, this_date:response.data.this_date};
            } else {
              if(response.data.id != undefined) {
                Vue.set(this.data.roads, response.data.id.toString(), this.data.roads[this.oldid]);
                if(this.data.activeRoad==this.oldid) {
                  this.data.activeRoad = response.data.id;
                }
                Vue.delete(this.data.roads, this.oldid);
                console.log(this.oldid + " " + response.data.id);
                return Promise.resolve({oldid: this.oldid, newid: response.data.id, state: "changed"});
              } else {
                return Promise.resolve({oldid: this.oldid, newid: this.oldid, state: "same"});
              }
              Vue.set(this.data.roads[newid], "downloaded", moment().format(DATE_FORMAT));
            }

          }
        }.bind({oldid: roadID,data:this}))
        savePromises.push(savePromise);
      }
      Promise.all(savePromises)
      .then(function(saveResults) {
        console.log(saveResults.map((sr)=>"Saved road " + sr.oldid + (sr.state=="changed" ? (" as " + sr.newid) : "")));
        for(var s = 0; s < saveResults.length; s++) {
          var savedResult = saveResults[s];
          if(savedResult.state == "changed") {
            var oldIdIndex = this.newRoads.indexOf(savedResult.oldid);
            if(oldIdIndex>=0) {
              this.newRoads.splice(oldIdIndex);
            }
          }
        }
        if(this.$cookies.isKey("newRoads")) {
          this.$cookies.remove("newRoads");
        }
        this.currentlySaving = false;
        console.log(this.saveWarnings);
      }.bind(this)).catch(function(err) {
        console.log(err);
        this.currentlySaving = false;
      }.bind(this));
    },
    updateRemote: function(roadID) {
      var newRoad = Object.assign({id: roadID, override: true, agent: this.getAgent()}, this.roads[roadID]);
      this.postSecure("/sync/sync_road/",newRoad)
      .then(function(response) {
        if(!response.data.success) {
          this.saveWarnings.push({error: response.data.error_msg, id: roadID, name: this.roads[roadID]});
        }
      })
      this.conflictInfo = {};
      this.conflictDialog = false;
    },
    updateLocal: function(roadID) {
      Vue.set(this.roads[roadID], "name", this.conflictInfo.other_name);
      Vue.set(this.roads[roadID], "agent", this.conflictInfo.other_agent);
      Vue.set(this.roads[roadID], "changed_date", this.conflictInfo.other_date);
      Vue.set(this.roads[roadID], "contents", this.conflictInfo.other_contents)
      Vue.set(this.roads[roadID], "downloaded", moment().format(DATE_FORMAT));
      this.conflictInfo = {};
      this.conflictDialog = false;
    },
    saveLocal: function() {
      if(this.newRoads.length) {
        var newRoadData = {}
        for (var r=0; r < this.newRoads.length; r++) {
          var roadID = this.newRoads[r];
          if(roadID in this.roads) {
            newRoadData[roadID] = this.roads[roadID];
          }
        }
        this.$cookies.set("newRoads", newRoadData, "7d");
      }
      Vue.set(this.roads[roadID], "downloaded", moment().format(DATE_FORMAT));
    },
    getAgent: function() {
      return navigator.platform;
    },
    addRoad: function(roadName) {
      var tempRoadID = "$" + this.newRoads.length + "$";
      var newContents;
      if(!this.duplicateRoad) {
        newContents = {
          coursesOfStudy: ["girs"],
          selectedSubjects: []
        }
      } else {
        newContents = JSON.parse(JSON.stringify(this.roads[this.duplicateRoadSource].contents));
      }

      var newRoad = {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: roadName,
        agent: this.getAgent(),
        contents: newContents
      }
      Vue.set(this.roads, tempRoadID, newRoad);
      this.newRoads.push(tempRoadID);
      console.log("setting to temp");
      this.activeRoad = tempRoadID;
    },
    deleteRoad: function(roadID) {
      console.log("deleting "  + roadID + " " + this.roads[roadID].name);
      if(this.activeRoad == roadID) {
        var roadIndex = Object.keys(this.roads).indexOf(roadID);
        var withoutRoad = Object.keys(this.roads).slice(0, roadIndex).concat(Object.keys(this.roads).slice(roadIndex+1));
        if(withoutRoad.length) {
          if(withoutRoad.length>roadIndex) {
            this.activeRoad = withoutRoad[roadIndex];
          } else {
            this.activeRoad = withoutRoad[roadIndex-1];
          }
        } else {
          this.activeRoad = "";
        }
      }
      Vue.delete(this.roads, roadID);
      if(roadID in this.newRoads) {
        roadIndex = this.newRoads.indexOf(roadID);
        this.newRoads.splice(roadID);
      }

      if(this.loggedIn) {
        if(roadID.indexOf("$")<0) {
          this.postSecure("/sync/delete_road/",{id: roadID});
        }
      }
    },
    setRoadName: function(roadID, roadName) {
      Vue.set(this.roads[roadID], "name", roadName);
    },
    allowCookies: function() {
      this.cookiesAllowed = true;
      if(this.loggedIn) {
        this.$cookies.set("accessInfo", this.accessInfo);
      }
    },
    changeActiveRoad: function(event) {
      this.activeRoad = event;
    }
  },
  watch: {
    //call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function(newRoad,oldRoad) {
      this.justLoaded = false;
      this.duplicateRoadSource = newRoad;
      if(newRoad != "") {
        window.history.pushState({},this.roads[newRoad].name,"/#road"+newRoad);
        this.updateFulfillment();
      }
    },
    roads: {
      handler: function(newRoads,oldRoads) {
        if(this.activeRoad != "") {
          this.updateFulfillment();
        }
          if(this.loggedIn && !this.currentlySaving) {
            this.save();
          } else {
            this.saveLocal();
          }
          this.justLoaded = false;
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

    if(this.$cookies.isKey("accessInfo")) {
      this.loggedIn = true;
      this.cookiesAllowed = true;
      this.accessInfo = this.$cookies.get("accessInfo");
      this.getUserData();
    }

    if(this.$cookies.isKey("newRoads")) {
      this.cookiesAllowed = true;
      var newRoads = this.$cookies.get("newRoads");
      if(Object.keys(newRoads).length) {
        if(this.justLoaded) {
          if(!(this.activeRoad in newRoads)) {
            console.log("mounted setting to 0th")
            this.activeRoad = Object.keys(newRoads)[0];
          }
          this.roads = newRoads;
        } else {
          this.roads = Object.assign(newRoads, this.roads);
        }
        this.newRoads = Object.keys(newRoads);
      } else {
        this.$cookies.remove("newRoads");
      }

    }

    var borders = $(".v-navigatio   n-drawer__border")
    var scrollers = $(".scroller")
    var scrollWidth = scrollers.width()

    $(window).on("hashchange", function() {
      this.setActiveRoad();
    }.bind(this))
    //moves nav drawer border with scroll
    //if the effect proves too annoying we can remove the borders instead
    //(commented out below)
    scrollers.scroll(function() {
      var scrollPosition = scrollers.scrollLeft()
      borders.css({top: 0, left: scrollWidth-1+scrollPosition})
    })

    this.setActiveRoad();
    this.attemptLogin();
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
  .search-menu {
    background: white;
  }
  .expanded-search {
    width: 350px;
  }
</style>
