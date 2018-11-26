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
  padding: 1em;
  padding-left: 2em;
  padding-right: 2em;
  border-style: solid;
  border-width: 0.2em;
  border-radius: 0.5em;
}

.satisfied {
  background: #52AA5E;
  border-color: #388659;
}
/* this is a bad color, change it */
.unsatisfied {
  background: #f00;
  border-color: #f00;
}
</style>