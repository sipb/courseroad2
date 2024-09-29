<template>
  <div :id="reqID">
    <v-btn
      v-if="!requirement.topLevel"
      icon
      small
      :data-cy="'closeButton' + reqID"
      @click="closeMe"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <span
      v-if="
        requirement.expansionDesc.length > 0 &&
        ((!requirement.topLevel && !doubleScroller) ||
          requirement.connectionType === 'any')
      "
    >
      {{ requirement.expansionDesc }}
    </span>
    <div v-if="doubleScroller">
      <div :id="'ds0' + reqID">
        <span
          v-if="
            requirement.reqs[0].expansionDesc.length > 0 &&
            (requirement.reqs[0].connectionType === 'any' ||
              requirement.reqs[1].connectionType === 'any')
          "
        >
          {{ requirement.reqs[0].expansionDesc }}
        </span>
        <subject-scroll
          :subjects="requirement.reqs[0].reqs"
          :data-cy="'doubleScroller0' + reqID"
          @click-subject="clickSubject($event, 0)"
        />
      </div>
      <div :id="'ds1' + reqID">
        <span
          v-if="
            requirement.reqs[1].expansionDesc.length > 0 &&
            (requirement.reqs[1].connectionType === 'any' ||
              requirement.reqs[0].connectionType === 'any')
          "
        >
          {{ requirement.reqs[1].expansionDesc }}
        </span>
        <subject-scroll
          :subjects="requirement.reqs[1].reqs"
          :data-cy="'doubleScroller1' + reqID"
          @click-subject="clickSubject($event, 1)"
        />
      </div>
    </div>
    <subject-scroll
      v-else
      :subjects="requirement.reqs"
      :data-cy="'singleScroller' + reqID"
      @click-subject="clickSubject"
    />
    <div v-if="open && getNextReqs !== undefined" class="expanded-req">
      <ExpansionReqs
        :requirement="getNextReqs"
        :req-i-d="
          reqID +
          (doubleScroller ? '.' + whichScroller : '') +
          '.' +
          expansionIndex
        "
        @close-expansion="closeMyExpansion"
        @click-subject="$emit('click-subject', $event)"
      />
    </div>
  </div>
</template>

<script>
import SubjectScroll from "../components/SubjectScroll.vue";
import $ from "jquery";
import Vue from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ExpansionReqs",
  components: {
    "subject-scroll": SubjectScroll,
  },
  props: {
    requirement: {
      type: Object,
      required: true,
    },
    reqID: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      open: false,
      expansionIndex: 0,
      whichScroller: 0,
      scrollerClicked: undefined,
      subjectClicked: undefined,
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
    },
    getNextReqs: function () {
      if (!this.open) {
        return undefined;
      }

      if (this.scrollerClicked !== undefined) {
        return this.requirement.reqs[this.scrollerClicked].reqs[
          this.subjectClicked.index
        ];
      } else {
        return this.requirement.reqs[this.subjectClicked.index];
      }
    },
  },
  watch: {
    reqID: function () {
      this.open = false;
    },
  },
  methods: {
    clickSubject: function (subj, scroller) {
      this.scrollerClicked = scroller;
      this.subjectClicked = subj;

      let scrollPointID;
      let nextReqs;
      if (scroller !== undefined) {
        scrollPointID =
          this.reqID + "." + this.whichScroller + "." + subj.index;
        nextReqs = this.requirement.reqs[scroller].reqs[subj.index];
      } else {
        scrollPointID = this.reqID + "." + subj.index;
        nextReqs = this.requirement.reqs[subj.index];
      }

      if (nextReqs.reqs !== undefined) {
        this.expansionIndex = subj.index;
        this.open = true;
        Vue.nextTick(function () {
          const scrollPoint = $("#" + $.escapeSelector(scrollPointID));
          const topPoint = scrollPoint.offset().top;
          const cardBody = $("#cardBody");
          cardBody.animate(
            {
              scrollTop:
                topPoint - cardBody.offset().top + cardBody.scrollTop() - 10,
            },
            200,
          );
        });
      } else {
        if (subj.subject_id.indexOf("GIR:") >= 0) {
          subj.subject_id = subj.subject_id.substring(4);
        }
        this.$emit("click-subject", subj);
      }
    },
    closeMe: function () {
      this.$emit("close-expansion");
    },
    closeMyExpansion: function () {
      this.open = false;
      let scrollPoint;
      if (!this.doubleScroller) {
        scrollPoint = $("#" + $.escapeSelector(this.reqID));
      } else {
        scrollPoint = $(
          "#ds" + this.whichScroller + $.escapeSelector(this.reqID),
        );
      }
      const topPoint = scrollPoint.offset().top;
      const cardBody = $("#cardBody");
      cardBody.animate(
        {
          scrollTop:
            topPoint - cardBody.offset().top + cardBody.scrollTop() - 10,
        },
        350,
      );
    },
  },
});
</script>

<style scoped>
.expanded-req {
  margin: 1em;
  padding: 0.5em;
  border: 1px dotted gray;
  background-color: #e0e0e0;
}
.expansion-req-header {
  margin: 0;
  padding: 0;
}
</style>
