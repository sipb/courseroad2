
<template>
  <div class = "requirement" @click = "clickRequirement">
    <div v-if="!leaf">
      <span v-if="'title-no-degree' in req && req['title-no-degree'] !=''">{{ req["title-no-degree"] }}</span>
      <span v-else-if = "'short-title' in req && req['short-title'] != ''">{{ req['short-title']}}</span>
      <span v-else-if = "'title' in req">{{ req["title"] }}</span>
      <span style="font-style:italic">{{ req['threshold-desc'] }}</span>
      <!--fake padding for scroll-->
      &nbsp &nbsp &nbsp
      <v-btn icon flat fixed v-if = "showDelete" @click = "viewDialog = true;"><v-icon>delete</v-icon></v-btn>
    </div>
    <span v-else>
      <span v-if="'title' in req">{{ req.title }}</span>
    </span>

    <span v-if = "!req['plain-string']">
      <span v-if="!('title' in req) && 'req' in req">
        <span :class="reqFulfilled">{{ req.req }}</span>
        <span style = "font-style:italic" v-if = "'threshold-desc' in req">({{ req['threshold-desc']}})</span>
      </span>
    </span>
    <span v-else>
      | <span style = "text-transform: cursive">{{ req.req }}</span>
    </span>
    <div :class = "percentage_bar" :style = "percentage"></div>
  </div>
</template>


<script>
import $ from 'jquery'

export default {
  name: 'requirement',
  props: ['req', 'leaf'],
  data: function() {
    return {
      open: [],
      viewDialog: false,
      showDelete: false
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
    },
    percentage: function() {
      var pfulfilled = this.req.percent_fulfilled
      var pstring = "--percent: "+this.req.percent_fulfilled+"%";
      return pstring;
    },
    percentage_bar: function() {
      var pblock = {
        "percentage-bar": ("reqs" in this.req || "threshold" in this.req)
      }
      return pblock
    }
  },
  methods: {
    clickRequirement: function(event) {
      if(this.req.req !== undefined) {
        this.$emit('push-stack', this.req.req);
      }
    }
  }
}
</script>


<style scoped>
  .fulfilled {
    /* background:  radial-gradient(#00b300,white); */
  }
  .requirement {
    font-size: 0.75em;
  }

  .percentage-bar {
    height: 4px;
    background: linear-gradient(90deg, #00b300 var(--percent), lightgrey var(--percent));
  }
</style>
