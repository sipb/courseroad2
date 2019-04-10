<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex md3 xs4>
    <v-hover>
      <v-badge overlap right color = "rgba(0,0,0,0)" style = "width:100%;" slot-scope = "{ hover }">
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
          :class="[{classbox: true,}, courseColor]"
          draggable
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
        <v-btn icon flat style = "float:right" @click = "warningDialog = false"><v-icon>close</v-icon></v-btn>
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
      warningDialog: false,
      shouldOverrideWarnings: this.classInfo.overrideWarnings
    }
  },
  methods: {
    dragStart: function(event) {
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
</style>
