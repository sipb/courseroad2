<template>
  <v-layout row align-baseline>
    <v-btn class = "collapse-button" v-if = "!loggedIn" outline round color = "primary" @click="loginUser">
      <span class = "hidden-sm-and-down">Login</span>
      <font-awesome-icon class = "hidden-md-and-up" icon = "sign-in-alt"/>
    </v-btn>
    <v-btn class = "collapse-button" v-if = "loggedIn" outline round color = "primary" @click = "logoutUser">
      <span class = "hidden-sm-and-down">Logout</span>
      <font-awesome-icon class = "hidden-md-and-up" icon = "sign-out-alt"/>
    </v-btn>
    <v-tooltip bottom :disabled = "saveWarnings.length===0">
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
  </v-layout>
</template>

<script>
import Vue from 'vue'
import UAParser from "ua-parser-js"
var DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z"
var FIREROAD_LINK = `https://fireroad-dev.mit.edu`;

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
  name: "Auth",
  components: {},
  props: ["roads", "justLoaded", "activeRoad", "conflictInfo"],
  data: function() {return {
    accessInfo: undefined,
    loggedIn: false,
    newRoads: [],
    saveWarnings: [],
    gettingUserData: false,
    currentlySaving: false,
    authCookiesAllowed: false,
    tabID: Math.floor(Math.random()*16**10).toString(16)
  }},
  computed: {
    saveColor: function() {
      if(!this.authCookiesAllowed && !this.loggedIn) {
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
    loginUser: function(event) {
      window.location.href = `https://fireroad-dev.mit.edu/login/?redirect=${process.env.APP_URL}`
    },
    logoutUser: function(event) {
      this.$cookies.remove("accessInfo");
      this.loggedIn = false;
      this.accessInfo = undefined;
      window.location.reload();
    },
    verify: function() {
      var headerList = {headers: {
        "Authorization": 'Bearer ' + this.accessInfo.access_token,
        }};
      return axios.get(FIREROAD_LINK+"/verify/", headerList)
      .then(function(verifyResponse) {
        if(verifyResponse.data.success) {
          this.$emit("set-sem", verifyResponse.data.current_semester);
          return verifyResponse.data;
        } else {
          this.logoutUser();
          return Promise.reject("Token not valid")
        }
      }.bind(this));
    },
    doSecure: function(axiosFunc, link, params) {
      if(this.loggedIn && this.accessInfo !== undefined) {
        var headerList = {headers: {
          "Authorization": 'Bearer ' + this.accessInfo.access_token,
          }};
        return this.verify()
        .then(function(verifyResponse){
          if(params===false) {
            return axiosFunc(FIREROAD_LINK+link,headerList);
          } else {
            return axiosFunc(FIREROAD_LINK+link,params,headerList);
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
        if(response.status === 200 && response.data.success) {
          return Object.keys(response.data.files)
        } else {
          return Promise.reject();
        }
        return response;
      }).then(function(fileKeys) {
          var fileLinks = fileKeys.map(function(fk) {
            return this.getSecure("/sync/roads/?id="+fk)
          }.bind(this));
          return Promise.all(fileLinks).then((fl) => [fileKeys, fl]);
      }.bind(this)).then(function([roadIDs,roadData]) {
        if(roadData !== undefined) {
          this.renumberRoads(roadData);
          if(this.justLoaded) {
            Vue.delete(this.roads, "$defaultroad$");
          }
          for(var r = 0; r < roadIDs.length; r++) {
            if(roadData[r].status===200 && roadData[r].data.success) {
              roadData[r].data.file.downloaded = moment().format(DATE_FORMAT);
              roadData[r].data.file.changed = moment().format(DATE_FORMAT);
              if(roadData[r].data.file.contents.progressOverrides === undefined) {
                roadData[r].data.file.contents.progressOverrides = {};
              }
              this.$emit("set-road", roadIDs[r], roadData[r].data.file);
            }
          }
          this.$emit("set-active", Object.keys(this.roads)[0])
        }
        this.gettingUserData = false;
      }.bind(this)).catch(function(err) {
        alert(err);
        this.gettingUserData = false;
        if(err==="Token not valid") {
          alert("Your token has expired.  Please log in again.");
        }
        this.logoutUser();
      }.bind(this))
    },

    renumber: function(name, otherNames) {
      var newName = undefined;
      var copyIndex = 2;
      while(newName === undefined) {
        var copyName = name + " ("+copyIndex+")";
        if(otherNames.indexOf(copyName)===-1) {
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
          if(this.data.authCookiesAllowed) {
            this.data.$cookies.set("accessInfo", response.data.access_info);
          }
          this.data.accessInfo = response.data.access_info;
          this.data.verify();
          this.data.loggedIn = true;
          this.data.getUserData();
        }
      }.bind({data:this}))
    },

    attemptLogin: function() {
      var queryObject = getQueryObject();
      if("code" in queryObject) {
        var code = queryObject["code"];
        window.history.pushState("CourseRoad Home","CourseRoad Home","./#"+this.activeRoad);
        this.getAuthorizationToken(code);
      }
    },
    save: function() {
      if(this.loggedIn) {
        this.saveRemote();
      } else {
        this.saveLocal();
      }
    },
    saveRemote: function() {
      this.currentlySaving = true;
      this.saveWarnings = [];
      var savePromises = [];
      for(var roadID in this.roads) {
        var assignKeys = {override: false, agent: this.getAgent()}
        if(!roadID.includes("$")) {
          assignKeys.id = roadID
        }
        var newRoad = Object.assign(this.roads[roadID], assignKeys);
        var savePromise = this.postSecure("/sync/sync_road/",newRoad)
        .then(function(response) {
          if(response.status!==200) {
            return Promise.reject("Unable to save road " + this.oldid);
          } else {
            var newid = (response.data.id!==undefined ? response.data.id : this.oldid);
            if(response.data.success === false) {
              this.data.saveWarnings.push({id: newid, error: response.data.error_msg, name: this.data.roads[this.oldid].name});
            }
            if(response.data.result === "conflict") {
              var conflictInfo = {id: this.oldid, other_name: response.data.other_name, other_agent: response.data.other_agent, other_date:response.data.other_date, other_contents: response.data.other_contents, this_agent:response.data.this_agent, this_date:response.data.this_date};
              this.data.$emit("conflict", conflictInfo);
            } else {
              if(response.data.id !== undefined) {
                //note: code moved to app.vue for reset id
                //this is to fix a problem where the activeroad gets reset to the first one
                //i suspect this is because the three events required were not happening
                //in the correct order or something
                if(this.oldid != response.data.id) {
                  this.data.$emit("reset-id", this.oldid, response.data.id);
                }
                return Promise.resolve({oldid: this.oldid, newid: response.data.id, state: "changed"});
              } else {
                return Promise.resolve({oldid: this.oldid, newid: this.oldid, state: "same"});
              }
              this.data.$emit("set-road-prop", newid, "downloaded", moment().format(DATE_FORMAT))
            }

          }
        }.bind({oldid: roadID,data:this}))
        savePromises.push(savePromise);
      }
      return Promise.all(savePromises)
      .then(function(saveResults) {
        for(var s = 0; s < saveResults.length; s++) {
          var savedResult = saveResults[s];
          if(savedResult.state === "changed") {
            var oldIdIndex = this.newRoads.indexOf(savedResult.oldid);
            if(oldIdIndex>=0) {
              this.newRoads.splice(oldIdIndex,1);
            }
          }
        }
        if(this.$cookies.isKey("newRoads")) {
          this.$cookies.set("newRoads", {});
        }
        this.currentlySaving = false;
      }.bind(this)).catch(function(err) {
        console.log(err);
        this.currentlySaving = false;
      }.bind(this));
    },
    saveLocal: function() {
      this.currentlySaving = true;
      if(this.authCookiesAllowed) {
        this.$cookies.set("newRoads", this.getNewRoadData());
      }
      this.currentlySaving = false;
      for(var roadID in this.roads) {
        this.$emit("set-road-prop", roadID, "downloaded", moment().format(DATE_FORMAT));
      }
    },
    getNewRoadData: function() {
      var newRoadData = {};
      if(this.newRoads.indexOf("$defaultroad$") === -1 && "$defaultroad$" in this.roads) {
        if(this.roads["$defaultroad$"].contents.selectedSubjects.length > 0 || JSON.stringify(Array.from(this.roads["$defaultroad$"].contents.coursesOfStudy)) !== "[\"girs\"]") {
          this.newRoads.push("$defaultroad$");
        }
      }
      for (var r=0; r < this.newRoads.length; r++) {
        var roadID = this.newRoads[r];
        if(roadID in this.roads) {
          newRoadData[roadID] = this.roads[roadID];
        }
      }
      return newRoadData;
    },
    updateRemote: function(roadID) {
      var newRoad = Object.assign(this.roads[roadID],{id: roadID, override: true, agent: this.getAgent()});
      this.postSecure("/sync/sync_road/",newRoad)
      .then(function(response) {
        if(!response.data.success) {
          this.saveWarnings.push({error: response.data.error_msg, id: roadID, name: this.roads[roadID]});
        }
      })
      this.$emit("resolve-conflict");
    },

    updateLocal: function(roadID) {
      Vue.set(this.roads[roadID], "name", this.conflictInfo.other_name);
      Vue.set(this.roads[roadID], "agent", this.conflictInfo.other_agent);
      Vue.set(this.roads[roadID], "changed_date", this.conflictInfo.other_date);
      Vue.set(this.roads[roadID], "contents", this.conflictInfo.other_contents)
      Vue.set(this.roads[roadID], "downloaded", moment().format(DATE_FORMAT));
      this.$emit("resolve-conflict")
    },

    deleteRoad: function(roadID) {
      if(this.activeRoad === roadID) {
        var roadIndex = Object.keys(this.roads).indexOf(roadID);
        var withoutRoad = Object.keys(this.roads).slice(0, roadIndex).concat(Object.keys(this.roads).slice(roadIndex+1));
        if(withoutRoad.length) {
          if(withoutRoad.length>roadIndex) {
            this.$emit("set-active", withoutRoad[roadIndex]);
          } else {
            this.$emit("set-active", withoutRoad[roadIndex-1]);
          }
        } else {
          this.$emit("set-active", "");
        }
      }
      this.$emit("delete-road", roadID);

      if(roadID in this.newRoads) {
        roadIndex = this.newRoads.indexOf(roadID);
        this.newRoads.splice(roadID,1);
      }

      if(this.loggedIn) {
        if(roadID.indexOf("$")<0) {
          this.postSecure("/sync/delete_road/",{id: roadID});
        }
      }
    },
    allowCookies: function() {
      this.$cookies.set("newRoads",this.getNewRoadData());
      this.authCookiesAllowed = true;
      if(this.loggedIn) {
        this.$cookies.set("accessInfo", this.accessInfo);
      }
      this.setTabID();
    },
    getAgent: function() {
      var ua = UAParser(navigator.userAgent);
      return navigator.platform + " " + ua.browser.name + " Tab " + this.tabID;
    },
    setTabID: function() {
      if(this.authCookiesAllowed) {
        if(sessionStorage.tabID !== undefined) {
          this.tabID = sessionStorage.tabID;
          if(this.$cookies.isKey("tabs")) {
            var tabs = JSON.parse(this.$cookies.get("tabs"));
            if(tabs.indexOf(this.tabID)===-1) {
              tabs.push(this.tabID);
              this.$cookies.set("tabs", JSON.stringify(tabs));
            }
          } else {
            this.$cookies.set("tabs", JSON.stringify([this.tabID]));
          }
        } else {
          if(this.$cookies.isKey("tabs") && (tabs = JSON.parse(this.$cookies.get("tabs"))).length) {
            var maxTab = Math.max(...tabs);
            var newTab = (maxTab + 1).toString();
            sessionStorage.tabID = newTab;
            this.tabID = newTab;
            tabs.push(newTab);
            this.$cookies.set("tabs", JSON.stringify(tabs));
          } else {
            sessionStorage.tabID = "1";
            this.tabID = "1";
            this.$cookies.set("tabs", "[\"1\"]");
          }
        }
      }
    },
    changeSemester: function(year) {
      var currentMonth = new Date().getMonth();
      var sem;
      if(currentMonth >= 4 && currentMonth <= 10) {
        sem = 1 + year * 3;
      } else {
        sem = 3 + year * 3;
      }
      this.postSecure("/set_semester/",{semester: sem}).then(function(res) {
        if(res.status===200 && res.data.success) {
          this.$emit('set-sem', sem);
        }
      }.bind(this)).catch(function(err) {
        if(err == "No auth information") {
          this.$emit('set-sem', sem);
        }
      }.bind(this))
    }
  },
  watch: {
    authCookiesAllowed: function(newCA, oldCA) {
      if(newCA) {
        this.$emit("allow-cookies");
      }
    }
  },
  mounted() {
    if(this.$cookies.isKey("newRoads")) {
      var newRoads = this.$cookies.get("newRoads");
      if(Object.keys(newRoads).length) {
        if(this.justLoaded) {
          if(!(this.activeRoad in newRoads)) {
            this.$emit("set-active", Object.keys(newRoads)[0]);
          }
          this.$emit("set-roads", newRoads);
        } else {
          this.$emit("set-roads", Object.assign(newRoads, this.roads));
        }
        this.newRoads = Object.keys(newRoads);
      }
      this.allowCookies();
    }

    window.cookies = this.$cookies;
    if(this.$cookies.isKey("accessInfo")) {
      this.loggedIn = true;
      this.accessInfo = this.$cookies.get("accessInfo");
      this.$emit("set-sem",this.accessInfo.current_semester);
      this.verify();
      this.allowCookies();
      this.getUserData();
    }

    window.onbeforeunload = function() {
      if(this.authCookiesAllowed) {
        var tabID = sessionStorage.tabID;
        var tabs = JSON.parse(this.$cookies.get("tabs"));
        var tabIndex = tabs.indexOf(tabID);
        tabs.splice(tabIndex, 1);
        this.$cookies.set("tabs", JSON.stringify(tabs));
      }
      if(this.currentlySaving) {
        return "Are you sure you want to leave?  Your roads are not saved.";
      }
    }.bind(this);

    this.attemptLogin();
    // window.cookies = this.$cookies;
  }
}
</script>

<style>
.collapse-button {
  min-width: 0;
}
</style>
