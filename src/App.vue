<template>
  <div id="app-wrapper">
    <div id="left-panel" class="panel">
      <div id="degree-audit">
        <ul>
          <!-- useful for adding dropdown: https://vuejs.org/v2/guide/forms.html -->
          <req-tree
              v-for="item in selectedReqs"
              v-bind:root="reqTrees[item]">
           </req-tree>
        </ul>
      </div>
    </div>

    <div id="center-panel" class="panel">
      <div id="road">
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
  //import HelloComponent from './components/HelloComponent.vue'
  //export default {
  //  components: {
  //    HelloComponent
  //  }
  //}
</script>
