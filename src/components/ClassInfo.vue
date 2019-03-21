<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card class = "class-info-card" id = "classInfoCard" style = "display: flex; flex-direction:column;" >
          <v-card-title class = "card-header">
            <v-flex style = "display: flex; flex-direction: row; align-items: center;">
              <div style = "padding: 0; margin: 0; display: block;">
                <v-btn v-if = "classInfoStack.length > 1" @click = "$emit('pop-stack')" style = "padding: 0; margin: 0" icon>
                  <v-icon>navigate_before</v-icon>
                </v-btn>
              </div>
              <div style = "padding: 0 0.5em 0 0;">
                <h3>{{currentSubject.subject_id}}</h3>
              </div>
              <div style = "padding: 0 0.5em 0 0;"><span>{{currentSubject.title}}</span></div>
              <div style = "margin-left:auto">
                <v-btn @click = "$emit('close-classinfo')" icon style = "margin: 0;">
                  <v-icon style = "margin:0; padding: 0;">
                    close
                  </v-icon>
                </v-btn>
              </div>
            </v-flex>
          </v-card-title>
          <v-card-text class = "card-body">
            <div class = "card-body-container" id = "cardBody">
              <table cellspacing= "4">
                <tr v-if = "currentSubject.total_units!==undefined">
                  <td><b>Units</b></td>
                  <td>{{currentSubject.total_units}} <span v-if = "currentSubject.lecture_units!==undefined&&currentSubject.lab_units!==undefined&&currentSubject.preparation_units!==undefined">total ({{currentSubject.lecture_units}}-{{currentSubject.lab_units}}-{{currentSubject.preparation_units}})</span></td>
                </tr>
                <tr v-if = "currentSubject.offeredFall!==undefined || currentSubject.offered_IAP !== undefined || currentSubject.offered_spring !== undefined || currentSubject.offered_summer !== undefined">
                  <td><b>Offered</b></td>
                  <td>
                    <ul class = "comma-separated">
                      <li v-if = "currentSubject.offered_fall">Fall</li>
                      <li v-if = "currentSubject.offered_IAP">IAP</li>
                      <li v-if = "currentSubject.offered_spring">Spring</li>
                      <li v-if = "currentSubject.offered_summer">Summer</li>
                    </ul>
                    <span v-if = "!currentSubject.offered_fall&&!currentSubject.offered_IAP&&!currentSubject.offered_spring&&!currentSubject.offered_summer">None</span>
                  </td>
                </tr>
                <tr v-if = "currentSubject.instructors !== undefined">
                  <td><b>Instructor</b></td>
                  <td><ul class = "comma-separated"><li v-for = "instructor in currentSubject.instructors">{{instructor}}</li></ul></td>
                </tr>
                <tr v-if = "currentSubject.enrollment_number !== undefined">
                  <td><b>Average Enrollment</b></td>
                  <td>{{currentSubject.enrollment_number}}</td>
                </tr>
                <tr v-if = "currentSubject.rating !== undefined">
                  <td><b>Average Rating</b></td>
                  <td>{{currentSubject.rating}}</td>
                </tr>
                <tr v-if = "currentSubject.in_class_hours !== undefined || currentSubject.out_of_class_hours !== undefined">
                  <td><b>Hours</b></td>
                  <td>
                    <table cellspacing = "0">
                      <tr v-if = "currentSubject.in_class_hours !== undefined">{{currentSubject.in_class_hours}} in class</tr>
                      <tr v-if = "currentSubject.out_of_class_hours !== undefined">{{currentSubject.out_of_class_hours}} out of class</tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h3>Description</h3>
              <p>{{currentSubject.description}}</p>
              <p v-if = "currentSubject.url !== undefined"><a target = "_blank" :href = "currentSubject.url">View in Course Catalog</a></p>
              <p v-if = "currentSubject.subject_id in subjectsIndex"><a target = "_blank" :href = "'https://sisapp.mit.edu/ose-rpt/subjectEvaluationSearch.htm?search=Search&subjectCode='+currentSubject.subject_id">View Course Evaluations</a></p>
              <div v-if = "currentSubject.equivalent_subjects !== undefined">
                <h3>Equivalent Subjects</h3>
                <subject-scroll @click-subject = "clickRelatedSubject" v-bind:subjects = "currentSubject.equivalent_subjects.map(classInfo)"></subject-scroll>
              </div>
              <div v-if = "parsedPrereqs.reqs.length > 0">
                <h3 id = "prereq0">Prerequisites</h3>
                <expansion-reqs
                  v-bind:requirement = "parsedPrereqs"
                  v-bind:reqID = "'prereq0'"
                >
                </expansion-reqs>
              </div>
              <div v-if = "parsedCoreqs.reqs.length > 0">
                <h3 id = "coreq0">Corequisites</h3>
                <expansion-reqs
                  v-bind:requirement = "parsedCoreqs"
                  v-bin:reqID = "'coreq0'"
                >
                </expansion-reqs>
              </div>
              <div v-if = "currentSubject.related_subjects !== undefined">
                <h3>Related subjects</h3>
                <subject-scroll @click-subject = "clickRelatedSubject" v-bind:subjects = "currentSubject.related_subjects.map(classInfo)"></subject-scroll>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import $ from "jquery";
import SubjectScroll from "../components/SubjectScroll.vue"
import ExpansionReqs from "../components/ExpansionReqs.vue"
export default {
  name: "ClassInfo",
  components: {
    'subject-scroll': SubjectScroll,
    'expansion-reqs': ExpansionReqs
  },
  props: ["subjects", "classInfoStack", "subjectsIndex", "genericCourses", "genericIndex"],
  data: function() {return {}},
  computed: {
    currentSubject: function() {
      var currentID = this.classInfoStack[this.classInfoStack.length-1];
      var curSubj;
      if(currentID in this.subjectsIndex) {
        curSubj = this.subjects[this.subjectsIndex[currentID]];
      } else {
        curSubj = this.genericCourses[this.genericIndex[currentID]];
      }
      return curSubj;
    },
    parsedPrereqs: function() {
      if(this.currentSubject.prerequisites !== undefined) {
        return this.parseRequirements(this.currentSubject.prerequisites);
      } else {
        return {
          reqs: []
        }
      }
    },
    parsedCoreqs: function() {
      if(this.currentSubject.corequisites !== undefined) {
        return this.parseRequirements(this.currentSubject.corequisites);
      } else {
        return {
          reqs: []
        }
      }
    }
  },
  methods: {
    classInfo: function(subjectID) {
      var subj = this.subjects[this.subjectsIndex[subjectID]];
      if(subj !== undefined) {
        return subj;
      } else {
        return {
          subject_id: subjectID,
          title: ""
        }
      }
    },
    clickRelatedSubject: function(subject) {
      this.$emit('push-stack', subject.id);
      $("#cardBody").animate({scrollTop:0});
    },
    listRequirements: function(requirements) {
      if(requirements) {
        var allReqs = requirements.split(/, |\(|\)|\/| or/);
        var filteredReqs = allReqs.filter(function(req) {
          return req.length > 0 && req.indexOf("'") == -1 && req!=="or";
        });
        return filteredReqs;
      } else {
        return [];
      }
    },
    parseRequirements: function(requirements) {
      requirements = requirements.replace(/([,\/])\s+/g,"$1")
      function getParenGroup(str) {
        if(str[0]=="(") {
          var retString = "";
          str = str.substring(1);
          var nextParen;
          var numParens = 1;
          while(((nextParen = /[\(\)]/.exec(str))!==null)&&numParens>0) {
            var parenIndex = nextParen.index;
            var parenType = nextParen[0];
            if(parenType == "(") {
              numParens++;
            } else {
              numParens--;
            }
            retString += str.substring(0,parenIndex+1);
            str = str.substring(parenIndex+1);
          }
          return [retString.substring(0,retString.length-1),str.substring(1),str.length>0?str.substring(0,1):undefined];
        } else {
          return undefined;
        }
      }
      function getNextReq(reqString) {
        if(reqString[0] == "(") {
          return getParenGroup(reqString);
        } else {
          var nextMatch = /^([^\/,]+)([\/,])(.*)/g.exec(reqString);
          if(nextMatch !== null) {
            var nextReq = nextMatch[1];
            var restOfString = nextMatch[3];
            var delimiter = nextMatch[2];
            return [nextReq, restOfString, delimiter];
          } else {
            return [reqString, "",undefined];
          }
        }
      }
      function isBaseReq(req) {
        return /[\/\(\),]/g.exec(req) === null;
      }
      var getClassInfo = this.classInfo;
      function parseReqs(reqString) {
        var parsedReq = {reqs:[],subject_id: "",connectionType:"",title:"",expansionDesc:"",topLevel:false};
        var onereq;
        var connectionType = undefined;
        var nextConnectionType = undefined;
        while(reqString.length>0) {
          [onereq, reqString, nextConnectionType] = getNextReq(reqString);
          if(nextConnectionType !== undefined) {
            connectionType = nextConnectionType;
          }
          if(isBaseReq(onereq)) {
            if(onereq.indexOf("'")>=0) {
              parsedReq.reqs.push({subject_id: onereq.replace(/'/g,""),title:""});
            } else {
              parsedReq.reqs.push(getClassInfo(onereq));
            }
          } else {
            parsedReq.reqs.push(parseReqs(onereq));
          }
        }
        if(connectionType == "/") {
          parsedReq.connectionType = "any";
        } else if(connectionType == ",") {
          parsedReq.connectionType = "all";
        }
        function sortOrder(req) {
          if(req.reqs !== undefined) {
            return 0;
          } else if(req.total_units !== undefined) {
            return -1;
          } else {
            return 1;
          }
        }

        parsedReq.reqs.sort(function(a,b) {
          return sortOrder(a) - sortOrder(b);
        })

        function getReqTitle(req) {
          if(req.total_units !== undefined) {
            return req.subject_id;
          } else if(typeof req === "string") {
            return req;
          } else {
            return req.subject_id + " " + req.title;
          }
        }

        if(parsedReq.reqs.length == 2) {
          if(parsedReq.connectionType === "any") {
            parsedReq.subject_id = getReqTitle(parsedReq.reqs[0]);
            parsedReq.title = "or " + getReqTitle(parsedReq.reqs[1]);
            parsedReq.expansionDesc = "Select either:";
          } else {
            parsedReq.subject_id = getReqTitle(parsedReq.reqs[0]);
            parsedReq.title = "and " + getReqTitle(parsedReq.reqs[1]);
            parsedReq.expansionDesc = "Select both:";
          }
        } else {
          parsedReq.subject_id = getReqTitle(parsedReq.reqs[0]);
          if(parsedReq.connectionType === "any") {
            parsedReq.title = "or " + (parsedReq.reqs.length-1) + " others";
            parsedReq.expansionDesc = "Select any:";
          } else {
            parsedReq.title = "and " + (parsedReq.reqs.length-1) + " others";
            parsedReq.expansionDesc = "Select all:";
          }
        }
        return parsedReq;
      }
      var rList = parseReqs(requirements);
      rList.topLevel = true;
      return rList;
    },
    adjustCardStyle: function() {
      var classInfoCard = $("#classInfoCard");
      var searchInput = $("#searchInputTF");
      var cardWidth = searchInput.outerWidth();
      var cardLeft = cardWidth + searchInput.offset().left;
      var browserWidth = $(window).width();
      classInfoCard.css({right: browserWidth - cardLeft, width: cardWidth});
    }
  },
  mounted() {
    this.adjustCardStyle();
    $(window).resize(this.adjustCardStyle);
  }
}
</script>


<style>
.card-header {
  padding: 0.5em 1em;
  background-color: lightblue;
  display: inline-block;
}
.class-info-card {
  height: 35vh;
  position: fixed;
  bottom: 1em;
  right: 0;
  width: 20em;
}
.card-body {
  display: flex;
  flex: 1;
  min-height: 0px;
}
.card-body-container {
  flex: 1;
  overflow: auto;
}
.comma-separated {
  padding: 0;
}
.comma-separated li {
  display: inline;
  list-style: none;
}
.comma-separated li:after {
  content: ", ";
}
.comma-separated li:last-child:after {
  content: "";
}
</style>
