<template>
  <v-layout row >
    <v-btn outline round color="primary" @click="exportRoad">
      Export
    </v-btn>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn outline round color="primary" v-on="on">
          Import
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Import Road
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="roadtitle"
            outline
            label="Road name"
            clearable
          ></v-text-field>
          <v-spacer></v-spacer>
          <input id="file" type="file" />
          <v-spacer></v-spacer>
          <v-textarea
            v-model="inputtext"
            label="Or copy/paste a road here"
            full-width
            single-line
          ></v-textarea>
          <v-spacer></v-spacer>

          <v-flex v-if="badinput">
            <v-card color="red">
              <v-card-title>
                <b>Invalid input!</b> Make sure you have given this road a name, and uploaded/pasted the right thing.
              </v-card-title>
            </v-card>
          </v-flex>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            color="primary"
            flat
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
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
  name: "import-export",
  components: {},
  props: ["roads", "activeRoad"],
  data: function(){ return {
    dialog: false,
    inputtext: "",
    roadtitle: "",
    badinput: false,
  }},
  methods: {
    exportRoad: function(event) {
      var filename = this.roads[this.activeRoad].name + '.road';
      var text = JSON.stringify(this.roads[this.activeRoad].contents);

      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    importRoad: function(event) {

      let fail = false;
      // check for legal input
      if (this.inputtext === "" || this.roadtitle === ""){
        fail = true;
      }

      if (!fail) {
        try {
          // parse text and add to roads and stuff
          var obj = JSON.parse(this.inputtext);
          this.$emit('add-road', this.roadtitle, obj.coursesOfStudy, obj.selectedSubjects)
        } catch(error) {
          fail = true;
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
  },
  mounted() {
    // read uploaded files
    var onChange = (event) => {

      var reader = new FileReader();
      reader.onload = (event) => {
          this.inputtext = event.target.result;
      };
      reader.readAsText(event.target.files[0]);
    }

    document.getElementById('file').addEventListener('change', onChange);
  },
}
</script>


<style>
</style>
