<template>
  <div class="searchdiv">
    <h1>Class Search</h1>
    <input v-model="nameInput" placeholder="6.0061 Silly Systems" type="text"/>
    <filter-set v-model = "girInput" v-bind:label="'GIR'" v-bind:filters="classFilters.girInput"></filter-set>
    <filter-set v-model = "hassInput" v-bind:label="'HASS'" v-bind:filters="classFilters.hassInput"></filter-set>
    <filter-set v-model = "ciInput" v-bind:label = "'CI'" v-bind:filters="classFilters.ciInput"></filter-set>
    <filter-set v-model = "levelInput" v-bind:label = "'Level'" v-bind:filters="classFilters.levelInput"></filter-set>
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
      classFilters: {
        girInput: [
          {name: "Any", regex: ".+"},
          {name: "Lab", regex: ".*(LAB|LAB2).*"},
          {name: "REST", regex: ".*(REST|RST2).*"}
        ],
        hassInput: [
          {name: "Any", regex: ".*HA.*"},
          {name: "Art", regex: ".*HA.*"},
          {name: "Social Science", regex: ".*HS.*"},
          {name: "Humanity", regex: ".*HH.*"},
          {name: "Elective", regex: ".*HE.*"}
        ],
        ciInput: [
          {name: "Any", regex: "CI.+"},
          {name: "CI-H", regex: "CIH"},
          {name: "CI-HW", regex: "CIHW"},
          {name: "CI-M", regex: "CIM"},
          {name: "Not CI", regex: "^(?![\s\S])"}
        ],
        levelInput: [
          {name: "Undergraduate", regex: "Undergraduate"},
          {name: "Graduate", regex: "Graduate"}
        ]
      }
    }
  },
  computed: {
    autocomplete: function () {
      var returnAny = this.nameInput.length || this.girInput.length || this.hassInput.length || this.ciInput.length || this.levelInput.length;
      if(returnAny) {
        function escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
        function getRegexes(regexStrings) {
          return regexStrings.map(rs => new RegExp(rs));
        }
        var filters = {
          "id": [new RegExp("^"+escapeRegExp(this.nameInput)+".*")],
          "gir_attribute": getRegexes(this.girInput),
          "hass_attribute": getRegexes(this.hassInput),
          "comm_req_attribute": getRegexes(this.ciInput),
          "level": getRegexes(this.levelInput)
        }
        console.log(filters);
        return this.subjects.filter(function(subject) {
          for(var attr in filters) {
            var testers = filters[attr];
            for(var t = 0; t < testers.length; t++) {
              if(!testers[t].test(subject[attr])) {
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
