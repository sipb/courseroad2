<template>
  <div
    class="requirement"
    :draggable="canDrag(req)"
    @dragstart="dragStart"
    @mouseover="hoveringOver = true"
    @mouseleave="hoveringOver = false"
  >
    <v-layout row>
      <v-flex>
        <div v-if="!isLeaf" style="display: inline;">
          <span v-if="'title-no-degree' in req && req['title-no-degree'] !=''">
            {{ req["title-no-degree"] }}
          </span>
          <span v-else-if="'medium-title' in req && req['medium-title'] != ''">{{ req['medium-title'] }}</span>
          <span v-else-if="'short-title' in req && req['short-title'] != ''">
            {{ req['short-title'] }}
          </span>
          <span v-else-if="'title' in req">{{ req["title"] }}</span>
          <span style="font-style:italic">{{ req['threshold-desc'] }}</span>
        </div>
        <span v-else>
          <span v-if="'title' in req"> {{ req.title }} </span>
        </span>
        <span v-if="!req['plain-string']">
          <span v-if="!('title' in req) && 'req' in req">
            <span :class="reqFulfilled">{{ req.req }}</span>
            <span v-if="'threshold-desc' in req" style="font-style:italic">
              ({{ req['threshold-desc'] }})
            </span>
          </span>
        </span>
        <span v-else>
          <span v-if="'title' in req">| </span>
          <span style="text-transform: cursive">{{ req.req }}</span>
        </span>
        <span v-if="req.max === 0 && isLeaf" style="font-style:italic">
          (optional)
        </span>
        <span
          v-if="hoveringOver
            && ('reqs' in req || 'threshold' in req)
            && 'percent_fulfilled' in req
            && req.percent_fulfilled !== 'N/A'"
          :style="'float: right; color: '+percentageTextColor"
        >
          {{ req.percent_fulfilled }}%
          <v-icon
            v-if="'reqs' in req && hoveringOver"
            style="padding-left: 0.2em; padding-right: 0em;"
            small
            :color="iconColor"
            @mouseover="iconHover = true"
            @mouseleave="iconHover = false"
            @click.stop="$emit('click-info', $event)"
          >
            info
          </v-icon>
        </span>
        <div :class="percentage_bar" :style="percentage" />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import classInfoMixin from './../mixins/classInfo.js';

export default {
  name: 'Requirement',
  mixins: [classInfoMixin],
  props: {
    req: {
      type: Object,
      required: true
    },
    isLeaf: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      open: [],
      hoveringOver: false,
      iconHover: false
    };
  },
  computed: {
    iconColor: function () {
      return this.iconHover ? 'info' : 'grey';
    },
    reqFulfilled: function () {
      return {
        fulfilled: !!this.req.fulfilled
      };
    },
    percentageTextColor: function () {
      return this.req.fulfilled
        ? '#008400'
        : (this.req.percent_fulfilled > 15 ? '#d1b82b' : '#d3701f');
    },
    percentageColor: function () {
      return this.req.fulfilled
        ? '#00b300'
        : (this.req.percent_fulfilled > 15 ? '#efce15' : '#ef8214');
    },
    percentage: function () {
      const pfulfilled = this.req.percent_fulfilled;
      return `--percent: ${pfulfilled}%; --bar-color: ${this.percentageColor}; --bg-color: lightgrey`;
    },
    percentage_bar: function () {
      const showPBar = ('reqs' in this.req || 'threshold' in this.req);
      return {
        'percentage-bar': showPBar,
        'p-bar': showPBar
      };
    }
  },
  methods: {
    dragStart: function (event) {
      let usedInfo = this.classInfo(this.req);
      if (usedInfo === undefined) {
        usedInfo = { id: this.req.req };
      }
      event.dataTransfer.setData('classData', JSON.stringify({ isNew: true, classIndex: -1 }));
      this.$store.commit('dragStartClass', {
        dragstart: event,
        classInfo: usedInfo,
        isNew: true
      });
    }
  }
};
</script>

<style scoped>
  .requirement {
    font-size: 0.75em;
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
