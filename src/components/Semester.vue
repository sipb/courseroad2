<template>
  <div :class="semesterStyles">
    Semester {{semesterInfo.id}}
    <class v-for="subject in semesterInfo.subjects" :key="subject.id"
      v-bind:classInfo="subject">

    </class>

    <!--<h1>{{semesterInfo.name}}</h1>-->

  </div>
</template>


<script>
import Class from './Class.vue'

export default {
  name: "semester",
  props:['semesterInfo'],
  components: {
    'class': Class
  },
  computed: {
    semesterStyles: function() {
      return {
        semesterBin: true,
        dark: this.semesterInfo.id % 2 == 0,
        light: this.semesterInfo.id % 2 == 1,
      }
    }
  }
}
</script>


<style scoped>
  .semesterBin {
    display: flex;
    justify-content: space-between;
    padding: 5% 10% 5% 10%;
  }

  .dark {
    background-color: #bcdeea;
  }

  .light {
    background-color: #cde7f0;
  }
</style>
