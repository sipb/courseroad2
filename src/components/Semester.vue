<template>
  <div class="semester-bin">

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
    }
  }
</script>

<style scoped>
  .semester-bin {
    display: flex;
    justify-content: space-between;
    padding: 5% 10% 5% 10%;
  }
</style>