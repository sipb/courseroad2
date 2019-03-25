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
      v-bind:itemAddingFromCard = "itemAddingFromCard"
      v-bind:currentSemester = "currentSemester"
      @add-at-placeholder = "$emit('add-at-placeholder',$event)"
      @drag-class = "$emit('drag-class',$event)"
      @drop-class = "$emit('drop-class',$event)"
      @remove-class = "$emit('remove-class', $event)"
      @click-class = "$emit('click-class',$event)"
      @change-year = "changeYearDialog = true"
      >
    </semester>
    <v-dialog v-model = "changeYearDialog">
      <v-card>
        <v-card-title>Change Class Year</v-card-title>
        <v-card-text>
          <v-select
            v-model = "newYear"
            :items = "[{value: 0,text:'1st Year'},{value: 1,text:'2nd Year'},{value:2,text:'3rd Year'},{value:3,text:'4th Year'},{value:4,text:'5th Year'}]"
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
  props: ['selectedSubjects',"subjects","roadID","currentSemester","addingFromCard", "itemAddingFromCard"],
  data: function () { return {
      visibleList: this.currentSemester >= 13 ? Array(16).fill(true) : Array(13).fill(true),
      changeYearDialog: false,
      newYear: (this.currentSemester-1) * 3,
      numSems: this.currentSemester >= 13 ? 16 : 13
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
    },
    addingFromCard: function(new1, old1) {
      console.log("adding from card changed from " + old1 + " to " + new1);
    }
  }
}
</script>


<style scoped>

</style>
