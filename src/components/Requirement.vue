<template>
  <div
    class = "requirement"
    :draggable = "canDrag"
    v-on:dragstart = "dragStart"
    @mouseover = "hoveringOver = true"
    @mouseleave = "hoveringOver = false"
  >
  <v-layout row>
    <v-flex>
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
        <span v-if = "'title' in req">| </span>
        <span style = "text-transform: cursive">{{ req.req }}</span>
      </span>
      <span v-if = "req.max === 0 && leaf" style = "font-style:italic">
         (optional)
      </span>
      <div :class = "percentage_bar" :style = "percentage"></div>
    </v-flex>
    <v-icon @mouseover = "iconHover = true" @mouseleave = "iconHover = false" @click.stop = "$emit('click-info', $event)" v-if = "hoveringOver" small :color = "iconClass">info</v-icon>
  </v-layout>
  </div>

</template>


<script>
export default {
  name: 'requirement',
  props: ['req', 'leaf', 'subjects', 'genericCourses', 'subjectIndex', 'genericIndex'],
  data: function() {
    return {
      open: [],
      viewDialog: false,
      showDelete: false,
      hoveringOver: false,
      iconHover: false,
    }
  },
  computed: {
    classInfo: function() {
      if('req' in this.req) {
        if(this.req.req in this.subjectIndex) {
          return this.subjects[this.subjectIndex[this.req.req]];
        }
        var attributeReq = this.req.req;
        if(attributeReq.indexOf("GIR:")===0) {
          attributeReq = attributeReq.substring(4);
        }
        if(attributeReq in this.genericIndex) {
          return this.genericCourses[this.genericIndex[attributeReq]];
        }
      }
      return undefined;
    },
    iconClass: function() {
      return this.iconHover ? "info" : "grey";
    },
    canDrag: function() {
      return this.classInfo !== undefined || ('req' in this.req && (Object.keys(this.subjectIndex).length===0));
    },
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
      var pfulfilled = this.req.percent_fulfilled;
      var pcolor = this.req.fulfilled ? "#00b300" : (this.req.percent_fulfilled > 15 ? "#efce15": "#ef8214");
      var pstring = "--percent: " + pfulfilled +"%; --bar-color: " + pcolor + "; --bg-color: lightgrey";
      return pstring;
    },
    percentage_bar: function() {
      var showPBar = ("reqs" in this.req || "threshold" in this.req);
      var pblock = {
        "percentage-bar": showPBar,
        "p-bar": showPBar
      }
      return pblock
    }
  },
  methods: {
    dragStart: function(event) {
      var usedInfo = this.classInfo;
      if(usedInfo === undefined) {
        usedInfo = {id: this.req.req};
      }
      event.dataTransfer.setData('classData', JSON.stringify({isNew:true,classIndex:-1}));
      this.$emit('drag-start-class', {
        dragstart: event,
        classInfo: usedInfo,
        isNew: true
      })
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

  .p-bar {
    height: 4px;
  }
</style>
