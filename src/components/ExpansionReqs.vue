<template>
  <div>
    <subject-scroll></subject-scroll>
    <div>
    </div>
  </div>
</template>
<script>
import SubjectScroll from "../components/SubjectScroll.vue"

export default {
  name: "ExpansionReqs",
  props: ["requirement"],
  components: {
    "subject-scroll": SubjectScroll
  },
  data: function() {return {

  }},
  methods: {

  }
}
</script>
