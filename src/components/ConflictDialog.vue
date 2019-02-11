<template>
  <v-dialog v-model = "conflictDialog">
    <v-card>
      <v-card-title>Save Conflict</v-card-title>
      <v-layout row>
        <v-flex xs6 style = "padding: 2em">
          <b>Local</b>
          <v-list>
            <v-card style = "padding: 1em">Name: conflictInfo.other_name</v-card>
            <v-card style = "padding: 1em">Agent: conflictInfo.other_agent</v-card>
            <v-card style = "padding: 1em">Date: conflictInfo.other_date</v-card>
            <v-card style = "padding: 1em">
              <p>Contents:</p>
              <p>Courses of Study: <span v-for = "req in conflictInfo.other_contents.coursesOfStudy"> {{req}} </span></p>
              <p>Selected Subjects: <span v-for = "course in conflictInfo.other_contents.selectedSubjects"> {{course}} </span></p>
            </v-card>
          </v-list>
          <v-btn color = "primary" @click = "$emit('update-local', conflictInfo.id) ">Keep Remote</v-btn>
        </v-flex>
        <v-flex xs6>
          <b>Cloud</b>
          <v-list>
            <v-card style = "padding: 1em">Name: roads[conflictInfo.id].name</v-card>
            <v-card style = "padding: 1em">Agent: roads[conflictInfo.id].agent</v-card>
            <v-card style = "padding: 1em">Date: roads[conflictInfo.id].changed_date</v-card>
            <v-card style = "padding: 1em">
              <p>Contents:</p>
              <p>Courses of Study: <span v-for = "req in roads[conflictInfo.id].contents.coursesOfStudy"> {{req}} </span></p>
              <p>Selected Subjects: <span v-for = "course in roads[conflictInfo.id].contents.selectedSubjects"> {{course}} </span></p>
            </v-card>
          </v-list>
          <v-btn color = "primary" @click = "$emit('update-remote', conflictInfo.id)">Keep Local</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>

</template>

<script>
export default {
  name: "ConflictDialog",
  props: ["conflictDialog", "conflictInfo"]
}
</script>
