<template>
  <v-row class="grow" no-gutters>
    <v-btn
      class="collapse-button"
      outlined
      color="primary"
      data-cy="exportRoadButton"
      @click="exportRoad"
    >
      <span class="hidden-sm-and-down">Export</span>
      <v-icon class="hidden-md-and-up"> mdi-cloud-download </v-icon>
    </v-btn>

    <v-dialog v-model="dialog" max-width="600">
      <template #activator="{ on, attrs }">
        <v-btn
          slot="activator"
          class="collapse-button"
          outlined
          color="primary"
          data-cy="importRoadButton"
          v-bind="attrs"
          v-on="on"
        >
          <span class="hidden-sm-and-down">Import</span>
          <v-icon class="hidden-md-and-up"> mdi-cloud-upload </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-btn icon text style="float: right" @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title class="text-h5 lighten-2" primary-title>
          Import Road
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-if="dialog"
            v-model="roadtitle"
            outlined
            label="Road name"
            clearable
            autofocus
            data-cy="importRoadTitle"
            @keyup.enter="importRoad"
          ></v-text-field>

          <v-spacer />
          <input
            id="file"
            type="file"
            data-cy="importRoadFileInput"
            @input="onFileChange"
          />

          <v-textarea
            v-model="inputtext"
            style="margin-top: 10px"
            label="Or copy/paste a road here"
            full-width
            single-line
            outlined
          />

          <v-spacer />
          <v-col v-if="otherRoadHasName(roadtitle)">
            <v-card color="red">
              <v-card-text>
                <b>Invalid input!</b>
                There's already a road with this name.
              </v-card-text>
            </v-card>
          </v-col>
          <v-col v-if="badinput">
            <v-card color="red">
              <v-card-text>
                <b>Invalid input!</b>
                Make sure you have given this road a unique name, and
                uploaded/pasted a valid '.road' file.
              </v-card-text>
            </v-card>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false"> Cancel </v-btn>
          <v-btn
            color="primary"
            :disabled="otherRoadHasName(roadtitle)"
            data-cy="importRoadSubmitButton"
            @click="importRoad"
          >
            Import!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "../plugins/composition.js";
import { getSimpleSelectedSubjects } from "../mixins/sanitizeSubjects.js";
import { flatten } from "../plugins/browserSupport.js";

const store = useStore();

const emit = defineEmits(["add-road"]);

const dialog = ref(false);
const inputtext = ref("");
const roadtitle = ref("");
const badinput = ref(false);

const activeRoad = computed(() => store.activeRoad);
const roads = computed(() => store.roads);

const onFileChange = (event) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    inputtext.value = event.target.result;
  };

  if (event.target.files[0]) {
    // would have been undefined if user exited file select dialog
    const name = event.target.files[0].name;
    // check for valid type hopefully
    if (name.substr(name.length - 5) === ".road") {
      // update title unless they already input one
      if (roadtitle.value === "") {
        roadtitle.value = name.substr(0, name.length - 5);
      }
      // finally, read the file
      reader.readAsText(event.target.files[0]);
    } else {
      // wrong file type
      badinput.value = true;
      setTimeout(() => {
        badinput.value = false;
      }, 7000);
    }
  }
};

const exportRoad = () => {
  const filename = roads.value[activeRoad.value].name + ".road";

  const roadSubjects = flatten(
    roads.value[activeRoad.value].contents.selectedSubjects,
  );
  const formattedRoadContents = Object.assign(
    { coursesOfStudy: ["girs"], progressOverrides: [] },
    roads.value[activeRoad.value].contents,
    { selectedSubjects: roadSubjects },
  );

  const text = JSON.stringify(formattedRoadContents);

  // for some reason this is the way you download files...
  //    create an element, click it, and remove it
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

const importRoad = async () => {
  let fail = false;
  // check for legal input
  if (
    inputtext.value === "" ||
    roadtitle.value === "" ||
    otherRoadHasName(roadtitle.value)
  ) {
    fail = true;
  }

  const expectedFields = [
    "index",
    "title",
    "overrideWarnings",
    "semester",
    "units",
    "subject_id",
  ];

  if (!fail) {
    try {
      // parse text and add to roads
      const obj = JSON.parse(inputtext.value);
      // sanitize
      // progressOverrides must be defined
      if (obj.progressOverrides === undefined) {
        obj.progressOverrides = {};
      }
      // subject_id issue
      const newss = obj.selectedSubjects.map((s) => {
        if ("id" in s) {
          s.subject_id = s.id;
          delete s.id;
        }
        return s;
      });
      obj.selectedSubjects = newss;

      const ss = obj.selectedSubjects
        .map((s) => {
          // make sure it has everything, if not fill in from subjectsIndex or genericCourses
          let subject;
          if (store.subjectsIndex[s.subject_id] !== undefined) {
            subject = store.subjectsInfo[store.subjectsIndex[s.subject_id]];
          } else if (store.genericIndex[s.subject_id] !== undefined) {
            subject = store.genericCourses[store.genericIndex[s.subject_id]];
          }

          if (subject === undefined) {
            const oldSubjects = store.subjectsInfo.filter((subj) => {
              return subj.old_id === s.subject_id;
            });

            if (oldSubjects.length > 0) {
              subject = oldSubjects[0];
              s.subject_id = subject.subject_id;
            }
          }

          if (subject !== undefined) {
            expectedFields.forEach((f) => {
              if (s[f] === undefined) {
                // right now (4/16/19) 'units' is the only one that doesn't match and needs an exception
                if (f === "units") {
                  s[f] = subject.total_units;
                } else {
                  s[f] = subject[f];
                }
              }
            });
            return s;
          }
          console.log("ignoring " + s.subject_id);
          return undefined;
        })
        .filter((s) => {
          return s !== undefined;
        });

      // convert selected subjects to more convenient format
      const simpless = await getSimpleSelectedSubjects(ss);

      emit(
        "add-road",
        roadtitle.value,
        obj.coursesOfStudy,
        simpless,
        obj.progressOverrides,
      );
    } catch (error) {
      fail = true;
      console.log("import failed with error:");
      console.error(error);
    }
  }

  if (fail) {
    badinput.value = true;
    // make warning go away after 7 seconds
    setTimeout(() => {
      badinput.value = false;
    }, 7000);
  } else {
    badinput.value = false;
    dialog.value = false;
  }
};

const otherRoadHasName = (roadName) => {
  const otherRoadNames = Object.keys(roads.value).filter((road) => {
    return roads.value[road].name.toLowerCase() === roadName.toLowerCase();
  });
  return otherRoadNames.length > 0;
};
</script>

<style scoped>
.collapse-button {
  min-width: 0;
  margin: 0.5em;
}
</style>
