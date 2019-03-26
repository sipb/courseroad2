<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex md3 xs4>
    <v-hover>
      <v-badge overlap right color = "rgba(0,0,0,0)" style = "width:100%;" slot-scope = "{ hover }">
        <v-card
          :class="[{classbox: true, satisfied: isSatisfied}, courseColor]"
          draggable
          v-on:drag = "drag"
          v-on:dragend = "drop"
          v-on:dragstart = "dragStart"
          v-on:click = "$emit('click-class',classInfo)"
          :id = "'class'+classInfo.id.replace('.','')+semesterIndex"
        >
          <div :class = "courseColor(classInfo.id)" style = "height:100%;">
            <v-icon style = "margin: 4px" small @click = "$emit('remove-class',classInfo); $event.stopPropagation();">cancel</v-icon>
            <v-card-text class="card-text"><b>{{classInfo.id}}:</b> {{classInfo.title}}</v-card-text>
          </div>
        </v-card>
        <v-btn v-if = "warnings.length>0&&(!classInfo.overrideWarnings||hover)" @click = "warningDialog = true" icon slot = "badge">
          <v-icon medium>
            warning
          </v-icon>
        </v-btn>
      </v-badge>
    </v-hover>
    <v-dialog v-model = "warningDialog">
      <v-card>
        <v-card-title>
          <h3>Warnings for {{classInfo.id}}</h3>
        </v-card-title>
        <v-card-text>
          <p v-for = "warning in warnings" v-html="warning"></p>
          <v-switch
            label = "Override Warnings"
            color = "orange darken-3"
            v-model = "shouldOverrideWarnings"
          >
          </v-switch>
        </v-card-text>
        <v-card-actions>
          <v-btn @click = "warningDialog = false; $emit('override-warnings',{override:shouldOverrideWarnings,classInfo:classInfo})">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import colorMixin from "./../mixins/colorMixin.js"

export default {
  name: "class",
  props: ['classInfo','semesterIndex','warnings'],
  mixins: [colorMixin],
  data() {
    return {
      isSatisfied: true,
      dragSemesterNum: -1,
      warningDialog: false,
      shouldOverrideWarnings: this.classInfo.overrideWarnings
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
