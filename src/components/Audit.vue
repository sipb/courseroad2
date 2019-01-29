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
          {{ open ? 'assignment_returned' : item.fulfilled ? 'assignment_turned_in' : 'assignment' }}
        </v-icon>
        <v-icon v-else>
          {{ item['plain-string'] ? item.fulfilled ? "star" : "star_outline": item.fulfilled ? "check_box" : "check_box_outline_blank"}}
        </v-icon>
      </template>
      <template slot = "label" slot-scope = "{ item, leaf}">
        <requirement
          class = "hi"
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
  }
}
</script>

<style scoped>
  .hi {
    /* background-color: green; */
    /* overflow: hidden; */
    /* width: 100%; */
  }
</style>
