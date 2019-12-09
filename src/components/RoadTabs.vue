<template>
  <v-layout row>
    <v-tabs
      v-model="tabRoad"
      show-arrows
    >
      <v-tabs-slider />
      <v-tab
        v-for="roadId in Object.keys(roads)"
        :key="roadId"
        :href="`#${roadId}`"
        @click="$store.commit('setActiveRoad', roadId)"
      >
        {{ roads[roadId].name }}
        <v-btn v-show="roadId == tabRoad" icon text @click="newRoadName = roads[roadId].name; editDialog = true;">
          <v-icon>edit</v-icon>
        </v-btn>
      </v-tab>
      <v-dialog v-model="editDialog" max-width="600" @input="newRoadName = ''">
        <v-card>
          <v-btn icon text style="float:right" @click="editDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title>Edit Road</v-card-title>
          <v-card-text>
            <v-text-field v-if="editDialog" v-model="newRoadName" autofocus label="Road Name" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="error" @click="editDialog = false; deleteDialog = true;">
              <v-icon>delete</v-icon>
              Delete Road
            </v-btn>
            <v-btn
              color="primary"
              :disabled="otherRoadHasName(tabRoad, newRoadName)"
              @click="$store.commit('setRoadName', {id: tabRoad, name: newRoadName}); editDialog = false; newRoadName = ''"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-if="tabRoad in roads" v-model="deleteDialog" max-width="600">
        <v-card>
          <v-btn icon text style="float:right" @click="deleteDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title>Permanently Delete {{ roads[tabRoad].name }}?</v-card-title>
          <v-card-text>This action cannot be undone.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="deleteDialog = false; editDialog = true;">
              Cancel
            </v-btn>
            <v-btn color="error" @click="deleteDialog = false; $emit('delete-road',tabRoad); newRoadName = ''">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="addDialog" max-width="600" @input="newRoadName = ''">
        <v-card>
          <v-btn icon text style="float:right" @click="addDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title>Create Road</v-card-title>
          <v-card-text>
            <v-text-field
              v-if="addDialog"
              v-model="newRoadName"
              autofocus
              placeholder="New road name"
              @keyup.enter="
                if (validRoadName) createRoad()"
            />
            <v-layout row>
              <v-flex xs6>
                <v-switch v-model="duplicateRoad" label="Duplicate existing" />
              </v-flex>
              <v-flex>
                <v-select v-model="duplicateRoadSource" :disabled="!duplicateRoad" :items="Object.keys(roads)">
                  <template slot="item" slot-scope="{item}">
                    {{ roads[item].name }}
                  </template>
                  <template slot="selection" slot-scope="{item}">
                    {{ roads[item].name }}
                  </template>
                </v-select>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn :disabled="!validRoadName" color="primary" @click="createRoad">
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-tabs>
    <v-flex>
      <v-btn type="submit" icon text color="primary" @click="addDialog = true">
        <v-icon>add</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'RoadTabs',
  components: {
  },
  data: function () {
    return {
      addDialog: false,
      deleteDialog: false,
      editDialog: false,
      duplicateRoad: false,
      duplicateRoadSource: '$defaultroad$',
      newRoadName: '',
      tabRoad: this.activeRoad
    };
  },
  computed: {
    activeRoad () {
      return this.$store.state.activeRoad;
    },
    roads () {
      return this.$store.state.roads;
    },
    validRoadName: function () {
      return !(this.otherRoadHasName('', this.newRoadName) || this.newRoadName === '');
    }
  },
  watch: {
    activeRoad: function (newRoad, oldRoad) {
      this.tabRoad = this.activeRoad;
    }
  },
  methods: {
    otherRoadHasName: function (roadID, roadName) {
      const otherRoadNames = Object.keys(this.roads).map(function (road) {
        return road === roadID ? undefined : this.roads[road].name.toLowerCase();
      }.bind(this));
      return otherRoadNames.indexOf(roadName.toLowerCase()) >= 0;
    },
    createRoad: function () {
      if (!this.duplicateRoad) {
        this.$emit('add-road', this.newRoadName);
      } else if (this.duplicateRoadSource in this.roads) {
        this.$emit('add-road',
          this.newRoadName,
          this.roads[this.duplicateRoadSource].contents.coursesOfStudy.slice(0),
          this.roads[this.duplicateRoadSource].contents.selectedSubjects.map((semester) => semester.slice(0)),
          Object.assign({}, this.roads[this.duplicateRoadSource].contents.progressOverrides)
        );
      }
      this.addDialog = false;
      this.newRoadName = '';
    }
  }
};
</script>

<style> /* CAREFUL! this is not scoped */
/*This is to prevent it from monopolizing all the space*/
div.v-tabs__container {
  display: unset;
  white-space: unset;
}
</style>
