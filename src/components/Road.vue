<template>
  <!-- more on expansion panels (and more examples): https://vuetifyjs.com/en/components/expansion-panels -->
  <!-- this is the example I copied: https://vuetifyjs.com/en/components/expansion-panels#expand -->
  <v-expansion-panels v-model="visibleList" multiple accordion>
    <!-- v-for index in N starts at 1... -->
    <!-- FYI can't use key as prop: https://stackoverflow.com/questions/47783396/access-key-from-child-component-in-vue -->
    <Semester
      v-for="index in numSems"
      :key="index - 1"
      :index="index - 1"
      :selected-subjects="selectedSubjects"
      :semester-subjects="selectedSubjects[index - 1]"
      :road-i-d="roadID"
      :is-open="visibleList.includes(index - 1)"
      :adding-from-card="addingFromCard"
      :dragging-over="dragSemesterNum === index - 1"
      :hide-iap="hideIAP"
      @open-road-settings-dialog="openRoadSettings = true"
    />
    <v-btn
      v-if="addingFromCard"
      fab
      small
      style="position: fixed; right: 1em; bottom: 1em"
      class="secondary"
      @click="store.cancelAddFromCard()"
    >
      <v-icon>mdi-cancel</v-icon>
    </v-btn>
    <v-dialog v-model="openRoadSettings" max-width="600">
      <v-card>
        <v-btn icon text style="float: right" @click="openRoadSettings = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title> Road Settings </v-card-title>
        <v-card-text>
          <v-select
            id="year-choices"
            v-model="year"
            autocomplete
            :items="[
              { value: 0, text: 'First Year/Freshman' },
              { value: 1, text: 'Sophomore' },
              { value: 2, text: 'Junior' },
              { value: 3, text: 'Senior' },
              { value: 4, text: 'Super Senior' },
            ]"
            label="I am a..."
            outlined
            data-cy="selectClassYear"
          />
          <v-switch v-model="hideIAP" label="Hide IAP" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="openRoadSettings = false"> Cancel </v-btn>
          <v-btn
            id="change-year"
            color="primary"
            data-cy="submitRoadSettingsButton"
            @click="
              $emit('change-year', year);
              openRoadSettings = false;
            "
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-expansion-panels>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "RoadComponent",
});
</script>

<script setup>
import Semester from "./Semester.vue";
import { ref, watch, computed, onMounted } from "vue";
import { useStore, useCookies } from "../plugins/composition.js";

const store = useStore();
const cookies = useCookies();

const props = defineProps({
  selectedSubjects: {
    type: Array,
    required: true,
  },
  roadID: {
    type: String,
    required: true,
  },
  addingFromCard: {
    type: Boolean,
    required: true,
  },
  dragSemesterNum: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["change-year"]);

const defaultOpen = [
  false,
  true,
  false,
  true,
  true,
  false,
  true,
  true,
  false,
  true,
  true,
  false,
  true,
];
const numSemesters = 16;

const visibleList = ref(
  (numSemesters >= 13
    ? defaultOpen.concat([true, false, true])
    : defaultOpen
  ).reduce((out, bool, index) => (bool ? out.concat(index) : out), []),
);

const openRoadSettings = ref(false);
const numSems = ref(numSemesters);

const year = computed({
  get: function () {
    return store.userYear;
  },
  set: function (newYear) {
    emit("change-year", newYear);
  },
});

const hideIAP = computed({
  get: function () {
    return store.hideIAP;
  },
  set: function (value) {
    store.setHideIAP(value);
  },
});

watch(visibleList, (newVisibleList) => {
  if (store.cookiesAllowed) {
    cookies.set("visibleList" + props.roadID, JSON.stringify(newVisibleList));
  }
});

onMounted(() => {
  const visibleListCookie = JSON.parse(
    cookies.get("visibleList" + props.roadID),
  );
  if (store.cookiesAllowed && visibleListCookie) {
    if (
      Array.isArray(visibleListCookie) &&
      visibleListCookie.length === numSems.value
    ) {
      visibleList.value = visibleListCookie;
    } else {
      cookies.remove("visibleList" + props.roadID);
    }
  }
});
</script>
