<template>
  <v-layout row align-center grow>
    <v-btn
      v-if="!loggedIn"
      class="collapse-button"
      outline
      color="primary"
      data-cy="loginButton"
      @click="loginUser"
    >
      <span class="hidden-sm-and-down">Login</span>
      <font-awesome-icon class="hidden-md-and-up" icon="sign-in-alt" />
    </v-btn>
    <v-btn
      v-if="loggedIn"
      class="collapse-button"
      outline
      color="primary"
      data-cy="logoutButton"
      @click="logoutUser"
    >
      <span class="hidden-sm-and-down">Logout</span>
      <font-awesome-icon class="hidden-md-and-up" icon="sign-out-alt" />
    </v-btn>
    <v-tooltip bottom :disabled="saveWarnings.length===0">
      <v-icon
        v-if="!currentlySaving && !gettingUserData"
        id="save-icon"
        slot="activator"
        :color="saveColor"
        style="user-select: none;"
      >
        {{ saveIcon }}
      </v-icon>
      <div>
        <p v-for="saveWarning in saveWarnings" :key="saveWarning.name + saveWarning.error">
          {{ saveWarning.name }}: {{ saveWarning.error }}
        </p>
      </div>
    </v-tooltip>
    <div v-if="currentlySaving || gettingUserData">
      <v-progress-circular :size="18" indeterminate />
    </div>
  </v-layout>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import UAParser from 'ua-parser-js';
import simpleSSMixin from './../mixins/simpleSelectedSubjects.js';

var DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

function getQueryObject () {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  const queryObject = {};
  for (let i = 0; i < vars.length; i++) {
    const keyValuePair = vars[i].split('=');
    queryObject[keyValuePair[0]] = keyValuePair[1];
  }
  return queryObject;
}

export default {
  name: 'Auth',
  components: {},
  mixins: [simpleSSMixin],
  props: {
    justLoaded: {
      type: Boolean,
      required: true
    },
    conflictInfo: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  data: function () {
    return {
      accessInfo: undefined,
      loggedIn: false,
      newRoads: [],
      saveWarnings: [],
      gettingUserData: false,
      currentlySaving: false,
      tabID: Math.floor(Math.random() * 16 ** 10).toString(16)
    };
  },
  computed: {
    activeRoad () {
      return this.$store.state.activeRoad;
    },
    cookiesAllowed () {
      return this.$store.state.cookiesAllowed;
    },
    roads () {
      return this.$store.state.roads;
    },
    saveColor: function () {
      if (!this.cookiesAllowed && !this.loggedIn) {
        return 'gray';
      }
      return this.saveWarnings.length ? 'warning' : 'primary';
    },
    saveIcon: function () {
      return this.saveWarnings.length ? 'warning' : 'save';
    }
  },
  watch: {
    cookiesAllowed (newCA) {
      if (newCA) {
        this.$cookies.set('newRoads', this.getNewRoadData());
        if (this.loggedIn) {
          this.$cookies.set('accessInfo', this.accessInfo, '3d');
        }
        this.setTabID();
      }
    },
    loggedIn (newLoggedIn) {
      this.$store.commit('setLoggedIn', newLoggedIn);
      if (newLoggedIn && this.$cookies.get('has_set_year') !== 'true') {
        const email = this.accessInfo.academic_id;
        const endPoint = email.indexOf('@');
        const kerb = email.slice(0, endPoint);
        axios.get(process.env.VUE_APP_URL + '/cgi-bin/people.py?kerb=' + kerb)
          .then(response => {
            if (response.status !== 200) {
              console.log('Failed to find user year');
            } else {
              const year = response.data.year;
              if (year === undefined) {
                console.log('Failed to find user year');
              } else {
                this.changeSemester(year);
                console.log('setting year to ' + year);
              }
            }
          });
      }
    }
  },
  mounted () {
    window.setLocationHref = function (url) {
      window.location.href = url;
    };

    if (this.$cookies.isKey('newRoads')) {
      const newRoads = this.$cookies.get('newRoads');
      if (Object.keys(newRoads).length) {
        for (var roadID in newRoads) {
          if (!Array.isArray(newRoads[roadID].contents.selectedSubjects[0])) {
            newRoads[roadID].contents.selectedSubjects = this.getSimpleSelectedSubjects(newRoads[roadID].contents.selectedSubjects);
          }
          if (newRoads[roadID].contents.progressAssertions === undefined) {
            newRoads[roadID].contents.progressAssertions = {};
          }
        }
        if (this.justLoaded) {
          if (!(this.activeRoad in newRoads)) {
            this.$store.commit('setActiveRoad', Object.keys(newRoads)[0]);
          }
          this.$store.commit('setRoads', newRoads);
        } else {
          this.$store.commit('setRoads', Object.assign(newRoads, this.roads));
        }
        this.newRoads = Object.keys(newRoads);
      }
      this.$store.commit('allowCookies');
    }

    if (this.$cookies.isKey('accessInfo')) {
      this.accessInfo = this.$cookies.get('accessInfo');
      this.loggedIn = true;
      this.$store.commit('allowCookies');
      this.verify().then(() => {
        this.getUserData();
      });
    }

    this.setTabID();

    window.onbeforeunload = function () {
      if (this.cookiesAllowed) {
        const tabID = sessionStorage.tabID;
        let tabs = [];
        if (this.$cookies.isKey('tabs')) {
          tabs = this.$cookies.get('tabs').ids;
        }
        const tabIndex = tabs.indexOf(tabID);
        tabs.splice(tabIndex, 1);
        if (tabs.length) {
          this.$cookies.set('tabs', { 'ids': tabs });
        } else {
          this.$cookies.remove('tabs');
        }
      }
      if (this.currentlySaving) {
        return 'Are you sure you want to leave?  Your roads are not saved.';
      }
    }.bind(this);

    this.attemptLogin();
    // window.cookies=this.$cookies;
  },
  methods: {
    loginUser: function (event) {
      window.setLocationHref(`${process.env.VUE_APP_FIREROAD_URL}/login/?redirect=${process.env.VUE_APP_URL}`);
      if (this.cookiesAllowed) {
        this.$cookies.set('hasLoggedIn', true);
      }
    },
    logoutUser: function (event) {
      this.$cookies.remove('accessInfo');
      if (this.cookiesAllowed) {
        this.$cookies.set('hasLoggedIn', false);
      }
      localStorage.clear();
      this.loggedIn = false;
      this.accessInfo = undefined;
      window.location.reload();
    },
    verify: function () {
      const headerList = { headers: {
        'Authorization': 'Bearer ' + this.accessInfo.access_token
      } };
      const currentMonth = new Date().getMonth();
      return axios.get(process.env.VUE_APP_FIREROAD_URL + '/verify/', headerList)
        .then(function (verifyResponse) {
          if (verifyResponse.data.success) {
            this.$store.commit('setCurrentSemester', verifyResponse.data.current_semester - (currentMonth === 4 ? 1 : 0));
            return verifyResponse.data;
          } else {
            this.logoutUser();
            return Promise.reject(new Error('Token not valid'));
          }
        }.bind(this)).catch(function (err) {
          this.logoutUser();
          return Promise.reject(err);
        });
    },
    doSecure: function (axiosFunc, link, params) {
      if (this.loggedIn && this.accessInfo !== undefined) {
        const headerList = { headers: {
          'Authorization': 'Bearer ' + this.accessInfo.access_token
        } };
        return params
          ? axiosFunc(process.env.VUE_APP_FIREROAD_URL + link, params, headerList)
          : axiosFunc(process.env.VUE_APP_FIREROAD_URL + link, headerList);
      } else {
        return Promise.reject(new Error('No auth information'));
      }
    },
    getSecure: function (link) {
      return this.doSecure(axios.get, link, false);
    },
    postSecure: function (link, params) {
      return this.doSecure(axios.post, link, params);
    },
    retrieveRoad: function (roadID) {
      const _this = this;
      this.gettingUserData = true;
      return this.getSecure('/sync/roads/?id=' + roadID).then(function (roadData) {
        if (roadData.status === 200 && roadData.data.success) {
          roadData.data.file.downloaded = moment().format(DATE_FORMAT);
          roadData.data.file.changed = moment().format(DATE_FORMAT);
        }

        _this.sanitizeRoad(roadData.data.file);

        _this.$store.commit('setRoad', {
          id: roadID,
          road: roadData.data.file,
          ignoreSet: true
        });

        _this.$store.commit('setRetrieved', roadID);

        _this.gettingUserData = false;
        return roadData;
      });
    },
    sanitizeRoad: function (road) {
      // sanitize subject_id
      const newss = road.contents.selectedSubjects.map((s) => {
        if ('subject_id' in s) {
          s.id = s.subject_id;
          delete s.subject_id;
        }
        return s;
      });

      road.contents.selectedSubjects = newss;

      // convert selected subjects to more convenient format
      road.contents.selectedSubjects = this.getSimpleSelectedSubjects(road.contents.selectedSubjects);
      // sanitize progressOverrides
      if (road.contents.progressOverrides === undefined) {
        road.contents.progressOverrides = {};
      }
      // sanitize progressAssertions
      if (road.contents.progressAssertions === undefined) {
        road.contents.progressAssertions = {};
      }
    },
    getUserData: function () {
      this.gettingUserData = true;
      this.getSecure('/sync/roads/')
        .then(function (response) {
          if (response.status === 200 && response.data.success) {
            return response.data.files;
          } else {
            return Promise.reject(new Error('sync request not successfull in getUserData'));
          }
        }).then(function (files) {
          this.renumberRoads(files);
          for (var i = 0; i < this.newRoads.length; i++) {
            this.saveRemote(this.newRoads[i]);
          }
          const fileKeys = Object.keys(files);
          for (i = 0; i < fileKeys.length; i++) {
            const blankRoad = {
              downloaded: moment().format(DATE_FORMAT),
              changed: files[fileKeys[i]].changed,
              name: files[fileKeys[i]].name,
              agent: files[fileKeys[i]].agent,
              contents: {
                coursesOfStudy: ['girs'],
                selectedSubjects: Array.from(Array(16), () => []),
                progressOverrides: {},
                progressAssertions: {}
              }
            };
            this.$store.commit('setRoad', {
              id: fileKeys[i],
              road: blankRoad,
              ignoreSet: true
            });
          }
          if (this.justLoaded && fileKeys.length > 0) {
            this.$store.commit('deleteRoad', '$defaultroad$');
          }
          if (fileKeys.includes(this.$route.params.road)) {
            this.$store.commit('setActiveRoad', this.$route.params.road);
          } else {
            this.$store.commit('setActiveRoad', Object.keys(this.roads)[0]);
          }
          // Set list of unretrieved roads to all but first road ID
          this.$store.commit('setUnretrieved', fileKeys);
          if (fileKeys.length) {
            // Retrieves based on url and defaults to first road if unable to find it
            if (fileKeys.includes(this.$route.params.road)) {
              return this.retrieveRoad(this.$route.params.road);
            } else {
              return this.retrieveRoad(fileKeys[0]);
            }
          }
        }.bind(this)).then(function () {
          this.gettingUserData = false;
        }.bind(this)).catch(function (err) {
          alert(err);
          this.gettingUserData = false;
          if (err === 'Token not valid') {
            alert('Your token has expired.  Please log in again.');
          }
          this.logoutUser();
        }.bind(this));
    },

    renumber: function (name, otherNames) {
      let newName;
      let copyIndex = 2;
      while (newName === undefined) {
        const copyName = name + ' (' + copyIndex + ')';
        if (otherNames.indexOf(copyName) === -1) {
          newName = copyName;
        }
        copyIndex++;
      }
      return newName;
    },
    renumberRoads: function (cloudFiles) {
      const cloudRoads = Object.keys(cloudFiles).map((id) => cloudFiles[id]);
      const cloudNames = cloudRoads.map(function (cr) {
        try {
          return cr.name;
        } catch (err) {
          return undefined;
        }
      });
      for (const roadID in this.roads) {
        const localName = this.roads[roadID].name;
        if (cloudNames.indexOf(localName) >= 0) {
          const renumberedName = this.renumber(localName, cloudNames);
          this.$store.commit('setRoadName', {
            id: roadID,
            name: renumberedName
          });
        }
      }
    },

    getAuthorizationToken: function (code) {
      axios.get(process.env.VUE_APP_FIREROAD_URL + '/fetch_token/?code=' + code)
        .then(function (response) {
          if (response.data.success) {
            if (this.data.cookiesAllowed) {
              this.data.$cookies.set('accessInfo', response.data.access_info, '3d');
            }
            this.data.accessInfo = response.data.access_info;
            this.data.verify();
            this.data.loggedIn = true;
            this.data.getUserData();
          }
        }.bind({ data: this }));
    },

    attemptLogin: function () {
      const queryObject = getQueryObject();
      if ('code' in queryObject) {
        const code = queryObject['code'];
        window.history.pushState('CourseRoad Home', 'CourseRoad Home', './#' + this.activeRoad);
        this.getAuthorizationToken(code);
      } else if (this.$cookies.get('hasLoggedIn') === 'true' && !this.loggedIn) {
        this.loginUser();
      }
    },
    save: function (roadID) {
      if (this.loggedIn) {
        this.saveRemote(roadID);
      } else {
        this.saveLocal();
      }
    },
    saveRemote: function (roadID, override) {
      if (override === undefined) {
        override = false;
      }
      this.currentlySaving = true;
      this.saveWarnings = [];
      const assignKeys = { override: override, agent: this.getAgent() };
      if (!roadID.includes('$')) {
        assignKeys.id = roadID;
      }
      const roadSubjects = this.flatten(this.roads[roadID].contents.selectedSubjects);
      const formattedRoadContents = Object.assign({ coursesOfStudy: ['girs'], progressOverrides: [], progressAssertions: {} }, this.roads[roadID].contents, { selectedSubjects: roadSubjects });
      const roadToSend = {};
      Object.assign(roadToSend, this.roads[roadID], { contents: formattedRoadContents }, assignKeys);
      const savePromise = this.postSecure('/sync/sync_road/', roadToSend)
        .then(function (response) {
          if (response.status !== 200) {
            return Promise.reject(new Error('Unable to save road ' + this.oldid));
          } else {
            const newid = (response.data.id !== undefined ? response.data.id : this.oldid);
            if (response.data.success === false) {
              this.data.saveWarnings.push({ id: newid, error: response.data.error_msg, name: this.data.roads[this.oldid].name });
            }
            if (response.data.result === 'conflict') {
              const conflictInfo = { id: this.oldid, other_name: response.data.other_name, other_agent: response.data.other_agent, other_date: response.data.other_date, other_contents: response.data.other_contents, this_agent: response.data.this_agent, this_date: response.data.this_date };
              this.data.$store.commit('setRoadProp', {
                id: this.oldid,
                prop: 'agent',
                value: this.data.getAgent(),
                ignoreSet: true
              });
              this.data.$emit('conflict', conflictInfo);

              return Promise.resolve({ oldid: this.oldid, state: 'same' });
            } else if (response.data.result === 'update_local') {
              alert('Server has more recent edits.  Overriding local road.  If this is unexpected, check that your computer clock is accurate.');

              const updatedRoad = {
                downloaded: moment().format(DATE_FORMAT),
                changed: response.data.changed,
                name: response.data.name,
                agent: this.data.getAgent(),
                contents: response.data.contents
              };

              this.data.sanitizeRoad(updatedRoad);

              this.data.$store.commit('setRoad', {
                id: this.oldid,
                road: updatedRoad,
                ignoreSet: false
              });

              return Promise.resolve({ oldid: this.oldid, newid: response.data.id, state: 'same' });
            } else {
              this.data.$store.commit('setRoadProp', {
                id: this.oldid,
                prop: 'downloaded',
                value: moment().format(DATE_FORMAT),
                ignoreSet: true
              });

              if (response.data.id !== undefined) {
                // note: code moved to app.vue for reset id
                // this is to fix a problem where the activeroad gets reset to the first one
                // i suspect this is because the three events required were not happening
                // in the correct order or something
                if (this.oldid !== response.data.id.toString()) {
                  this.data.$store.commit('resetID', { oldid: this.oldid, newid: response.data.id });
                }
                return Promise.resolve({ oldid: this.oldid, newid: response.data.id, state: 'changed' });
              } else {
                return Promise.resolve({ oldid: this.oldid, newid: this.oldid, state: 'same' });
              }
            }
          }
        }.bind({ oldid: roadID, data: this }));
      savePromise.then(function (saveResult) {
        if (saveResult.state === 'changed') {
          const oldIdIndex = this.newRoads.indexOf(saveResult.oldid);
          if (oldIdIndex >= 0) {
            this.newRoads.splice(oldIdIndex, 1);
          }
        }
        if (this.$cookies.isKey('newRoads')) {
          this.$cookies.set('newRoads', this.getNewRoadData());
        }
        this.currentlySaving = false;
      }.bind(this)).catch(function (err) {
        console.log(err);
        this.currentlySaving = false;
      }.bind(this));
    },
    saveLocal: function () {
      this.currentlySaving = true;
      if (this.cookiesAllowed) {
        this.$cookies.set('newRoads', this.getNewRoadData());
      }
      for (const roadID in this.roads) {
        this.$store.commit('setRoadProp', {
          id: roadID,
          prop: 'downloaded',
          value: moment().format(DATE_FORMAT),
          ignoreSet: true
        });
      }
      this.currentlySaving = false;
    },
    getNewRoadData: function () {
      const newRoadData = {};
      if (this.newRoads.indexOf('$defaultroad$') === -1 && '$defaultroad$' in this.roads) {
        if (this.flatten(this.roads['$defaultroad$'].contents.selectedSubjects).length > 0 || JSON.stringify(Array.from(this.roads['$defaultroad$'].contents.coursesOfStudy)) !== '["girs"]') {
          this.newRoads.push('$defaultroad$');
        }
      }
      for (let r = 0; r < this.newRoads.length; r++) {
        const roadID = this.newRoads[r];
        if (roadID in this.roads) {
          newRoadData[roadID] = this.roads[roadID];
        }
      }
      return newRoadData;
    },
    updateRemote: function (roadID) {
      this.saveRemote(roadID, true);
      this.$emit('resolve-conflict');
    },

    updateLocal: function (roadID) {
      const remoteRoad = {
        name: this.conflictInfo.other_name,
        agent: this.conflictInfo.other_agent,
        changed: this.conflictInfo.other_date,
        contents: this.conflictInfo.other_contents,
        downloaded: moment().format(DATE_FORMAT)
      };
      this.sanitizeRoad(remoteRoad);
      this.$store.commit('setRoad', {
        id: roadID,
        road: remoteRoad,
        ignoreSet: false
      });
      this.$emit('resolve-conflict');
    },

    deleteRoad: function (roadID) {
      if (this.activeRoad === roadID) {
        const roadIndex = Object.keys(this.roads).indexOf(roadID);
        const withoutRoad = Object.keys(this.roads).slice(0, roadIndex).concat(Object.keys(this.roads).slice(roadIndex + 1));
        if (withoutRoad.length) {
          if (withoutRoad.length > roadIndex) {
            this.$store.commit('setActiveRoad', withoutRoad[roadIndex]);
          } else {
            this.$store.commit('setActiveRoad', withoutRoad[roadIndex - 1]);
          }
        } else {
          this.$store.commit('setActiveRoad', '');
        }
      }
      this.$store.commit('deleteRoad', roadID);

      if (roadID in this.newRoads) {
        const roadIndex = this.newRoads.indexOf(roadID);
        this.newRoads.splice(roadIndex, 1);
      }

      if (this.loggedIn) {
        if (roadID.indexOf('$') < 0) {
          this.postSecure('/sync/delete_road/', { id: roadID });
        }
      }
    },
    getAgent: function () {
      const ua = UAParser(navigator.userAgent);
      return navigator.platform + ' ' + ua.browser.name + ' Tab ' + this.tabID;
    },
    setTabID: function () {
      if (this.cookiesAllowed) {
        if (sessionStorage.tabID !== undefined) {
          this.tabID = sessionStorage.tabID;
          const tabNum = parseInt(this.tabID);
          if (this.$cookies.isKey('tabs')) {
            var tabs = this.$cookies.get('tabs').ids;
            if (tabs.indexOf(tabNum) === -1) {
              tabs.push(tabNum);
              this.$cookies.set('tabs', { 'ids': tabs });
            }
          } else {
            this.$cookies.set('tabs', { 'ids': [tabNum] });
          }
        } else {
          // TODO: look into whether this = sign is acting correctly?
          if (this.$cookies.isKey('tabs') && (tabs = this.$cookies.get('tabs').ids)) {
            const maxTab = Math.max(...tabs);
            const newTab = (maxTab + 1).toString();
            sessionStorage.tabID = newTab;
            this.tabID = newTab;
            tabs.push(maxTab + 1);
            this.$cookies.set('tabs', { 'ids': tabs });
          } else {
            sessionStorage.tabID = '1';
            this.tabID = '1';
            this.$cookies.set('tabs', { 'ids': [1] });
          }
        }
      }
    },
    changeSemester: function (year) {
      if (this.cookiesAllowed) {
        this.$cookies.set('has_set_year', true);
      }
      const currentMonth = new Date().getMonth();
      const sem = currentMonth >= 5 && currentMonth <= 10
        ? 1 + year * 3
        : 3 + year * 3;
      this.postSecure('/set_semester/', { semester: sem + (currentMonth === 4 ? 1 : 0) }).then(function (res) {
        if (res.status === 200 && res.data.success) {
          this.$store.commit('setCurrentSemester', sem);
        }
      }.bind(this)).catch(function (err) {
        if (err.message === 'No auth information') {
          this.$store.commit('setCurrentSemester', sem);
        }
      }.bind(this));
    }
  }
};
</script>

<style scoped>
.collapse-button {
  min-width: 0;
}
</style>
