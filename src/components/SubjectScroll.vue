<template>
  <v-container grid-list-md>
    <v-layout row overflow-x>
        <v-flex v-for = "subject in subjects" :key = "subject.subject_id">
          <v-card class = "subject" color = "primary" @click = "$emit('click-subject', subject.subject_id)">
            <v-card-text class = "cardtext pa-1">
              <div><b>{{subject.subject_id}}</b></div>
              <p class = "subject-title">{{subject.title}}</p>
            </v-card-text>
          </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: "SubjectScroll",
  props: ["subjects"]
}
</script>
<style>
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
</style>
