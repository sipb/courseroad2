<template>
  <div class="searchdiv">
    <h1>Class Search</h1>
    <input v-model="nameInput" placeholder="6.0061 Silly Systems" type="text"/>
    <div>
      <label class = "filter-title">GIR</label>
      <input type = "radio" v-model = "girInput" value = ".*">Off</input>
      <input type = "radio" v-model = "girInput" value = ".+">Any</input>
      <input type = "radio" v-model = "girInput" value = ".*(LAB|LAB2).*">Lab</input>
      <!--could also be rst2/lab2-->
      <input type = "radio" v-model = "girInput" value = ".*(REST|RST2).*">REST</input>
    </div>
    <div>
      <label class = "filter-title">HASS</label>
      <input type = "radio" v-model = "hassInput" value = ".*">Off</input>
      <input type = "radio" v-model = "hassInput" value = ".+">Any</input>
      <input type = "radio" v-model = "hassInput" value = ".*HA.*">Arts</input>
      <input type = "radio" v-model = "hassInput" value = ".*HS.*">Social Sciences</input>
      <input type = "radio" v-model = "hassInput" value = ".*HH.*">Humanity</input>
      <input type = "radio" v-model = "hassInput" value = ".*HE.*">Elective</input>
    </div>
    <div>
      <label class = "filter-title">CI</label>
      <input type = "radio" v-model = "ciInput" value = ".*">Off</input>
      <input type = "radio" v-model = "ciInput" value = "CI.+">Any</input>
      <input type = "radio" v-model = "ciInput" value = "CIH">CI-H</input>
      <input type = "radio" v-model = "ciInput" value = "CIHW">CI-HW</input>
      <input type = "radio" v-model = "ciInput" value = "CIM">CI-M</input>
      <input type = "radio" v-model = "ciInput" value = "^(?![\s\S])">Not CI</input>
    </div>
    <!-- <label>Semester</label>
    <input type = "radio" v-model = "semesterInput" value = ".*">Any</input>
    <input type = "radio" v-model = "semesterInput" value = "Fall">Fall</input>
    <input type = "radio" v-model = "semesterInput" value = "Spring">Spring</input>
    <input type = "radio" v-model = "semesterInput" value = "IAP">IAP</input>
    <input type = "radio" v-model = "semesterInput" value = "Summer">Summer</input> -->
    <div>
      <label class = "filter-title">Level</label>
      <input type = "radio" v-model = "levelInput" value = ".*">Any</input>
      <input type = "radio" v-model = "levelInput" value = "Undergraduate">Undergraduate</input>
      <input type = "radio" v-model = "levelInput" value = "Graduate">Graduate</input>
    </div>
    <h4> Search: {{ nameInput}} </h4>
    <h4> Results: </h4>
    <ul>
      <li v-for="subjectName in autocomplete">{{ subjectName }}</li>
    </ul>
  </div>
</template>


<script>
export default {
  name: "ClassSearch",
  props: ['subjects'],
  data: function () {
    return {
      nameInput: "",
      girInput: ".*",
      hassInput: ".*",
      ciInput: ".*",
      // semesterInput: "off",
      levelInput: ".*"
    }
  },
  computed: {
    autocomplete: function () {
      var returnAny = this.nameInput != "" || this.girInput != ".*" || this.hassInput != ".*" || this.ciInput != ".*" || this.levelInput != ".*";
      if(returnAny) {
        function escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
        var filters = {
          "id": new RegExp("^"+escapeRegExp(this.nameInput)+".*"),
          "gir_attribute": new RegExp(this.girInput),
          "hass_attribute": new RegExp(this.hassInput),
          "comm_req_attribute": new RegExp(this.ciInput),
          "level": new RegExp(this.levelInput)
        }
        console.log(filters);
        return this.subjects.filter(function(subject) {
          for(var attr in filters) {
            var tester = filters[attr];
            if(!tester.test(subject[attr])) {
              return false;
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
