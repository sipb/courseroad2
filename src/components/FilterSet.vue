<template>
  <div>
    <label class = "filter-title">{{label}}</label>
    <span v-for = "filter in filters">
      <input type = "checkbox" :checked = "shouldBeChecked(filter.regex)" @change = "updateInput" :value = "filter.regex">{{filter.name}}</input>
    </span>
  </div>
</template>
<script>
export default {
  name: "FilterSet",
  props: ["value", "label", "filters"],
  computed: {

  },
  methods: {
    shouldBeChecked(val) {
      return this.value.includes(val);
    },
    updateInput(event) {
      let isChecked = event.target.checked;
      let newValue = [...this.value];
      if(isChecked) {
        newValue.push(event.target.value);
      } else {
        newValue.splice(newValue.indexOf(event.target.value),1);
      }
      this.$emit("input", newValue);
    }
  }
}
</script>
<style>
.filter-title {
  font-weight: bold;
  color: red;
}
</style>
