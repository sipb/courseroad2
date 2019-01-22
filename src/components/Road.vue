<template>
  <div>
    <semester v-for="stage in courseroad" :key="stage.id"
              v-bind:semesterInfo="stage"></semester>
  </div>
</template>


<script>
import Semester from './Semester.vue'

export default {
  name: 'Semester',
  components: {
    'semester': Semester
  },
  data: function () { return {
      // TODO: Really we should grab this from a global datastore
      courseroad : [
        {'name':'S1', 'id':0, 'subjects':[
          {'name':'6.006', 'id':0},
          {'name':'6.031', 'id':1},
          {'name':'6.009', 'id':2}]},
        {'name':'S2', 'id':1, 'subjects':[
          {'name':'6.007', 'id':3}]},
        {'name':'S3', 'id':2, 'subjects':[]},
        {'name':'S4', 'id':3, 'subjects':[
          {'name':'6.172', 'id':4},
        ]},
      ]
    }
  }
}
</script>
