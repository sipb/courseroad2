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
        <div id="search"></div>
        <div id="class-info"></div>
      </div>
    </div>
  </div>
</template>


<script>
import Audit from './components/Audit.vue'
import Road from './components/Road.vue'

export default {
  components: {
    'audit': Audit,
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
        this.reqList = response.data;
      });
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/girs`)
      .then(response => {
        this.reqTrees['girs'] = response.data;
      });
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/major6-3`)
      .then(response => {
        this.reqTrees['major6-3'] = response.data;
      });
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/minor2`)
      .then(response => {
        this.reqTrees['minor2'] = response.data;
      });
  },
};
</script>
