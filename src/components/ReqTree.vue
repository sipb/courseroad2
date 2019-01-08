<template>
  <li>
    <div class="req-tree">
      
      <div v-if="'reqs' in root">
        <button type="button" @click="toggleChildren" class="req-title">
          <span v-if="showChildren" class='chevron down'></span>
          <span v-else class='chevron right' v-bind:class="{close : !firstTime}"></span>

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
      firstTime: true,
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren;
      this.firstTime = false;
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
    vertical-align: top;
    width: 0.35em;
    margin-right: .3em;
  }

  .chevron.right:before {
    left: 0;
    top: 0.30em;
    transform: rotate(45deg);
  }

  .chevron.close:before {
    animation: rotate-close .1s ease forwards;
  }

  .chevron.down:before {
    animation: rotate-open .1s ease forwards;
  }

  @keyframes rotate-open {
    0% {
      left: 0;
      transform: rotate(45deg);
    }
    100% {
      left: .2em;
      transform: rotate(135deg);
    }
  }

  @keyframes rotate-close {
    0% {
      left: .2em;
      transform: rotate(135deg);
    }
    100% {
      left: 0;
      transform: rotate(45deg);
    }
  }

</style>
