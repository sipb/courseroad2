<template>
  <v-container grid-list-md>
    <v-layout row overflow-x-scroll>
      <v-flex v-for = "subject in subjects">
        <v-card class = "subject" color = "primary" @click = "$emit('click-subject', subject.subject_id)">
          <v-card-text>
            <div><b>{{subject.subject_id}}</b></div>
            {{subject.title}}
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
.overflow-x-scroll {
  overflow-x: scroll;
}
.subject {
  width: 8em;
  height: 6em;
  overflow-y: scroll;
}
</style>
