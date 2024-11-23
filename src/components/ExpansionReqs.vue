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

<script setup>
import SubjectScroll from "../components/SubjectScroll.vue";
import $ from "jquery";
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  reqID: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["click-subject", "close-expansion"]);

const open = ref(false);
const expansionIndex = ref(0);
const whichScroller = ref(0);
const scrollerClicked = ref(undefined);
const subjectClicked = ref(undefined);

const doubleScroller = computed(() => {
  if (props.requirement.reqs.length === 2) {
    return props.requirement.reqs.reduce(function (acc, nxt) {
      return acc && nxt.reqs !== undefined;
    }, true);
  }
  return false;
});

const getNextReqs = computed(() => {
  if (!open.value) {
    return undefined;
  }

  if (scrollerClicked.value !== undefined) {
    return props.requirement.reqs[scrollerClicked.value].reqs[
      subjectClicked.value.index
    ];
  } else {
    return props.requirement.reqs[subjectClicked.value.index];
  }
});

watch(
  () => props.reqID,
  () => {
    open.value = false;
  },
);

const clickSubject = (subj, scroller) => {
  scrollerClicked.value = scroller;
  subjectClicked.value = subj;

  let scrollPointID;
  let nextReqs;
  if (scroller !== undefined) {
    scrollPointID = props.reqID + "." + whichScroller.value + "." + subj.index;
    nextReqs = props.requirement.reqs[scroller].reqs[subj.index];
  } else {
    scrollPointID = props.reqID + "." + subj.index;
    nextReqs = props.requirement.reqs[subj.index];
  }

  if (nextReqs.reqs !== undefined) {
    expansionIndex.value = subj.index;
    open.value = true;
    nextTick(function () {
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
    emit("click-subject", subj);
  }
};

const closeMe = () => {
  emit("close-expansion");
};

const closeMyExpansion = () => {
  open.value = false;
  let scrollPoint;
  if (!doubleScroller.value) {
    scrollPoint = $("#" + $.escapeSelector(props.reqID));
  } else {
    scrollPoint = $(
      "#ds" + whichScroller.value + $.escapeSelector(props.reqID),
    );
  }
  const topPoint = scrollPoint.offset().top;
  const cardBody = $("#cardBody");
  cardBody.animate(
    {
      scrollTop: topPoint - cardBody.offset().top + cardBody.scrollTop() - 10,
    },
    350,
  );
};
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
