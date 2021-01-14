<template>
  <v-layout row grow>
    <v-btn class="collapse-button" outline color="primary" @click="exportRoad" data-cy="exportRoadButton">
      <span class="hidden-sm-and-down">Export</span>
      <font-awesome-icon class="hidden-md-and-up" icon="cloud-download-alt" />
    </v-btn>

    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <v-btn slot="activator" class="collapse-button" outline color="primary" data-cy="importRoadButton">
        <span class="hidden-sm-and-down">Import</span>
        <font-awesome-icon class="hidden-md-and-up" icon="cloud-upload-alt" />
      </v-btn>
      <v-card>
        <v-btn icon flat style="float:right;" @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-title class="headline lighten-2" primary-title>
          Import Road
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-if="dialog"
            v-model="roadtitle"
            outline
            label="Road name"
            clearable
            autofocus
            @keyup.enter="importRoad"
            data-cy="importRoadTitle"
          />

          <v-spacer />
          <input id="file" type="file" data-cy="importRoadFileInput">

          <v-textarea
            v-model="inputtext"
            style="margin-top: 10px;"
            label="Or copy/paste a road here"
            full-width
            single-line
            outline
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
                Make sure you have given this road a unique name, and uploaded/pasted a valid '.road' file.
              </v-card-text>
            </v-card>
          </v-flex>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn flat @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="otherRoadHasName(roadtitle)"
            @click="importRoad"
            data-cy="importRoadSubmitButton"
          >
            Import!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import simpleSSMixin from './../mixins/simpleSelectedSubjects.js';

export default {
  name: 'ImportExport',
  components: {},
  mixins: [simpleSSMixin],
  data: function () {
    return {
      dialog: false,
      inputtext: '',
      roadtitle: '',
      badinput: false
    };
  },
  computed: {
    activeRoad () {
      return this.$store.state.activeRoad;
    },
    roads () {
      return this.$store.state.roads;
    }
  },
  mounted () {
    // read uploaded files
    const onFileChange = (event) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.inputtext = event.target.result;
      };

      if (event.target.files[0]) {
        // would have been undefined if user exited file select dialog
        const name = event.target.files[0].name;
        // check for valid type hopefully
        if (name.substr(name.length - 5) === '.road') {
          // update title unless they already input one
          if (this.roadtitle === '') {
            this.roadtitle = name.substr(0, name.length - 5);
          }
          // finally, read the file
          reader.readAsText(event.target.files[0]);
        } else {
          // wrong file type
          this.badinput = true;
          setTimeout(() => { this.badinput = false }, 7000);
        }
      }
    };

    document.getElementById('file').addEventListener('change', onFileChange);
  },
  methods: {
    exportRoad: function (event) {
      const filename = this.roads[this.activeRoad].name + '.road';

      const roadSubjects = this.flatten(this.roads[this.activeRoad].contents.selectedSubjects);
      const formattedRoadContents = Object.assign({ coursesOfStudy: ['girs'], progressOverrides: [] }, this.roads[this.activeRoad].contents, { selectedSubjects: roadSubjects });

      const text = JSON.stringify(formattedRoadContents);

      // for some reason this is the way you download files...
      //    create an element, click it, and remove it
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    importRoad: function (event) {
      let fail = false;
      // check for legal input
      if (this.inputtext === '' ||
          this.roadtitle === '' ||
          this.otherRoadHasName(this.roadtitle)
      ) {
        fail = true;
      }

      const expectedFields = ['index', 'title', 'overrideWarnings', 'semester', 'units', 'id'];

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
            if ('subject_id' in s) {
              s.id = s.subject_id;
              delete s.subject_id;
            }
            return s;
          });
          obj.selectedSubjects = newss;

          const ss = obj.selectedSubjects.map((s) => {
            // make sure it has everything, if not fill in from subjectsIndex or genericCourses
            let subject;
            if (this.$store.state.subjectsIndex[s.id] !== undefined) {
              subject = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[s.id]];
            } else if (this.$store.state.genericIndex[s.id] !== undefined) {
              subject = this.$store.state.genericCourses[this.$store.state.genericIndex[s.id]];
            }

            if (subject !== undefined) {
              expectedFields.map((f) => {
                if (s[f] === undefined) {
                  // right now (4/16/19) 'units' is the only one that doesn't match and needs an exception
                  if (f === 'units') {
                    s[f] = subject['total_units'];
                  } else {
                    s[f] = subject[f];
                  }
                }
              });
              return s;
            }
            console.log('ignoring ' + s.id);
            return undefined;
          }).filter((s) => {
            return s !== undefined;
          });

          // convert selected subjects to more convenient format
          const simpless = this.getSimpleSelectedSubjects(ss);

          this.$emit('add-road', this.roadtitle, obj.coursesOfStudy, simpless, obj.progressOverrides);
        } catch (error) {
          fail = true;
          console.log('import failed with error:');
          console.error(error);
        }
      }

      if (fail) {
        this.badinput = true;
        // make warning go away after 7 seconds
        setTimeout(() => { this.badinput = false }, 7000);
      } else {
        this.badinput = false;
        this.dialog = false;
      }
    },
    otherRoadHasName: function (roadName) {
      const otherRoadNames = Object.keys(this.roads).filter(function (road) {
        return this.roads[road].name.toLowerCase() === roadName.toLowerCase();
      }.bind(this));
      return otherRoadNames.length > 0;
    }
  }
};
</script>

<style scoped>
.collapse-button {
  min-width: 0;
}
</style>
