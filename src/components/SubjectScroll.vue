<template>
  <v-container grid-list-md style="padding: 0.5em;">
    <v-layout row overflow-x>
      <v-flex v-for="(subject,index) in subjects" :key="subject.subject_id">
        <v-badge right overlap color="rgba(0,0,0,0)">
          <v-card class="subject" @click="$emit('click-subject', {id:subject.subject_id,index:index})">
            <div :class="[courseColor(subject), shouldLighten(subject)]" style="height:100%;">
              <v-card-text class="cardtext pa-1">
                <div><b>{{ subject.subject_id }}</b></div>
                <p class="subject-title">
                  {{ subject.title }}
                </p>
              </v-card-text>
            </div>
          </v-card>
          <template v-if="shouldLighten(subject)" v-slot:badge>
            <v-icon color="green" medium>
              done
            </v-icon>
          </template>
        </v-badge>
      </v-flex>
      <v-flex style="width:500px" />
    </v-layout>
  </v-container>
</template>
<script>
import colorMixin from './../mixins/colorMixin.js';

export default {
  name: 'SubjectScroll',
  mixins: [colorMixin],
  props: {
    subjects: {
      type: Array,
      required: true
    }
  },
  methods: {
    shouldLighten: function (subject) {
      if (subject.fulfilled === true) {
        return 'lightened';
      } else {
        return '';
      }
    }
  }
};
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
    overflow:hidden;
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
