<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex lg2 md3 xs4>
    <v-hover>
      <v-badge
        slot-scope="{ hover }"
        overlap
        right
        color="rgba(0,0,0,0)"
        style="width: 100%"
      >
        <v-card
          v-if="classInfo === 'placeholder'"
          data-cy="placeholderClass"
          class="placeholder classbox"
        >
          <v-container fill-height>
            <v-layout align-center justify-center>
              <v-btn large icon @click="store.addAtPlaceholder(semesterIndex)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-layout>
          </v-container>
        </v-card>

        <v-card
          v-else
          :id="'class' + classInfo.subject_id.replace('.', '') + semesterIndex"
          class="classbox"
          :data-cy="
            'classInSemester' +
            semesterIndex +
            '_' +
            classInfo.subject_id.replace('.', '_')
          "
          :color="cardColor(classInfo)"
          draggable="true"
          @dragstart="dragStart"
          @click.stop="clickClass(classInfo)"
        >
          <v-btn
            icon
            :color="cardTextColor(classInfo)"
            style="margin: -0.5em; pointer-events: auto; opacity: 0.8"
            @click="
              store.removeClass({
                classInfo: classInfo,
                classIndex: classIndex,
              });
              $event.stopPropagation();
            "
          >
            <v-icon small> mdi-close-circle </v-icon>
          </v-btn>

          <v-card-text
            class="card-text"
            :style="'color: ' + cardTextColor(classInfo)"
          >
            <span class="text-body-1 font-weight-bold"
              >{{ classInfo.subject_id
              }}<sub v-if="oldID != undefined">[{{ oldID }}]</sub>
            </span>
            <span class="text-body-2"> {{ classInfo.title }} </span>
          </v-card-text>
        </v-card>
        <v-btn
          v-if="warnings.length > 0 && (!classInfo.overrideWarnings || hover)"
          slot="badge"
          icon
          color="gray"
          style="
            position: absolute;
            right: -0.5em;
            top: -0.5em;
            z-index: 1;
            opacity: 0.8;
          "
          @click="warningDialog = true"
        >
          <v-icon medium> mdi-alert </v-icon>
        </v-btn>
      </v-badge>
    </v-hover>
    <v-dialog v-model="warningDialog" max-width="600">
      <v-card>
        <v-btn icon text style="float: right" @click="warningDialog = false">
          <v-icon>mdi-close</v-icon>
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
            @change="
              store.overrideWarnings({
                override: shouldOverrideWarnings,
                classInfo: classInfo,
              })
            "
          />
        </v-card-text>
        <v-card-actions style="justify-content: flex-end">
          <v-btn text @click="warningDialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ClassComponent",
});
</script>

<script setup>
import { useStore } from "../plugins/composition.js";
import {
  getRawColor,
  getRawTextColor,
  courseColor,
} from "./../mixins/colorMixin.js";
import { computed, ref } from "vue";

const props = defineProps({
  classIndex: {
    type: Number,
    required: true,
  },
  classInfo: {
    type: [Object, String],
    required: true,
  },
  semesterIndex: {
    type: Number,
    required: true,
  },
  warnings: {
    type: Array,
    required: true,
  },
});

const store = useStore();

const warningDialog = ref(false);
const shouldOverrideWarnings = ref(props.classInfo.overrideWarnings);

const oldID = computed(() => {
  if (props.classInfo.public === false) {
    return undefined;
  }
  const subjectIndex = store.subjectsIndex[props.classInfo.subject_id];
  if (subjectIndex !== undefined) {
    const subject = store.subjectsInfo[subjectIndex];
    return subject.old_id;
  } else {
    return undefined;
  }
});

const dragStart = (event) => {
  event.dataTransfer.setData(
    "classData",
    JSON.stringify({
      isNew: false,
      classInfo: props.classInfo,
      classIndex: props.classIndex,
    }),
  );
  store.dragStartClass({
    dragstart: event,
    basicClass: props.classInfo,
    isNew: false,
    currentSem: props.semesterIndex,
  });
};
const clickClass = (classInfo) => {
  if (classInfo === "placeholder") {
    //
  } else if (classInfo.public === false) {
    store.editCustomClass(classInfo);
  } else {
    store.pushClassStack(classInfo.subject_id);
  }
};
// const cardClass = (classInfo) => {
//   return `classbox ${this.courseColor(classInfo)}`;
// };
const cardColor = (classInfo) => {
  return `${getRawColor(courseColor(classInfo))}`;
};
const cardTextColor = (classInfo) => {
  return `${getRawTextColor(courseColor(classInfo))}`;
};
</script>

<style scoped>
.card-text {
  font-size: 1.1em;
  padding: 0;
  margin: 0.2em 0.4em 0em 0.2em;
  height: 100%;
}

.classbox {
  display: flex;
  align-items: flex-start;
  height: 5.8em; /* Chosen for three lines in the card, working with the set padding and margins. */
  overflow: hidden;
  /* padding: 0.2em 0.4em 0.4em 0.2em; */
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
