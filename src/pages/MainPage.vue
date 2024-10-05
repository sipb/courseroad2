<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <v-app id="app-wrapper">
    <v-dialog v-model="showMobile" fullscreen>
      <v-card height="100%">
        <v-container fill-height>
          <v-layout column>
            <v-flex grow>
              <v-card-title primary-title>
                <h1 class="text-h3">Hello there!</h1>
              </v-card-title>
              <v-card-text>
                <p class="text-h5">
                  It looks like you're browsing CourseRoad from mobile! For a
                  better mobile experience, consider downloading the FireRoad
                  app instead, available on Android and iOS.
                </p>
              </v-card-text>
            </v-flex>
            <v-flex shrink align-self-center>
              <v-btn block :href="appLink" color="info">
                <v-icon>mdi-download</v-icon> Download
              </v-btn>
              <br />
              <v-btn block href="#" @click="showMobile = false">
                No thanks, take me to the desktop site.
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
    <v-app-bar app fixed dense :elevation="2">
      <road-tabs
        slot="extension"
        @delete-road="$refs.authcomponent.deleteRoad($event)"
        @add-road="addRoad(...arguments)"
        @retrieve="$refs.authcomponent.retrieveRoad($event)"
      />

      <import-export @add-road="addRoad(...arguments)" />

      <auth
        ref="authcomponent"
        :just-loaded="justLoaded"
        :conflict-info="conflictInfo"
        @conflict="conflict"
        @resolve-conflict="resolveConflict"
      />

      <v-layout justify-end>
        <v-text-field
          id="searchInputTF"
          v-model="searchInput"
          hide-details
          data-cy="classSearchInput"
          autocomplete="off"
          class="expanded-search"
          prepend-icon="mdi-magnify"
          placeholder="Add classes"
          autofocus
          style="width: 100%"
          @click.native="
            clickSearch($event);
            $event.stopPropagation();
          "
          @input="typeSearch"
          @keydown.esc="searchOpen = false"
          @keyup.enter="$refs.searchMenu.openFirstClass"
        />
      </v-layout>
    </v-app-bar>

    <v-navigation-drawer
      id="left-panel"
      width="350"
      mobile-breakpoint="600"
      class="side-panel elevation-2 scroller"
      app
    >
      <v-container fill-height style="padding: 0">
        <v-layout fill-height column>
          <v-layout
            shrink
            style="padding: 14px; padding-bottom: 0"
            align-center
          >
            <v-flex
              shrink
              class="blue-grey"
              :class="[$vuetify.theme.dark ? 'darken-4' : 'lighten-4']"
              style="
                user-select: none;
                color: inherit;
                text-decoration: none;
                border-radius: 2px;
                padding: 6px 8px;
                display: inline-block;
              "
            >
              <v-icon size="1.3em" color="#00b300">
                mdi-checkbox-marked
              </v-icon>
              <h3 style="display: inline">{{ " C o u r s e R o a d " }}</h3>
            </v-flex>
            <theme-toggler />
            <v-flex>
              <v-dialog
                v-model="aboutDialog"
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    fab
                    small
                    dark
                    color="primary"
                    style="float: right"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon dark> mdi-information-variant </v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-container>
                    <v-btn icon text @click="aboutDialog = false">
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <about />
                  </v-container>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-layout>
          <audit
            v-if="activeRoad !== ''"
            :req-trees="reqTrees"
            :selected-reqs="roads[activeRoad].contents.coursesOfStudy"
            :selected-subjects="roads[activeRoad].contents.selectedSubjects"
            :req-list="reqList"
            :progress-overrides="roads[activeRoad].contents.progressOverrides"
            data-cy="audit"
          />
          <v-flex
            shrink
            style="padding: 14px; padding-bottom: 0"
            data-cy="unofficialWarning"
          >
            <p>
              <b>Warning:</b> This is an unofficial tool that may not accurately
              reflect degree progress. Please view the
              <a
                target="_blank"
                href="https://student.mit.edu/cgi-bin/shrwsdau.sh"
                >official audit</a
              >,
              <a target="_blank" href="http://student.mit.edu/catalog/index.cgi"
                >course catalog</a
              >, and
              <a target="_blank" href="http://catalog.mit.edu/degree-charts/"
                >degree charts</a
              >
              and confirm with your department advisors.
            </p>
            <p>
              Problems with the course requirements? Request edits
              <a target="_blank" href="https://fireroad.mit.edu/requirements/"
                >here</a
              >
              or send an email to
              <a target="_blank" href="mailto:courseroad@mit.edu"
                >courseroad@mit.edu</a
              >.
            </p>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- TODO: will need to add event for when the child can edit selectedReqs probably -->
    </v-navigation-drawer>

    <v-main id="center-panel" app>
      <v-tabs-items v-model="activeRoad">
        <v-tab-item
          v-for="roadId in Object.keys(roads)"
          :key="roadId"
          :value="roadId"
        >
          <road
            :selected-subjects="roads[roadId].contents.selectedSubjects"
            :road-i-d="roadId"
            :adding-from-card="addingFromCard && activeRoad === roadId"
            :drag-semester-num="activeRoad === roadId ? dragSemesterNum : -1"
            :data-cy="'road_' + roadId"
            @change-year="$refs.authcomponent.changeSemester($event)"
          />
        </v-tab-item>
      </v-tabs-items>

      <conflict-dialog
        ref="conflictdialog"
        :conflict-info="conflictInfo"
        :conflict-dialog="conflictDialog"
        @update-local="updateLocal"
        @update-remote="updateRemote"
      />
    </v-main>

    <v-card
      v-show="searchOpen"
      id="searchMenuCard"
      class="elevation-8"
      @click.native="$event.stopPropagation()"
    >
      <class-search
        id="searchMenu"
        ref="searchMenu"
        class="search-menu"
        :search-input="searchInput"
      />
    </v-card>

    <class-info
      v-if="$store.state.classInfoStack.length"
      @click.native="$event.stopPropagation()"
    />

    <v-footer v-if="!dismissedCookies" fixed :color="'#34627d'" app>
      <v-layout column>
        <v-flex v-if="!dismissedCookies" class="py-1 px-2">
          <v-layout align-center>
            <v-flex style="color: white">
              This website uses cookies and session storage to store your data
              and login token, and important features like saving roads will not
              work without them. <br />
              <span v-if="cookiesAllowed === undefined"
                >By continuing to use this website or clicking "I accept", you
                consent to the use of cookies.</span
              >
              <span v-if="cookiesAllowed !== undefined"
                >By continuing to use this website, you have consented to the
                use of cookies, but may opt out by clicking the button to the
                right.</span
              >
            </v-flex>
            <v-flex shrink>
              <v-btn
                small
                depressed
                color="green"
                class="ma-1"
                data-cy="acceptCookies"
                style="color: rgb(255 255 255)"
                @click="
                  $store.commit('allowCookies');
                  dismissCookies();
                "
              >
                I accept
              </v-btn>
            </v-flex>
            <v-flex shrink>
              <v-btn
                small
                depressed
                text
                outlined
                class="ma-1"
                color="rgb(255 255 255 / 70%)"
                @click="disallowCookies"
              >
                Opt out
              </v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import Audit from "./../components/Audit.vue";
import ClassSearch from "./../components/ClassSearch.vue";
import Road from "./../components/Road.vue";
import RoadTabs from "./../components/RoadTabs.vue";
import ConflictDialog from "./../components/ConflictDialog.vue";
import Auth from "./../components/Auth.vue";
import axios from "axios";
import $ from "jquery";
import moment from "moment";
import UAParser from "ua-parser-js";
import Vue from "vue";
import ClassInfo from "./../components/ClassInfo.vue";
import ImportExport from "./../components/ImportExport.vue";
import ThemeToggler from "./../components/ThemeToggler.vue";
import About from "./../components/About.vue";

const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z";

export default {
  components: {
    audit: Audit,
    "class-search": ClassSearch,
    road: Road,
    "road-tabs": RoadTabs,
    "conflict-dialog": ConflictDialog,
    auth: Auth,
    "class-info": ClassInfo,
    "import-export": ImportExport,
    "theme-toggler": ThemeToggler,
    about: About,
  },
  data: function () {
    return {
      aboutDialog: false,
      reqTrees: {},
      reqList: [],
      dragSemesterNum: -1,
      gettingUserData: false,
      cookieName: "Default Cookie",
      accessInfo: undefined,
      rightDrawer: true,
      newRoadName: "",
      justLoaded: true,
      currentlySaving: false,
      saveWarnings: [],
      conflictDialog: false,
      conflictInfo: undefined,
      searchInput: "",
      dismissedAndroidWarning: false,
      dismissedCookies: false,
      searchOpen: false,
      updatingFulfillment: false,
      showMobile:
        ["mobile", "tabvar"].indexOf(
          new UAParser(navigator.userAgent).getDevice().type,
        ) !== -1,
    };
  },
  computed: {
    activeRoad: {
      get() {
        return this.$store.state.activeRoad;
      },
      set(value) {
        this.$store.commit("setActiveRoad", value);
      },
    },
    addingFromCard() {
      return this.$store.state.addingFromCard;
    },
    appLink: function () {
      switch (new UAParser(navigator.userAgent).getOS().name) {
        case "Android":
          return "http://play.google.com/store/apps/details?id=com.base12innovations.android.fireroad";
        case "iOS":
          return "https://itunes.apple.com/us/app/fireroad-mit-course-planner/id1330678450?mt=8";
        default:
          return null;
      }
    },
    cookiesAllowed() {
      return this.$store.state.cookiesAllowed;
    },
    roads() {
      return this.$store.state.roads;
    },
    roadref: function () {
      return "#road" + this.activeRoad;
    },
  },
  watch: {
    // call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function (newRoad) {
      if (
        this.$store.state.unretrieved.indexOf(newRoad) >= 0 &&
        !this.$refs.authcomponent.gettingUserData
      ) {
        const _this = this;
        this.$refs.authcomponent.retrieveRoad(newRoad).then(function () {
          _this.$store.commit("setRetrieved", newRoad);
        });
      } else if (newRoad !== "") {
        this.updateFulfillment(this.$store.state.fulfillmentNeeded);
      }
      // If just loaded, store isn't loaded yet
      // and so we can't overwrite the router just yet
      if (newRoad !== "" && !this.justLoaded) {
        this.$router.push({ path: `/road/${newRoad}` });
      }
      this.justLoaded = false;
    },
    cookiesAllowed: function (newCA) {
      if (newCA) {
        this.$cookies.set(
          "dismissedAndroidWarning",
          this.dismissedAndroidWarning,
        );
      }
    },
    roads: {
      handler: function () {
        this.justLoaded = false;
        if (this.cookiesAllowed === undefined) {
          this.$store.commit("allowCookies");
        }
        if (this.activeRoad !== "") {
          this.updateFulfillment(this.$store.state.fulfillmentNeeded);
        }
        this.$store.commit("resetFulfillmentNeeded");

        if (!this.$store.state.ignoreRoadChanges) {
          this.$refs.authcomponent.save(this.activeRoad);
        } else {
          this.$store.commit("watchRoadChanges");
        }
      },
      deep: true,
    },
  },
  created() {
    if (
      this.cookiesAllowed &&
      this.$cookies.get("versionNumber") !== this.$store.state.versionNumber
    ) {
      console.log("Warning: the version number has changed.");
      // do whatever needs to happen when the version changed, probably including clearing local storage
      // then update the version number cookie
      localStorage.clear();
      this.$cookies.set("versionNumber", this.$store.state.versionNumber);
    }
  },
  mounted() {
    const today = new Date();
    const month = today.getMonth();
    this.$store.commit("setCurrentSemester", month >= 4 && month <= 10 ? 1 : 3);
    if (
      localStorage.courseRoadStore !== undefined &&
      this.cookiesAllowed &&
      this.$store.state.loggedIn
    ) {
      this.$store.commit(
        "setFromLocalStorage",
        JSON.parse(localStorage.courseRoadStore),
      );
    }
    const borders = $(".v-navigation-drawer__border");
    const scrollers = $(".scroller");
    const scrollWidth = scrollers.width();
    // moves nav drawer border with scroll
    // if the effect proves too annoying we can remove the borders instead
    scrollers.scroll(function () {
      const scrollPosition = scrollers.scrollLeft();
      borders.css({ top: 0, left: scrollWidth - 1 + scrollPosition });
    });

    this.setActiveRoad();

    axios
      .get(import.meta.env.VITE_FIREROAD_URL + "/requirements/list_reqs/")
      .then((response) => {
        this.reqList = Object.keys(response.data)
          .map((m) => {
            return Object.assign(response.data[m], { key: m });
          })
          .sort();
      });

    // Update fulfillment for all majors on load
    this.updateFulfillment("all");

    document.body.addEventListener(
      "click",
      function () {
        this.searchOpen = false;
      }.bind(this),
    );

    window.addEventListener("beforeunload", () => {
      if (this.cookiesAllowed && this.$store.state.loggedIn) {
        const subjectsInfoNoDescriptions = this.$store.state.subjectsInfo.map(
          function (x) {
            x = {
              subject_id: x.subject_id,
              title: x.title,
              offered_fall: x.offered_fall,
              offered_spring: x.offered_spring,
              offered_iap: x.offered_iap,
            };
            return x;
          },
        );
        this.$store.commit("setSubjectsInfo", subjectsInfoNoDescriptions);
        localStorage.courseRoadStore = JSON.stringify(this.$store.state);
      }
    });

    if (this.$cookies.isKey("dismissedAndroidWarning")) {
      this.dismissedAndroidWarning = JSON.parse(
        this.$cookies.get("dismissedAndroidWarning"),
      );
      this.$store.commit("allowCookies");
    }
    if (this.$cookies.isKey("dismissedCookies")) {
      this.dismissedCookies = JSON.parse(this.$cookies.get("dismissedCookies"));
      this.$store.commit("allowCookies");
    }

    // developer.mit.edu version commented out because I couldn't get it to work. filed an issue to resolve it.
    // axios.get('https://mit-course-catalog-v2.cloudhub.io/coursecatalog/v2/terms/2018FA/subjects', {headers:{client_id:'01fce9ed7f9d4d26939a68a4126add9b', client_secret:'D4ce51aA6A32421DA9AddF4188b93255'}})
    // , 'Accept': 'application/json'} ?
    // full=true is ~3x bigger but has some great info like "in_class_hours" and "rating"
    this.$store
      .dispatch("loadAllSubjects")
      .then(() => {
        console.log("Subjects were loaded successfully!");
      })
      .catch((e) => {
        console.log("There was an error loading subjects: \n" + e);
      });
  },
  methods: {
    updateFulfillment: function (fulfillmentNeeded) {
      if (!this.updatingFulfillment && fulfillmentNeeded !== "none") {
        this.updatingFulfillment = true;
        const _this = this;
        // list of majors to get audit fulfillment for depending on fulfillmentNeeded
        const fulfillments =
          fulfillmentNeeded === "all"
            ? this.roads[this.activeRoad].contents.coursesOfStudy
            : [fulfillmentNeeded];
        for (let r = 0; r < fulfillments.length; r++) {
          const req = fulfillments[r];
          const alteredRoadContents = Object.assign(
            {},
            _this.roads[_this.activeRoad].contents,
          );
          alteredRoadContents.selectedSubjects = this.flatten(
            alteredRoadContents.selectedSubjects,
          );
          axios
            .post(
              import.meta.env.VITE_FIREROAD_URL +
                "/requirements/progress/" +
                req +
                "/",
              alteredRoadContents,
            )
            .then(
              function (response) {
                // This is necessary so Vue knows about the new property on reqTrees
                Vue.set(this.data.reqTrees, this.req, response.data);
              }.bind({ data: this, req }),
            );
        }
        Vue.nextTick(
          function () {
            this.updatingFulfillment = false;
          }.bind(this),
        );
      }
    },
    setActiveRoad: function () {
      const roadRequested = this.$route.params.road;
      if (this.$route.params.road in this.roads) {
        this.$store.commit("setActiveRoad", roadRequested);
        return true;
      } else if (!this.$cookies.isKey("accessInfo")) {
        // If user isn't logged in, and bad road id in url, then redirect to default road
        const defaultRoadId = this.$store.state.activeRoad;
        this.$router.replace({ path: `/road/${defaultRoadId}` });
      }
      return false;
    },
    addRoad: function (
      roadName,
      cos = ["girs"],
      ss = Array.from(Array(16), () => []),
      overrides = {},
    ) {
      const tempRoadID = "$" + this.$refs.authcomponent.newRoads.length + "$";
      const newContents = {
        coursesOfStudy: cos,
        selectedSubjects: ss,
        progressOverrides: overrides,
        progressAssertions: {},
      };
      const newRoad = {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: roadName,
        agent: "",
        contents: newContents,
      };
      this.$store.commit("setRoad", {
        id: tempRoadID,
        road: newRoad,
        ignoreSet: false,
      });
      this.$store.commit("resetFulfillmentNeeded");
      this.$store.commit("setActiveRoad", tempRoadID);
      this.$refs.authcomponent.newRoads.push(tempRoadID);
    },
    conflict: function (conflictInfo) {
      this.$refs.conflictdialog.startConflict();
      this.conflictInfo = conflictInfo;
    },
    resolveConflict: function () {
      this.$refs.conflictdialog.resolveConflict();
      this.conflictInfo = undefined;
    },
    disallowCookies: function () {
      this.$store.commit("disallowCookies");
      this.dismissCookies();
      const cookieKeys = this.$cookies.keys();
      for (let k = 0; k < cookieKeys.length; k++) {
        this.$cookies.remove(cookieKeys[k]);
      }
    },
    updateLocal: function (id) {
      this.$refs.authcomponent.updateLocal(id);
    },
    updateRemote: function (id) {
      this.$refs.authcomponent.updateRemote(id);
    },
    dismissOld: function () {
      this.dismissedAndroidWarning = true;
      if (this.cookiesAllowed) {
        this.$cookies.set("dismissedAndroidWarning", true);
      }
    },
    dismissCookies: function () {
      this.dismissedCookies = true;
      if (this.cookiesAllowed) {
        this.$cookies.set("dismissedCookies", true);
      }
    },
    clickSearch: function () {
      this.searchOpen = !this.searchOpen;
    },
    typeSearch: function (searchString) {
      this.searchOpen = searchString.length > 0;
    },
  },
};
</script>

<style scoped>
#searchMenuCard {
  position: fixed;
  top: 37px;
  right: 24px;
  z-index: 100;
  overflow: hidden;
}

@media only screen and (max-width: 959px) {
  #searchMenuCard {
    right: 16px;
  }
}
.scroller {
  overflow-x: auto;
}
.v-navigation-drawer__border {
  display: none !important;
}
/* .search-menu {
  background: white;
} */
.expanded-search {
  max-width: 22em;
}
</style>
