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
          <input id="file" type="file" />
          <v-spacer></v-spacer>
          <v-text-field
            v-model="roadtitle"
            box
            label="Road name"
            clearable
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-textarea
            v-model="inputtext"
            label="Or copy/paste a road here"
            full-width
            single-line
          ></v-textarea>
          {{inputtext}}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
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
      this.dialog = false;
    },
    settext: function(t) {
      this.inputtext = t;
    }
  },
  mounted() {
    var onChange = function(event) {

      function onReaderLoad(event){
          console.log(event.target.result);
          var obj = JSON.parse(event.target.result);
          this.settext(event.target.result) // not a function
          // this.inputtext = event.target.result;
      }

      var reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsText(event.target.files[0]);
    }

    document.getElementById('file').addEventListener('change', onChange);
  },
}
</script>


<style>
</style>
