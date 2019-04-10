<template>
  <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->
  <v-flex style="padding: 24px; overflow: auto;">
    <v-treeview
      v-model="tree"
      :items="selectedTrees"
      item-key="index"
      item-children="reqs"
      open-on-click
      :activatable = "false"
    >
      <!-- TODO: useful icons can go here if you can figure out how -->
      <template slot="prepend" slot-scope="{ item, leaf, open }">
        <v-icon v-if = "!('reqs' in item)" :style = "fulfilledIcon(item)">
          {{ item['plain-string'] ? item.fulfilled ? "assignment_turned_in" : "assignment": item.fulfilled ? "done" : "remove"}}
        </v-icon>
      </template>
      <template slot = "label" slot-scope = "{ item, leaf}">
        <requirement
          v-bind:req="item"
          v-bind:leaf="leaf"
          v-bind:subjects = "subjects"
          v-bind:subjectIndex = "subjectIndex"
          v-bind:genericCourses = "genericCourses"
          v-bind:genericIndex = "genericIndex"
          @drag-start-class = "$emit('drag-start-class',$event)"
          @click.native = "clickRequirement(item)"
          @click-info = "reqInfo($event, item)"
        >
        </requirement>
      </template>
    </v-treeview>

    <v-dialog v-model = "viewDialog">
      <div v-if = "dialogReq !== undefined">
      <v-card style = "padding: 2em">
        <v-btn icon flat style = "float:right" @click = "viewDialog = false"><v-icon>close</v-icon></v-btn>
        <v-card-title>{{dialogReq["title"]}}</v-card-title>
        <v-card-text v-if="'url' in dialogReq">
          <a target="_blank" :href="dialogReq['url']">Link to the real, up to date requirements</a>
        </v-card-text>
        <v-card-text v-if = "'desc' in dialogReq">{{dialogReq["desc"]}}</v-card-text>
        <v-card-text>
          <div class = "percentage-bar p-block" :style = "percentage(dialogReq)">
            {{dialogReq["percent_fulfilled"]}}% fulfilled
          </div>
        </v-card-text>
        <v-card-text v-if = "'req' in dialogReq">
          {{dialogReq["req"]}}
        </v-card-text>
        <v-card-text >
          <b>Satisfied Courses</b>
          <div v-for = "course in dialogReq['sat_courses']" v-bind:key="course">
            {{course}}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color = "error" v-if = "'title-no-degree' in dialogReq" @click = "deleteReq(dialogReq); viewDialog = false; dialogReq = undefined;">Remove Requirement</v-btn>
        </v-card-actions>
      </v-card>
      </div>
    </v-dialog>
    <v-menu max-height="600px" absolute>
      <v-btn flat color = "primary" slot = "activator">
        <v-icon>add</v-icon>Add a Major/Minor
      </v-btn>
      <v-list dense>
        <v-list-tile
          v-for = "(item, key) in reqList"
          v-bind:key = "(item, key)"
          @click = "addReqTree(key)"
        >
          <v-list-tile-title style = "font-size:12px;">{{item["medium-title"]}}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <p><b>Warning:</b> This is an unofficial estimate that may not accurately reflect your degree progress.  Please visit
    the <a target = "_blank" href = "https://student.mit.edu/cgi-bin/shrwsdau.sh">official audit</a>,
    <a target = "_blank" href = "http://student.mit.edu/catalog/index.cgi">course catalog</a>, and
    <a target = "_blank" href = "http://catalog.mit.edu/degree-charts/">degree charts</a> and confirm
    with your department advisor.</p>
  </v-flex>
</template>


<script>
import Requirement from './Requirement.vue'
export default {
  name: 'audit',
  components: {
    'requirement': Requirement,
  },
  props: ['selectedReqs', 'reqTrees', 'reqList', 'subjects', 'genericCourses', 'subjectIndex', 'genericIndex'],
  data: function() { return {
    tree: [],
    viewDialog: false,
    dialogReq: undefined
  }},
  computed: {
    selectedTrees: function() {
      return this.selectedReqs.map(function(req,index){
        if(req in this.reqTrees) {
          return Object.assign({index: index},this.reqTrees[req]);
        } else {
          return {
            title: "loading...",
            reqs: [],
            index: index
          }
        }
      }, this);
    },
  },
  methods: {
    fulfilledIcon: function(req) {
      if(req.fulfilled && (req.req != undefined || req.sat_courses.length>0)) {
        return "color: #00b300;";
      } else {
        return "";
      }
    },
    addReqTree: function(req) {
      this.$emit("add-req", req)
    },
    reqInfo: function(event, req) {
      event.preventDefault();
      event.stopPropagation();
      this.viewDialog = true;
      this.dialogReq = req;
    },
    percentage: function(req) {
      var pfulfilled = req.percent_fulfilled;
      var pcolor = req.fulfilled ? "#00b300" : (req.percent_fulfilled > 15 ? "#efce15": "#ef8214");
      var pstring = "--percent: " + pfulfilled +"%; --bar-color: " + pcolor + "; --bg-color: #ffffff";
      return pstring;
    },
    deleteReq: function(req) {
      var reqName = req["list-id"].substring(0, req["list-id"].indexOf(".reql"));
      this.$emit("remove-req",reqName);
    },
    clickRequirement: function(item) {
      if(item.req !== undefined) {
        var usedReq = item.req;
        if(usedReq.indexOf("GIR:")===0) {
          usedReq = usedReq.substring(4);
        }
        this.$emit('push-stack', usedReq);
      }
    },
  },

}
</script>

<style>

.percentage-bar {
  background: linear-gradient(90deg, var(--bar-color) var(--percent), var(--bg-color) var(--percent));
}
.p-block{
  height: 30px;
  border: 1px solid gray;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
}
.terminal {
  cursor: default;
}
</style>
