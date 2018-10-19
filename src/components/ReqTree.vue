<template>
  <li>
    <div class="req-tree">
      <div>{{ root.title }}</div>
      <div style="font-style:italic">{{ root['threshold-desc'] }}</div>
      <div>{{ root.req }}</div>
      <a href="#" @click="toggleChildren" v-if="'reqs' in root"> show/hide </a>
      <ul v-if="showChildren">
        <req-tree
          v-for="node in root.reqs"
          :root="node"
        >
        </req-tree>
      </ul>
    </div>
  </li>
</template>

<script>
modules.export = {
  props: ['root'],
  data: function() {
    return {
      showChildren: false,
    }
  },
  template:

    methods: {
      toggleChildren() {
        this.showChildren = !this.showChildren;
      }
    }
}
</script>
