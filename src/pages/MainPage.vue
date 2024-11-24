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
      <RoadTabs
        slot="extension"
        @delete-road="authcomponent.deleteRoad($event)"
        @add-road="addRoad(...arguments)"
        @retrieve="authcomponent.retrieveRoad($event)"
      />

      <ImportExport @add-road="addRoad(...arguments)" />

      <Auth
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
          @keyup.enter="searchMenu.openFirstClass"
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
              :class="[vuetify.theme.dark ? 'darken-4' : 'lighten-4']"
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
            <ThemeToggler />
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
                    <About />
                  </v-container>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-layout>
          <Audit
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
          <Road
            :selected-subjects="roads[roadId].contents.selectedSubjects"
            :road-i-d="roadId"
            :adding-from-card="addingFromCard && activeRoad === roadId"
            :drag-semester-num="activeRoad === roadId ? dragSemesterNum : -1"
            :data-cy="'road_' + roadId"
            @change-year="authcomponent.changeSemester($event)"
          />
        </v-tab-item>
      </v-tabs-items>

      <ConflictDialog
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
      <ClassSearch
        id="searchMenu"
        ref="searchMenu"
        class="search-menu"
        :search-input="searchInput"
      />
    </v-card>

    <ClassInfo
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

<script setup>
import Audit from "./../components/Audit.vue";
import ClassSearch from "./../components/ClassSearch.vue";
import Road from "./../components/Road.vue";
import RoadTabs from "./../components/RoadTabs.vue";
import ConflictDialog from "./../components/ConflictDialog.vue";
import Auth from "./../components/Auth.vue";
import ClassInfo from "./../components/ClassInfo.vue";
import ImportExport from "./../components/ImportExport.vue";
import ThemeToggler from "./../components/ThemeToggler.vue";
import About from "./../components/About.vue";
import axios from "axios";
import $ from "jquery";
import moment from "moment";
import UAParser from "ua-parser-js";
import {
  useStore,
  useVuetify,
  useCookies,
  useRoute,
  useRouter,
} from "../plugins/composition.js";
import { flatten } from "../plugins/browserSupport.js";
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeMount,
  reactive,
  set,
} from "vue";

const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z";

const store = useStore();
const vuetify = useVuetify();
const cookies = useCookies();
const route = useRoute();
const router = useRouter();

const aboutDialog = ref(false);
const reqTrees = reactive({});
const reqList = ref([]);
const dragSemesterNum = ref(-1);
// const gettingUserData = ref(false);
// const cookieName = ref("Default Cookie");
// const accessInfo = ref(undefined);
// const rightDrawer = ref(true);
// const newRoadName = ref("");
const justLoaded = ref(true);
// const currentlySaving = ref(false);
// const saveWarnings = ref([]);
const conflictDialog = ref(false);
const conflictInfo = ref(undefined);
const searchInput = ref("");
const dismissedAndroidWarning = ref(false);
const dismissedCookies = ref(false);
const searchOpen = ref(false);
const updatingFulfillment = ref(false);
const showMobile = ref(
  ["mobile", "tabvar"].indexOf(
    new UAParser(navigator.userAgent).getDevice().type,
  ) !== -1,
);

// template component
const authcomponent = ref(null);
const searchMenu = ref(null);
const conflictdialog = ref(null);

const activeRoad = computed({
  get: () => store.state.activeRoad,
  set: (value) => store.commit("setActiveRoad", value),
});
const addingFromCard = computed(() => store.state.addingFromCard);
const appLink = computed(() => {
  switch (new UAParser(navigator.userAgent).getOS().name) {
    case "Android":
      return "http://play.google.com/store/apps/details?id=com.base12innovations.android.fireroad";
    case "iOS":
      return "https://itunes.apple.com/us/app/fireroad-mit-course-planner/id1330678450?mt=8";
    default:
      return null;
  }
});
const cookiesAllowed = computed(() => store.state.cookiesAllowed);
const roads = computed(() => store.state.roads);
// const roadref = computed(() => "#road" + activeRoad.value);

watch(activeRoad, (newRoad) => {
  if (
    store.state.unretrieved.indexOf(newRoad) >= 0 &&
    !authcomponent.value.gettingUserData
  ) {
    authcomponent.value.retrieveRoad(newRoad).then(() => {
      store.commit("setRetrieved", newRoad);
    });
  } else if (newRoad !== "") {
    updateFulfillment(store.state.fulfillmentNeeded);
  }
  // If just loaded, store isn't loaded yet
  // and so we can't overwrite the router just yet
  if (newRoad !== "" && !justLoaded.value) {
    router.push({ path: `/road/${newRoad}` });
  }
  justLoaded.value = false;
});
watch(cookiesAllowed, (newCA) => {
  if (newCA) {
    cookies.set("dismissedAndroidWarning", dismissedAndroidWarning.value);
  }
});
watch(
  roads,
  () => {
    justLoaded.value = false;
    if (cookiesAllowed.value === undefined) {
      store.commit("allowCookies");
    }
    if (activeRoad.value !== "") {
      updateFulfillment(store.state.fulfillmentNeeded);
    }
    store.commit("resetFulfillmentNeeded");

    if (!store.state.ignoreRoadChanges) {
      authcomponent.value.save(activeRoad.value);
    } else {
      store.commit("watchRoadChanges");
    }
  },
  { deep: true },
);

onBeforeMount(() => {
  if (
    cookiesAllowed.value &&
    cookies.get("versionNumber") !== store.state.versionNumber
  ) {
    console.log("Warning: the version number has changed.");
    // do whatever needs to happen when the version changed, probably including clearing local storage
    // then update the version number cookie
    localStorage.clear();
    cookies.set("versionNumber", store.state.versionNumber);
  }
});

onMounted(() => {
  const today = new Date();
  const month = today.getMonth();
  store.commit("setCurrentSemester", month >= 4 && month <= 10 ? 1 : 3);
  if (
    localStorage.courseRoadStore !== undefined &&
    cookiesAllowed.value &&
    store.state.loggedIn
  ) {
    store.commit(
      "setFromLocalStorage",
      JSON.parse(localStorage.courseRoadStore),
    );
  }
  const borders = $(".v-navigation-drawer__border");
  const scrollers = $(".scroller");
  const scrollWidth = scrollers.width();
  // moves nav drawer border with scroll
  // if the effect proves too annoying we can remove the borders instead
  scrollers.on("scroll", () => {
    const scrollPosition = scrollers.scrollLeft();
    borders.css({ top: 0, left: scrollWidth - 1 + scrollPosition });
  });

  setActiveRoad();

  axios
    .get(import.meta.env.VITE_FIREROAD_URL + "/requirements/list_reqs/")
    .then((response) => {
      reqList.value = Object.keys(response.data)
        .map((m) => {
          return Object.assign(response.data[m], { key: m });
        })
        .sort();
    });

  // Update fulfillment for all majors on load
  updateFulfillment("all");

  document.body.addEventListener("click", () => {
    searchOpen.value = false;
  });

  window.addEventListener("beforeunload", () => {
    if (cookiesAllowed.value && store.state.loggedIn) {
      const subjectsInfoNoDescriptions = store.state.subjectsInfo.map((x) => ({
        subject_id: x.subject_id,
        title: x.title,
        offered_fall: x.offered_fall,
        offered_spring: x.offered_spring,
        offered_iap: x.offered_iap,
      }));
      store.commit("setSubjectsInfo", subjectsInfoNoDescriptions);
      localStorage.courseRoadStore = JSON.stringify(store.state);
    }
  });

  if (cookies.isKey("dismissedAndroidWarning")) {
    dismissedAndroidWarning.value = JSON.parse(
      cookies.get("dismissedAndroidWarning"),
    );
    store.commit("allowCookies");
  }

  if (cookies.isKey("dismissedCookies")) {
    dismissedCookies.value = JSON.parse(cookies.get("dismissedCookies"));
    store.commit("allowCookies");
  }

  // developer.mit.edu version commented out because I couldn't get it to work. filed an issue to resolve it.
  // axios.get('https://mit-course-catalog-v2.cloudhub.io/coursecatalog/v2/terms/2018FA/subjects', {headers:{client_id:'01fce9ed7f9d4d26939a68a4126add9b', client_secret:'D4ce51aA6A32421DA9AddF4188b93255'}})
  // , 'Accept': 'application/json'} ?
  // full=true is ~3x bigger but has some great info like "in_class_hours" and "rating"
  store
    .dispatch("loadAllSubjects")
    .then(() => {
      console.log("Subjects were loaded successfully!");
    })
    .catch((e) => {
      console.log("There was an error loading subjects: \n" + e);
    });
});

const updateFulfillment = (fulfillmentNeeded) => {
  if (!updatingFulfillment.value && fulfillmentNeeded !== "none") {
    updatingFulfillment.value = true;
    // list of majors to get audit fulfillment for depending on fulfillmentNeeded
    const fulfillments =
      fulfillmentNeeded === "all"
        ? roads.value[activeRoad.value].contents.coursesOfStudy
        : [fulfillmentNeeded];
    for (let r = 0; r < fulfillments.length; r++) {
      const req = fulfillments[r];
      const alteredRoadContents = Object.assign(
        {},
        roads.value[activeRoad.value].contents,
      );
      alteredRoadContents.selectedSubjects = flatten(
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
        .then((response) => {
          // This is necessary so Vue knows about the new property on reqTrees
          // TODO: above comment was true in vue 2, check for vue 3
          set(reqTrees, req, response.data);
        });
    }
    nextTick(() => {
      updatingFulfillment.value = false;
    });
  }
};

const setActiveRoad = () => {
  const roadRequested = route.params.road;
  if (route.params.road in roads.value) {
    store.commit("setActiveRoad", roadRequested);
    return true;
  } else if (!cookies.isKey("accessInfo")) {
    // If user isn't logged in, and bad road id in url, then redirect to default road
    const defaultRoadId = store.state.activeRoad;
    router.replace({ path: `/road/${defaultRoadId}` });
  }
  return false;
};

const addRoad = (
  roadName,
  cos = ["girs"],
  ss = Array.from(Array(16), () => []),
  overrides = {},
) => {
  const tempRoadID = "$" + authcomponent.value.newRoads.length + "$";
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
  store.commit("setRoad", {
    id: tempRoadID,
    road: newRoad,
    ignoreSet: false,
  });
  store.commit("resetFulfillmentNeeded");
  store.commit("setActiveRoad", tempRoadID);
  authcomponent.value.newRoads.push(tempRoadID);
};

const conflict = (conflictInfo) => {
  conflictDialog.value = true;
  conflictInfo.value = conflictInfo;
};

const resolveConflict = () => {
  conflictDialog.value = false;
  conflictInfo.value = undefined;
};

const disallowCookies = () => {
  store.commit("disallowCookies");
  dismissCookies();
  const cookieKeys = cookies.keys();
  for (let k = 0; k < cookieKeys.length; k++) {
    cookies.remove(cookieKeys[k]);
  }
};

const updateLocal = (id) => {
  authcomponent.value.updateLocal(id);
};

const updateRemote = (id) => {
  authcomponent.value.updateRemote(id);
};

// const dismissOld = () => {
//   dismissedAndroidWarning.value = true;
//   if (cookiesAllowed.value) {
//     cookies.set("dismissedAndroidWarning", true);
//   }
// };

const dismissCookies = () => {
  dismissedCookies.value = true;
  if (cookiesAllowed.value) {
    cookies.set("dismissedCookies", true);
  }
};

const clickSearch = () => {
  searchOpen.value = !searchOpen.value;
};

const typeSearch = (searchString) => {
  searchOpen.value = searchString.length > 0;
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
