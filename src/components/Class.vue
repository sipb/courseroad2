<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex lg2 md3 xs4>
    <v-hover>
      <v-badge overlap right color = "rgba(0,0,0,0)" style = "width:100%;" slot-scope = "{ hover }">
        <v-card
          v-if = "classInfo == 'placeholder'"
          class = "placeholder classbox"
        >
          <v-container fill-height>
            <v-layout align-center justify-center>
              <v-btn
                large
                icon
                @click = "$emit('add-at-placeholder',semesterIndex)"
              >
                <v-icon>add</v-icon>
              </v-btn>
            </v-layout>
          </v-container>
        </v-card>

        <v-card
          v-else
          draggable
          v-on:dragstart = "dragStart"
          v-on:click = "$emit('click-class', classInfo)"
          :id = "'class'+classInfo.id.replace('.','')+semesterIndex"
        >
          <!-- This extra div is necessary because we can't set style with background-color on the v-card. -->
          <div :class="cardClass(classInfo)">
            <v-icon style = "margin: 4px" small @click = "$emit('remove-class',classInfo); $event.stopPropagation();">cancel</v-icon>
            <v-card-text class="card-text"><span style="font-weight: bold; font-size: 1.1em;">{{classInfo.id}}</span> {{classInfo.title}}</v-card-text>
          </div>
        </v-card>
        <v-btn v-if = "warnings.length>0&&(!classInfo.overrideWarnings||hover)" @click = "warningDialog = true" icon slot = "badge">
          <v-icon medium>
            warning
          </v-icon>
        </v-btn>
      </v-badge>
    </v-hover>
    <v-dialog v-model = "warningDialog" max-width="600">
      <v-card>
        <v-btn icon flat style = "float:right" @click = "warningDialog = false"><v-icon>close</v-icon></v-btn>
        <v-card-title>
          <h3>Warnings for {{classInfo.id}}</h3>
        </v-card-title>
        <v-card-text>
          <p v-for = "warning in warnings" v-html="warning"></p>
          <v-switch
            label = "Override warnings"
            color = "orange darken-3"
            v-model = "shouldOverrideWarnings"
          >
          </v-switch>
        </v-card-text>
        <v-card-actions style="justify-content: flex-end;">
          <v-btn flat @click = "warningDialog = false; $emit('override-warnings',{override:shouldOverrideWarnings,classInfo:classInfo})">Close</v-btn>
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
      });
    },
    clickClass: function(classInfo) {
      if(classInfo !== "placeholder") {
        this.$emit('click-class', classInfo);
      }
    },
    cardClass: function(classInfo) {
      return `classbox ${this.courseColor(classInfo.id)}`;
    }
  }
}
</script>


<style scoped>
  .card-text {
    color: white;
    font-size: 1.1em;
    padding: 0;
    margin: .2em .4em 0em .2em;
    height: 100%;
  }

  .classbox {
    display: flex;
    align-items: flex-start;
    height: 5.8em; /* Chosen for three lines in the card, working with the set padding and margins. */
    overflow: hidden;
    padding: .2em .4em .4em .2em;
    /* Multi-line truncation is not a supported feature of CSS right now.
       Optimally, we would have multi-line truncation within the cards, but
       currently extra words are clipped.
    text-overflow: ellipsis;
    white-space: nowrap; */
  }

  .placeholder {
    background: none;
  }
</style>
