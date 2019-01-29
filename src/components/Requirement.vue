
<template>
  <div class = "requirement">
    <div v-if="!leaf">

      <span v-if="'title-no-degree' in req && req['title-no-degree'] !=''">{{ req["title-no-degree"] }}</span>
      <span v-else-if = "'short-title' in req && req['short-title'] != ''">{{ req['short-title']}}</span>
      <span v-else-if = "'title' in req">{{ req["title"] }}</span>
      <span style="font-style:italic">{{ req['threshold-desc'] }}</span>
      <!--fake padding for scroll-->
      &nbsp &nbsp &nbsp
    </div>

    <span v-else>
      <span v-if="'title' in req">{{ req.title }}</span>
    </span>

    <span v-if = "!req['plain-string']">
      <span v-if="!('title' in req) && 'req' in req">
        <span :class="reqFulfilled">{{ req.req }}</span>
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
    reqFulfilled: function() {
      if(this.req.fulfilled) {
        return {
          fulfilled: true
        }
      } else {
        return {
          fulfilled: false
        }
      }
    }
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
