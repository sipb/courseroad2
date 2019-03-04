<template>
  <v-layout row >
    <v-btn outline round color="primary" @click="exportRoad">
      Export
    </v-btn>

    <v-btn outline round color="primary" @click="importRoad">
      Import
    </v-btn>
  </v-layout>
</template>


<script>
export default {
  name: "import-export",
  components: {},
  props: ["roads", "activeRoad"],
  methods: {
    exportRoad: function(event) {
      var filename = this.roads[this.activeRoad].name + '.json';
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

    }
  },
}
</script>


<style>
</style>
