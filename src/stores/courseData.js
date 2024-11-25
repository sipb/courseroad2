import { defineStore, acceptHMRUpdate } from "pinia";
import axios from "axios";
import moment from "moment";
import Vue from "vue";

const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS000Z";

const useCourseDataStore = defineStore("courseData", {
  state: () => ({
    versionNumber: "1.0.0", // change when making backwards-incompatible changes
    currentSemester: 1,
    activeRoad: "$defaultroad$",
    addingFromCard: false,
    classInfoStack: [],
    cookiesAllowed: undefined,
    customClassEditing: undefined,
    fullSubjectsInfoLoaded: false,
    genericCourses: [],
    genericIndex: {},
    itemAdding: undefined,
    loggedIn: false,
    hideIAP: localStorage.hideIAP === "true",
    roads: {
      $defaultroad$: {
        downloaded: moment().format(DATE_FORMAT),
        changed: moment().format(DATE_FORMAT),
        name: "My First Road",
        agent: "",
        contents: {
          coursesOfStudy: ["girs"],
          selectedSubjects: Array.from(Array(16), () => []),
          progressOverrides: {},
          progressAssertions: {},
        },
      },
    },
    subjectsIndex: {},
    subjectsInfo: [],
    ignoreRoadChanges: false,
    // When changes are made to roads, different levels of fulfillment need to be update in the audit
    // all: update audit for all majors (for changes like adding a class)
    // {specific major}: update audit for a specific major (for changes like adding a major)
    // none: no update to audit is needed (for changes like road name)
    fulfillmentNeeded: "all",
    // list of road IDs that have not been retrieved from the server yet
    unretrieved: [],
    loadSubjectsPromise: undefined,
    loadedSubjects: false,
    roadsToMigrate: [],
    isDarkMode: JSON.parse(localStorage.courseRoadStore ?? "{}").isDarkMode,
  }),
  getters: {
    userYear: (state) => {
      return Math.floor((state.currentSemester - 1) / 3);
    },
  },
  actions: {
    getMatchingAttributes(gir, hass, ci) {
      const matchingClasses = this.subjectsInfo.filter(function (subject) {
        if (gir !== undefined && subject.gir_attribute !== gir) {
          return false;
        }
        if (hass !== undefined && subject.hass_attribute !== hass) {
          return false;
        }
        return !(ci !== undefined && subject.communication_requirement !== ci);
      });

      const totalObject = matchingClasses.reduce(
        function (accumObject, nextClass) {
          return {
            offered_spring:
              accumObject.offered_spring || nextClass.offered_spring,
            offered_summer:
              accumObject.offered_summer || nextClass.offered_summer,
            offered_IAP: accumObject.offered_IAP || nextClass.offered_IAP,
            offered_fall: accumObject.offered_fall || nextClass.offered_fall,
            in_class_hours:
              accumObject.in_class_hours +
              (nextClass.in_class_hours !== undefined
                ? nextClass.in_class_hours
                : 0),
            out_of_class_hours:
              accumObject.out_of_class_hours +
              (nextClass.out_of_class_hours !== undefined
                ? nextClass.out_of_class_hours
                : 0),
          };
        },
        {
          offered_spring: false,
          offered_summer: false,
          offered_IAP: false,
          offered_fall: false,
          in_class_hours: 0,
          out_of_class_hours: 0,
        },
      );
      totalObject.in_class_hours /= matchingClasses.length;
      totalObject.out_of_class_hours /= matchingClasses.length;
      return totalObject;
    },
    resetState() {
      this.$reset();
    },
    addClass(newClass) {
      this.roads[this.activeRoad].contents.selectedSubjects[
        newClass.semester
      ].push(newClass);
      this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
    },
    addFromCard(classItem) {
      this.addingFromCard = true;
      this.itemAdding = classItem;
    },
    addReq(event) {
      this.roads[this.activeRoad].contents.coursesOfStudy.push(event);
      this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
      this.fulfillmentNeeded = event;
    },
    migrateOldSubjects(roadID) {
      for (let i = 0; i < 16; i++) {
        for (
          let j = 0;
          j < this.roads[roadID].contents.selectedSubjects[i].length;
          j++
        ) {
          const subject = this.roads[roadID].contents.selectedSubjects[i][j];

          const subjectIndex = this.subjectsIndex[subject.subject_id];
          const genericIndex = this.genericIndex[subject.subject_id];

          const notInCatalog =
            subjectIndex === undefined && genericIndex === undefined;
          const isHistorical =
            subjectIndex !== undefined &&
            this.subjectsInfo[subjectIndex].is_historical;

          if (notInCatalog || isHistorical) {
            // Look for subject with old ID
            const oldSubjects = this.subjectsInfo.filter((subj) => {
              return subj.old_id === subject.subject_id;
            });

            if (oldSubjects.length > 0) {
              const oldSubject = oldSubjects[0];
              subject.subject_id = oldSubject.subject_id;
              subject.title = oldSubject.title;
              subject.units = oldSubject.total_units;
            }
          }
        }
      }
    },
    allowCookies() {
      this.cookiesAllowed = true;
    },
    cancelAddFromCard() {
      this.addingFromCard = false;
      this.itemAdding = undefined;
    },
    cancelEditCustomClass() {
      this.customClassEditing = undefined;
    },
    clearClassInfoStack() {
      this.classInfoStack = [];
    },
    disallowCookies() {
      this.cookiesAllowed = false;
    },
    deleteRoad(id) {
      this.ignoreRoadChanges = true;
      Vue.delete(this.roads, id);
    },
    dragStartClass(event) {
      let classInfo = event.classInfo;
      if (classInfo === undefined) {
        if (event.basicClass.subject_id in this.subjectsIndex) {
          classInfo =
            this.subjectsInfo[this.subjectsIndex[event.basicClass.subject_id]];
        } else if (event.basicClass.subject_id in this.genericIndex) {
          classInfo =
            this.genericCourses[this.genericIndex[event.basicClass.subject_id]];
        }
      }
      this.itemAdding = classInfo;
      this.addingFromCard = false;
    },
    editCustomClass(classItem) {
      this.customClassEditing = classItem;
    },
    finishEditCustomClass(newClass) {
      for (const attr of [
        "subject_id",
        "title",
        "in_class_hours",
        "out_of_class_hours",
        "custom_color",
        "public",
        "offered_fall",
        "offered_IAP",
        "offered_spring",
        "offered_summer",
      ]) {
        this.customClassEditing[attr] = newClass[attr];
      }
      this.customClassEditing.units = newClass.total_units;
      this.customClassEditing = undefined;
    },
    moveClass({ currentClass, classIndex, semester }) {
      this.roads[this.activeRoad].contents.selectedSubjects[
        currentClass.semester
      ].splice(classIndex, 1);
      currentClass.semester = semester;
      this.roads[this.activeRoad].contents.selectedSubjects[semester].push(
        currentClass,
      );
      this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
    },
    overrideWarnings(payload) {
      const classIndex = this.roads[this.activeRoad].contents.selectedSubjects[
        payload.classInfo.semester
      ].indexOf(payload.classInfo);
      this.roads[this.activeRoad].contents.selectedSubjects[
        payload.classInfo.semester
      ][classIndex].overrideWarnings = payload.override;
    },
    setPASubstitutions({ uniqueKey, newReqs }) {
      Vue.set(
        this.roads[this.activeRoad].contents.progressAssertions,
        uniqueKey,
        { substitutions: newReqs },
      );
      Vue.set(
        this.roads[this.activeRoad],
        "changed",
        moment().format(DATE_FORMAT),
      );
    },
    setPAIgnore({ uniqueKey, isIgnored }) {
      const progressAssertion =
        this.roads[this.activeRoad].contents.progressAssertions[uniqueKey];
      if (isIgnored === true) {
        if (progressAssertion === undefined) {
          Vue.set(
            this.roads[this.activeRoad].contents.progressAssertions,
            uniqueKey,
            { ignore: isIgnored },
          );
        } else {
          progressAssertion.ignore = isIgnored;
        }
      } else {
        if (progressAssertion.substitutions === undefined) {
          this.removeProgressAssertion(uniqueKey);
        } else {
          Vue.delete(progressAssertion, "ignore");
        }
      }
      Vue.set(
        this.roads[this.activeRoad],
        "changed",
        moment().format(DATE_FORMAT),
      );
    },
    setUnretrieved(roadIDs) {
      this.unretrieved = roadIDs;
    },
    setRetrieved(roadID) {
      // Remove from unretrieved list when a road is retrieved
      const roadIDIndex = this.unretrieved.indexOf(roadID);
      if (roadIDIndex >= 0) {
        this.unretrieved.splice(roadIDIndex, 1);
      }
    },
    parseGenericCourses() {
      const girAttributes = {
        PHY1: ["Physics 1 GIR", "p1"],
        PHY2: ["Physics 2 GIR", "p2"],
        CHEM: ["Chemistry GIR", "c"],
        BIOL: ["Biology GIR", "b"],
        CAL1: ["Calculus I GIR", "m1"],
        CAL2: ["Calculus II GIR", "m2"],
        LAB: ["Lab GIR", "l1"],
        REST: ["REST GIR", "r"],
      };
      // the titles of the hass and ci attributes are currently not used in the description on fireroad
      // I think they might be nice to display with the description, but as of now they are unused
      const hassAttributes = {
        "HASS-A": ["HASS Arts", "ha"],
        "HASS-S": ["HASS Social Sciences", "hs"],
        "HASS-H": ["HASS Humanities", "hh"],
        "HASS-E": ["HASS Elective", "ht"],
      };
      const ciAttributes = {
        "CI-H": ["Communication Intensive", "hc"],
        "CI-HW": ["Communication Intensive with Writing", "hw"],
      };
      const genericCourses = [];
      const baseGeneric = {
        description:
          "Use this generic subject to indicate that you are fulfilling a requirement, but do not yet have a specific subject selected.",
        total_units: 12,
      };
      const baseurl =
        "http://student.mit.edu/catalog/search.cgi?search=&style=verbatim&when=*&termleng=4&days_offered=*&start_time=*&duration=*&total_units=*";
      for (const gir in girAttributes) {
        const offeredGir = this.getMatchingAttributes(
          gir,
          undefined,
          undefined,
        );
        genericCourses.push(
          Object.assign({}, baseGeneric, offeredGir, {
            gir_attribute: gir,
            title: "Generic " + girAttributes[gir][0],
            subject_id: gir,
            url: baseurl + "&cred=" + girAttributes[gir][1] + "&commun_int=*",
          }),
        );
      }
      for (const hass in hassAttributes) {
        const offeredHass = this.getMatchingAttributes(
          undefined,
          hass,
          undefined,
        );
        genericCourses.push(
          Object.assign({}, baseGeneric, offeredHass, {
            hass_attribute: hass,
            title: "Generic " + hass,
            subject_id: hass,
            url: baseurl + "&cred=" + hassAttributes[hass][1] + "&commun_int=*",
          }),
        );
        const offeredHassCI = this.getMatchingAttributes(
          undefined,
          hass,
          "CI-H",
        );
        genericCourses.push(
          Object.assign({}, baseGeneric, offeredHassCI, {
            hass_attribute: hass,
            communication_requirement: "CI-H",
            title: "Generic CI-H " + hass,
            subject_id: "CI-H " + hass,
            url:
              baseurl +
              "&cred=" +
              hassAttributes[hass][1] +
              "&commun_int=" +
              ciAttributes["CI-H"][1],
          }),
        );
      }
      for (const ci in ciAttributes) {
        const offeredCI = this.getMatchingAttributes(undefined, undefined, ci);
        genericCourses.push(
          Object.assign({}, baseGeneric, offeredCI, {
            communication_requirement: ci,
            title: "Generic " + ci,
            hass_attribute: "HASS",
            subject_id: ci,
            url: baseurl + "&cred=*&commun_int=" + ciAttributes[ci][1],
          }),
        );
      }
      this.genericCourses = genericCourses;
    },
    parseGenericIndex() {
      this.genericIndex = this.genericCourses.reduce(function (
        obj,
        item,
        index,
      ) {
        obj[item.subject_id] = index;
        return obj;
      }, {});
    },
    parseSubjectsIndex() {
      this.subjectsIndex = this.subjectsInfo.reduce(function (
        obj,
        item,
        index,
      ) {
        obj[item.subject_id] = index;
        return obj;
      }, {});
    },
    popClassStack() {
      this.classInfoStack.pop();
    },
    pushClassStack(id) {
      if (id in this.subjectsIndex || id in this.genericIndex) {
        if (
          this.classInfoStack.length === 0 ||
          id !== this.classInfoStack[this.classInfoStack.length - 1]
        ) {
          // we don't want to push to the stack if we click the same class over and over again
          this.classInfoStack.push(id);
        }
      }
    },
    removeClass({ classInfo, classIndex }) {
      this.roads[this.activeRoad].contents.selectedSubjects[
        classInfo.semester
      ].splice(classIndex, 1);
      this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
    },
    removeReq(event) {
      const reqIndex =
        this.roads[this.activeRoad].contents.coursesOfStudy.indexOf(event);
      if (reqIndex === -1) {
        console.log(
          "Attempted to remove a requirement not in the requirements list.",
        );
      } else {
        this.roads[this.activeRoad].contents.coursesOfStudy.splice(reqIndex, 1);
        this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
        this.fulfillmentNeeded = "none";
      }
    },
    removeProgressAssertion(uniqueKey) {
      Vue.delete(
        this.roads[this.activeRoad].contents.progressAssertions,
        uniqueKey,
      );
      Vue.set(
        this.roads[this.activeRoad],
        "changed",
        moment().format(DATE_FORMAT),
      );
    },
    resetID({ oldid, newid }) {
      newid = newid.toString();
      Vue.set(this.roads, newid, this.roads[oldid]);
      if (this.activeRoad === oldid) {
        this.activeRoad = newid;
      }
      Vue.delete(this.roads, oldid);
      this.ignoreRoadChanges = true;
      this.fulfillmentNeeded = "none";
      const migrationIndex = this.roadsToMigrate.indexOf(oldid);
      if (migrationIndex >= 0) {
        this.roadsToMigrate.splice(migrationIndex, 1, newid);
      }
    },
    setActiveRoad(activeRoad) {
      this.activeRoad = activeRoad;
    },
    setFullSubjectsInfoLoaded(isFull) {
      this.fullSubjectsInfoLoaded = isFull;
    },
    setLoggedIn(newLoggedIn) {
      this.loggedIn = newLoggedIn;
    },
    setHideIAP(value) {
      this.hideIAP = value;
      localStorage.hideIAP = value;
    },
    setRoadProp({ id, prop, value, ignoreSet }) {
      if (ignoreSet) {
        this.ignoreRoadChanges = true;
      }
      if (prop !== "contents") {
        this.fulfillmentNeeded = "none";
      }
      Vue.set(this.roads[id], prop, value);
    },
    setRoad({ id, road, ignoreSet }) {
      if (ignoreSet) {
        this.ignoreRoadChanges = true;
      }
      if (this.activeRoad !== id) {
        this.fulfillmentNeeded = "none";
      }
      Vue.set(this.roads, id, road);
    },
    setRoads(roads) {
      this.roads = roads;
    },
    setRoadName({ id, name }) {
      this.roads[id].name = name;
      this.roads[id].changed = moment().format(DATE_FORMAT);
    },
    setSubjectsInfo(data) {
      this.subjectsInfo = data;
    },
    setCurrentSemester(sem) {
      this.currentSemester = Math.max(1, sem);
    },
    updateProgress(progress) {
      Vue.set(
        this.roads[this.activeRoad].contents.progressOverrides,
        progress.listID,
        progress.progress,
      );
      this.roads[this.activeRoad].changed = moment().format(DATE_FORMAT);
    },
    setFromLocalStorage(localStore) {
      this.$patch(localStore);
    },
    updateRoad(id, road) {
      Object.assign(this.roads[id], road);
    },
    watchRoadChanges() {
      this.ignoreRoadChanges = false;
    },
    // Reset fulfillment needed to default of all
    resetFulfillmentNeeded() {
      this.fulfillmentNeeded = "all";
    },
    setLoadSubjectsPromise(promise) {
      this.loadSubjectsPromise = promise;
    },
    setSubjectsLoaded() {
      this.subjectsLoaded = true;
    },
    queueRoadMigration(roadID) {
      this.roadsToMigrate.push(roadID);
    },
    clearMigrationQueue() {
      this.roadsToMigrate = [];
    },
    changeTheme() {
      this.isDarkMode = !this.isDarkMode;
    },
    async loadAllSubjects() {
      const promise = axios.get(
        import.meta.env.VITE_FIREROAD_URL + "/courses/all?full=true",
      );
      this.setLoadSubjectsPromise(promise);
      const response = await promise;
      this.setSubjectsLoaded();
      this.setSubjectsInfo(response.data);
      this.setFullSubjectsInfoLoaded(true);
      this.parseGenericCourses();
      this.parseGenericIndex();
      this.parseSubjectsIndex();
      for (const roadID of this.roadsToMigrate) {
        this.migrateOldSubjects(roadID);
      }
      this.clearMigrationQueue();
    },
    addAtPlaceholder(index) {
      let newClass = {};
      if (this.itemAdding.public === false) {
        // Adding custom class
        newClass = {
          overrideWarnings: false,
          semester: index,
          title: this.itemAdding.title,
          subject_id: this.itemAdding.subject_id,
          units: this.itemAdding.total_units,
          in_class_hours: this.itemAdding.in_class_hours,
          out_of_class_hours: this.itemAdding.out_of_class_hours,
          custom_color: this.itemAdding.custom_color,
          public: false,
        };
      } else {
        // Class is in catalog
        newClass = {
          overrideWarnings: false,
          semester: index,
          title: this.itemAdding.title,
          subject_id: this.itemAdding.subject_id,
          units: this.itemAdding.total_units,
        };
      }
      this.addClass(newClass);
      this.cancelAddFromCard();
    },
    async waitLoadSubjects() {
      if (this.loadSubjectsPromise !== undefined) {
        return this.loadSubjectsPromise;
      } else {
        return this.loadAllSubjects();
      }
    },
    waitAndMigrateOldSubjects(roadID) {
      if (this.subjectsLoaded) {
        this.migrateOldSubjects(roadID);
      } else {
        this.queueRoadMigration(roadID);
        this.waitLoadSubjects();
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseDataStore, import.meta.hot));
}

export default useCourseDataStore;
