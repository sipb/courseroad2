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
      class="side-panel elevation-5"
      v-model="leftDrawer"
      app
    >
      <audit
        v-bind:reqTrees="reqTrees"
        v-bind:selectedReqs="roads[activeRoad].selectedReqs"
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
      <class-search v-bind:subjects="subjectsInfo" @add-class="addClass"></class-search>
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

export default {
  components: {
    'audit': Audit,
    'class-search': ClassSearch,
    'road': Road,
    'filter-set': FilterSet
  },
  data: function(){ return {
    reqTrees: {
      // unfortunately have to have this here or it crashes on key lookup in the beginning...
      // TODO: make that ^ not the case. Probably by using the Vue key system properly/at all
      'girs': {
          title: 'loading...',
          reqs: []
        },
      'major6-3': {
          title: 'loading....',
          reqs: []
        },
      'minor2': {
          title: 'loading.....',
          reqs: []
        },
      },
    reqList: [],

    // A list of dictionaries containing info on current mit subjects. (actually filled in correctly below)
    subjectsInfo: [{"subject_id": "6.00"},],
    leftDrawer: true,
    rightDrawer: true,
    activeRoad: "road-one",
    // TODO: Really we should grab this from a global datastore
    // now in the same format as FireRoad
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
  // computed: { // tried this to fix the thing above but it didn't update reactively
  //   loadedReqs: function () {
  //     return this.selectedReqs.filter(function(r) {
  //       return this.reqTrees && (r in this.reqTrees);
  //     })
  //   }
  // },
  methods: {
    addClass: function(newClass) {
      this.roads[this.activeRoad].selectedSubjects.push(newClass);
    }
  },
  mounted() {
    // TODO: this is kind of janky, and should not happen ideally:
    //  I'm bouncing the request through this proxy to avoid some issue with CORS
    //  see this issue for more: https://github.com/axios/axios/issues/853
    axios.get(`https://fireroad-dev.mit.edu/requirements/list_reqs/`)
      .then(response => {
        console.log(response.data);
        this.reqList = response.data;
      });
    axios.get(`https://fireroad-dev.mit.edu/requirements/get_json/girs`)
      .then(response => {
        this.reqTrees['girs'] = response.data;
      });
    axios.get(`https://fireroad-dev.mit.edu/requirements/get_json/major6-3`)
      .then(response => {
        console.log(response.data['major6-3']);
        this.reqTrees['major6-3'] = response.data;
      });
    axios.get(`https://fireroad-dev.mit.edu/requirements/get_json/minor2`)
      .then(response => {
        this.reqTrees['minor2'] = response.data;
      });
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
