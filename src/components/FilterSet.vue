<template>
  <div class="filter-group">
    <span class="filter-title">{{label}}</span>
    <v-btn-toggle
      multiple
      v-on:change="changeFilter"
    >
      <v-btn
        flat
        v-for="filter in filters"
        v-bind:value="filter.filterString"
      >
        {{filter.short}}
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  name: "FilterSet",
  props: ["value", "label", "filters"],
  methods: {
    changeFilter(newValues) {
      this.$emit("input", newValues);
    },
  }
}
</script>

<style>
.filter-group {
  margin: 2px 0px;
  display: flex;
  align-items: center;
}

.filter-title {
  font-weight: bold;
  font-size: 0.9em;
  min-width: 3.3em;
}
</style>
