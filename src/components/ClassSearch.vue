<template>
  <v-container class="searchdiv" :style = "searchHeight + 'display: flex; flex-direction:column;'">
    <div>
      <filter-set v-model = "chosenFilters.girInput" v-bind:label="'GIR'" v-bind:filters="allFilters.girInput"></filter-set>
      <filter-set v-model = "chosenFilters.hassInput" v-bind:label="'HASS'" v-bind:filters="allFilters.hassInput"></filter-set>
      <filter-set v-model = "chosenFilters.ciInput" v-bind:label = "'CI'" v-bind:filters="allFilters.ciInput"></filter-set>
      <filter-set v-model = "chosenFilters.levelInput" v-bind:label = "'Level'" v-bind:filters="allFilters.levelInput"></filter-set>
      <filter-set v-model = "chosenFilters.unitInput" v-bind:label = "'Units'" v-bind:filters = "allFilters.unitInput"></filter-set>
    </div>
    <h4> Search: {{ chosenFilters.nameInput}} </h4>
    <h4> Results: </h4>
    <div style = "display: flex; flex: 1; min-height: 0px;">
      <div style = "flex: 1; overflow: auto;">
        <v-data-table
          :items="autocomplete"
          :rows-per-page-items="rowsPerPageItems"
          :pagination.sync = "pagination"
          :no-data-text = "'No results'"
          :rows-per-page-text= "'Results per page: '"
          :hide-headers= "true"
        >
          <template slot = "items" slot-scope = "props">
            <tr
              draggable = "true"
              v-on:dragend ="drop($event, props)"
              v-on:drag = "drag($event, props)"
              v-on:dragstart="dragStart($event, props)"
              @click = "viewClassInfo(props)"
            >
              <td>{{props.item.subject_id}}</td>
              <td>{{props.item.title}}</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>


<script>
import FilterSet from "./FilterSet.vue";
import $ from 'jquery';
import Vue from 'vue'

export default {
  name: "ClassSearch",
  components: {
    "filter-set": FilterSet,
  },
  props: ['subjects', 'searchInput','classInfoStack'],
  data: function () {
    return {
      dragSemesterNum: -1,
      searchHeight: "",
      menuMargin: 20,
      //lists of the filters turned on in each filter group
      chosenFilters: {
        nameInput: "",
        girInput: [],
        hassInput: [],
        ciInput: [],
        // semesterInput: [],
        levelInput: [],
        unitInput: []
      },
      //list of all filters
      //most are regex but unitInput tests math equations
      //name is the display name of the filter, short is the short display name, and filterString is the filter regex/math
      allFilters: {
        girInput: [
          {name: "Any", short: "Any", filterString: ".+"},
          {name: "Lab", short: "Lab", filterString: ".*(LAB|LAB2).*"},
          {name: "REST", short: "REST", filterString: ".*(REST|RST2).*"}
        ],
        hassInput: [
          {name: "Any", short: "Any", filterString: "HASS"},
          {name: "Art", short: "A", filterString: "HASS-A"},
          {name: "Social Science", short: "S", filterString: "HASS-S"},
          {name: "Humanity", short: "H", filterString: "HASS-H"},
        ],
        ciInput: [
          {name: "Any", short: "Any", filterString: "CI.+"},
          {name: "CI-H", short: "CI-H", filterString: "CI-H"},
          {name: "CI-HW", short: "CI-HW", filterString: "CI-HW"},
          {name: "CI-M", short: "CI-M", filterString: "CI-M"},
          {name: "Not CI", short: "None", filterString: "^(?!CI)"}
        ],
        levelInput: [
          {name: "Undergraduate", short: "UG", filterString: "U"},
          {name: "Graduate", short: "G", filterString: "G"}
        ],
        unitInput: [
          {name: "<6", short: "<6", filterString: "^[0-5]$"},
          {name: "6", short: "6", filterString: "^6$"},
          {name: "9", short: "9", filterString: "^9$"},
          {name: "12", short: "12", filterString: "^12$"},
          {name: "15", short: "15", filterString:"^15$"},
          {name: "6-15", short: "6-15", filterString:"^([7-9]|1[0-5])$"},
          {name: ">=15", short: ">15", filterString:"([2-9][0-9]|1[6-9])$"}
        ]
      },
      //modes to filter by across a filter group
      filterGroupModes: {
        "AND": function(a,b) { return a && b; },
        "OR": function(a,b) { return a || b; }
      },
      //set this to AND to get subjects that match all filters turned on in a group
      //set this to OR to get subjects that match any filter turned on in a group
      filterGroupMode: "OR",
      rowsPerPageItems: [5, 10, 20, 50],
      pagination: {
        rowsPerPage: 20,
      }
    }
  },
  watch: {
    searchInput: function(newSearch, oldSearch) {
      this.chosenFilters.nameInput = newSearch;
    },
    classStackExists: function(oldExists, newExists) {
      Vue.nextTick(function() {
        this.updateMenuStyle();
      }.bind(this));
    }
  },
  computed: {
    autocomplete: function () {
      //only display subjects if you are filtering by something
      var returnAny = false;
      for(var filterName in this.chosenFilters) {
        returnAny = returnAny || this.chosenFilters[filterName].length;
      }
      if(returnAny) {
        //escapes special characters for regex in a string
        function escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
        //gets the .test function (which tests if a string matches regex) from each regex filter in a group
        function getRegexFuncs(regexStrings) {
          return regexStrings.map(function(rs) {
            var r = new RegExp(rs, "i");
            var t = r.test.bind(r);
            return t;
          });
        }
        //gets a function that returns true if a string is true
        //replaces $ in the string with the input (value of an attribute of the subject)
        function getMathFuncs(mathStrings) {
          return mathStrings.map(function(ms) {
            return function(input) {
              return eval(this.ms.replace(/\$/g, input));
            }.bind({ms: ms});
          })
        }
        //gets functions that return a boolean if a filter is true
        var filters = {
          "subject_id,title": getRegexFuncs([this.chosenFilters.nameInput]),
          "gir_attribute": getRegexFuncs(this.chosenFilters.girInput),
          "hass_attribute": getRegexFuncs(this.chosenFilters.hassInput),
          "communication_requirement": getRegexFuncs(this.chosenFilters.ciInput),
          "level": getRegexFuncs(this.chosenFilters.levelInput),
          "total_units": getRegexFuncs(this.chosenFilters.unitInput)
        }
        // gets all possible values of an attribute

        // var allSubjects = this.subjects;
        // function unique(arr) {
        //   return [... new Set(arr)]
        // }
        // function allAttr(attr) {
        //   return unique(allSubjects.map(s=>s[attr]));
        // }
        // console.log(allAttr("hass_attribute"));

        // and or or function based on filter mode
        var filterAction = this.filterGroupModes[this.filterGroupMode];
        var filteredSubjects =  this.subjects.filter(function(subject) {
          for(var attrs in filters) {
            //each test function in a filter group
            var testers = filters[attrs];
            if(testers.length) {
              //if a single attribute group in a set returns true, the filter will match it
              var passesAnyAttributeGroupInSet = false;
              var attrSet = attrs.split(",");
              for(var a = 0; a < attrSet.length; a++) {
                var attr = attrSet[a];
                var subjectattr = subject[attr]
                if(!subject[attr]) {
                  subjectattr = ""
                }
                //start with false for OR mode, and true for AND mode
                var passesAttributeGroup = !filterAction(false, true);
                //use the filter mode function (OR or AND) and test all filters in a group
                for(var t = 0; t < testers.length; t++) {
                  passesAttributeGroup = filterAction(passesAttributeGroup, testers[t](subjectattr));
                }
                if(passesAttributeGroup) {
                  passesAnyAttributeGroupInSet = true;
                }
              }
              //if the subject passes no attribute group in the set, don't include it
              if(!passesAnyAttributeGroupInSet) {
                return false;
              }

            }

          }
          return true;
        })
        if(this.chosenFilters.nameInput.length) {
          var sortingOrder = [this.chosenFilters.nameInput,  "^" + this.chosenFilters.nameInput, escapeRegExp(this.chosenFilters.nameInput), "^" + escapeRegExp(this.chosenFilters.nameInput)];
          var sortingFuncs = getRegexFuncs(sortingOrder);
          var getOrderForString = function(matchingString) {
            var matches = sortingFuncs.map((func)=>func(matchingString))
            return matches.lastIndexOf(true);
          }
          var getOrder = function(subject) {
            var idMatch = getOrderForString(subject.subject_id);
            var nameMatch = getOrderForString(subject.title);
            return Math.max(idMatch, nameMatch)
          }
          return filteredSubjects.sort(function(subject1, subject2) {
            return getOrder(subject2) - getOrder(subject1);
          });
        } else {
          return filteredSubjects;
        }

      } else {
        return [];
      }
    },
    classStackExists: function() {
      return this.classInfoStack.length>0;
    }
  },
  methods: {
    drag: function(event, classItem) {
      this.$emit("drag-class", {
        drag: event,
        classInfo: classItem.item,
        isNew: true
      });
    },
    dragStart: function(event, classItem) {
      // TODO: Rewrite as part of #53?
      event.dataTransfer.setData('foo', 'bar')
    },
    drop: function(event, classItem) {
      this.$emit("drop-class", {
        drop: event,
        classInfo: classItem.item,
        isNew: true
      });
    },
    addClass: function(event, classItem) {
      var semesterElem = document.elementFromPoint(event.x,event.y);
      var semesterParent = $(semesterElem).parents(".semester-container");
      var classElem = $(event.target);
      // var semesterBox = semesterParent.find(".semester-drop-container");
      var semesterBox = $("#semester_"+this.dragSemesterNum).find(".semester-drop-container");
      semesterBox.addClass("grey");
      semesterBox.removeClass("red");
      semesterBox.removeClass("green");
      if(semesterParent.length) {
        var semesterID = semesterParent.attr("id");
        if(semesterID.substring(0,9)=="semester_") {
          var semesterNum = parseInt(semesterID.substring(9))
          var semesterType = semesterNum % 2;
          var isOffered = (semesterType == 0 && classItem.item.offered_fall)
                          || (semesterType == 1 && classItem.item.offered_spring);
          if (isOffered) {
            var newClass = {
              overrideWarnings : false,
              semester : semesterNum,
              title : classItem.item.title,
              id : classItem.item.subject_id,
              units : classItem.item.total_units
            }
            console.log(newClass);
            this.$emit("add-class",newClass)
          }
        }
      }
      this.dragSemesterNum = -1;
    },
    testClass: function(event, classItem) {
      var semesterElem = $(document.elementFromPoint(event.x,event.y));
      var semesterParent = semesterElem.parents(".semester-container");
      var classElem = $(event.target);
      var semesterBox = semesterParent.find(".semester-drop-container");
      if(semesterParent.length) {
        var semesterID = semesterParent.attr("id");
        if(semesterID.substring(0,9)=="semester_") {
          var semesterNum = parseInt(semesterID.substring(9))
          if(this.dragSemesterNum != semesterNum) {
            var semesterType = semesterNum % 2;
            var isOffered = (semesterType == 0 && classItem.item.offered_fall)
                            || (semesterType == 1 && classItem.item.offered_spring);
            if (!isOffered) {
              semesterBox.removeClass("grey");
              semesterBox.addClass("red");
            } else {
              semesterBox.removeClass("grey");
              semesterBox.addClass("green");
            }
            var lastSemester = $("#semester_" + this.dragSemesterNum);
            var lastSemesterBox = lastSemester.find(".semester-drop-container");
            lastSemesterBox.addClass("grey");
            lastSemesterBox.removeClass("red");
            lastSemesterBox.removeClass("green");
          }
          this.dragSemesterNum = semesterNum;
        }
      }
    },
    updateMenuStyle: function() {
      var searchInputElem = document.getElementById("searchInputTF");
      var searchInputRect = searchInputElem.getBoundingClientRect();
      var searchMenuTop = searchInputRect.top + searchInputRect.height;
      var searchInput = $("#searchInputTF");
      var menuWidth = searchInput.outerWidth();
      var classInfoCard = $("#classInfoCard");
      var menuBottom;
      if(classInfoCard.length) {
        menuBottom = classInfoCard.position().top;
      } else {
        menuBottom= $(window).innerHeight();
      }
      var maxHeight = menuBottom - searchMenuTop - this.menuMargin;
      this.searchHeight = "max-height: "+maxHeight+"px;width: "+menuWidth+"px;";

    },
    viewClassInfo: function(item) {
      this.$emit("view-class-info", item.item.subject_id);
    }
  },
  mounted() {
    this.updateMenuStyle();

    $(window).resize(function() {
      this.updateMenuStyle();
    }.bind(this));
  }
}
</script>


<style scoped>
  .searchdiv {
    /*padding: 1em;*/
  }
</style>
