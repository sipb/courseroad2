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
import SubjectScroll from '../components/SubjectScroll.vue';
import Vue from 'vue';

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
    };
  },
  computed: {
    doubleScroller: function () {
      if (this.requirement.reqs.length === 2) {
        return this.requirement.reqs.reduce(function (acc, nxt) {
          return acc && nxt.reqs !== undefined;
        }, true);
      }
      return false;
    }
  },
  watch: {
    requirement: function (newReq, oldReq) {
      this.open = false;
    }
  },
  methods: {
    fcssecape: function (ch, asCodePoint) {
      if (asCodePoint) {
          if (ch === "\0") {
              return "\uFFFD";
          }
          return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
      }
      return "\\" + ch;
    },
    escape: function (sel) {
      return (sel + "").replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g
        , fcssescape);
    },
    clickSubject: function (subj, scroller) {
      let scrollPointID;
      let nextReqs;
      if (scroller !== undefined) {
        scrollPointID = this.reqID + '.' + this.whichScroller + '.' + subj.index;
        nextReqs = this.requirement.reqs[scroller].reqs[subj.index];
      } else {
        scrollPointID = this.reqID + '.' + subj.index;
        nextReqs = this.requirement.reqs[subj.index];
      }
      if (nextReqs.reqs !== undefined) {
        this.expansionIndex = subj.index;
        this.open = true;
        this.nextReqs = nextReqs;
        Vue.nextTick(function () {
          const scrollPoint = document.getElementById(escape(scrollPointID));
          const topPoint = scrollPoint.getBoundingClientRect().top;
          const cardBody = document.getElementById("cardBody");
          const cardTopPoint = cardBody.getBoundingClientRect().top;
          cardBody.scrollTop = topPoint - cardTopPoint + cardBody.scrollTop - 10;
        });
      } else {
        if (subj.id.indexOf('GIR:') >= 0) {
          subj.id = subj.id.substring(4);
        }
        this.$emit('click-subject', subj);
      }
    },
    closeMe: function (subj) {
      this.$emit('close-expansion');
    },
    closeMyExpansion: function (event) {
      this.open = false;
      let scrollPoint;
      if (!this.doubleScroller) {
        scrollPoint = document.getElementById(escape(this.reqID));
      } else {
        scrollPoint = document.getElementById('ds' + this.whichScroller + escape(this.reqID));
      }
      const topPoint = scrollPoint.getBoundingClientRect().top;
      const cardBody = document.getElementById("cardBody");
      const cardTopPoint = cardBody.getBoundingClientRect().top;
      cardBody.scrollTop = topPoint - cardTopPoint + cardBody.scrollTop - 10;
    }
  }
};
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
