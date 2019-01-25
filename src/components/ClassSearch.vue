<template>
  <div class="searchdiv">
    <h1>Class Search</h1>
    <input v-model="chosenFilters.nameInput" placeholder="6.0061 Silly Systems" type="text"/>
    <filter-set v-model = "chosenFilters.girInput" v-bind:label="'GIR'" v-bind:filters="allFilters.girInput"></filter-set>
    <filter-set v-model = "chosenFilters.hassInput" v-bind:label="'HASS'" v-bind:filters="allFilters.hassInput"></filter-set>
    <filter-set v-model = "chosenFilters.ciInput" v-bind:label = "'CI'" v-bind:filters="allFilters.ciInput"></filter-set>
    <filter-set v-model = "chosenFilters.levelInput" v-bind:label = "'Level'" v-bind:filters="allFilters.levelInput"></filter-set>
    <filter-set v-model = "chosenFilters.unitInput" v-bind:label = "'Units'" v-bind:filters = "allFilters.unitInput"></filter-set>
    <h4> Search: {{ chosenFilters.nameInput}} </h4>
    <h4> Results: </h4>
    <ul>
      <li v-for="subjectName in autocomplete">{{ subjectName }}</li>
    </ul>
  </div>
</template>


<script>
import FilterSet from "./FilterSet.vue";

export default {
  name: "ClassSearch",
  components: {
    "filter-set": FilterSet
  },
  props: ['subjects'],
  data: function () {
    return {
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
          {name: "<6", short: "<6", filterString: "$<6"},
          {name: "6", short: "6", filterString: "$==6"},
          {name: "9", short: "9", filterString: "$==9"},
          {name: "12", short: "12", filterString: "$==12"},
          {name: "15", short: "15", filterString:"$==15"},
          {name: "6-15", short: "6-15", filterString:"$>=6&&$<=15"},
          {name: ">=15", short: ">15", filterString:"$>15"}
        ]
      },
      //modes to filter by across a filter group
      filterGroupModes: {
        "AND": function(a,b) { return a && b; },
        "OR": function(a,b) { return a || b; }
      },
      //set this to AND to get subjects that match all filters turned on in a group
      //set this to OR to get subjects that match any filter turned on in a group
      filterGroupMode: "OR"
    }
  },
  computed: {
    autocomplete: function () {
      //only display subjects if you are filtering by something
      var returnAny = false;
      for(var filterName in this.chosenFilters) {
        returnAny = returnAny || this.chosenFilters[filterName].length;
      }
      var returnAny = this.chosenFilters.nameInput.length || this.chosenFilters.girInput.length || this.chosenFilters.hassInput.length || this.chosenFilters.ciInput.length || this.chosenFilters.levelInput.length || this.chosenFilters.unitInput.length;
      if(returnAny) {
        //escapes special characters for regex in a string
        function escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
        //gets the .test function (which tests if a string matches regex) from each regex filter in a group
        function getRegexFuncs(regexStrings) {
          return regexStrings.map(function(rs) {
            var r = new RegExp(rs);
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
          "total_units": getMathFuncs(this.chosenFilters.unitInput)
        }
        // gets all possible values of an attribute

        // var allSubjects = this.subjects;
        // function unique(arr) {
        //   return [... new Set(arr)]
        // }
        // function allAttr(attr) {
        //   return unique(allSubjects.map(s=>s[attr]));
        // }
        // console.log(allAttr("preparation_units"));

        // and or or function based on filter mode
        var filterAction = this.filterGroupModes[this.filterGroupMode];
        return this.subjects.filter(function(subject) {
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
        }).map(s=>s.subject_id);
      } else {
        return [];
      }
    }
  }
}
</script>


<style scoped>
  .searchdiv {
    padding: 1em;
  }
  .filter-title {
    font-weight: bold;
    color: red;
  }
</style>
