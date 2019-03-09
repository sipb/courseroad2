<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex md3>
    <v-card
      :class="{classbox: true, satisfied: isSatisfied}"
      draggable
      v-on:drag = "drag"
      v-on:dragend = "drop"
      v-on:dragstart = "dragStart"
      v-on:click = "$emit('click-class',classInfo)"
    >
      <v-icon style = "margin: 4px" small @click = "$emit('remove-class',classInfo)">cancel</v-icon>
      <v-card-text>{{classInfo.id}}: {{classInfo.title}}</v-card-text>

<!--
     <v-container
      height="200px"
      fluid
      pa-2
    > -->

    </v-card>
  </v-flex>
</template>

<script>
export default {
  name: "class",
  props: ['classInfo','semesterIndex'],
  data() {
    return {
      isSatisfied: true,
      dragSemesterNum: -1
    }
  },
  methods: {
    drag: function(event) {
      this.$emit("drag-class",{
        drag: event,
        basicClass: this.classInfo,
        isNew: false,
        currentSem: this.semesterIndex
      });
    },
    dragStart: function(event) {
      // TODO: Rewrite as part of #53?
      event.dataTransfer.setData('foo', 'bar')
    },
    drop: function(event) {
      this.$emit("drop-class",{
        drop: event,
        basicClass: this.classInfo,
        isNew: false,
        currentSem: this.semesterIndex
      });
    }
  }
}
</script>


<style scoped>
/*  .classbox {
    padding: 1rem 2rem;
    border-style: solid;
    border-width: 0.2em;
    border-radius: 0.5em;
  }
*/
  .satisfied {
    background: #98fb98;
  }
  /* this is a bad color, change it */
  .unsatisfied {
    background: #eb7e7e;
  }
</style>
