<template>
  <v-layout row >
    <v-btn outline round color="primary" @click="exportRoad">
      Export
    </v-btn>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <v-btn slot="activator" outline round color="primary">
        Import
      </v-btn>

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
              <v-card-text>
                <b>Invalid input!</b>
                Make sure you have given this road a name, and uploaded/pasted the right thing.
              </v-card-text>
            </v-card>
          </v-flex>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            color="primary"
            flat
            @click="dialog=false"
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
      var filename=this.roads[this.activeRoad].name + '.road';
      var text=JSON.stringify(this.roads[this.activeRoad].contents);

      // for some reason this is the way you download files...
      //    create an element, click it, and remove it
      var element=document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display='none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    importRoad: function(event) {

      let fail=false;
      // check for legal input
      if (this.inputtext === "" || this.roadtitle === ""){
        fail=true;
      }

      if (!fail) {
        try {
          // parse text and add to roads
          var obj=JSON.parse(this.inputtext);
          this.$emit('add-road', this.roadtitle, obj.coursesOfStudy, obj.selectedSubjects)
        } catch(error) {
          fail=true;
        }
      }

      if (fail) {
        this.badinput=true;
        // make warning go away after 7 seconds
        setTimeout(() => { this.badinput=false }, 7000);

      } else {
        this.badinput=false;
        this.dialog=false;
      }
    },
  },
  mounted() {
    // read uploaded files
    var onFileChange=(event) => {

      var reader=new FileReader();
      reader.onload=(event) => {
          this.inputtext=event.target.result;
      };

      if (event.target.files[0]) {
        // would have been undefined if user exited file select dialog
        let name=event.target.files[0].name
        // check for valid type hopefully
        if (name.substr(name.length - 5) === '.road') {
          // update title unless they already input one
          if (this.roadtitle === '') {
            this.roadtitle=name.substr(0, name.length - 5)
          }
          // finally, read the file
          reader.readAsText(event.target.files[0]);
        } else {
          // wrong file type
          this.badinput=true
          setTimeout(() => { this.badinput=false }, 7000);
        }
      }
    }

    document.getElementById('file').addEventListener('change', onFileChange);
  },
}
</script>


<style>
</style>
