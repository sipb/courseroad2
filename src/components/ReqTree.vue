<template>
  <li>
    <div class="req-tree">
      
      <div v-if="'reqs' in root">
        <button type="button" @click="toggleChildren" class="req-title">
          <span v-if="showChildren" class='chevron'></span>
          <span v-else class='chevron right'></span>

          <span v-if="'title' in root">{{ root.title }}
            <div style="font-style:italic">{{ root['threshold-desc'] }}</div>
          </span>
          <span v-else style="font-style:italic">{{ root['threshold-desc'] }}</span>
        </button>

      </div>

      <div v-else>
        <span v-if="'title' in root">● {{ root.title }}</span>
      </div>

      <div>
        <span v-if="!('title' in root) && 'req' in root">● </span>
        <span :class="reqFulfilledHash">{{ root.req }}</span>
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
  },
  computed: {
    reqFulfilledHash: function() {
      let hashCode = (s) => {
        var h = 0, l = s.length, i = 0;
        if ( l > 0 )
          while (i < l)
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
        return h;
      };

      return {
        green: this.root.req && hashCode(this.root.req) % 3 === 0,
      }
    }
  }
}
</script>

<style scoped>
  .green {
    color: green;
  }

  ul.tree {
    padding-left: 2rem;
    padding-top: .5rem;
    padding-bottom: .5rem;
  }

  button.req-title {
    text-decoration: none;
    text-align: left;
  }

  button.req-title:hover {
    opacity: 0.7;
    text-decoration: underline;
  }

  .chevron:before {
    border-style: solid;
    border-width: 0.16em 0.16em 0 0;
    content: '';
    display: inline-block;
    height: 0.35em;
    left: 0.2em;
    position: relative;
    top: 0.23em;
    transform: rotate(135deg);
    vertical-align: top;
    width: 0.35em;
    margin-right: .3em;
  }

  .chevron.right:before {
    left: 0;
    transform: rotate(45deg);
}
</style>
