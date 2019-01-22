<template>
  <div :class="{classbox: true, satisfied: isSatisfied}">
    {{classInfo.name}}
  </div>
</template>

<script>
  export default {
    name: "class",
    props: ['classInfo'],
    data() {
      return {
        isSatisfied: true
      }
    },
  }
</script>

<style scoped>
  .classbox {
    padding: 1rem 2rem;
    border-style: solid;
    border-width: 0.2em;
    border-radius: 0.5em;
  }

  .satisfied {
    background: #98fb98;
    border-color: #79c879;
  }
  /* this is a bad color, change it */
  .unsatisfied {
    background: #eb7e7e;
    border-color: #e75f5f;
  }
</style>
