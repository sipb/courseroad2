<template>
  <ul class="parent-tree tree">
    <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->
    <req-tree
        v-for="item in selectedReqs"
        v-bind:root="reqTrees[item]">
     </req-tree>
  </ul>
</template>


<script>
import ReqTree from './ReqTree.vue'

export default {
  name: 'audit',
  components: {
    'req-tree': ReqTree,
  },
  props: ['selectedReqs', 'reqTrees'],
  data: function() { return {
    }
  },
}
</script>
