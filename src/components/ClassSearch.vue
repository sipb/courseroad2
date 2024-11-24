<template>
  <v-container :style="searchHeight + 'display: flex; flex-direction:column;'">
    <div>
      <FilterSet
        v-model="chosenFilters.girs"
        :label="'GIR'"
        :filters="allFilters.girs.filters"
      />
      <FilterSet
        v-model="chosenFilters.hass"
        :label="'HASS'"
        :filters="allFilters.hass.filters"
      />
      <FilterSet
        v-model="chosenFilters.ci"
        :label="'CI'"
        :filters="allFilters.ci.filters"
      />
      <FilterSet
        v-model="chosenFilters.level"
        :label="'Level'"
        :filters="allFilters.level.filters"
      />
      <FilterSet
        v-model="chosenFilters.units"
        :label="'Units'"
        :filters="allFilters.units.filters"
      />
      <FilterSet
        v-model="chosenFilters.terms"
        :label="'Term'"
        :filters="allFilters.terms.filters"
      />
      <FilterSet
        v-model="chosenFilters.virtual"
        :label="'Virtual'"
        :filters="allFilters.virtual.filters"
      />
    </div>
    <div style="display: flex; flex: 1; min-height: 0px">
      <div style="flex: 1; overflow: auto">
        <v-data-table
          :items="autocomplete"
          :items-per-page-options="rowsPerPageItems"
          :sync="pagination"
          :no-data-text="'No results'"
          :items-per-page-text="'Results per page:\xa0'"
          :hide-default-header="true"
        >
          <template slot="item" slot-scope="searchProps">
            <v-hover>
              <tr
                slot-scope="{ hover }"
                :data-cy="
                  'classInSearch' +
                  searchProps.item.subject_id.replace('.', '_')
                "
                :class="{ 'elevation-3': hover }"
                draggable="true"
                style="cursor: grab; margin: 4px"
                @dragstart="dragStart($event, searchProps)"
                @click="viewClassInfo(searchProps)"
              >
                <td style="padding: 0px; white-space: nowrap; width: 30%">
                  <v-icon style="vertical-align: middle"> mdi-drag </v-icon>
                  <span style="vertical-align: middle">
                    {{ searchProps.item.subject_id }}</span
                  >
                </td>
                <td style="padding: 2px 4px 2px 0px; width: 60%">
                  {{ searchProps.item.title }}
                </td>
              </tr>
            </v-hover>
          </template>
          <template slot="body.append">
            <tr>
              <td colspan="2">
                <CustomClass />
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import CustomClass from "./CustomClass.vue";
import FilterSet from "./FilterSet.vue";
import $ from "jquery";
import {
  FilterGroup,
  RegexFilter,
  MathFilter,
  BooleanFilter,
  ArrayFilter,
} from "../utilities/filters.js";
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useStore, useCookies } from "../plugins/composition.js";

const store = useStore();
const cookies = useCookies();

const props = defineProps({
  searchInput: {
    type: String,
    required: true,
  },
});

const girAny = new RegexFilter("GIR:Any", "Any", ".+", undefined, [
  "gir_attribute",
]);
const girLab = new RegexFilter("GIR:Lab", "Lab", ".*(LAB|LAB2).*", undefined, [
  "gir_attribute",
]);
const girRest = new RegexFilter(
  "GIR:REST",
  "REST",
  ".*(REST|RST2).*",
  undefined,
  ["gir_attribute"],
);
const hassAny = new RegexFilter("HASS:Any", "Any", "HASS", undefined, [
  "hass_attribute",
]);
const hassArt = new RegexFilter("HASS-A", "A", "HASS-A", undefined, [
  "hass_attribute",
]);
const hassSocialScience = new RegexFilter("HASS-S", "S", "HASS-S", undefined, [
  "hass_attribute",
]);
const virtual = new RegexFilter("Virtual", "Y", "^Virtual$", undefined, [
  "virtual_status",
]);
const notVirtual = new RegexFilter("In Person", "N", "^In-Person$", undefined, [
  "virtual_status",
]);
const partlyVirtual = new RegexFilter(
  "Partly Virtual",
  "Both",
  "^Virtual/In-Person$",
  undefined,
  ["virtual_status"],
);
const hassHumanity = new RegexFilter("HASS-H", "H", "HASS-H", undefined, [
  "hass_attribute",
]);
const hassElective = new RegexFilter("HASS-E", "E", "HASS-E", undefined, [
  "hass_attribute",
]);
const ciAny = new RegexFilter("CI:Any", "Any", "CI.+", undefined, [
  "communication_requirement",
]);
const ciH = new RegexFilter("CI-H", "CI-H", "CI-H", undefined, [
  "communication_requirement",
]);
const ciHW = new RegexFilter("CI-HW", "CI-HW", "CI-HW", undefined, [
  "communication_requirement",
]);
const ciNone = new RegexFilter("Not CI", "None", "^(?!CI)", undefined, [
  "communication_requirement",
]);
const levelUG = new RegexFilter("Undergraduate", "UG", "U", undefined, [
  "level",
]);
const levelG = new RegexFilter("Graduate", "G", "G", undefined, ["level"]);
const unitsLt6 = new MathFilter("<6", "<6", [undefined, 6], false, [
  "total_units",
]);
const units6 = new MathFilter("6", "6", [6, 6], true, ["total_units"]);
const units9 = new MathFilter("9", "9", [9, 9], true, ["total_units"]);
const units12 = new MathFilter("12", "12", [12, 12], true, ["total_units"]);
const units15 = new MathFilter("15", "15", [15, 15], true, ["total_units"]);
const units6To15 = new MathFilter("6-15", "6-15", [6, 15], true, [
  "total_units",
]);
const unitsGte15 = new MathFilter(">15", ">15", [15, undefined], false, [
  "total_units",
]);
const termFall = new BooleanFilter("Fall", "FA", false, ["offered_fall"]);
const termIAP = new BooleanFilter("IAP", "IAP", false, ["offered_IAP"]);
const termSpring = new BooleanFilter("Spring", "SP", false, ["offered_spring"]);
const textFilter = new RegexFilter(
  "Subject ID",
  "ID",
  "",
  "nameInput",
  ["subject_id", "title", "old_id"],
  "OR",
);
const instructorFilter = new ArrayFilter(
  "Instructor",
  "Prof",
  RegexFilter,
  ["", "nameInput"],
  ["instructors"],
  "OR",
);

// const dragSemesterNum = ref(-1);
const searchHeight = ref("");
const menuMargin = ref(20);
// lists of the filters turned on in each filter group
const nameInput = ref("");
const chosenFilters = ref({
  girs: [false, false, false],
  hass: [false, false, false, false, false],
  ci: [false, false, false],
  level: [false, false],
  units: [false, false, false, false, false, false, false],
  terms: [false, false, false],
  virtual: [false, false, false],
});
const allFilters = ref({
  girs: new FilterGroup("GIR", [girAny, girLab, girRest], "OR"),
  hass: new FilterGroup(
    "HASS",
    [hassAny, hassArt, hassSocialScience, hassHumanity, hassElective],
    "OR",
  ),
  ci: new FilterGroup("CI", [ciAny, ciH, ciHW, ciNone], "OR"),
  level: new FilterGroup("Level", [levelUG, levelG], "OR"),
  units: new FilterGroup(
    "Units",
    [unitsLt6, units6, units9, units12, units15, units6To15, unitsGte15],
    "OR",
  ),
  terms: new FilterGroup("Term", [termFall, termIAP, termSpring], "OR"),
  virtual: new FilterGroup(
    "Virtual",
    [virtual, notVirtual, partlyVirtual],
    "OR",
  ),
});

const rowsPerPageItems = ref([
  5,
  10,
  20,
  50,
  { text: "$vuetify.dataIterator.rowsPerPageAll", value: -1 },
]);
const pagination = ref({
  rowsPerPage: 20,
});

const allSubjects = computed(() =>
  store.state.genericCourses.concat(store.state.subjectsInfo),
);

const autocomplete = computed(() => {
  // Only display subjects if you are filtering by something
  let returnAny = nameInput.value.length > 0;
  for (const filterName in chosenFilters.value) {
    returnAny = returnAny || chosenFilters.value[filterName].some((f) => f);
  }
  if (!returnAny) {
    return [];
  }
  textFilter.setupInputs({ nameInput: nameInput.value });
  instructorFilter.setupInputs({ nameInput: nameInput.value });
  // Filter subjects that match all filter sets and the text filter
  const filteredSubjects = allSubjects.value.filter((subject) => {
    const matches =
      textFilter.matches(subject) || instructorFilter.matches(subject);
    return (
      matches &&
      Object.keys(allFilters.value).every((filterGroup) => {
        return allFilters.value[filterGroup].matches(
          subject,
          chosenFilters.value[filterGroup],
        );
      })
    );
  });
  // Sort subjects by priority order
  if (nameInput.value.length) {
    // Sort first by if it's a literal string vs regex match, then by if it starts with the search
    textFilter.setupVariants(
      { nameInput: nameInput.value },
      { atStart: true, asLiteral: true },
      ["asLiteral", "atStart"],
    );
    // Compare by variants for each subject
    return filteredSubjects.sort(function (subject1, subject2) {
      return (
        textFilter.compareByVariants(subject2) -
        textFilter.compareByVariants(subject1)
      );
    });
  } else {
    return filteredSubjects;
  }
});

const classInfoStack = computed(() => {
  return store.state.classInfoStack;
});
const classStackExists = computed(() => {
  return classInfoStack.value.length > 0;
});
const cookiesAllowed = computed(() => {
  return store.state.cookiesAllowed;
});

watch(
  () => props.searchInput,
  (newVal) => {
    nameInput.value = newVal;
  },
);
watch(classStackExists, () => {
  nextTick(() => {
    updateMenuStyle();
  });
});

watch(
  () => pagination.value.rowsPerPage,
  (newRows) => {
    if (cookiesAllowed.value) {
      cookies.set("paginationRows", newRows);
    }
  },
);
watch(cookiesAllowed, (newCA) => {
  if (newCA) {
    cookies.set("paginationRows", pagination.value.rowsPerPage);
  }
});

onMounted(() => {
  nextTick(() => {
    updateMenuStyle();
  });
  window.cookies = cookies;
  $(window).resize(() => {
    updateMenuStyle();
  });
  if (cookies.isKey("paginationRows")) {
    pagination.value.rowsPerPage = parseInt(cookies.get("paginationRows"));
  }
});

const dragStart = (event, classItem) => {
  event.dataTransfer.setData(
    "classData",
    JSON.stringify({ isNew: true, classIndex: -1 }),
  );
  store.commit("dragStartClass", {
    dragstart: event,
    classInfo: classItem.item,
    isNew: true,
  });
};
const updateMenuStyle = () => {
  const searchInputElem = document.getElementById("searchInputTF");
  const searchInputRect = searchInputElem.getBoundingClientRect();
  const searchMenuTop = searchInputRect.top + searchInputRect.height;
  const searchInput = $("#searchInputTF");
  const menuWidth = searchInput.outerWidth();
  const classInfoCard = $("#classInfoCard");
  let menuBottom;
  if (classInfoCard.length) {
    menuBottom = classInfoCard.position().top;
  } else {
    menuBottom = $(window).innerHeight();
  }
  const maxHeight = menuBottom - searchMenuTop - menuMargin.value;
  searchHeight.value =
    "max-height: " + maxHeight + "px;width: " + menuWidth + "px;";
};
const viewClassInfo = (item) => {
  store.commit("pushClassStack", item.item.subject_id);
};
// const openFirstClass = () => {
//   if (autocomplete.value.length > 0) {
//     store.commit("pushClassStack", autocomplete.value[0].subject_id);
//   }
// };
</script>
