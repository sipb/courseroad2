<template>
  <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->
  <v-container>
    <v-treeview
      v-model="tree"
      :items="selectedTrees"
      activatable
      item-key="title"
      item-children="reqs"
      open-on-click
      :activatable = "false"
    >
      <!-- TODO: useful icons can go here if you can figure out how -->
      <template slot="prepend" slot-scope="{ item, leaf, open }">
        <v-icon v-if="'reqs' in item">
          {{ open ? 'folder_open' : 'folder' }}
        </v-icon>
        <v-icon v-else>
          {{ item['plain-string'] ? item.fulfilled ? "star" : "star_outline": item.fulfilled ? "radio_button_checked" : "radio_button_unchecked"}}
        </v-icon>
      </template>
      <template slot="label" slot-scope="{ item, leaf }">
        <requirement
          v-bind:req="item"
          v-bind:leaf="leaf"
        >
        </requirement>
      </template>
    </v-treeview>
  </v-container>
</template>


<script>
import Requirement from './Requirement.vue'

export default {
  name: 'audit',
  components: {
    'requirement': Requirement,
  },
  props: ['selectedReqs', 'reqTrees'],
  data: function() { return {
    tree: [],
  }},
  computed: {
    selectedTrees: function() {
      return this.selectedReqs.map(function(req){
        return this.reqTrees[req];
      }, this);
    }

  },
  methods: {
    icon_for_req: function(req) {
      console.log("calculating")
      return {
        outlined: true
      }
    }
  }
}
</script>

<style>
</style>
