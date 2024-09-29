<template>
  <div class="filter-group" :data-cy="'filter_' + label">
    <span class="filter-title">{{ label }}</span>
    <v-btn-toggle borderless dense multiple tile @change="changeFilter">
      <v-btn
        v-for="(filter, index) in filters"
        :id="cssID(filter.name)"
        :key="filter.name"
        text
        :value="index"
        :data-cy="'filterButton_' + filter.name"
        @click="buttonClicked"
      >
        {{ filter.short }}
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "FilterSet",
  props: {
    value: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    filters: {
      type: Array,
      required: true,
    },
  },
  methods: {
    /* selectionIndices : a list of the indices of selected filters

    produces an array of booleans filtersSelected, such that for
    0 <= i < filters.length, filtersSelected[i] is true iff
    i is in selectionIndices

    emits an input event with this array to let the search menu know
    */
    changeFilter(selectionIndices) {
      const filtersSelected = this.filters.map(
        (f, i) => selectionIndices.indexOf(i) >= 0,
      );
      this.$emit("input", filtersSelected);
    },
    /*
    Focuses the search input after a filter is selected so typing in searchbar
    can begin immediately after
    */
    buttonClicked() {
      document.getElementById("searchInputTF").focus();
    },
    cssID(name) {
      return (
        "filter-" + name.replace(/[~!@$%^&*()+=,./';:"?><[\]\\{}|`#]/gi, "-")
      );
    },
  },
});
</script>

<style scoped>
.filter-group {
  margin: 2px 0px;
  display: flex;
  align-items: center;
}

.filter-title {
  user-select: none;
  font-weight: bold;
  font-size: 0.9em;
  min-width: 3.3em;
}
</style>
