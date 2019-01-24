<template>
  <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->
  <v-treeview
    v-model="tree"
    :items="selectedTrees"
    activatable
    item-key="title"
    item-children="reqs"
    open-on-click
  >
    <!-- TODO: useful icons can go here if you can figure out how -->
    <!-- <template slot="prepend" slot-scope="{ item, leaf }">
      <v-icon v-if="item.reqs">
        {{ true ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.file] }}
      </v-icon>
    </template> -->
    <template slot="label" slot-scope="{ item, leaf }">
      <requirement
        v-bind:req="item"
        v-bind:leaf="leaf"
      >
      </requirement>
    </template>
  </v-treeview>
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
    },
  },
}
</script>
