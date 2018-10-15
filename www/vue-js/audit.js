// 'use strict';

// var sourceOfTruth = require("../source-of-truth");
// import {sourceOfTruth} from "../source-of-truth";

const DegreeAudit = new Vue({
  el: '#degree-audit',
  // data: sourceOfTruth,
  computed: {
    message() {
        return sourceOfTruth.selectedSubjects[0].id;
    }
  }
})
