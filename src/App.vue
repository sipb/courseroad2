<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <!-- *** USE THIS for multiple roads! https://vuetifyjs.com/en/components/tabs#icons-and-text -->
  <v-app id="app-wrapper"
  >
    <v-toolbar fixed app dense>
        <v-toolbar-side-icon @click.stop="leftDrawer = !leftDrawer"></v-toolbar-side-icon>
        <v-toolbar-title>Audit</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-tabs
          show-arrows
          v-model = "activeRoad"
          slot = "extension"
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab
            :key = "roadid"
            :href = "`#${roadid}`"
            v-for = "roadid in Object.keys(roads)"
            >
              {{roads[roadid].name}}
              <v-btn icon flat v-show = "roadid == activeRoad" @click = "$event.preventDefault(); newRoadName = roads[roadid].name; showDialog(editDialog, roadid);">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-dialog v-model = "editDialog[roadid]" @input = "newRoadName = ''">
                <v-card style = "padding: 2em">
                  <v-card-title>Edit Road</v-card-title>
                  <v-text-field v-model = "newRoadName" label = "Road Name"></v-text-field>
                  <v-card-actions>
                    <v-btn color = "primary" :disabled = "otherRoadHasName(roadid, newRoadName)" @click = "setRoadName(roadid, newRoadName); hideDialog(editDialog, roadid); newRoadName = ''">Submit</v-btn>
                    <v-btn color = "error" @click = "hideDialog(editDialog, roadid); showDialog(deleteDialog, roadid)">
                      Delete Road
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model = "deleteDialog[roadid]">
                <v-card style = "padding: 2em">
                  <v-card-title>Permanently Delete {{roads[roadid].name}}?</v-card-title>
                  <v-card-text>This action cannot be undone.</v-card-text>
                  <v-card-actions>
                    <v-btn @click = "hideDialog(deleteDialog, roadid);showDialog(editDialog, roadid)">Cancel</v-btn>
                    <v-btn @click = "deleteRoad($event, roadid);" color = "error">Delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
          </v-tab>
        </v-tabs>
        <v-dialog v-model = "addDialog" width = "500" slot = "extension" @input = "newRoadName = ''">
          <v-btn icon flat style = "padding: 0" color = "primary" slot = "activator">
            <v-icon>add</v-icon>
          </v-btn>
          <v-card style = "padding: 2em">
            <v-card-title>Create Road</v-card-title>
            <v-text-field v-model = "newRoadName"></v-text-field>
            <v-layout row>
              <v-flex xs6>
                <v-switch v-model = "duplicateRoad" label = "Duplicate Existing"></v-switch>
              </v-flex>
              <v-flex>
                <v-select :disabled = "!duplicateRoad" :items = "Object.keys(roads)" v-model = "duplicateRoadSource">
                  <template slot = "item" slot-scope = "{item}">
                    {{roads[item].name}}
                  </template>
                  <template slot = "selection" slot-scope = "{item}">
                    {{roads[item].name}}
                  </template>
                </v-select>
              </v-flex>
            </v-layout>
            <v-card-actions>
              <v-btn :disabled = "otherRoadHasName('', newRoadName)" color = "primary" @click="addRoad(newRoadName); addDialog=false;">Create</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

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
        <!-- <v-btn v-if = "loggedIn" @click="save">
          Save
        </v-btn> -->
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

      <v-dialog v-if = "conflictInfo != undefined" v-model = "conflictDialog">
        <v-card>
          <v-card-title>Save Conflict</v-card-title>
          <v-layout row>
            <v-flex xs6 style = "padding: 2em">
              <b>Local</b>
              <v-list>
                <v-card style = "padding: 1em">Name: conflictInfo.other_name</v-card>
                <v-card style = "padding: 1em">Agent: conflictInfo.other_agent</v-card>
                <v-card style = "padding: 1em">Date: conflictInfo.other_date</v-card>
                <v-card style = "padding: 1em">
                  <p>Contents:</p>
                  <p>Courses of Study: <span v-for = "req in conflictInfo.other_contents.coursesOfStudy"> {{req}} </span></p>
                  <p>Selected Subjects: <span v-for = "course in conflictInfo.other_contents.selectedSubjects"> {{course}} </span></p>
                </v-card>
              </v-list>
              <v-btn color = "primary" @click = "updateLocal(conflictInfo.id); conflictInfo = {}; conflictDialog = false;">Keep Remote</v-btn>
            </v-flex>
            <v-flex xs6>
              <b>Cloud</b>
              <v-list>
                <v-card style = "padding: 1em">Name: roads[conflictInfo.id].name</v-card>
                <v-card style = "padding: 1em">Agent: roads[conflictInfo.id].agent</v-card>
                <v-card style = "padding: 1em">Date: roads[conflictInfo.id].changed_date</v-card>
                <v-card style = "padding: 1em">
                  <p>Contents:</p>
                  <p>Courses of Study: <span v-for = "req in roads[conflictInfo.id].contents.coursesOfStudy"> {{req}} </span></p>
                  <p>Selected Subjects: <span v-for = "course in roads[conflictInfo.id].contents.selectedSubjects"> {{course}} </span></p>
                </v-card>
              </v-list>
              <v-btn color = "primary" @click = "updateRemote(conflictInfo.id); conflictInfo = {}; conflictDialog = false;">Keep Local</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-dialog>

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
import $ from 'jquery'
import Vue from 'vue'

var MAIN_URL = "http://localhost:8080"
var DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ"

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
    'filter-set': FilterSet
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
    duplicateRoad: false,
    duplicateRoadSource: "$defaultroad$",
    addDialog: false,
    editDialog: {"$defaultroad$":false},
    deleteDialog: {"$defaultroad$": false},
    conflictDialog: false,
    conflictInfo: undefined,
    cookiesAllowed: false,
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
      Vue.set(this.editDialog, this.activeRoad, false);
      Vue.set(this.deleteDialog, this.activeRoad, false);
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
        var CORS_LINK = `https://cors-anywhere.herokuapp.com/`;
        var FIREROAD_LINK = `https://fireroad-dev.mit.edu`;
        var headerList = {headers: {
          "Authorization": 'Bearer ' + this.accessInfo.access_token,
          "Access-Control-Allow-Origin": "*"
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
        if(fileKeys.length) {
          var fileLinks = fileKeys.map(function(fk) {
            return this.getSecure("/sync/roads/?id="+fk)
          }.bind(this));
          return Promise.all(fileLinks).then((fl) => [fileKeys, fl]);
        } else {
          return [fileKeys, undefined];
        }
      }.bind(this)).then(function([roadIDs,roadData]) {
        this.renumberRoads(roadData);
        if(roadData != undefined) {
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
        if(err=="Token not valid") {
          alert("Your token has expired.  Please log in again.");
        }
      })
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
          console.log(response);
          if(response.status!=200) {
            return Promise.reject("Unable to save road " + this.oldid);
          } else {
            if(response.data.success == false) {
              this.data.saveWarnings.push({id: (response.data.id!=undefined ? response.data.id : this.oldid), error: response.data.error_msg, name: this.data.roads[this.oldid].name});
            }
            if(response.data.result == "conflict") {
              this.conflictDialog = true;
              this.conflictInfo = {id: this.oldid, other_name: response.data.other_name, other_agent: response.data.other_agent, other_date:response.data.other_date, other_contents: response.data.other_contents, this_agent:response.data.this_agent, this_date:response.data.this_date};
            }
            if(response.data.id != undefined) {
              Vue.set(this.data.roads, response.data.id.toString(), this.data.roads[this.oldid]);
              Vue.delete(this.data.roads, this.oldid);
              if(this.data.activeRoad==this.oldid) {
                this.data.activeRoad = response.data.id;
              }
              console.log(this.oldid + " " + response.data.id);
              return Promise.resolve({oldid: this.oldid, newid: response.data.id, state: "changed"});
            } else {
              return Promise.resolve({oldid: this.oldid, newid: this.oldid, state: "same"});
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
    },
    updateLocal: function(roadID) {
      Vue.set(this.roads[roadID], "name", this.conflictInfo.other_name);
      Vue.set(this.roads[roadID], "agent", this.conflictInfo.other_agent);
      Vue.set(this.roads[roadID], "changed_date", this.conflictInfo.other_date);
      Vue.set(this.roads[roadID], "contents", this.conflictInfo.other_contents)
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
      this.activeRoad = tempRoadID;
    },
    deleteRoad: function(event, roadID) {
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
      Vue.delete(this.editDialog, roadID);
      Vue.delete(this.deleteDialog, roadID);

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
    otherRoadHasName: function(roadID, roadName) {
      var otherRoadNames = Object.keys(this.roads).map(function(road) {
        if(road == roadID) {
          return undefined;
        } else {
          return this.roads[road].name
        }
      }.bind(this));
      return otherRoadNames.indexOf(roadName) >= 0;
    },
    hideDialog: function(dialog, roadID) {
      Vue.set(dialog, roadID, false);
    },
    showDialog: function(dialog, roadID) {
      Vue.set(dialog, roadID, true);
    },
    allowCookies: function() {
      this.cookiesAllowed = true;
      if(this.loggedIn) {
        this.$cookies.set("accessInfo", this.accessInfo);
      }
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
</style>
