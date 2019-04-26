<template>
  <v-layout row grow>
    <v-btn class="collapse-button" outline round color="primary" @click="exportRoad">
      <span class="hidden-sm-and-down">Export</span>
      <font-awesome-icon class="hidden-md-and-up" icon="cloud-download-alt" />
    </v-btn>

    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <v-btn slot="activator" class="collapse-button" outline round color="primary">
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
          />

          <v-spacer />
          <input id="file" type="file">

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
                Make sure you have given this road a name, and uploaded/pasted the right thing.
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
          >
            Import!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: 'ImportExport',
  components: {},
  props: ['roads', 'activeRoad', 'subjects', 'subjectsIndex', 'genericCourses', 'genericIndex'],
  data: function () {
    return {
      dialog: false,
      inputtext: '',
      roadtitle: '',
      badinput: false
    };
  },
  mounted () {
    // read uploaded files
    var onFileChange = (event) => {
      var reader = new FileReader();
      reader.onload = (event) => {
        this.inputtext = event.target.result;
      };

      if (event.target.files[0]) {
        // would have been undefined if user exited file select dialog
        let name = event.target.files[0].name;
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
      var filename = this.roads[this.activeRoad].name + '.road';
      var text = JSON.stringify(this.roads[this.activeRoad].contents);

      // for some reason this is the way you download files...
      //    create an element, click it, and remove it
      var element = document.createElement('a');
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
      if (this.inputtext === '' || this.roadtitle === '') {
        fail = true;
      }

      let expectedFields = ['index', 'title', 'overrideWarnings', 'semester', 'units', 'id' ];

      if (!fail) {
        try {
          // parse text and add to roads
          var obj = JSON.parse(this.inputtext);
          // sanitize
          // progressOverrides must be defined
          if (obj.progressOverrides === undefined) {
            obj.progressOverrides = {};
          }
          // subject_id issue
          let newss = obj.selectedSubjects.map((s) => {
            if ('subject_id' in s) {
              s.id = s.subject_id;
              delete s.subject_id;
            }
            return s;
          });
          obj.selectedSubjects = newss;
          let ss = obj.selectedSubjects.map((s) => {
            // make sure it has everything, if not fill in from subjectsIndex or genericCourses
            let subject;
            if (this.subjectsIndex[s.id] !== undefined) {
              subject = this.subjects[this.subjectsIndex[s.id]];
            } else if (this.genericIndex[s.id] !== undefined) {
              subject = this.genericCourses[this.genericIndex[s.id]];
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
          this.$emit('add-road', this.roadtitle, obj.coursesOfStudy, ss, obj.progressOverrides);
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
      var otherRoadNames = Object.keys(this.roads).filter(function (road) {
        return this.roads[road].name === roadName;
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
