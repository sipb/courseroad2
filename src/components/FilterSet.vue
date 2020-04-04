<template>
  <div class="filter-group">
    <span class="filter-title">{{ label }}</span>
    <v-btn-toggle
      multiple
      @change="changeFilter"
    >
      <v-btn
        v-for="(filter, index) in filters"
        :key="filter.name"
        :id="cssID(filter.name)"
        flat
        :value="index"
        @click="buttonClicked"
      >
        {{ filter.short }}
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  name: 'FilterSet',
  props: {
    value: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    filters: {
      type: Array,
      required: true
    }
  },
  methods: {
    changeFilter (selectionIndices) {
      var filtersSelected = this.filters.map((f, i) => selectionIndices.indexOf(i) >= 0);
      this.$emit('input', filtersSelected);
    },
    buttonClicked (event) {
      // Focus the search input in case user wants to start typing after
      // selecting a filter
      document.getElementById('searchInputTF').focus();
    },
    cssID (name) {
      return 'filter-' + name.replace(/[~!@$%^&*()+=,./';:"?><\[\]\\{}|`#]/gi, '-')
    }
  }
};
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
