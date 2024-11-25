<template>
  <div
    class="requirement"
    :draggable="canDrag(store, req)"
    :data-cy="'requirement' + req['list-id']"
    @dragstart="dragStart"
    @mouseover="hoveringOver = true"
    @mouseleave="hoveringOver = false"
  >
    <v-layout>
      <v-flex>
        <div v-if="!isLeaf" style="text-wrap: wrap">
          <span v-if="'title-no-degree' in req && req['title-no-degree'] != ''">
            {{ req["title-no-degree"] }}
          </span>
          <span
            v-else-if="'medium-title' in req && req['medium-title'] != ''"
            >{{ req["medium-title"] }}</span
          >
          <span v-else-if="'short-title' in req && req['short-title'] != ''">
            {{ req["short-title"] }}
          </span>
          <span v-else-if="'title' in req">{{ req["title"] }}</span>
          <span style="font-style: italic">{{ req["threshold-desc"] }}</span>
        </div>
        <span v-else>
          <span v-if="'title' in req">
            {{ req.title }}
            <div
              v-if="
                req['list-id'] in
                store.roads[store.activeRoad].contents.progressAssertions
              "
              style="display: inline-block"
            >
              <v-icon
                v-if="
                  !(
                    'ignore' in
                    store.roads[store.activeRoad].contents.progressAssertions[
                      req['list-id']
                    ]
                  )
                "
                small
              >
                mdi-gavel
              </v-icon>
              <v-icon v-else small> mdi-tag-off </v-icon>
            </div>
          </span>
        </span>
        <span v-if="!req['plain-string']">
          <span v-if="!('title' in req) && 'req' in req">
            <span :class="reqFulfilled">{{ req.req }}</span>
            <span v-if="'threshold-desc' in req" style="font-style: italic">
              ({{ req["threshold-desc"] }})
            </span>
            <span
              v-if="
                req['list-id'] in
                store.roads[store.activeRoad].contents.progressAssertions
              "
            >
              <v-icon
                v-if="
                  !(
                    'ignore' in
                    store.roads[store.activeRoad].contents.progressAssertions[
                      req['list-id']
                    ]
                  )
                "
                small
              >
                mdi-gavel
              </v-icon>
              <v-icon v-else small> mdi-tag-off </v-icon>
            </span>
          </span>
        </span>
        <span v-else>
          <span v-if="'title' in req">| </span>
          <span style="text-transform: cursive">{{ req.req }}</span>
        </span>
        <span v-if="req.max === 0 && isLeaf" style="font-style: italic">
          (optional)
        </span>
      </v-flex>
      <v-flex>
        <div>
          <span v-if="hoveringOver && isLeaf" style="float: right">
            <v-icon
              style="padding-left: 0.2em; padding-right: 0em"
              small
              :color="petitionColor"
              @mouseover="petitionHover = true"
              @mouseleave="petitionHover = false"
              @click.stop="$emit('click-petition', $event)"
            >
              mdi-note-plus
            </v-icon>
          </span>
          <span
            v-if="
              hoveringOver &&
              ('reqs' in req || 'threshold' in req) &&
              'percent_fulfilled' in req &&
              req.percent_fulfilled !== 'N/A'
            "
            :style="'float: right; color: ' + percentageTextColor"
            :data-cy="'percentFulfilled' + req['list-id']"
          >
            &nbsp;{{ req.percent_fulfilled }}%
            <v-icon
              v-if="'reqs' in req && hoveringOver"
              style="padding-left: 0.2em; padding-right: 0em"
              small
              :color="iconColor"
              :data-cy="'auditInfoButton' + req['list-id']"
              @mouseover="iconHover = true"
              @mouseleave="iconHover = false"
              @click.stop="$emit('click-info', $event)"
            >
              mdi-information
            </v-icon>
          </span>
        </div>
      </v-flex>
    </v-layout>
    <div :class="percentage_bar" :style="percentage"></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "RequirementComponent",
});
</script>

<script setup>
import { canDrag, classInfo } from "../mixins/classInfo.js";
import { useStore } from "../plugins/composition.js";
import { ref, computed } from "vue";

const store = useStore();

const props = defineProps({
  req: {
    type: Object,
    required: true,
  },
  isLeaf: {
    type: Boolean,
    required: true,
  },
});

// const open = ref([]);
const hoveringOver = ref(false);
const iconHover = ref(false);
const petitionHover = ref(false);

const iconColor = computed(() => (iconHover.value ? "info" : "grey"));
const petitionColor = computed(() => (petitionHover.value ? "info" : "grey"));
const reqFulfilled = computed(() => {
  return {
    fulfilled: !!props.req.fulfilled,
  };
});
const percentageTextColor = computed(() => {
  return props.req.fulfilled
    ? "#008400"
    : props.req.percent_fulfilled > 15
      ? "#d1b82b"
      : "#d3701f";
});
const percentageColor = computed(() => {
  return props.req.fulfilled
    ? "#00b300"
    : props.req.percent_fulfilled > 15
      ? "#efce15"
      : "#ef8214";
});
const percentage = computed(() => {
  const pfulfilled = props.req.percent_fulfilled;
  return `--percent: ${pfulfilled}%; --bar-color: ${percentageColor.value}; --bg-color: lightgrey`;
});
const percentage_bar = computed(() => {
  const showPBar = "reqs" in props.req || "threshold" in props.req;
  return {
    "percentage-bar": showPBar,
    "p-bar": showPBar,
  };
});

const dragStart = (event) => {
  let usedInfo = classInfo(store, props.req);
  if (usedInfo === undefined) {
    usedInfo = { subject_id: props.req.req };
  }
  event.dataTransfer.setData(
    "classData",
    JSON.stringify({ isNew: true, classIndex: -1 }),
  );
  store.dragStartClass({
    dragstart: event,
    classInfo: usedInfo,
    isNew: true,
  });
};
</script>

<style scoped>
.requirement {
  font-size: 0.75em;
  flex: 1;
  padding: 4px;
}

.p-bar {
  height: 4px;
}
.percentage-bar {
  background: linear-gradient(
    90deg,
    var(--bar-color) var(--percent),
    var(--bg-color) var(--percent)
  );
}
</style>
