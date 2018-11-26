<template>
  <li>
    <div class="req-tree">


      <div v-if="'reqs' in root">
        <a href="#" @click="toggleChildren" class="req-title">
          <span v-if="showChildren" class='chevron'></span>
          <span v-else class='chevron right'></span>

          <span v-if="'title' in root">{{ root.title }}
            <div style="font-style:italic">{{ root['threshold-desc'] }}</div>
          </span>
          <span v-else style="font-style:italic">{{ root['threshold-desc'] }}</span>
        </a>

      </div>

      <div v-else>
        <span v-if="'title' in root">● {{ root.title }}</span>
      </div>

      <div>
        <span v-if="!('title' in root) && 'req' in root">● </span>
        {{ root.req }}
      </div>

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
