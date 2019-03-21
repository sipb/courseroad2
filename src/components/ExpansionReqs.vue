<template>
  <div :id = "reqID">
    <v-btn v-if = "!requirement.topLevel" icon small @click = "closeMe"><v-icon>close</v-icon></v-btn>
    <span v-if = "requirement.expansionDesc.length>0 && (!requirement.topLevel || requirement.connectionType == 'any')">{{requirement.expansionDesc}}</span>
    <subject-scroll @click-subject = "clickSubject" v-bind:subjects = "requirement.reqs"></subject-scroll>
    <div v-if = "open && requirement.reqs[expansionIndex].reqs !== undefined" class = "expanded-req">
      <p v-if = "doubleScroller">Double Scroller</p>
      <ExpansionReqs
        @close-expansion = "closeMyExpansion"
        @click-subject = "$emit('click-subject',$event)"
        v-bind:requirement = "requirement.reqs[expansionIndex]"
        v-bind:reqID = "reqID + '.' + expansionIndex"
        >
      </ExpansionReqs>
    </div>
  </div>
</template>
<script>
import SubjectScroll from "../components/SubjectScroll.vue"
import $ from "jquery"
import Vue from "vue"

export default {
  name: "ExpansionReqs",
  props: ["requirement","reqID"],
  components: {
    "subject-scroll": SubjectScroll,
  },
  data: function() {return {
    open: false,
    expansionIndex: 0
  }},
  computed: {
    doubleScroller: function() {
      if(this.open && this.requirement.reqs[this.expansionIndex].reqs!==undefined) {
        var nextLevelReqs = this.requirement.reqs[this.expansionIndex].reqs;
        if(nextLevelReqs.length == 2) {
          return nextLevelReqs.reduce(function(acc, nxt) {
            return acc && nxt.reqs !== undefined;
          }, true);
        }
      }
      return false;

    }
  },
  methods: {
    clickSubject: function(subj) {
      if(this.requirement.reqs[subj.index].reqs !== undefined) {
        this.expansionIndex = subj.index;
        this.open = true;
        Vue.nextTick(function() {
          var scrollPoint = $("#"+$.escapeSelector(this.reqID+"."+this.expansionIndex));
          var topPoint = scrollPoint.offset().top;
          var cardBody = $("#cardBody");
          cardBody.animate({scrollTop:scrollPoint.offset().top-cardBody.offset().top+cardBody.scrollTop()-10},200);
        }.bind(this))
      } else {
        if(subj.id.indexOf("GIR:")>=0) {
          subj.id = subj.id.substring(4);
        }
        this.$emit("click-subject", subj);
        this.open = false;
      }
    },
    closeMe: function(subj) {
      this.$emit("close-expansion");
    },
    closeMyExpansion: function(event) {
      this.open = false;
      var scrollPoint = $("#"+$.escapeSelector(this.reqID));
      var topPoint = scrollPoint.offset().top;
      var cardBody = $("#cardBody");
      cardBody.animate({scrollTop:scrollPoint.offset().top-cardBody.offset().top+cardBody.scrollTop()-10},350);
    }
  }
}
</script>
<style>
.expanded-req {
  margin: 1em;
  padding: 0.5em;
  border: 1px dotted gray;
  background-color: #E0E0E0;
}
.expansion-req-header {
  margin: 0;
  padding: 0;
}
</style>
