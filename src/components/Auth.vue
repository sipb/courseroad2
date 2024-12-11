<template>
  <v-row class="grow" align="center" no-gutters>
    <v-tooltip v-if="!loggedIn" bottom>
      <template #activator="{ on }">
        <v-btn
          v-if="!loggedIn"
          class="collapse-button"
          outlined
          color="primary"
          data-cy="loginButton"
          @click="loginUser"
          v-on="on"
        >
          <span class="hidden-sm-and-down">Login</span>
          <!-- <font-awesome-icon class="hidden-md-and-up" icon="sign-in-alt" /> -->
          <v-icon class="hidden-md-and-up">mdi-login</v-icon>
        </v-btn>
      </template>
      <span>
        If you are experiencing difficulties logging in, please clear your
        cookies or log in with an incognito tab.
      </span>
    </v-tooltip>
    <v-btn
      v-if="loggedIn"
      class="collapse-button"
      outlined
      color="primary"
      data-cy="logoutButton"
      @click="logoutUser"
    >
      <span class="hidden-sm-and-down">Logout</span>
      <!-- <font-awesome-icon class="hidden-md-and-up" icon="sign-out-alt" /> -->
      <v-icon class="hidden-md-and-up">mdi-logout</v-icon>
    </v-btn>
    <v-tooltip bottom :disabled="saveWarnings.length === 0">
      <template #activator="{ on }">
        <div>
          <v-icon
            v-if="!currentlySaving && !gettingUserData"
            id="save-icon"
            :color="saveColor"
            style="user-select: none"
            title="All changes saved!"
            v-on="on"
          >
            {{ saveIcon }}
          </v-icon>
        </div>
      </template>
      <div>
        <p
          v-for="saveWarning in saveWarnings"
          :key="saveWarning.name + saveWarning.error"
        >
          {{ saveWarning.name }}: {{ saveWarning.error }}
        </p>
      </div>
    </v-tooltip>
    <div v-if="currentlySaving || gettingUserData">
      <v-progress-circular :size="18" indeterminate />
    </div>
  </v-row>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "AuthComponent",
});
</script>

<script setup>
import axios from "axios";
import moment from "moment";
import UAParser from "ua-parser-js";
import { getSimpleSelectedSubjects } from "./../mixins/sanitizeSubjects.js";
import { ref, computed, watch, onMounted } from "vue";
import { flatten } from "../plugins/browserSupport.js";
import {
  useStore,
  useCookies,
  useRoute,
  useRouter,
} from "./../plugins/composition.js";

const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z";

const getQueryObject = () => {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  const queryObject = {};
  for (let i = 0; i < vars.length; i++) {
    const keyValuePair = vars[i].split("=");
    queryObject[keyValuePair[0]] = keyValuePair[1];
  }
  return queryObject;
};

const props = defineProps({
  justLoaded: {
    type: Boolean,
    required: true,
  },
  conflictInfo: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["conflict", "resolve-conflict"]);

const store = useStore();
const cookies = useCookies();
const route = useRoute();
const router = useRouter();

const accessInfo = ref(undefined);
const loggedIn = ref(false);
const newRoadsRef = ref([]);
const saveWarnings = ref([]);
const gettingUserData = ref(false);
const currentlySaving = ref(false);
const tabID = ref(Math.floor(Math.random() * 16 ** 10).toString(16));

const activeRoad = computed(() => store.activeRoad);
const cookiesAllowed = computed(() => store.cookiesAllowed);
const roads = computed(() => store.roads);
const saveColor = computed(() => {
  if (!cookiesAllowed.value && !loggedIn.value) {
    return "gray";
  }
  return saveWarnings.value.length ? "warning" : "primary";
});
const saveIcon = computed(() =>
  saveWarnings.value.length ? "mdi-alert" : "mdi-content-save",
);

watch(cookiesAllowed, (newCA) => {
  if (newCA) {
    cookies.set("newRoads", getNewRoadData());
    if (loggedIn.value) {
      cookies.set("accessInfo", accessInfo.value, "3d");
    }
    setTabID();
  }
});

watch(loggedIn, (newLoggedIn) => {
  store.setLoggedIn(newLoggedIn);
  if (newLoggedIn && cookies.get("has_set_year") !== "true") {
    const email = accessInfo.value.academic_id;
    const endPoint = email.indexOf("@");
    const kerb = email.slice(0, endPoint);
    axios
      .get(`${import.meta.env.VITE_URL}/cgi-bin/people.py?kerb=${kerb}`)
      .then((response) => {
        if (response.status !== 200) {
          console.log("Failed to find user year");
        } else {
          const year = response.data.current_semester
            ? Math.floor(response.data.current_semester / 2) + 1
            : undefined;
          if (year === undefined) {
            console.log("Failed to find user year");
          } else {
            changeSemester(year);
            console.log("setting year to " + year);
          }
        }
      });
  }
});

onMounted(() => {
  window.setLocationHref = function (url) {
    window.location.href = url;
  };

  if (cookies.isKey("newRoads")) {
    const newRoads = cookies.get("newRoads");
    if (Object.keys(newRoads).length) {
      for (const roadID in newRoads) {
        if (!Array.isArray(newRoads[roadID].contents.selectedSubjects[0])) {
          newRoads[roadID].contents.selectedSubjects =
            this.getSimpleSelectedSubjects(
              newRoads[roadID].contents.selectedSubjects,
            );
        }
        if (newRoads[roadID].contents.progressAssertions === undefined) {
          newRoads[roadID].contents.progressAssertions = {};
        }
      }
      if (props.justLoaded) {
        if (!(activeRoad.value in newRoads)) {
          store.setActiveRoad(Object.keys(newRoads)[0]);
        }
        store.setRoads(newRoads);
      } else {
        store.setRoads(Object.assign(newRoads, roads.value));
      }
      newRoadsRef.value = Object.keys(newRoads);
    }
    store.allowCookies();
  }

  if (cookies.isKey("accessInfo")) {
    accessInfo.value = cookies.get("accessInfo");
    loggedIn.value = true;
    store.allowCookies();
    verify().then(() => {
      getUserData();
    });
  }

  setTabID();

  window.onbeforeunload = () => {
    if (cookiesAllowed.value) {
      const tabID = sessionStorage.tabID;
      let tabs = [];
      if (cookies.isKey("tabs")) {
        tabs = cookies.get("tabs").ids;
      }
      const tabIndex = tabs.indexOf(tabID);
      tabs.splice(tabIndex, 1);
      if (tabs.length) {
        cookies.set("tabs", { ids: tabs });
      } else {
        cookies.remove("tabs");
      }
    }
    if (currentlySaving.value) {
      return "Are you sure you want to leave?  Your roads are not saved.";
    }
  };

  attemptLogin();
  // window.cookies=this.$cookies;
});

const loginUser = () => {
  window.setLocationHref(
    `${import.meta.env.VITE_FIREROAD_URL}/login/?redirect=${import.meta.env.VITE_URL}`,
  );
  if (cookiesAllowed.value) {
    cookies.set("hasLoggedIn", true);
  }
};

const logoutUser = () => {
  cookies.remove("accessInfo");
  if (cookiesAllowed.value) {
    cookies.set("hasLoggedIn", false);
  }
  localStorage.clear();
  loggedIn.value = false;
  accessInfo.value = undefined;
  window.location.reload();
};

const verify = () => {
  const headerList = {
    headers: {
      Authorization: "Bearer " + accessInfo.value.access_token,
    },
  };
  const currentMonth = new Date().getMonth();
  return axios
    .get(import.meta.env.VITE_FIREROAD_URL + "/verify/", headerList)
    .then((verifyResponse) => {
      if (verifyResponse.data.success) {
        store.setCurrentSemester(
          verifyResponse.data.current_semester - (currentMonth === 4 ? 1 : 0),
        );
        return verifyResponse.data;
      } else {
        logoutUser();
        return Promise.reject(new Error("Token not valid"));
      }
    })
    .catch((err) => {
      logoutUser();
      return Promise.reject(err);
    });
};

const doSecure = (axiosFunc, link, params) => {
  if (loggedIn.value && accessInfo.value !== undefined) {
    const headerList = {
      headers: {
        Authorization: "Bearer " + accessInfo.value.access_token,
      },
    };
    return params
      ? axiosFunc(import.meta.env.VITE_FIREROAD_URL + link, params, headerList)
      : axiosFunc(import.meta.env.VITE_FIREROAD_URL + link, headerList);
  } else {
    return Promise.reject(new Error("No auth information"));
  }
};

const getSecure = (link) => {
  return doSecure(axios.get, link, false);
};

const postSecure = (link, params) => {
  return doSecure(axios.post, link, params);
};

const retrieveRoad = (roadID) => {
  gettingUserData.value = true;
  return getSecure("/sync/roads/?id=" + roadID).then((roadData) => {
    if (roadData.status === 200 && roadData.data.success) {
      roadData.data.file.downloaded = moment().format(DATE_FORMAT);
      roadData.data.file.changed = moment().format(DATE_FORMAT);
    }

    sanitizeRoad(roadData.data.file);

    store.setRoad({
      id: roadID,
      road: roadData.data.file,
      ignoreSet: true,
    });

    store.setRetrieved(roadID);

    store.waitAndMigrateOldSubjects(roadID);

    gettingUserData.value = false;
    return roadData;
  });
};

const sanitizeRoad = (road) => {
  // sanitize subject_id
  const newss = road.contents.selectedSubjects.map((s) => {
    if ("id" in s) {
      s.subject_id = s.id;
      delete s.id;
    }
    return s;
  });

  road.contents.selectedSubjects = newss;

  // convert selected subjects to more convenient format
  road.contents.selectedSubjects = getSimpleSelectedSubjects(
    road.contents.selectedSubjects,
  );
  // sanitize progressOverrides
  if (road.contents.progressOverrides === undefined) {
    road.contents.progressOverrides = {};
  }
  // sanitize progressAssertions
  if (road.contents.progressAssertions === undefined) {
    road.contents.progressAssertions = {};
  }
};

const getUserData = () => {
  gettingUserData.value = true;
  getSecure("/sync/roads/")
    .then((response) => {
      if (response.status === 200 && response.data.success) {
        return response.data.files;
      } else {
        return Promise.reject(
          new Error("sync request not successfull in getUserData"),
        );
      }
    })
    .then((files) => {
      renumberRoads(files);
      for (let i = 0; i < newRoadsRef.value.length; i++) {
        saveRemote(newRoadsRef.value[i]);
      }
      const fileKeys = Object.keys(files);
      for (let i = 0; i < fileKeys.length; i++) {
        const blankRoad = {
          downloaded: moment().format(DATE_FORMAT),
          changed: files[fileKeys[i]].changed,
          name: files[fileKeys[i]].name,
          agent: files[fileKeys[i]].agent,
          contents: {
            coursesOfStudy: ["girs"],
            selectedSubjects: Array.from(Array(16), () => []),
            progressOverrides: {},
            progressAssertions: {},
          },
        };
        store.setRoad({
          id: fileKeys[i],
          road: blankRoad,
          ignoreSet: true,
        });
      }
      if (props.justLoaded && fileKeys.length > 0) {
        store.deleteRoad("$defaultroad$");
      }
      if (fileKeys.includes(route.params.road)) {
        store.setActiveRoad(route.params.road);
      } else {
        // Redirect to first road if road cannot be found
        store.setActiveRoad(Object.keys(roads.value)[0]);
        router.push({
          path: `/road/${Object.keys(roads.value)[0]}`,
        });
      }
      // Set list of unretrieved roads to all but first road ID
      store.setUnretrieved(fileKeys);
      if (fileKeys.length) {
        // Retrieves based on url and defaults to first road if unable to find it
        if (fileKeys.includes(route.params.road)) {
          return retrieveRoad(route.params.road);
        } else {
          return retrieveRoad(fileKeys[0]);
        }
      }
    })
    .then(() => {
      gettingUserData.value = false;
    })
    .catch((err) => {
      alert(err);
      gettingUserData.value = false;
      if (err === "Token not valid") {
        alert("Your token has expired.  Please log in again.");
      }
      logoutUser();
    });
};

const renumber = (name, otherNames) => {
  let newName;
  let copyIndex = 2;
  while (newName === undefined) {
    const copyName = name + " (" + copyIndex + ")";
    if (otherNames.indexOf(copyName) === -1) {
      newName = copyName;
    }
    copyIndex++;
  }
  return newName;
};

const renumberRoads = (cloudFiles) => {
  const cloudRoads = Object.keys(cloudFiles).map((id) => cloudFiles[id]);
  const cloudNames = cloudRoads.map(function (cr) {
    try {
      return cr.name;
    } catch (err) {
      return undefined;
    }
  });
  for (const roadID in roads.value) {
    const localName = roads.value[roadID].name;
    if (cloudNames.indexOf(localName) >= 0) {
      const renumberedName = renumber(localName, cloudNames);
      store.setRoadName({
        id: roadID,
        name: renumberedName,
      });
    }
  }
};

const getAuthorizationToken = (code) => {
  axios
    .get(import.meta.env.VITE_FIREROAD_URL + "/fetch_token/?code=" + code)
    .then((response) => {
      if (response.data.success) {
        if (cookiesAllowed.value) {
          cookies.set("accessInfo", response.data.access_info, "3d");
        }
        accessInfo.value = response.data.access_info;
        verify();
        loggedIn.value = true;
        getUserData();
      }
    });
};

const attemptLogin = () => {
  const queryObject = getQueryObject();
  if ("code" in queryObject) {
    const code = queryObject.code;
    window.history.pushState(
      "CourseRoad Home",
      "CourseRoad Home",
      "./#" + activeRoad.value,
    );
    getAuthorizationToken(code);
  } else if (cookies.get("hasLoggedIn") === "true" && !loggedIn.value) {
    loginUser();
  }
};

const save = (roadID) => {
  if (cookiesAllowed.value) {
    cookies.set("newRoads", getNewRoadData());
  }
  if (loggedIn.value) {
    saveRemote(roadID);
  }
};

const saveRemote = (roadID, override) => {
  if (override === undefined) {
    override = false;
  }

  currentlySaving.value = true;
  saveWarnings.value = [];
  const assignKeys = { override, agent: getAgent() };
  if (!roadID.includes("$")) {
    assignKeys.id = roadID;
  }
  const roadSubjects = flatten(roads.value[roadID].contents.selectedSubjects);
  const formattedRoadContents = Object.assign(
    {
      coursesOfStudy: ["girs"],
      progressOverrides: [],
      progressAssertions: {},
    },
    roads.value[roadID].contents,
    { selectedSubjects: roadSubjects },
  );
  const roadToSend = {};
  Object.assign(
    roadToSend,
    roads.value[roadID],
    { contents: formattedRoadContents },
    assignKeys,
  );
  const savePromise = postSecure("/sync/sync_road/", roadToSend).then(
    (response) => {
      if (response.status !== 200) {
        return Promise.reject(new Error("Unable to save road " + roadID));
      } else {
        const newid =
          response.data.id !== undefined ? response.data.id : roadID;
        if (response.data.success === false) {
          saveWarnings.value.push({
            id: newid,
            error: response.data.error,
            name: roads.value[roadID].name,
          });
        }
        if (response.data.result === "conflict") {
          const conflictInfo = {
            id: roadID,
            other_name: response.data.other_name,
            other_agent: response.data.other_agent,
            other_date: response.data.other_date,
            other_contents: response.data.other_contents,
            this_agent: response.data.this_agent,
            this_date: response.data.this_date,
          };
          store.setRoadProp({
            id: roadID,
            prop: "agent",
            value: getAgent(),
            ignoreSet: true,
          });
          emit("conflict", conflictInfo);

          return Promise.resolve({ oldid: roadID, state: "same" });
        } else if (response.data.result === "update_local") {
          alert(
            "Server has more recent edits.  Overriding local road.  If this is unexpected, check that your computer clock is accurate.",
          );

          const updatedRoad = {
            downloaded: moment().format(DATE_FORMAT),
            changed: response.data.changed,
            name: response.data.name,
            agent: getAgent(),
            contents: response.data.contents,
          };

          sanitizeRoad(updatedRoad);

          store.setRoad({
            id: newid,
            road: updatedRoad,
            ignoreSet: true,
          });

          return Promise.resolve({
            oldid: roadID,
            newid: response.data.id,
            state: "same",
          });
        } else {
          store.setRoadProp({
            id: roadID,
            prop: "downloaded",
            value: moment().format(DATE_FORMAT),
            ignoreSet: true,
          });

          if (response.data.id !== undefined) {
            // note: code moved to app.vue for reset id
            // this is to fix a problem where the activeroad gets reset to the first one
            // i suspect this is because the three events required were not happening
            // in the correct order or something
            if (roadID !== response.data.id.toString()) {
              store.resetID({
                oldid: roadID,
                newid: response.data.id,
              });
            }
            return Promise.resolve({
              oldid: roadID,
              newid: response.data.id,
              state: "changed",
            });
          } else {
            return Promise.resolve({
              oldid: roadID,
              newid: roadID,
              state: "same",
            });
          }
        }
      }
    },
  );
  savePromise
    .then((saveResult) => {
      if (saveResult.state === "changed") {
        const oldIdIndex = newRoadsRef.value.indexOf(saveResult.oldid);
        if (oldIdIndex >= 0) {
          newRoadsRef.value.splice(oldIdIndex, 1);
        }
      }
      if (cookies.isKey("newRoads")) {
        cookies.set("newRoads", getNewRoadData());
      }
      currentlySaving.value = false;
    })
    .catch((err) => {
      console.log(err);
      currentlySaving.value = false;
    });
};

// const saveLocal = () => {
//   currentlySaving.value = true;
//   if (cookiesAllowed.value) {
//     cookies.set("newRoads", getNewRoadData());
//   }
//   for (const roadID in roads.value) {
//     store.setRoadProp({
//       id: roadID,
//       prop: "downloaded",
//       value: moment().format(DATE_FORMAT),
//       ignoreSet: true,
//     });
//   }
//   currentlySaving.value = false;
// };

const getNewRoadData = () => {
  const newRoadData = {};
  if (
    newRoadsRef.value.indexOf("$defaultroad$") === -1 &&
    "$defaultroad$" in roads.value
  ) {
    if (
      flatten(roads.value.$defaultroad$.contents.selectedSubjects).length > 0 ||
      JSON.stringify(
        Array.from(roads.value.$defaultroad$.contents.coursesOfStudy),
      ) !== '["girs"]'
    ) {
      newRoadsRef.value.push("$defaultroad$");
    }
  }
  for (let r = 0; r < newRoadsRef.value.length; r++) {
    const roadID = newRoadsRef.value[r];
    if (roadID in roads.value) {
      newRoadData[roadID] = roads.value[roadID];
    }
  }
  return newRoadData;
};

const updateRemote = (roadID) => {
  saveRemote(roadID, true);
  emit("resolve-conflict");
};

const updateLocal = (roadID) => {
  const remoteRoad = {
    name: props.conflictInfo.other_name,
    agent: props.conflictInfo.other_agent,
    changed: props.conflictInfo.other_date,
    contents: props.conflictInfo.other_contents,
    downloaded: moment().format(DATE_FORMAT),
  };
  sanitizeRoad(remoteRoad);
  store.setRoad({
    id: roadID,
    road: remoteRoad,
    ignoreSet: false,
  });
  emit("resolve-conflict");
};

const deleteRoad = (roadID) => {
  if (activeRoad.value === roadID) {
    const roadIndex = Object.keys(roads.value).indexOf(roadID);
    const withoutRoad = Object.keys(roads.value)
      .slice(0, roadIndex)
      .concat(Object.keys(roads.value).slice(roadIndex + 1));
    if (withoutRoad.length) {
      if (withoutRoad.length > roadIndex) {
        store.setActiveRoad(withoutRoad[roadIndex]);
      } else {
        store.setActiveRoad(withoutRoad[roadIndex - 1]);
      }
    } else {
      store.setActiveRoad("");
    }
  }
  store.deleteRoad(roadID);

  if (roadID in newRoadsRef.value) {
    const roadIndex = newRoadsRef.value.indexOf(roadID);
    newRoadsRef.value.splice(roadIndex, 1);
  }

  if (loggedIn.value) {
    if (roadID.indexOf("$") < 0) {
      postSecure("/sync/delete_road/", { id: roadID });
    }
  }
};

const getAgent = () => {
  const ua = UAParser(navigator.userAgent);
  return navigator.platform + " " + ua.browser.name + " Tab " + tabID.value;
};

const setTabID = () => {
  if (cookiesAllowed.value) {
    if (sessionStorage.tabID !== undefined) {
      tabID.value = sessionStorage.tabID;
      const tabNum = parseInt(tabID.value);
      if (cookies.isKey("tabs")) {
        var tabs = cookies.get("tabs").ids;
        if (tabs.indexOf(tabNum) === -1) {
          tabs.push(tabNum);
          cookies.set("tabs", { ids: tabs });
        }
      } else {
        cookies.set("tabs", { ids: [tabNum] });
      }
    } else {
      // TODO: look into whether this = sign is acting correctly?
      if (cookies.isKey("tabs") && (tabs = cookies.get("tabs").ids)) {
        const maxTab = Math.max(...tabs);
        const newTab = (maxTab + 1).toString();
        sessionStorage.tabID = newTab;
        tabID.value = newTab;
        tabs.push(maxTab + 1);
        cookies.set("tabs", { ids: tabs });
      } else {
        sessionStorage.tabID = "1";
        tabID.value = "1";
        cookies.set("tabs", { ids: [1] });
      }
    }
  }
};

const changeSemester = (year) => {
  if (cookiesAllowed.value) {
    cookies.set("has_set_year", true);
  }
  const currentMonth = new Date().getMonth();
  const sem =
    currentMonth >= 5 && currentMonth <= 10 ? 1 + year * 3 : 3 + year * 3;
  postSecure("/set_semester/", {
    semester: sem + (currentMonth === 4 ? 1 : 0),
  })
    .then((res) => {
      if (res.status === 200 && res.data.success) {
        store.setCurrentSemester(sem);
      }
    })
    .catch((err) => {
      if (err.message === "No auth information") {
        store.setCurrentSemester(sem);
      }
    });
};

defineExpose({
  save,
  updateLocal,
  updateRemote,
  deleteRoad,
  retrieveRoad,
  gettingUserData,
  newRoads: newRoadsRef,
});
</script>

<style scoped>
.collapse-button {
  min-width: 0;
  margin: 0.5em;
}
</style>
