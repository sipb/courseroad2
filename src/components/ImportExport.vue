<template>
  <v-layout grow>
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
          <v-flex v-if="otherRoadHasName(roadtitle)">
            <v-card color="red">
              <v-card-text>
                <b>Invalid input!</b>
                There's already a road with this name.
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex v-if="badinput">
            <v-card color="red">
              <v-card-text>
                <b>Invalid input!</b>
                Make sure you have given this road a unique name, and
                uploaded/pasted a valid '.road' file.
              </v-card-text>
            </v-card>
          </v-flex>
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
  </v-layout>
</template>

<script>
import simpleSSMixin from "./../mixins/sanitizeSubjects.js";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ImportExport",
  components: {},
  mixins: [simpleSSMixin],
  data: function () {
    return {
      dialog: false,
      inputtext: "",
      roadtitle: "",
      badinput: false,
    };
  },
  computed: {
    activeRoad() {
      return this.$store.state.activeRoad;
    },
    roads() {
      return this.$store.state.roads;
    },
  },
  mounted() {
    // read uploaded files
  },
  methods: {
    onFileChange: function (event) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.inputtext = event.target.result;
      };

      if (event.target.files[0]) {
        // would have been undefined if user exited file select dialog
        const name = event.target.files[0].name;
        // check for valid type hopefully
        if (name.substr(name.length - 5) === ".road") {
          // update title unless they already input one
          if (this.roadtitle === "") {
            this.roadtitle = name.substr(0, name.length - 5);
          }
          // finally, read the file
          reader.readAsText(event.target.files[0]);
        } else {
          // wrong file type
          this.badinput = true;
          setTimeout(() => {
            this.badinput = false;
          }, 7000);
        }
      }
    },
    exportRoad: function () {
      const filename = this.roads[this.activeRoad].name + ".road";

      const roadSubjects = this.flatten(
        this.roads[this.activeRoad].contents.selectedSubjects,
      );
      const formattedRoadContents = Object.assign(
        { coursesOfStudy: ["girs"], progressOverrides: [] },
        this.roads[this.activeRoad].contents,
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
    },
    importRoad: async function () {
      let fail = false;
      // check for legal input
      if (
        this.inputtext === "" ||
        this.roadtitle === "" ||
        this.otherRoadHasName(this.roadtitle)
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
          const obj = JSON.parse(this.inputtext);
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
              if (this.$store.state.subjectsIndex[s.subject_id] !== undefined) {
                subject =
                  this.$store.state.subjectsInfo[
                    this.$store.state.subjectsIndex[s.subject_id]
                  ];
              } else if (
                this.$store.state.genericIndex[s.subject_id] !== undefined
              ) {
                subject =
                  this.$store.state.genericCourses[
                    this.$store.state.genericIndex[s.subject_id]
                  ];
              }

              if (subject === undefined) {
                const oldSubjects = this.$store.state.subjectsInfo.filter(
                  (subj) => {
                    return subj.old_id === s.subject_id;
                  },
                );

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
          const simpless = await this.getSimpleSelectedSubjects(ss);

          this.$emit(
            "add-road",
            this.roadtitle,
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
        this.badinput = true;
        // make warning go away after 7 seconds
        setTimeout(() => {
          this.badinput = false;
        }, 7000);
      } else {
        this.badinput = false;
        this.dialog = false;
      }
    },
    otherRoadHasName: function (roadName) {
      const otherRoadNames = Object.keys(this.roads).filter(
        function (road) {
          return this.roads[road].name.toLowerCase() === roadName.toLowerCase();
        }.bind(this),
      );
      return otherRoadNames.length > 0;
    },
  },
});
</script>

<style scoped>
.collapse-button {
  min-width: 0;
  margin: 0.5em;
}
</style>
