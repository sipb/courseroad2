<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <v-app
    id="app-wrapper"
  >
    <v-dialog v-model="showMobile" fullscreen>
      <v-card height="100%">
        <v-container fill-height>
          <v-layout column>
            <v-flex grow>
              <v-card-title primary-title>
                <h1 style="font-size: 3em;">
                  Hello there!
                </h1>
              </v-card-title>
              <v-card-text>
                <p style="font-size: 1.5em;">
                  It looks like you're browsing CourseRoad from mobile! For a better mobile experience, consider downloading
                  the FireRoad app instead, available on Android and iOS.
                </p>
              </v-card-text>
            </v-flex>
            <v-flex shrink style="justify-content: center;">
              <v-btn style="width: 100%; margin: 0 0 10% 0;" :href="appLink" color="info">
                <v-icon>vertical_align_bottom</v-icon> Download
              </v-btn><br>
              <a href="#" style="font-size: 1.25em; display: block; text-align: center;" @click="showMobile = false">No thanks, take me to the desktop site.</a>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
    <v-toolbar fixed app dense class="elevation-2">
      <road-tabs
        slot="extension"
        :roads="roads"
        :active-road="activeRoad"
        :subjects="subjectsInfo"
        @delete-road="$refs.authcomponent.deleteRoad($event)"
        @set-name="setRoadName($event.road, $event.name)"
        @add-road="addRoad(...arguments)"
        @change-active="changeActiveRoad($event)"
      />

      <import-export
        :roads="roads"
        :active-road="activeRoad"
        :subjects="subjectsInfo"
        :subjects-index="subjectsIndexDict"
        :generic-courses="genericCourses"
        :generic-index="genericIndexDict"
        @add-road="addRoad(...arguments)"
      />

      <v-spacer />

      <auth
        ref="authcomponent"
        :roads="roads"
        :just-loaded="justLoaded"
        :active-road="activeRoad"
        :conflict-info="conflictInfo"
        @delete-road="deleteRoad"
        @set-road="setRoad(...arguments)"
        @set-roads="roads = $event"
        @set-active="setActive"
        @conflict="conflict"
        @resolve-conflict="resolveConflict"
        @set-road-prop="setRoadProp(...arguments)"
        @reset-id="resetID(...arguments)"
        @allow-cookies="allowCookies"
        @set-sem="setSemester"
      />

      <v-spacer />

      <v-menu
        v-model="showSearch"
        attach
        :close-on-content-click="false"
        :close-on-click="false"
        fixed
        offset-y
        input-activator
      >
        <v-text-field
          id="searchInputTF"
          slot="activator"
          v-model="searchInput"
          autocomplete="false"
          class="expanded-search"
          prepend-icon="search"
          placeholder="Add classes"
          autofocus
        />
        <class-search
          id="searchMenu"
          ref="searchMenu"
          class="search-menu"
          :search-input="searchInput"
          :subjects="subjectsInfo"
          :generic-courses="genericCourses"
          :class-info-stack="classInfoStack"
          :cookies-allowed="cookiesAllowed"
          @add-class="addClass"
          @view-class-info="pushClassStack"
          @drag-start-class="dragStartClass"
        />
      </v-menu>
    </v-toolbar>

    <v-navigation-drawer
      id="left-panel"
      width="350"
      mobile-break-point="600"
      class="side-panel elevation-2 scroller"
      app
    >
      <v-container fill-height style="padding: 0;">
        <v-layout fill-height column>
          <v-layout shrink style="padding: 14px; padding-bottom: 0;" row align-center>
            <v-flex shrink class="blue-grey lighten-5" style="user-select: none; color: inherit; text-decoration: none; border-radius: 2px; padding: 6px 8px; display: inline-block;">
              <v-icon size="1.3em" color="#00b300">
                check_box
              </v-icon>
              <h3 style="display: inline;">
                C o u r s e R o a d
              </h3>
            </v-flex>
            <v-flex>
              <router-link to="/about" style="float: right;">
                About
              </router-link>
            </v-flex>
          </v-layout>
          <audit
            v-if="activeRoad !== ''"
            :req-trees="reqTrees"
            :selected-reqs="roads[activeRoad].contents.coursesOfStudy"
            :selected-subjects="roads[activeRoad].contents.selectedSubjects"
            :req-list="reqList"
            :subjects="subjectsInfo"
            :subject-index="subjectsIndexDict"
            :generic-courses="genericCourses"
            :generic-index="genericIndexDict"
            :progress-overrides="roads[activeRoad].contents.progressOverrides"
            @drag-start-class="dragStartClass"
            @add-req="addReq"
            @remove-req="removeReq"
            @push-stack="pushClassStack"
            @update-progress="updateProgress"
          />
          <v-flex shrink style="padding: 14px; padding-bottom: 0;">
            <p>
              <b>Warning:</b> This is an unofficial tool that may not accurately
              reflect degree progress. Please view the
              <a target="_blank" href="https://student.mit.edu/cgi-bin/shrwsdau.sh">official audit</a>,
              <a target="_blank" href="http://student.mit.edu/catalog/index.cgi">course catalog</a>, and
              <a target="_blank" href="http://catalog.mit.edu/degree-charts/">degree charts</a>
              and confirm with your department advisors.
            </p>
            <p>
              Problems with the course requirements? Request edits
              <a target="_blank" href="https://fireroad.mit.edu/requirements/">here</a> or
              send an email to <a target="_blank" href="mailto:courseroad@mit.edu">courseroad@mit.edu</a>.
            </p>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- TODO: will need to add event for when the child can edit selectedReqs probably -->
    </v-navigation-drawer>

    <v-content id="center-panel" app>
      <v-tabs-items v-model="activeRoad">
        <v-tab-item
          v-for="roadId in Object.keys(roads)"
          :key="roadId"
          :value="roadId"
        >
          <road
            :selected-subjects="roads[roadId].contents.selectedSubjects"
            :subjects="subjectsInfo"
            :road-i-d="roadId"
            :current-semester="currentSemester"
            :adding-from-card="addingFromCard && activeRoad===roadId"
            :item-adding="itemAdding"
            :subjects-index="subjectsIndexDict"
            :generic-courses="genericCourses"
            :generic-index="genericIndexDict"
            :drag-semester-num="(activeRoad===roadId) ? dragSemesterNum : -1"
            @add-at-placeholder="addAtPlaceholder"
            @add-class="addClass"
            @move-class="moveClass($event.classIndex,$event.semester)"
            @remove-class="removeClass"
            @click-class="pushClassStack($event.id)"
            @change-year="$refs.authcomponent.changeSemester($event)"
            @override-warnings="overrideWarnings($event.override,$event.classInfo)"
            @drag-start-class="dragStartClass"
          />
        </v-tab-item>
      </v-tabs-items>

      <conflict-dialog
        ref="conflictdialog"
        :conflict-info="conflictInfo"
        :conflict-dialog="conflictDialog"
        :roads="roads"
        @update-local="updateLocal"
        @update-remote="updateRemote"
      />
    </v-content>

    <class-info
      v-if="classInfoStack.length"
      :class-info-stack="classInfoStack"
      :subjects="subjectsInfo"
      :subjects-index="subjectsIndexDict"
      :adding-from-card="addingFromCard"
      :generic-courses="genericCourses"
      :generic-index="genericIndexDict"
      @pop-stack="popClassStack"
      @push-stack="pushClassStack"
      @add-class="addFromCard"
      @cancel-add-class="cancelAddFromCard"
      @close-classinfo="classInfoStack = []"
      @click.native="$event.stopPropagation()"
    />

    <v-footer v-if="!dismissedOld || (!cookiesAllowed && !dismissedCookies)" fixed class="py-1 px-2" style="height: unset;">
      <v-layout column>
        <v-flex v-if="!dismissedOld">
          <v-layout row align-center>
            <v-flex>
              Looking for the old courseroad?  Visit the old website <a target="_blank" href="https://courseroad.mit.edu/old">here</a> and export your roads!
            </v-flex>
            <v-flex shrink>
              <v-btn small icon flat class="ma-1" @click="dismissedOld = true;">
                <v-icon>close</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-divider v-if="!dismissedOld && !cookiesAllowed && !dismissedCookies" class="ma-1" />
        <v-flex v-if="!cookiesAllowed && !dismissedCookies">
          <v-layout row align-center>
            <v-flex>
              This site uses cookies and session storage to store your data and login token.  Click OK to consent to the use of cookies.
            </v-flex>
            <v-flex shrink>
              <v-btn small depressed color="primary" class="ma-1" @click="allowCookies">
                OK
              </v-btn>
            </v-flex>
            <v-flex shrink>
              <v-btn small icon flat class="ma-1" @click="dismissedCookies = true;">
                <v-icon>close</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import Audit from './../components/Audit.vue';
import ClassSearch from './../components/ClassSearch.vue';
import Road from './../components/Road.vue';
import FilterSet from './../components/FilterSet.vue';
import RoadTabs from './../components/RoadTabs.vue';
import ConflictDialog from './../components/ConflictDialog.vue';
import Auth from './../components/Auth.vue';
import $ from 'jquery';
import UAParser from 'ua-parser-js';
import Vue from 'vue';
import ClassInfo from './../components/ClassInfo.vue';
import ImportExport from './../components/ImportExport.vue';

var DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

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
    'import-export': ImportExport
  },
  data: function () {
    return {
      reqTrees: {},
      reqList: [],
      dragSemesterNum: -1,
      gettingUserData: false,
      cookieName: 'Default Cookie',
      accessInfo: undefined,
      // A list of dictionaries containing info on current mit subjects. (actually filled in correctly below)
      subjectsInfo: [],
      subjectsIndexDict: {},
      genericCourses: [],
      genericIndexDict: {},
      rightDrawer: true,
      activeRoad: '$defaultroad$',
      newRoadName: '',
      justLoaded: true,
      currentlySaving: false,
      saveWarnings: [],
      conflictDialog: false,
      conflictInfo: undefined,
      cookiesAllowed: false,
      searchInput: '',
      showSearch: false,
      classInfoStack: [],
      currentSemester: 0,
      addingFromCard: false,
      itemAdding: undefined,
      dismissedOld: false,
      dismissedCookies: false,
      // TODO: Really we should grab this from a global datastore
      // now in the same format as FireRoad

      // note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
      roads: {
        '$defaultroad$': {
          downloaded: moment().format(DATE_FORMAT),
          changed: moment().format(DATE_FORMAT),
          name: 'My First Road',
          agent: '',
          contents: {
            coursesOfStudy: ['girs'],
            selectedSubjects: [],
            progressOverrides: {}
          }
        }
      },
      showMobile: ['mobile', 'tablet'].indexOf(new UAParser(navigator.userAgent).getDevice().type) !== -1
    };
  },
  computed: {
    appLink: function () {
      switch (new UAParser(navigator.userAgent).getOS().name) {
        case 'Android':
          return 'http://play.google.com/store/apps/details?id=com.base12innovations.android.fireroad';
        case 'iOS':
          return 'https://itunes.apple.com/us/app/fireroad-mit-course-planner/id1330678450?mt=8';
        default:
          return null;
      }
    },
    roadref: function () {
      return '#road' + this.activeRoad;
    }
  },
  watch: {
    // call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function (newRoad, oldRoad) {
      this.justLoaded = false;
      if (newRoad !== '') {
        window.history.pushState({}, this.roads[newRoad].name, './#/#road' + newRoad);
        this.updateFulfillment();
      }
    },
    roads: {
      handler: function (newRoads, oldRoads) {
        this.justLoaded = false;
        if (this.activeRoad != '') {
          this.updateFulfillment();
        }
        this.$refs.authcomponent.save();
      },
      deep: true
    },
    searchInput: function (newSearch, oldSearch) {
      if (newSearch.length > 0) {
        this.showSearch = true;
      }
    }
  },
  mounted () {
    var borders = $('.v-navigation-drawer__border');
    var scrollers = $('.scroller');
    var scrollWidth = scrollers.width();

    // moves nav drawer border with scroll
    // if the effect proves too annoying we can remove the borders instead
    // (commented out below)

    scrollers.scroll(function () {
      var scrollPosition = scrollers.scrollLeft();
      borders.css({ top: 0, left: scrollWidth - 1 + scrollPosition });
    });

    $(window).on('hashchange', function () {
      this.setActiveRoad();
    }.bind(this));

    this.setActiveRoad();

    axios.get(process.env.FIREROAD_URL + `/requirements/list_reqs/`)
      .then(response => {
        const ordered = {};
        Object.keys(response.data).sort().forEach(function (key) {
          ordered[key] = response.data[key];
        });
        this.reqList = ordered;
      });

    this.updateFulfillment();

    document.body.addEventListener('click', function (e) {
      this.showSearch = false;
    }.bind(this));

    // developer.mit.edu version commented out because I couldn't get it to work. filed an issue to resolve it.
    // axios.get('https://mit-course-catalog-v2.cloudhub.io/coursecatalog/v2/terms/2018FA/subjects', {headers:{client_id:'01fce9ed7f9d4d26939a68a4126add9b', client_secret:'D4ce51aA6A32421DA9AddF4188b93255'}})
    // , 'Accept': 'application/json'} ?
    // full=true is ~3x bigger but has some great info like "in_class_hours" and "rating"
    axios.get(process.env.FIREROAD_URL + `/courses/all?full=true`)
      .then(response => {
        this.subjectsInfo = response.data;
        this.genericCourses = this.makeGenericCourses();
        this.subjectsIndexDict = this.subjectsInfo.reduce(function (obj, item, index) {
          obj[item.subject_id] = index;
          return obj;
        }, {});
        this.genericIndexDict = this.genericCourses.reduce(function (obj, item, index) {
          obj[item.subject_id] = index;
          return obj;
        }, {});
      });
  },
  methods: {
    addClass: function (newClass) {
      this.roads[this.activeRoad].contents.selectedSubjects.push(newClass);
      Vue.set(this.roads[this.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    moveClass: function (classIndex, newSem) {
      this.roads[this.activeRoad].contents.selectedSubjects[classIndex].semester = newSem;
      Vue.set(this.roads[this.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    removeClass: function (classInfo) {
      var classIndex = this.roads[this.activeRoad].contents.selectedSubjects.indexOf(classInfo);
      this.roads[this.activeRoad].contents.selectedSubjects.splice(classIndex, 1);
      Vue.set(this.roads[this.activeRoad], 'changed', moment().format(DATE_FORMAT));
    },
    resetID: function (oldid, newid) {
      newid = newid.toString();
      Vue.set(this.roads, newid, this.roads[oldid]);
      if (this.activeRoad === oldid) {
        this.activeRoad = newid;
      }
      Vue.delete(this.roads, oldid);
    },
    dragStartClass: function (event) {
      var classInfo = event.classInfo;
      if (classInfo === undefined) {
        if (event.basicClass.id in this.subjectsIndexDict) {
          classInfo = this.subjectsInfo[this.subjectsIndexDict[event.basicClass.id]];
        } else if (event.basicClass.id in this.genericIndexDict) {
          classInfo = this.genericCourses[this.genericIndexDict[event.basicClass.id]];
        }
      }
      this.itemAdding = classInfo;
      this.addingFromCard = false;
    },
    updateFulfillment: function () {
      for (var r = 0; r < this.roads[this.activeRoad].contents.coursesOfStudy.length; r++) {
        var req = this.roads[this.activeRoad].contents.coursesOfStudy[r];
        axios.post(process.env.FIREROAD_URL + `/requirements/progress/` + req + `/`, this.roads[this.activeRoad].contents).then(function (response) {
          // This is necessary so Vue knows about the new property on reqTrees
          Vue.set(this.data.reqTrees, this.req, response.data);
        }.bind({ data: this, req: req }));
      }
    },
    addReq: function (event) {
      this.roads[this.activeRoad].contents.coursesOfStudy.push(event);
      Vue.set(this.roads, this.activeRoad, this.roads[this.activeRoad]);
    },
    removeReq: function (event) {
      var reqIndex = this.roads[this.activeRoad].contents.coursesOfStudy.indexOf(event);
      this.roads[this.activeRoad].contents.coursesOfStudy.splice(reqIndex, 1);
    },
    setActiveRoad: function () {
      var roadHash = window.location.hash;
      if (roadHash.length && roadHash.substring(0, 7) === '#/#road') {
        var roadRequested = roadHash.substring(7);
        if (roadRequested in this.roads) {
          this.activeRoad = roadHash.substring(7);
          return true;
        }
      }
      window.location.hash = '#/#road' + this.activeRoad;
      return false;
    },
    addRoad: function (roadName, cos = ['girs'], ss = [], overrides = {}) {
      var tempRoadID = '$' + this.$refs.authcomponent.newRoads.length + '$';
      var newContents = {
        coursesOfStudy: cos,
        selectedSubjects: ss,
        progressOverrides: overrides
      };
      var newRoad = {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: roadName,
        agent: '',
        contents: newContents
      };
      Vue.set(this.roads, tempRoadID, newRoad);
      this.$refs.authcomponent.newRoads.push(tempRoadID);
      this.activeRoad = tempRoadID;
    },

    setRoadName: function (roadID, roadName) {
      Vue.set(this.roads[roadID], 'name', roadName);
    },
    changeActiveRoad: function (event) {
      this.activeRoad = event;
    },
    deleteRoad: function (roadID) {
      Vue.delete(this.roads, roadID);
    },
    setRoad: function (roadID, newRoad) {
      Vue.set(this.roads, roadID, newRoad);
    },
    setActive: function (roadID) {
      this.activeRoad = roadID;
    },
    conflict: function (conflictInfo) {
      this.$refs.conflictdialog.startConflict();
      this.conflictInfo = conflictInfo;
    },
    resolveConflict: function () {
      this.$refs.conflictdialog.resolveConflict();
      this.conflictInfo = undefined;
    },
    setRoadProp: function (roadID, roadProp, propValue) {
      Vue.set(this.roads[roadID], roadProp, propValue);
    },
    allowCookies: function () {
      this.$refs.authcomponent.allowCookies();
      this.cookiesAllowed = true;
    },
    updateLocal: function (id) {
      this.$refs.authcomponent.updateLocal(id);
    },
    updateRemote: function (id) {
      this.$refs.authcomponent.updateRemote(id);
    },
    setSemester: function (sem) {
      this.currentSemester = sem;
    },
    pushClassStack: function (id) {
      if (id in this.subjectsIndexDict || id in this.genericIndexDict) {
        this.classInfoStack.push(id);
      }
    },
    popClassStack: function () {
      this.classInfoStack.pop();
    },
    addFromCard: function (classItem) {
      this.addingFromCard = true;
      this.itemAdding = classItem;
    },
    cancelAddFromCard: function () {
      this.addingFromCard = false;
      this.itemAdding = undefined;
    },
    addAtPlaceholder: function (index) {
      var newClass = {
        overrideWarnings: false,
        semester: index,
        title: this.itemAdding.title,
        id: this.itemAdding.subject_id,
        units: this.itemAdding.total_units
      };
      this.addClass(newClass);
      this.addingFromCard = false;
      this.itemAdding = undefined;
    },
    getMatchingAttributes: function (gir, hass, ci) {
      var matchingClasses = this.subjectsInfo.filter(function (subject) {
        if (gir !== undefined && subject.gir_attribute !== gir) {
          return false;
        }
        if (hass !== undefined && subject.hass_attribute !== hass) {
          return false;
        }
        if (ci !== undefined && subject.communication_requirement !== ci) {
          return false;
        }
        return true;
      });
      var totalObject = matchingClasses.reduce(function (accumObject, nextClass) {
        return {
          offered_spring: accumObject.offered_spring || nextClass.offered_spring,
          offered_summer: accumObject.offered_summer || nextClass.offered_summer,
          offered_IAP: accumObject.offered_IAP || nextClass.offered_IAP,
          offered_fall: accumObject.offered_fall || nextClass.offered_fall,
          in_class_hours: accumObject.in_class_hours + (nextClass.in_class_hours !== undefined ? nextClass.in_class_hours : 0),
          out_of_class_hours: accumObject.out_of_class_hours + (nextClass.out_of_class_hours !== undefined ? nextClass.out_of_class_hours : 0)
        };
      }, { offered_spring: false, offered_summer: false, offered_IAP: false, offered_fall: false, in_class_hours: 0, out_of_class_hours: 0 });
      totalObject.in_class_hours /= matchingClasses.length;
      totalObject.out_of_class_hours /= matchingClasses.length;
      return totalObject;
    },
    makeGenericCourses: function () {
      var girAttributes = { 'PHY1': ['Physics 1 GIR', 'p1'], 'PHY2': ['Physics 2 GIR', 'p2'], 'CHEM': ['Chemistry GIR', 'c'], 'BIOL': ['Biology GIR', 'b'], 'CAL1': ['Calculus I GIR', 'm1'], 'CAL2': ['Calculus II GIR', 'm2'], 'LAB': ['Lab GIR', 'l1'], 'REST': ['REST GIR', 'r'] };
      // the titles of the hass and ci attributes are currently not used in the description on fireroad
      // I think they might be nice to display with the description, but as of now they are unused
      var hassAttributes = { 'HASS-A': ['HASS Arts', 'ha'], 'HASS-S': ['HASS Social Sciences', 'hs'], 'HASS-H': ['Hass Humanities', 'hh'] };
      var ciAttributes = { 'CI-H': ['Communication Intensive', 'hc'], 'CI-HW': ['Communication Intensive with Writing', 'hw'] };
      var genericCourses = [];
      var baseGeneric = {
        description: 'Use this generic subject to indicate that you are fulfilling a requirement, but do not yet have a specific subject selected.',
        total_units: 12
      };
      // biol:b, chem: c, lab: l1, partial lab: l2, rest: r, calc1: m1, calc2: m2, phys1: p1, phys2: p2
      // hass-a: ha, hass-h: hh, hass-s: hs, hass elective: ht, hass subject: h%5Bahst%5D
      // commun_int - cih: hc, cihw: hw
      var baseurl = 'http://student.mit.edu/catalog/search.cgi?search=&style=verbatim&when=*&termleng=4&days_offered=*&start_time=*&duration=*&total_units=*';
      for (var gir in girAttributes) {
        var offeredGir = this.getMatchingAttributes(gir, undefined, undefined);
        genericCourses.push(Object.assign({}, baseGeneric, offeredGir, {
          gir_attribute: gir,
          title: 'Generic ' + girAttributes[gir][0],
          subject_id: gir,
          url: baseurl + '&cred=' + girAttributes[gir][1] + '&commun_int=*'
        }));
      }
      for (var hass in hassAttributes) {
        var offeredHass = this.getMatchingAttributes(undefined, hass, undefined);
        genericCourses.push(Object.assign({}, baseGeneric, offeredHass, {
          hass_attribute: hass,
          title: 'Generic ' + hass,
          subject_id: hass,
          url: baseurl + '&cred=' + hassAttributes[hass][1] + '&commun_int=*'
        }));
        var offeredHassCI = this.getMatchingAttributes(undefined, hass, 'CI-H');
        genericCourses.push(Object.assign({}, baseGeneric, offeredHassCI, {
          hass_attribute: hass,
          communication_requirement: 'CI-H',
          title: 'Generic CI-H ' + hass,
          subject_id: 'CI-H ' + hass,
          url: baseurl + '&cred=' + hassAttributes[hass][1] + '&commun_int=' + ciAttributes['CI-H'][1]
        }));
      }
      for (var ci in ciAttributes) {
        var offeredCI = this.getMatchingAttributes(undefined, undefined, ci);
        genericCourses.push(Object.assign({}, baseGeneric, offeredCI, {
          communication_requirement: ci,
          title: 'Generic ' + ci,
          hass_attribute: 'HASS',
          subject_id: ci,
          url: baseurl + '&cred=*&commun_int=' + ciAttributes[ci][1]
        }));
      }
      return genericCourses;
    },
    overrideWarnings (override, classInfo) {
      var classIndex = this.roads[this.activeRoad].contents.selectedSubjects.indexOf(classInfo);
      Vue.set(this.roads[this.activeRoad].contents.selectedSubjects[classIndex], 'overrideWarnings', override);
    },
    updateProgress: function (newProgress) {
      Vue.set(this.roads[this.activeRoad].contents.progressOverrides, newProgress.listID, newProgress.progress);
      Vue.set(this.roads[this.activeRoad], 'changed', moment().format(DATE_FORMAT));
    }
  }
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
