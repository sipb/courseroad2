// 'use strict';

// var sourceOfTruth = require("../source-of-truth");
// import {sourceOfTruth} from "../source-of-truth";

Vue.component('req-tree', {
  props: ['root'],
  data: function() {
    return {
      showChildren: false,
    }
  },
  template:
    `<li>
      <div class="req-tree">
        <div>{{ root.title }}</div>
        <div style="font-style:italic">{{ root['threshold-desc'] }}</div>
        <div>{{ root.req }}</div>
        <a href="#" @click="toggleChildren" v-if="'reqs' in root"> show/hide </a>
        <ul v-if="showChildren">
          <req-tree 
            v-for="node in root.reqs" 
            :root="node" 
          >
          </req-tree>
        </ul>
      </div>
    </li>`,
    methods: {
      toggleChildren() {
        this.showChildren = !this.showChildren;
      }
    }
})

const DegreeAudit = new Vue({
  el: '#degree-audit',
  data: {
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
    selected: '',
  },
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
      })
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/girs`)
      .then(response => {
        this.reqTrees['girs'] = response.data;
      })
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/major6-3`)
      .then(response => {
        this.reqTrees['major6-3'] = response.data;
      })
    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/minor2`)
      .then(response => {
        this.reqTrees['minor2'] = response.data;
      })
    // return sourceOfTruth.selectedSubjects[0].id;
  },
})
