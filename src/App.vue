<template>
  <div id="app-wrapper">
    <div id="left-panel" class="panel">
      <div id="degree-audit">
        <audit
          v-bind:reqTrees="reqTrees"
          v-bind:selectedReqs="selectedReqs"
        ></audit>
          <!-- TODO: will need to add event for when the child can edit selectedReqs -->
      </div>
    </div>

    <div id="center-panel" class="panel">
      <div id="road">
        <road></road>
      </div>
    </div>

    <div id="right-panel" class="panel">
      <div id="class-browser">
        <div id="search">
          <class-search v-bind:subjects="subjectsInfo"></class-search>
        </div>
        <div id="class-info"></div>
      </div>
    </div>
  </div>
</template>


<style scoped>
  #app-wrapper {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .panel {
    height: 100%;
  }

  #left-panel {
    flex-basis: 400px;
    background-color: #ffffe6;
    border-right: 3px solid #f593a6;
    overflow-y: auto;
  }

  #center-panel {
    flex-grow: 1;
    background-color: #bcdeea;
  }

  #right-panel {
    flex-basis: 350px;
    background-color: #ffffe6;
    border-left: 3px solid #f593a6;
  }
</style>


<script>
import Audit from './components/Audit.vue'
import ClassSearch from './components/ClassSearch.vue'
import Road from './components/Road.vue'

export default {
  components: {
    'audit': Audit,
    'class-search': ClassSearch,
    'road': Road
  },
  data: function(){ return {
    selectedReqs: ['girs','major6-3','minor2',],
    reqTrees: {
      // unfortunately have to have this here or it crashes on key lookup in the beginning...
      // TODO: make that ^ not the case. Probably by using the Vue key system properly/at all
      'girs': {
          title: 'loading...',
          reqs: []
        },
      'major6-3': {
          title: 'loading...',
          reqs: []
        },
      'minor2': {
          title: 'loading...',
          reqs: []
        },
      },
    reqList: [],

    // A list of dictionaries containing info on current mit subjects. (actually filled in correctly below)
    subjectsInfo: [{"id": "6.00"},],
  }},
  // computed: { // tried this to fix the thing above but it didn't update reactively
  //   loadedReqs: function () {
  //     return this.selectedReqs.filter(function(r) {
  //       return this.reqTrees && (r in this.reqTrees);
  //     })
  //   }
  // },
  mounted() {
    // TODO: this is kind of janky, and should not happen ideally:
    //  I'm bouncing the request through this proxy to avoid some issue with CORS
    //  see this issue for more: https://github.com/axios/axios/issues/853
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/list_reqs/`)
      .then(response => {
        console.log(response.data);
        this.reqList = response.data;
      });
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/girs`)
      .then(response => {
        this.reqTrees['girs'] = response.data;
      });
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/major6-3`)
      .then(response => {
        console.log(response.data['major6-3']);
        this.reqTrees['major6-3'] = response.data;
      });
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/minor2`)
      .then(response => {
        this.reqTrees['minor2'] = response.data;
      });
    // developer.mit.edu version commented out because I couldn't get it to work. filed an issue to resolve it.
    // axios.get('https://mit-course-catalog-v2.cloudhub.io/coursecatalog/v2/terms/2018FA/subjects', {headers:{client_id:'01fce9ed7f9d4d26939a68a4126add9b', client_secret:'D4ce51aA6A32421DA9AddF4188b93255'}})
    // , 'Accept': 'application/json'} ?
    // ** load from fireroad instead: https://fireroad-dev.mit.edu/courses/all?full=false
    var term = '2018SP';
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}http://coursews.mit.edu/coursews/?term=${term}`)
      .then(response => {
        this.subjectsInfo = response.data.items.filter(
            function(item) {
              // possible 'type' labels: {'LabSession', 'Class', 'LectureSession', 'RecitationSession'}
              return item['type'] == 'Class'
            })
      })
  },
};
</script>
