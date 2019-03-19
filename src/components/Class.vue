<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex md3 xs4>
    <v-card
      class = "classbox"
      draggable
      v-on:drag = "drag"
      v-on:dragend = "drop"
      v-on:dragstart = "dragStart"
      v-on:click = "$emit('click-class',classInfo)"
    >
      <div :class = "courseColor(classInfo.id)" style = "height:100%;">
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
      dragSemesterNum: -1,
      validCourses: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '14', '15', '16', '17', '18', '20', '21', '21A', '21W',
        'CMS', '21G', '21H', '21L', '21M', 'WGS', '22', '24', 'CC', 'CSB',
        'EC', 'EM', 'ES', 'HST', 'IDS', 'MAS', 'SCM', 'STS', 'SWE', 'SP'
      ]
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
</style>
