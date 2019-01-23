<template>
  <div class="searchdiv">
    <h1>Class Search</h1>
    <input v-model="nameInput" placeholder="6.0061 Silly Systems" type="text"/>
    <filter-set v-model = "girInput" v-bind:label="'GIR'" v-bind:filters="classFilters.girInput"></filter-set>
    <filter-set v-model = "hassInput" v-bind:label="'HASS'" v-bind:filters="classFilters.hassInput"></filter-set>
    <filter-set v-model = "ciInput" v-bind:label = "'CI'" v-bind:filters="classFilters.ciInput"></filter-set>
    <filter-set v-model = "levelInput" v-bind:label = "'Level'" v-bind:filters="classFilters.levelInput"></filter-set>
    <filter-set v-model = "unitInput" v-bind:label = "'Units'" v-bind:filters = "classFilters.unitInput"></filter-set>
    <h4> Search: {{ nameInput}} </h4>
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
      nameInput: "",
      girInput: [],
      hassInput: [],
      ciInput: [],
      // semesterInput: [],
      levelInput: [],
      unitInput: [],
      classFilters: {
        girInput: [
          {name: "Any", short: "Any", filterString: ".+"},
          {name: "Lab", short: "Lab", filterString: ".*(LAB|LAB2).*"},
          {name: "REST", short: "REST", filterString: ".*(REST|RST2).*"}
        ],
        hassInput: [
          {name: "Any", short: "Any", filterString: ".+"},
          {name: "Art", short: "A", filterString: ".*HA.*"},
          {name: "Social Science", short: "S", filterString: ".*HS.*"},
          {name: "Humanity", short: "H", filterString: ".*HH.*"},
          {name: "Elective", short: "E", filterString: ".*HE.*"}
        ],
        ciInput: [
          {name: "Any", short: "Any", filterString: "CI.+"},
          {name: "CI-H", short: "CI-H", filterString: "CIH"},
          {name: "CI-HW", short: "CI-HW", filterString: "CIHW"},
          {name: "CI-M", short: "CI-M", filterString: "CIM"},
          {name: "Not CI", short: "None", filterString: "^(?![\s\S])"}
        ],
        levelInput: [
          {name: "Undergraduate", short: "UG", filterString: "Undergraduate"},
          {name: "Graduate", short: "G", filterString: "Graduate"}
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
      }
    }
  },
  computed: {
    autocomplete: function () {
      var returnAny = this.nameInput.length || this.girInput.length || this.hassInput.length || this.ciInput.length || this.levelInput.length || this.unitInput.length;
      if(returnAny) {
        function escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
        function getRegexFuncs(regexStrings) {
          return regexStrings.map(function(rs) {
            var r = new RegExp(rs);
            var t = r.test.bind(r);
            return t;
          });
        }
        function getMathFuncs(mathStrings) {
          return mathStrings.map(function(ms) {
            return function(input) {
              return eval(this.ms.replace(/\$/g, input));
            }.bind({ms: ms});
          })
        }
        var filters = {
          "id": getRegexFuncs(["^"+this.nameInput]),
          "gir_attribute": getRegexFuncs(this.girInput),
          "hass_attribute": getRegexFuncs(this.hassInput),
          "comm_req_attribute": getRegexFuncs(this.ciInput),
          "level": getRegexFuncs(this.levelInput),
          "total-units": getMathFuncs(this.unitInput)
        }
        //gets all possible values of an attribute
        // var allSubjects = this.subjects;
        // function unique(arr) {
        //   return [... new Set(arr)]
        // }
        // function allAttr(attr) {
        //   return unique(allSubjects.map(s=>s[attr]));
        // }
        // console.log(allAttr("total-units"));
        return this.subjects.filter(function(subject) {
          for(var attr in filters) {
            var testers = filters[attr];
            for(var t = 0; t < testers.length; t++) {
              if(!testers[t](subject[attr])) {
                return false;
              }
            }

          }
          return true;
        }).map(s=>s.id);
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
