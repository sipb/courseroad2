
<template>
  <div
    class = "requirement"
    :draggable = "canDrag"
    v-on:drag = "drag"
    v-on:dragend = "drop"
    v-on:dragstart = "dragStart"
  >
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
  props: ['req', 'leaf', 'subjects', 'genericCourses'],
  data: function() {
    return {
      open: [],
      viewDialog: false,
      showDelete: false
    }
  },
  computed: {
    classInfo: function() {
      if('req' in this.req) {
        var subjectIndex = this.subjects.map((s)=>s.subject_id).indexOf(this.req.req);
        if(subjectIndex >= 0) {
          return this.subjects[subjectIndex];
        }
        var attributeReq = this.req.req;
        if(attributeReq.indexOf("GIR:")===0) {
          attributeReq = attributeReq.substring(4);
        }
        var genericIndex = this.genericCourses.map((s)=>s.subject_id).indexOf(attributeReq);
        if(genericIndex >= 0) {
          return this.genericCourses[genericIndex];
        }
      }
      return undefined;
    },
    canDrag: function() {
      return this.classInfo !== undefined;
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
    drag: function(event) {
      this.$emit("drag-class", {
        drag: event,
        classInfo: this.classInfo,
        isNew: true
      });
    },
    drop: function(event) {
      this.$emit("drop-class", {
        drop: event,
        classInfo: this.classInfo,
        isNew: true
      });
    },
    dragStart: function() {
      event.dataTransfer.setData('foo', 'bar');
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
