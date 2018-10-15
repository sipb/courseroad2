// 'use strict';

// var sourceOfTruth = require("../source-of-truth");
// import {sourceOfTruth} from "../source-of-truth";

Vue.component('requirement', {
  props: ['req', 'classList'],
  computed: {
      isFulfilled: function () {
        return this.classList.indexOf(this.req.id) >= 0
      }
  },
  template: '<li v-bind:class="{\'fulfilled-req\': isFulfilled}"> {{ req.text }}</li>'
});

Vue.component('degree', {
  props:['degreeInfo', 'classList'],
  data: function () {
    return {
      visible: true
    }
  },
  template: '' +
  '<div>' +
  '<h3 v-on:click="visible = !visible"> {{ degreeInfo.title }} </h3>' +
  '<ul v-if="visible"> <requirement v-for="req in degreeInfo.requirements" v-bind:req="req" v-bind:classList="classList" v-bind:key="req.id"></requirement> </ul>' +
  '</div>',
});

const DegreeAudit = new Vue({
  el: '#degree-audit',
  data: {
    title: "Degree Requirements",
    degrees: [
      {
        title: "Computer Science and Engineering",
        requirements: [
          { id:22, text : "6.006: Intro to Algorithms" },
          { id:7, text : "6.009: Fundamentals of Programming" }
        ]
      },
      {
        title: "Electrical Engineering and Computer Science",
        requirements: [
          { id:34, text : "6.002: Circuits and Electronics"}
        ]
      }
    ],
    classes: [22, 34]
  }
});