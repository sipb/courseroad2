// 'use strict';

// var sourceOfTruth = require("../source-of-truth");
// import {sourceOfTruth} from "../source-of-truth";

// Vue.component('req-tree', {
//     props: ['req-name'],
//     template: '<li>{{ todo.text }}</li>'
// })



// Vue.use(VueResource);
const DegreeAudit = new Vue({
  el: '#degree-audit',
  data: {
    message:'loading audit...'
  },
  mounted() {
    // TODO: this is kind of janky, and should not happen ideally:
    //  I'm bouncing the request through this proxy to avoid some issue with CORS
    //  see this issue for more: https://github.com/axios/axios/issues/853
    return axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://fireroad-dev.mit.edu/requirements/get_json/major6-3`)
      .then(response => {
        this.message = response.data;
      })
    // return sourceOfTruth.selectedSubjects[0].id;
  }
})
