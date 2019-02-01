
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
        <span style = "font-style:italic" v-if = "'threshold-desc' in req">({{ req['threshold-desc']}})</span>
      </span>
    </span>
    <span v-else>
      | <span style = "text-transform: cursive">{{ req.req }}</span>
    </span>
    <div :class = "percentage_bar" :style = "percentage"></div>
    <!-- <div :style = "percentage">
    </div> -->
  </div>
</template>


<script>
import $ from 'jquery'

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
  }
}
</script>


<style scoped>
  .fulfilled {
    background:  radial-gradient(#98fb98,white);
    /* background: #98fb98; */
  }
  .requirement {
    font-size: 0.75em;
  }
  /* .percentage-background {
    background: linear-gradient(90deg, #98fb98 var(--percent), rgba(255,255,255,0) var(--percent));
    border: 1px solid #efefef;
    border-radius: 3px;
  } */
  .percentage-bar {
    height: 2px;
    background: linear-gradient(90deg, #98fb98 var(--percent), rgba(255,255,255,0) var(--percent));
  }
</style>
