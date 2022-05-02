<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex lg2 md3 xs4>
    <v-hover>
      <v-badge slot-scope="{ hover }" overlap right color="rgba(0,0,0,0)" style="width:100%;">
        <v-card
          v-if="classInfo == 'placeholder'"
          data-cy="placeholderClass"
          class="placeholder classbox"
        >
          <v-container fill-height>
            <v-layout align-center justify-center>
              <v-btn
                large
                icon
                @click="$store.dispatch('addAtPlaceholder',semesterIndex)"
              >
                <v-icon>add</v-icon>
              </v-btn>
            </v-layout>
          </v-container>
        </v-card>

        <v-card
          v-else
          :id="'class'+classInfo.subject_id.replace('.','')+semesterIndex"
          :data-cy="'classInSemester' + semesterIndex + '_' + classInfo.subject_id.replace('.', '_')"
          draggable
          @dragstart="dragStart"
          @click="$store.commit('pushClassStack', classInfo.subject_id)"
        >
          <!-- This extra div is necessary because we can't set style with background-color on the v-card. -->
          <div :class="cardClass(classInfo)">
            <v-icon style="margin: 4px" small @click="$store.commit('removeClass', {classInfo: classInfo, classIndex: classIndex}); $event.stopPropagation();">
              cancel
            </v-icon>
            <v-card-text class="card-text">
              <span style="font-weight: bold; font-size: 1.1em;">{{ classInfo.subject_id }}<sub v-if="oldID != undefined">[{{ oldID }}]</sub></span> {{ classInfo.title }}
            </v-card-text>
          </div>
        </v-card>
        <v-btn v-if="warnings.length>0&&(!classInfo.overrideWarnings||hover)" slot="badge" icon @click="warningDialog = true">
          <v-icon medium>
            warning
          </v-icon>
        </v-btn>
      </v-badge>
    </v-hover>
    <v-dialog v-model="warningDialog" max-width="600">
      <v-card>
        <v-btn icon flat style="float:right" @click="warningDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
          <h3>Warnings for {{ classInfo.subject_id }}</h3>
        </v-card-title>
        <v-card-text>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-for="warning in warnings" :key="warning" v-html="warning" />
          <v-switch
            v-model="shouldOverrideWarnings"
            label="Override warnings"
            color="orange darken-3"
            @change="$store.commit('overrideWarnings', {override:shouldOverrideWarnings,classInfo:classInfo})"
          />
        </v-card-text>
        <v-card-actions style="justify-content: flex-end;">
          <v-btn flat @click="warningDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import colorMixin from './../mixins/colorMixin.js';

export default {
  name: 'Class',
  mixins: [colorMixin],
  props: {
    classIndex: {
      type: Number,
      required: true
    },
    classInfo: {
      type: [Object, String],
      required: true
    },
    semesterIndex: {
      type: Number,
      required: true
    },
    warnings: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      warningDialog: false,
      shouldOverrideWarnings: this.classInfo.overrideWarnings
    };
  },
  methods: {
    dragStart: function (event) {
      event.dataTransfer.setData('classData', JSON.stringify({ isNew: false, classInfo: this.classInfo, classIndex: this.classIndex }));
      this.$store.commit('dragStartClass', {
        dragstart: event,
        basicClass: this.classInfo,
        isNew: false,
        currentSem: this.semesterIndex
      });
    },
    clickClass: function (classInfo) {
      if (classInfo !== 'placeholder') {
        this.$store.commit('pushClassStack', classInfo.subject_id);
      }
    },
    cardClass: function (classInfo) {
      return `classbox ${this.courseColor(classInfo)}`;
    }
  },
  computed: {
    oldID: function() {
      const subjectIndex = this.$store.state.subjectsIndex[this.classInfo.subject_id];
      if (subjectIndex !== undefined) {
        const subject = this.$store.state.subjectsInfo[subjectIndex];
        return subject.old_id;
      } else {
        return undefined;
      }
    }
  }
};
</script>

<style scoped>
  .card-text {
    color: white;
    font-size: 1.1em;
    padding: 0;
    margin: .2em .4em 0em .2em;
    height: 100%;
  }

  .classbox {
    display: flex;
    align-items: flex-start;
    height: 5.8em; /* Chosen for three lines in the card, working with the set padding and margins. */
    overflow: hidden;
    padding: .2em .4em .4em .2em;
    /* Multi-line truncation is not a supported feature of CSS right now.
       Optimally, we would have multi-line truncation within the cards, but
       currently extra words are clipped.
    text-overflow: ellipsis;
    white-space: nowrap; */
  }

  .placeholder {
    background: none;
  }
</style>
