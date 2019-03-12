<template>
  <v-layout row>
    <v-tabs
        show-arrows
        v-model="tabRoad"
      >
      <v-tabs-slider></v-tabs-slider>
      <v-tab
        :key="roadid"
        :href="`#${roadid}`"
        v-for="roadid in Object.keys(roads)"
        @click="$emit('change-active', roadid)"
        >
          {{roads[roadid].name}}
          <v-btn icon flat v-show="roadid == tabRoad" @click="newRoadName=roads[roadid].name; editDialog=true;">
            <v-icon>edit</v-icon>
          </v-btn>
      </v-tab>
      <v-dialog v-model="editDialog" @input="newRoadName=''">
        <v-card style="padding: 2em">
          <v-card-title>Edit Road</v-card-title>
          <v-text-field v-model="newRoadName" label="Road Name"></v-text-field>
          <v-card-actions>
            <v-btn color="primary" :disabled="otherRoadHasName(tabRoad, newRoadName)" @click="$emit('set-name', {road: tabRoad,name: newRoadName}); editDialog=false; newRoadName=''">Submit</v-btn>
            <v-btn color="error" @click="editDialog=false; deleteDialog=true;">
              Delete Road
              <v-icon>delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteDialog" v-if="tabRoad in roads">
        <v-card style="padding: 2em">
          <v-card-title>Permanently Delete {{roads[tabRoad].name}}?</v-card-title>
          <v-card-text>This action cannot be undone.</v-card-text>
          <v-card-actions>
            <v-btn @click="deleteDialog=false; editDialog=true;">Cancel</v-btn>
            <v-btn @click="deleteDialog=false; $emit('delete-road',tabRoad); newRoadName=''" color="error">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="addDialog" width="500" @input="newRoadName=''">
        <v-card style="padding: 2em">
          <v-card-title>Create Road</v-card-title>
          <v-text-field v-model="newRoadName"></v-text-field>
          <v-layout row>
            <v-flex xs6>
              <v-switch v-model="duplicateRoad" label="Duplicate Existing"></v-switch>
            </v-flex>
            <v-flex>
              <v-select :disabled="!duplicateRoad" :items="Object.keys(roads)" v-model="duplicateRoadSource">
                <template slot="item" slot-scope="{item}">
                  {{roads[item].name}}
                </template>
                <template slot="selection" slot-scope="{item}">
                  {{roads[item].name}}
                </template>
              </v-select>
            </v-flex>
          </v-layout>
          <v-card-actions>
            <v-btn :disabled="otherRoadHasName('', newRoadName)" color="primary" @click="$emit('add-road', newRoadName); addDialog=false; newRoadName=''">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-tabs>
    <!-- this button gets obscured if the tab sliders are visible -->
    <v-btn icon flat color="primary" @click="addDialog=true">
      <v-icon>add</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
import Road from "./Road.vue"
export default {
  name: 'RoadTabs',
  components: {
    "road": Road
  },
  props: ["activeRoad", "roads"],
  data: function() { return {
    addDialog: false,
    deleteDialog: false,
    editDialog: false,
    duplicateRoad: false,
    duplicateRoadSource: "$defaultroad$",
    newRoadName: "",
    tabRoad: this.activeRoad
  }},
  methods: {
    otherRoadHasName: function(roadID, roadName) {
      var otherRoadNames=Object.keys(this.roads).map(function(road) {
        if(road == roadID) {
          return undefined;
        } else {
          return this.roads[road].name
        }
      }.bind(this));
      return otherRoadNames.indexOf(roadName) >= 0;
    }
  },
  watch: {
    activeRoad: function(newRoad, oldRoad) {
      this.tabRoad=this.activeRoad;
    }
  }

}
</script>

<style>
</style>
