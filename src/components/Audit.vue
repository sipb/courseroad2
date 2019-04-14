<template>
  <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->
  <v-flex style="padding: 24px; overflow: auto;">
    <router-link to = "/about" class = "blue-grey lighten-5" style = "color: inherit; text-decoration: none; border-radius: 10px; padding: 8px; display: inline-block;">
      <v-icon>check_box</v-icon> <h2 style = "display: inline; font-family: Gadget">CourseRoad</h2>
    </router-link>
    <v-treeview
      v-model="tree"
      :items="selectedTrees"
      item-key="uniqueKey"
      item-children="reqs"
      open-on-click
      :activatable = "false"
    >
      <template slot="prepend" slot-scope="{ item, leaf, open }">
        <v-icon v-if = "!('reqs' in item)" :style = "fulfilledIcon(item)" @click = "clickRequirement(item)">
          {{ item['plain-string'] ?
              (item["list-id"] in progressOverrides ?
                  (item.fulfilled ? "assignment_turned_in" : "assignment") :
                  "assignment_late" ) :
              item.fulfilled ? "done" : "remove"}}
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

    <v-dialog v-model = "progressDialog">
      <v-card v-if = "progressReq !== undefined" style = "padding: 1em;">
        <v-btn icon flat style = "float:right" @click = "progressDialog = false"><v-icon>close</v-icon></v-btn>
        <v-card-title><h2>Manual Progress: {{progressReq.title}}</h2></v-card-title>
        <v-card-text>
          <h3>{{capitalize(progressReq.threshold.criterion)}} Completed: {{newManualProgress}}/{{progressReq.threshold.cutoff}}</h3>
          <v-layout row>
            <v-flex
             shrink
             style = "width: 3em;"
             >
             <v-text-field
               v-model="newManualProgress"
               type="number"
             ></v-text-field>
            </v-flex>
            <v-flex>
              <v-slider
              v-model = "newManualProgress"
              :max = "progressReq.threshold.cutoff"
              :min = "0"
              :step = "1"
              >
            </v-slider>
          </v-flex>
        </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-btn color = "secondary" @click = "progressDialog = false; progressReq = undefined;">Cancel</v-btn>
          <v-btn color = "primary" @click = "updateManualProgress">Update Progress</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  props: ['selectedReqs', 'reqTrees', 'reqList', 'subjects', 'genericCourses', 'subjectIndex', 'genericIndex', 'progressOverrides'],
  data: function() { return {
    tree: [],
    viewDialog: false,
    dialogReq: undefined,
    progressDialog: false,
    progressReq: undefined,
    newManualProgress: 0
  }},
  computed: {
    selectedTrees: function() {
      return this.selectedReqs.map(function(req,index) {
        if(req in this.reqTrees) {
          return this.assignListIDs(Object.assign({},this.reqTrees[req]), index);
        } else {
          return {
            title: "loading...",
            reqs: [],
            uniqueKey: index
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
        if(!item["plain-string"]) {
          var usedReq = item.req;
          if(usedReq.indexOf("GIR:")===0) {
            usedReq = usedReq.substring(4);
          }
          this.$emit('push-stack', usedReq);
        } else {
          this.startProgressDialog(item);
        }
      }
    },
    //gives each list and sublist an id
    //progress overrides are a dictionary where the keys are these list ids and the values are the manual progress
    //for example, the 3rd requirement of the 1st requirement of GIRs (CAL1) would have id gir.0.2
    assignListIDs: function(req, index) {
      if("reqs" in req && "list-id" in req) {
        var currentListID = req["list-id"];
        if(currentListID.indexOf(".reql")>=0) {
          //if the requirement is top level, it will have .reql at the end and this needs to be removed
          req["list-id"] = req["list-id"].substring(0,req["list-id"].indexOf(".reql"));
          currentListID = req["list-id"];
        }
        req.uniqueKey = index + "-" + req["list-id"];
        for(var r = 0; r < req.reqs.length; r++) {
          //give each sub-requirement a list id of [parent list id].[index]
          Object.assign(req.reqs[r], {"list-id": currentListID + "." + r});
          //assign list ids to each of the children
          req.reqs[r] = this.assignListIDs(req.reqs[r], index);
        }
      }
      return req;
    },
    startProgressDialog: function(req) {
      this.progressReq = Object.assign({threshold: {criterion: "subject", cutoff: 1, type: "GTE"}}, req);
      this.progressDialog = true;
      if(this.progressReq["list-id"] in this.progressOverrides) {
        this.newManualProgress = this.progressOverrides[this.progressReq["list-id"]];
      }
    },
    capitalize: function(word) {
      return word[0].toUpperCase() + word.substring(1);
    },
    updateManualProgress: function() {
      if(this.progressReq["list-id"] !== undefined) {
        this.$emit("update-progress", {listID: this.progressReq["list-id"], progress: this.newManualProgress});
      }
      this.progressReq = undefined;
      this.progressDialog = false;
      this.newManualProgress = 0;
    }
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
