<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex md3 xs4>
    <v-card
      v-if = "classInfo == 'placeholder'"
      class = "placeholder classbox"
    >
      <v-container fill-height>
        <v-layout>
          <v-btn style = "margin: auto" large icon @click = "$emit('add-at-placeholder',semesterIndex)"><v-icon>add</v-icon></v-btn>
        </v-layout>
      </v-container>
    </v-card>
    <v-card
      v-else
      :class="[{classbox: true, satisfied: isSatisfied}]"
      draggable
      v-on:dragstart = "dragStart"
      v-on:click = "$emit('click-class', classInfo)"
    >
      <div style = "height:100%" :class = "courseColor(classInfo.id)">
        <v-icon style = "margin: 4px" small @click = "$emit('remove-class',classInfo); $event.stopPropagation();">cancel</v-icon>
        <v-card-text class="card-text"><b>{{classInfo.id}}:</b> {{classInfo.title}}</v-card-text>
      </div>
    </v-card>

  </v-flex>
</template>

<script>
import colorMixin from "./../mixins/colorMixin.js"

export default {
  name: "class",
  props: ['classInfo','semesterIndex'],
  mixins: [colorMixin],
  data() {
    return {
      isSatisfied: true,
      dragSemesterNum: -1
    }
  },
  methods: {
    dragStart: function(event) {
      // TODO: Rewrite as part of #53?
      event.dataTransfer.setData('classData', JSON.stringify({isNew: false,classInfo:this.classInfo}));
      this.$emit('drag-start-class', {
        dragstart: event,
        basicClass: this.classInfo,
        isNew: false,
        currentSem: this.semesterIndex
      })
    },
    clickClass: function(classInfo) {
      if(classInfo !== "placeholder") {
        this.$emit('click-class', classInfo);
      }
    }
  }
}
</script>


<style scoped>
  .card-text {
    color: white;
    font-size: 1.1em;
    padding-top: 0;
  }

  .classbox {
    height: 8em;
    padding-top: 0;
    overflow:hidden;
  }

  .satisfied {
    background: #00b300;
  }
  /* this is a bad color, change it */
  .unsatisfied {
    background: #eb7e7e;
  }

  .placeholder {
    background: none;
  }
</style>
