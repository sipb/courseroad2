<template>
  <v-container grid-list-md style="padding: 0.5em">
    <v-layout overflow-x>
      <v-flex v-for="(subject, index) in subjects" :key="subject.subject_id">
        <v-badge right overlap color="rgba(0,0,0,0)">
          <v-card
            class="subject"
            :data-cy="'subjectInScroller' + index"
            @click="
              $emit('click-subject', {
                subject_id: subject.subject_id,
                index: index,
              })
            "
          >
            <div
              :class="[shouldLighten(subject)]"
              :style="
                'height: 100%; background-color: ' +
                getRawColor(courseColor(subject))
              "
            >
              <v-card-text
                class="cardtext pa-1"
                :style="'color: ' + getRawTextColor(courseColor(subject))"
              >
                <div>
                  <b
                    >{{ subject.subject_id
                    }}<sub v-if="subject.old_id !== undefined"
                      >[{{ subject.old_id }}]</sub
                    ></b
                  >
                </div>
                <p class="subject-title">
                  {{ subject.title }}
                </p>
              </v-card-text>
            </div>
          </v-card>
          <template v-if="shouldLighten(subject)" #badge>
            <v-icon color="green" medium> mdi-check </v-icon>
          </template>
        </v-badge>
      </v-flex>
      <v-flex style="width: 500px" />
    </v-layout>
  </v-container>
</template>
<script>
import colorMixin from "./../mixins/colorMixin.js";
import { defineComponent } from "vue";

export default defineComponent({
  name: "SubjectScroll",
  mixins: [colorMixin],
  props: {
    subjects: {
      type: Array,
      required: true,
    },
  },
  methods: {
    shouldLighten: function (subject) {
      if (subject.fulfilled === true) {
        return "lightened";
      } else {
        return "";
      }
    },
  },
});
</script>

<style scoped>
.overflow-x {
  overflow-x: auto;
}
.subject {
  cursor: pointer;
  user-select: none;
  width: 8em;
  height: 6em;
  overflow: hidden;
  column-width: 8em;
  -webkit-column-width: 8em;
}
.subject-title {
  font-size: 0.9em;
}
.cardtext {
  color: white;
}
.lightened {
  box-shadow: inset 0 0 8em 6em rgba(255, 255, 255, 0.45);
}
</style>
