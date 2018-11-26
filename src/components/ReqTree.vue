<template>
  <li>
    <div class="req-tree">
      <div>
        <a href="#" @click="toggleChildren" v-if="'reqs' in root" class="req-title">
          <span v-if="showChildren" class='chevron'></span>
          <span v-else class='chevron right'></span>
          {{ root.title }}
        </a>
        <span v-else>● {{ root.title }}</span>
      </div>

      <div style="font-style:italic">{{ root['threshold-desc'] }}</div>

      <div>{{ root.req }}</div>

      <ul class="tree" v-if="showChildren">
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
export default {
  name: 'req-tree',
  props: ['root'],
  data: function() {
    return {
      showChildren: false,
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren;
    }
  }
}
</script>
