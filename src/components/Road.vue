<template>
  <!-- more on expansion panels (and more examples): https://vuetifyjs.com/en/components/expansion-panels -->
  <!-- this is the example I copied: https://vuetifyjs.com/en/components/expansion-panels#expand -->
  <v-expansion-panel
    v-model="visibleList"
    expand
  >
    <!-- v-for index in N starts at 1... -->
    <!-- FYI can't use key as prop: https://stackoverflow.com/questions/47783396/access-key-from-child-component-in-vue -->
    <semester
      v-for="index in numSems"
      :key="index-1"
      v-bind:index="index-1"
      v-bind:selectedSubjects="selectedSubjects"
      v-bind:allSubjects = "subjects"
      v-bind:roadID = "roadID"
      v-bind:isOpen = "visibleList[index-1]"
      v-bind:baseYear = "baseYear"
      v-bind:addingFromCard = "addingFromCard"
      v-bind:itemAdding = "itemAdding"
      v-bind:currentSemester = "currentSemester"
      v-bind:draggingOver = "dragSemesterNum===index-1"
      v-bind:subjectsIndex = "subjectsIndex"
      v-bind:genericCourses = "genericCourses"
      v-bind:genericIndex = "genericIndex"
      @add-at-placeholder = "$emit('add-at-placeholder',$event)"
      @add-class = "$emit('add-class', $event)"
      @move-class = "$emit('move-class', $event)"
      @remove-class = "$emit('remove-class', $event)"
      @click-class = "$emit('click-class',$event)"
      @change-year = "changeYearDialog = true"
      @override-warnings = "$emit('override-warnings',$event)"
      @drag-start-class = "$emit('drag-start-class',$event)"
      >
    </semester>
    <v-dialog v-model = "changeYearDialog">
      <v-card>
        <v-btn icon flat style = "float:right" @click = "changeYearDialog = false"><v-icon>close</v-icon></v-btn>
        <v-card-title>
          <h1>I am a...</h1>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model = "newYear"
            :items = "[{value: 0,text:'First Year/Freshman'},{value: 1,text:'Sophomore'},{value:2,text:'Junior'},{value:3,text:'Senior'},{value:4,text:'Super Senior'}]"
          >

          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn @click = "changeYearDialog = false">
            Cancel
          </v-btn>
          <v-btn @click = "$emit('change-year',newYear); changeYearDialog = false;">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-expansion-panel>
</template>


<script>
import Semester from './Semester.vue'

export default {
  name: 'Semester',
  components: {
    'semester': Semester
  },
  props: ['selectedSubjects',"subjects","roadID","currentSemester","addingFromCard", "itemAdding", "dragSemesterNum","subjectsIndex", "genericCourses", "genericIndex"],
  data: function () {
    let defaultOpen = [false, true, false, true, true, false, true, true, false, true, true, false, true,];
    let numSemesters = 16;//this.currentSemester >= 13 ? 16 : 13
    return {
      visibleList: numSemesters >= 13 ? defaultOpen.concat([true, false, true,]) : defaultOpen,
      changeYearDialog: false,
      newYear: parseInt((this.currentSemester-1) / 3),
      numSems: numSemesters,
    }
  },
  computed: {
    baseYear: function() {
      var today = new Date();
      var currentYear = today.getFullYear();
      var baseYear = (today.getMonth() >= 4 && today.getMonth()<=10) ? currentYear + 1 : currentYear
      return baseYear - Math.floor((this.currentSemester-1)/3)
    }
  },
  watch: {
    currentSemester: function(newSem, oldSem) {
      this.numSems = newSem >= 13 ? 16 : 13;
    }
  }
}
</script>
