<template>
  <div>
    <v-btn v-if = "!requirement.topLevel" icon small @click = "closeExpansion"><v-icon>close</v-icon></v-btn>
    <span v-if = "requirement.expansionDesc.length>0 ">{{requirement.expansionDesc}}</span>
    <subject-scroll @click-subject = "clickSubject" v-bind:subjects = "requirement.reqs"></subject-scroll>
    <div v-if = "open" class = "expanded-req">
      <ExpansionReqs @close-expansion = "open = false" @click-subject = "$emit('click-subject',$event)" v-bind:requirement = "requirement.reqs[expansionIndex]"></ExpansionReqs>
    </div>
  </div>
</template>
<script>
import SubjectScroll from "../components/SubjectScroll.vue"

export default {
  name: "ExpansionReqs",
  props: ["requirement"],
  components: {
    "subject-scroll": SubjectScroll,
  },
  data: function() {return {
    open: false,
    expansionIndex: 0
  }},
  methods: {
    clickSubject: function(subj) {
      if(this.requirement.reqs[subj.index].reqs !== undefined) {
        this.expansionIndex = subj.index;
        this.open = true;
      } else {
        this.$emit("click-subject", subj.id);
      }
    },
    closeExpansion: function(subj) {
      this.$emit("close-expansion");
    }
  },
  mounted() {
    console.log("mounted");
    console.log(this.requirement);
  }
}
</script>
<style>
.expanded-req {
  margin: 1em;
  padding: 0.5em;
  border: 1px dotted gray;
  background-color: #E0E0E0;
}
.expansion-req-header {
  margin: 0;
  padding: 0;
}
</style>
