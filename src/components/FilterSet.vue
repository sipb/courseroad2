<template>
  <div>
    <label class = "filter-title">{{label}}</label>
    <div v-for = "filter in filters" v-on:click = "check" v-bind:class = "buttonClass(shouldBeChecked(filter.filterString))">
        <input class = "hidden-checkbox" type = "checkbox" :checked = "shouldBeChecked(filter.filterString)" :value = "filter.filterString">{{filter.short}}</input>
    </div>
  </div>
</template>
<script>
export default {
  name: "FilterSet",
  props: ["value", "label", "filters"],
  computed: {
  },
  data: function () {
    return {

    }
  },
  methods: {
    buttonClass: function(buttonBool) {
      if(buttonBool) {
        return {
          "btn": true,
          "btn-checked": true
        }
      } else {
        return {
          "btn": true,
          "btn-checked": false
        }
      }
    },
    shouldBeChecked(val) {
      return this.value.includes(val);
    },
    check(event) {
      var button = event.target;
      var input = event.target.children[0];
      input.checked = !input.checked;
      let isChecked = input.checked;
      let newValue = [...this.value];
      if(isChecked) {
        newValue.push(input.value);
      } else {
        newValue.splice(newValue.indexOf(input.value),1);
      }
      this.$emit("input", newValue);
    },
    // updateInput(event) {
    //   console.log("updating input");
    //   let isChecked = event.target.checked;
    //   let newValue = [...this.value];
    //   if(isChecked) {
    //     newValue.push(event.target.value);
    //   } else {
    //     newValue.splice(newValue.indexOf(event.target.value),1);
    //   }
    //   this.$emit("input", newValue);
    // }
  }
}
</script>
<style>
* {
  --button-dark: #79c879;
  --button-light: #98fb98;
  --secondary-color: #2b6f88;
  --secondary-light: #51a8c8;
}
.filter-title {
  font-weight: bold;
  color: var(--secondary-color);
  font-size: 0.9em;
}
.hidden-checkbox {
  display: none;
}
.btn {
  border: 2px solid var(--button-light);
  border-radius: 3px;
  display: inline-block;
  padding: 8px;
  color: var(--button-dark);
  cursor: pointer;
  margin: 1px;
}
.btn-checked {
  background-color: var(--button-light);
  color: black;
  border-color: var(--button-dark);
}
.btn:hover {
  background-color: var(--secondary-light);
  border-color: var(--secondary-light);
  color: white;

}
</style>
