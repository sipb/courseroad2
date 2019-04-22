<template>
  <v-layout row>
    <v-tabs
        show-arrows
        v-model = "tabRoad"
      >
      <v-tabs-slider></v-tabs-slider>
      <v-tab
        :key = "roadId"
        :href = "`#${roadId}`"
        v-for = "roadId in Object.keys(roads)"
        @click = "$emit('change-active', roadId)"
        >
          {{roads[roadId].name}}
          <v-btn icon flat v-show = "roadId == tabRoad" @click = "newRoadName = roads[roadId].name; editDialog = true;">
            <v-icon>edit</v-icon>
          </v-btn>
      </v-tab>
      <v-dialog v-model = "editDialog" @input = "newRoadName = ''" max-width="600">
        <v-card>
          <v-btn icon flat style = "float:right" @click = "editDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title>Edit Road</v-card-title>
          <v-card-text>
            <v-text-field v-if="editDialog" autofocus v-model = "newRoadName" label = "Road Name"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color = "error" @click = "editDialog = false; deleteDialog = true;">
              <v-icon>delete</v-icon>
              Delete Road
            </v-btn>
            <v-btn
              color = "primary"
              :disabled = "otherRoadHasName(tabRoad, newRoadName)"
              @click = "$emit('set-name', {road: tabRoad,name: newRoadName}); editDialog = false; newRoadName = ''"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model = "deleteDialog" v-if = "tabRoad in roads" max-width="600">
        <v-card>
          <v-btn icon flat style = "float:right" @click = "deleteDialog = false"><v-icon>close</v-icon></v-btn>
          <v-card-title>Permanently Delete {{roads[tabRoad].name}}?</v-card-title>
          <v-card-text>This action cannot be undone.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click = "deleteDialog = false; editDialog = true;">Cancel</v-btn>
            <v-btn @click = "deleteDialog = false; $emit('delete-road',tabRoad); newRoadName = ''" color = "error">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model = "addDialog" @input = "newRoadName = ''" max-width="600">
        <v-card>
          <v-btn icon flat style = "float:right" @click = "addDialog = false"><v-icon>close</v-icon></v-btn>
          <v-card-title>Create Road</v-card-title>
          <v-card-text>
          <v-text-field v-if="addDialog" autofocus placeholder="New road name" v-model = "newRoadName"></v-text-field>
            <v-layout row>
              <v-flex xs6>
                <v-switch v-model = "duplicateRoad" label = "Duplicate existing"></v-switch>
              </v-flex>
              <v-flex>
                <v-select :disabled = "!duplicateRoad" :items = "Object.keys(roads)" v-model = "duplicateRoadSource">
                  <template slot = "item" slot-scope = "{item}">
                    {{roads[item].name}}
                  </template>
                  <template slot = "selection" slot-scope = "{item}">
                    {{roads[item].name}}
                  </template>
                </v-select>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled = "otherRoadHasName('', newRoadName) || newRoadName === ''" color = "primary" @click="createRoad">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-tabs>
    <v-flex>
      <v-btn icon flat color = "primary" @click = "addDialog = true">
        <v-icon>add</v-icon>
      </v-btn>
    </v-flex>
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
      const otherRoadNames = Object.keys(this.roads).map(function(road) {
        if(road == roadID) {
          return undefined;
        } else {
          return this.roads[road].name.toLowerCase();
        }
      }.bind(this));
      return otherRoadNames.indexOf(roadName.toLowerCase()) >= 0;
    },
    createRoad: function() {
      if(!this.duplicateRoad) {
        this.$emit('add-road', this.newRoadName);
      } else if(this.duplicateRoadSource in this.roads){
        this.$emit('add-road',
            this.newRoadName,
            this.roads[this.duplicateRoadSource].contents.coursesOfStudy.slice(0),
            this.roads[this.duplicateRoadSource].contents.selectedSubjects.slice(0),
            Object.assign({}, this.roads[this.duplicateRoadSource].contents.progressOverrides),
        );
      }
      this.addDialog=false;
      this.newRoadName = ''
    }
  },
  watch: {
    activeRoad: function(newRoad, oldRoad) {
      this.tabRoad = this.activeRoad;
    }
  }
}
</script>

<style scoped>
/*This is to prevent it from monopolizing all the space*/
.v-tabs__container {
  display: unset;
  white-space: unset;
}
</style>
