
<template>
  <div class = "requirement">
    <div v-if="!leaf">

      <span v-if="'title-no-degree' in req && req['title-no-degree'] !=''">{{ req["title-no-degree"] }}  <span style = "font-style:italic">{{ req['threshold-desc'] }}</span></span>
      <span v-else-if = "'short-title' in req && req['short-title'] != ''">{{ req['short-title']}}</span>
      <span v-else-if = "'title' in req">{{ req["title"] }}  <span style = "font-style:italic">{{ req['threshold-desc'] }}</span></span>
      <span v-else style="font-style:italic">{{ req['threshold-desc'] }}</span>
    </div>

    <span v-else>
      <span v-if="'title' in req">{{ req.title }}</span>
    </span>

    <span v-if = "!req['plain-string']">
      <span v-if="!('title' in req) && 'req' in req">
        <span :class="reqFulfilledHash">{{ req.req }}</span>
      </span>
    </span>
    <span v-else>
      | <span style = "text-transform: cursive">{{ req.req }}</span>
    </span>
  </div>
</template>


<script>
export default {
  name: 'requirement',
  props: ['req', 'leaf'],
  data: function() {
    return {
      open: []
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
        fulfilled: this.req.req && hashCode(this.req.req) % 3 === 0,
      }
    },
  }
}
</script>


<style scoped>
  .fulfilled {
    color: green;
  }
  .requirement {
    font-size: 0.75em;
  }
</style>
