
<template>
  <div>
    <div v-if="!leaf">
      <span v-if="'title' in req">{{ req.title }}
        <div style="font-style:italic">{{ req['threshold-desc'] }}</div>
      </span>
      <span v-else style="font-style:italic">{{ req['threshold-desc'] }}</span>
    </div>

    <div v-else>
      <span v-if="'title' in req">{{ req.title }}</span>
    </div>

    <div>
      <span v-if="!('title' in req) && 'req' in req"></span>
      <span :class="reqFulfilledHash">{{ req.req }}</span>
    </div>
  </div>
</template>


<script>
export default {
  name: 'requirement',
  props: ['req', 'leaf'],
  data: function() {
    return {
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
        green: this.req.req && hashCode(this.req.req) % 3 === 0,
      }
    },
  }
}
</script>


<style scoped>
  .green {
    color: green;
  }
</style>
