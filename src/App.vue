<!-- direct from the Vuetify website: this is the proper nesting: v-container » v-layout » v-flex (» v-card) -->
<template>
  <!-- *** USE THIS for multiple roads! https://vuetifyjs.com/en/components/tabs#icons-and-text -->
  <v-app id="app-wrapper">
    <v-toolbar fixed app dense>
        <v-toolbar-side-icon @click.stop="leftDrawer = !leftDrawer"></v-toolbar-side-icon>
        <v-toolbar-title>Audit</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-btn-toggle v-model="activeRoad" mandatory>
          <v-btn v-for="(road, name) in roads"
            :value="name"
          >
            {{name}}
          </v-btn>
        </v-btn-toggle>
      <v-spacer></v-spacer>
        <v-toolbar-title>Class Search</v-toolbar-title>
        <v-toolbar-side-icon @click.stop="rightDrawer = !rightDrawer"></v-toolbar-side-icon>
    </v-toolbar>

    <v-navigation-drawer
      id="left-panel"
      width="350"
      mobile-break-point="800"
      class="side-panel elevation-5 scroller"
      v-model="leftDrawer"
      app
    >
      <audit
        v-bind:reqTrees="reqTrees"
        v-bind:selectedReqs="roads[activeRoad].selectedReqs"
        v-bind:selectedSubjects = "roads[activeRoad].selectedSubjects"
        v-bind:reqList="reqList"
        @add-req = "addReq"
      ></audit>
      <!-- TODO: will need to add event for when the child can edit selectedReqs probably -->
    </v-navigation-drawer>

    <v-content app id="center-panel">
      <road
        v-bind:selectedSubjects="roads[activeRoad].selectedSubjects"
      ></road>
    </v-content>

    <v-navigation-drawer
      id="right-panel"
      width="350"
      mobile-break-point="800"
      class="side-panel elevation-5"
      v-model="rightDrawer"
      right
      app
    >
      <class-search v-bind:subjects="subjectsInfo"></class-search>
    </v-navigation-drawer>
  </v-app>
</template>


<style scoped>
  #app-wrapper {
/*    display: flex;
    flex-direction: row;
    height: 100%;*/
  }

  .side-panel {
    /*height: 100%;*/
  }

</style>


<script>
import Audit from './components/Audit.vue'
import ClassSearch from './components/ClassSearch.vue'
import Road from './components/Road.vue'
import FilterSet from "./components/FilterSet.vue"
import $ from 'jquery'
import Vue from 'vue'

$(document).ready(function() {
  var borders = $(".v-navigation-drawer__border")
  var scrollers = $(".scroller")
  var scrollWidth = scrollers.width()
  //moves nav drawer border with scroll
  //if the effect proves too annoying we can remove the borders instead
  //(commented out below)
  scrollers.scroll(function() {
    var scrollPosition = scrollers.scrollLeft()
    borders.css({top: 0, left: scrollWidth-1+scrollPosition})
  })
  // borders.remove()
})


export default {
  components: {
    'audit': Audit,
    'class-search': ClassSearch,
    'road': Road,
    'filter-set': FilterSet
  },
  data: function(){ return {
    reqTrees: {},
    reqList: [],

    // A list of dictionaries containing info on current mit subjects. (actually filled in below)
    subjectsInfo: [],
    leftDrawer: true,
    rightDrawer: true,
    activeRoad: "road-one",
    // TODO: Really we should grab this from a global datastore
    // now in the same format as FireRoad

    //note for later: will need to use Vue.set on roads for reactivity once they come from fireroad
    roads: {
      'road-one': {
        selectedReqs: ['girs',],
        selectedSubjects: [],
      },
      'test_road1': {
        selectedReqs: ['girs','major6-3','minor2',],
        selectedSubjects : [
          {
            overrideWarnings : false,
            semester : 0,
            title : "Generic Physics I GIR",
            id : "PHY1",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 1,
            title : "Principles of Chemical Science",
            id : "5.112",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 4,
            title : "Fundamentals of Programming",
            id : "6.009",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 0,
            title : "Intro to EECS",
            id : "6.01",
            units : 12
          },
          {
            overrideWarnings : false,
            semester : 4,
            title : "Advanced Music Performance",
            id : "21M.480",
            units : 6
          },
          {
            overrideWarnings : false,
            semester : 6,
            title : "Advanced Music Performance",
            id : "21M.480",
            units : 6
          }
        ],
      },
    }
  }},
  watch: {
    //call fireroad to check fulfillment if you change active roads or change something about a road
    activeRoad: function(newRoad,oldRoad) {
      this.updateFulfillment();
    },
    roads: {
      handler: function(newRoads,oldRoads) {
        console.log("updating road");
        this.updateFulfillment();
      },
      deep: true
    }
  },
  methods: {
    updateFulfillment: function() {
      var subjectIDs = this.roads[this.activeRoad].selectedSubjects.map((s)=>s.id.toString()).join(",")
      for (var r = 0; r < this.roads[this.activeRoad].selectedReqs.length; r++) {
        var req = this.roads[this.activeRoad].selectedReqs[r];
        axios.get(`https://fireroad-dev.mit.edu/requirements/progress/`+req+`/`+subjectIDs).then(function(response) {
          //This is necessary so Vue knows about the new property on reqTrees
          Vue.set(this.data.reqTrees, this.req, response.data);
        }.bind({data: this, req:req}))
      }
    },
    addReq: function(event) {
      this.roads[this.activeRoad].selectedReqs.push(event);
      Vue.set(this.roads, this.activeRoad, this.roads[this.activeRoad]);
    }
  },
  mounted() {
    // TODO: this is kind of janky, and should not happen ideally:
    //  I'm bouncing the request through this proxy to avoid some issue with CORS
    // see this issue for more: https://github.com/axios/axios/issues/853

    axios.get(`https://fireroad-dev.mit.edu/requirements/list_reqs/`)
      .then(response => {
        this.reqList = response.data;
        for(var r in this.reqList) {
          Vue.set(this.reqList, r, this.reqList[r]);
        }
      })



    this.updateFulfillment();

    // developer.mit.edu version commented out because I couldn't get it to work. filed an issue to resolve it.
    // axios.get('https://mit-course-catalog-v2.cloudhub.io/coursecatalog/v2/terms/2018FA/subjects', {headers:{client_id:'01fce9ed7f9d4d26939a68a4126add9b', client_secret:'D4ce51aA6A32421DA9AddF4188b93255'}})
    // , 'Accept': 'application/json'} ?
    // full=true is ~3x bigger but has some great info like "in_class_hours" and "rating"
    axios.get(`https://fireroad-dev.mit.edu/courses/all?full=true`)
      .then(response => {
        this.subjectsInfo = response.data
      });
  },
};
</script>
<style scoped>
  .scroller {
    overflow-x: scroll;
  }
  .v-navigation-drawer__border {
    display: none !important;
  }
</style>
