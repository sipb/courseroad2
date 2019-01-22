<template>
  <div :class="semesterStyles">
    Semester {{index}}
    <class v-for="subject in semesterSubjects" :key="subject.id + index"
      v-bind:classInfo="subject">
    </class>

    <!--<h1>{{selectedSubjects.name}}</h1>-->

  </div>
</template>


<script>
import Class from './Class.vue'

export default {
  name: "semester",
  props:['selectedSubjects','index'],
  components: {
    'class': Class
  },
  computed: {
    semesterStyles: function() {
      return {
        semesterBin: true,
        dark: this.index % 2 == 0,
        light: this.index % 2 == 1,
      }
    },
    semesterSubjects: function() {
      return this.selectedSubjects.filter(subj => {
        return this.index === subj.semester;
      });
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
