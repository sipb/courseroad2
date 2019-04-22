<template>
  <div :id="reqID">
    <v-btn v-if="!requirement.topLevel" icon small @click="closeMe">
      <v-icon>close</v-icon>
    </v-btn>
    <span
      v-if="requirement.expansionDesc.length>0
        && ((!requirement.topLevel && !doubleScroller) || requirement.connectionType === 'any')
      "
    >
      {{ requirement.expansionDesc }}
    </span>
    <div v-if="doubleScroller">
      <div :id="'ds0'+reqID">
        <span
          v-if="requirement.reqs[0].expansionDesc.length>0
            && (requirement.reqs[0].connectionType === 'any' || requirement.reqs[1].connectionType === 'any')
          "
        >
          {{ requirement.reqs[0].expansionDesc }}
        </span>
        <subject-scroll :subjects="requirement.reqs[0].reqs" @click-subject="clickSubject($event, 0)" />
      </div>
      <div :id="'ds1'+reqID">
        <span
          v-if="requirement.reqs[1].expansionDesc.length>0
            && (requirement.reqs[1].connectionType === 'any' || requirement.reqs[0].connectionType === 'any')
          "
        >
          {{ requirement.reqs[1].expansionDesc }}
        </span>
        <subject-scroll :subjects="requirement.reqs[1].reqs" @click-subject="clickSubject($event, 1)" />
      </div>
    </div>
    <subject-scroll v-else :subjects="requirement.reqs" @click-subject="clickSubject" />
    <div v-if="open && nextReqs !== undefined" class="expanded-req">
      <ExpansionReqs
        :requirement="nextReqs"
        :req-i-d="reqID + (doubleScroller ? '.' + whichScroll : '') + '.' + expansionIndex"
        @close-expansion="closeMyExpansion"
        @click-subject="$emit('click-subject',$event)"
      />
    </div>
  </div>
</template>

<script>
import SubjectScroll from '../components/SubjectScroll.vue'
import $ from 'jquery'
import Vue from 'vue'

export default {
  name: 'ExpansionReqs',
  components: {
    'subject-scroll': SubjectScroll
  },
  props: ['requirement', 'reqID'],
  data: function () {
    return {
      open: false,
      expansionIndex: 0,
      nextReqs: undefined,
      whichScroller: 0
    }
  },
  computed: {
    doubleScroller: function () {
      if (this.requirement.reqs.length === 2) {
        return this.requirement.reqs.reduce(function (acc, nxt) {
          return acc && nxt.reqs !== undefined
        }, true)
      }
      return false
    }
  },
  watch: {
    requirement: function (newReq, oldReq) {
      this.open = false
    }
  },
  methods: {
    clickSubject: function (subj, scroller) {
      var scrollPointID
      var nextReqs
      if (scroller !== undefined) {
        scrollPointID = this.reqID + '.' + this.whichScroller + '.' + subj.index
        nextReqs = this.requirement.reqs[scroller].reqs[subj.index]
      } else {
        scrollPointID = this.reqID + '.' + subj.index
        nextReqs = this.requirement.reqs[subj.index]
      }
      if (nextReqs.reqs !== undefined) {
        this.expansionIndex = subj.index
        this.open = true
        this.nextReqs = nextReqs
        Vue.nextTick(function () {
          var scrollPoint = $('#' + $.escapeSelector(scrollPointID))
          var topPoint = scrollPoint.offset().top
          var cardBody = $('#cardBody')
          cardBody.animate({ scrollTop: scrollPoint.offset().top - cardBody.offset().top + cardBody.scrollTop() - 10 }, 200)
        })
      } else {
        if (subj.id.indexOf('GIR:') >= 0) {
          subj.id = subj.id.substring(4)
        }
        this.$emit('click-subject', subj)
      }
    },
    closeMe: function (subj) {
      this.$emit('close-expansion')
    },
    closeMyExpansion: function (event) {
      this.open = false
      var scrollPoint
      if (!this.doubleScroller) {
        scrollPoint = $('#' + $.escapeSelector(this.reqID))
      } else {
        scrollPoint = $('#ds' + this.whichScroller + $.escapeSelector(this.reqID))
      }
      var topPoint = scrollPoint.offset().top
      var cardBody = $('#cardBody')
      cardBody.animate({ scrollTop: scrollPoint.offset().top - cardBody.offset().top + cardBody.scrollTop() - 10 }, 350)
    }
  }
}
</script>

<style scoped>
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
