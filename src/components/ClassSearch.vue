<template>
  <v-container :style="searchHeight + 'display: flex; flex-direction:column;'">
    <div>
      <filter-set v-model="chosenFilters.girs" :label="'GIR'" :filters="allFilters.girs.filters" />
      <filter-set v-model="chosenFilters.hass" :label="'HASS'" :filters="allFilters.hass.filters" />
      <filter-set v-model="chosenFilters.ci" :label="'CI'" :filters="allFilters.ci.filters" />
      <filter-set v-model="chosenFilters.level" :label="'Level'" :filters="allFilters.level.filters" />
      <filter-set v-model="chosenFilters.units" :label="'Units'" :filters="allFilters.units.filters" />
      <filter-set v-model="chosenFilters.terms" :label="'Term'" :filters="allFilters.terms.filters" />
      <filter-set v-model="chosenFilters.virtual" :label="'Virtual'" :filters="allFilters.virtual.filters" />
    </div>
    <div style="display: flex; flex: 1; min-height: 0px;">
      <div style="flex: 1; overflow: auto;">
        <v-data-table
          :items="autocomplete"
          :rows-per-page-items="rowsPerPageItems"
          :pagination.sync="pagination"
          :no-data-text="'No results'"
          :rows-per-page-text="'Results per page:\xa0'"
          :hide-headers="true"
        >
          <template slot="items" slot-scope="props">
            <v-hover>
              <tr
                slot-scope="{ hover }"
                :class="{ 'elevation-3': hover }"
                draggable="true"
                style="cursor: grab; margin: 4px;"
                @dragstart="dragStart($event, props)"
                @click="viewClassInfo(props)"
              >
                <td style="padding: 0px; white-space: nowrap; width: 30%;">
                  <v-icon style="vertical-align: middle;">
                    drag_indicator
                  </v-icon>
                  <span style="vertical-align: middle;"> {{ props.item.subject_id }}</span>
                </td>
                <td style="padding: 2px 4px 2px 0px; width: 60%;">
                  {{ props.item.title }}
                </td>
              </tr>
            </v-hover>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script>
import FilterSet from './FilterSet.vue';
import Vue from 'vue';
import { FilterGroup, RegexFilter, MathFilter, BooleanFilter } from './../utilities/filters.js';

var girAny = new RegexFilter('GIR:Any', 'Any', '.+', ['gir_attribute']);
var girLab = new RegexFilter('GIR:Lab', 'Lab', '.*(LAB|LAB2).*', ['gir_attribute']);
var girRest = new RegexFilter('GIR:REST', 'REST', '.*(REST|RST2).*', ['gir_attribute']);
var hassAny = new RegexFilter('HASS:Any', 'Any', 'HASS', ['hass_attribute']);
var hassArt = new RegexFilter('HASS-A', 'A', 'HASS-A', ['hass_attribute']);
var hassSocialScience = new RegexFilter('HASS-S', 'S', 'HASS-S', ['hass_attribute']);
var virtual = new RegexFilter('Virtual', 'Y', '^Virtual$', ['virtual_status']);
var notVirtual = new RegexFilter('In Person', 'N', '^In-Person$', ['virtual_status']);
var partlyVirtual = new RegexFilter('Partly Virtual', 'Both', '^Virtual/In-Person$', ['virtual_status']);
var hassHumanity = new RegexFilter('HASS-H', 'H', 'HASS-H', ['hass_attribute']);
var hassElective = new RegexFilter('HASS-E', 'E', 'HASS-E', ['hass_attribute']);
var ciAny = new RegexFilter('CI:Any', 'Any', 'CI.+', ['communication_requirement']);
var ciH = new RegexFilter('CI-H', 'CI-H', 'CI-H', ['communication_requirement']);
var ciHW = new RegexFilter('CI-HW', 'CI-HW', 'CI-HW', ['communication_requirement']);
var ciNone = new RegexFilter('Not CI', 'None', '^(?!CI)', ['communication_requirement']);
var levelUG = new RegexFilter('Undergraduate', 'UG', 'U', ['level']);
var levelG = new RegexFilter('Graduate', 'G', 'G', ['level']);
var unitsLt6 = new MathFilter('<6', '<6', [undefined, 6], false, ['total_units']);
var units6 = new MathFilter('6', '6', [6, 6], true, ['total_units']);
var units9 = new MathFilter('9', '9', [9, 9], true, ['total_units']);
var units12 = new MathFilter('12', '12', [12, 12], true, ['total_units']);
var units15 = new MathFilter('15', '15', [15, 15], true, ['total_units']);
var units6To15 = new MathFilter('6-15', '6-15', [6, 15], true, ['total_units']);
var unitsGte15 = new MathFilter('>15', '>15', [15, undefined], false, ['total_units']);
var termFall = new BooleanFilter('Fall', 'FA', false, ['offered_fall']);
var termIAP = new BooleanFilter('IAP', 'IAP', false, ['offered_IAP']);
var termSpring = new BooleanFilter('Spring', 'SP', false, ['offered_spring']);
var textFilter = new RegexFilter('Subject ID', 'ID', '', ['subject_id', 'title'], 'OR', 'nameInput');

export default {
  name: 'ClassSearch',
  components: {
    'filter-set': FilterSet
  },
  props: {
    searchInput: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      dragSemesterNum: -1,
      searchHeight: '',
      menuMargin: 20,
      // lists of the filters turned on in each filter group
      nameInput: '',
      chosenFilters: {
        girs: [false, false, false],
        hass: [false, false, false, false, false],
        ci: [false, false, false],
        level: [false, false],
        units: [false, false, false, false, false, false, false],
        terms: [false, false, false],
        virtual: [false, false, false]
      },
      allFilters: {
        girs: new FilterGroup('GIR', [girAny, girLab, girRest], 'OR'),
        hass: new FilterGroup('HASS', [hassAny, hassArt, hassSocialScience, hassHumanity, hassElective], 'OR'),
        ci: new FilterGroup('CI', [ciAny, ciH, ciHW, ciNone], 'OR'),
        level: new FilterGroup('Level', [levelUG, levelG], 'OR'),
        units: new FilterGroup('Units', [unitsLt6, units6, units9, units12, units15, units6To15, unitsGte15], 'OR'),
        terms: new FilterGroup('Term', [termFall, termIAP, termSpring], 'OR'),
        virtual: new FilterGroup('Virtual', [virtual, notVirtual, partlyVirtual], 'OR')
      },
      rowsPerPageItems: [5, 10, 20, 50, { 'text': '$vuetify.dataIterator.rowsPerPageAll', 'value': -1 }],
      pagination: {
        rowsPerPage: 20
      }
    };
  },
  computed: {
    allSubjects: function () {
      return this.$store.state.genericCourses.concat(this.$store.state.subjectsInfo);
    },
    autocomplete: function () {
      // Only display subjects if you are filtering by something
      let returnAny = this.nameInput.length > 0;
      for (const filterName in this.chosenFilters) {
        returnAny = returnAny || this.chosenFilters[filterName].some((f) => f);
      }
      if (!returnAny) {
        return [];
      }

      textFilter.setupInputs({ nameInput: this.nameInput });

      // Filter subjects that match all filter sets and the text filter
      const filteredSubjects = this.allSubjects.filter((subject) => {
        var matches = textFilter.matches(subject, { nameInput: this.nameInput });
        return matches && Object.keys(this.allFilters).every((filterGroup) => {
          return this.allFilters[filterGroup].matches(subject, this.chosenFilters[filterGroup]);
        });
      });

      // Sort subjects by priority order
      if (this.nameInput.length) {
        // Sort first by if it's a literal string vs regex match, then by if it starts with the search
        textFilter.setupVariants({ nameInput: this.nameInput }, { 'atStart': true, 'asLiteral': true }, ['asLiteral', 'atStart']);

        // Compare by variants for each subject
        return filteredSubjects.sort(function (subject1, subject2) {
          return textFilter.compareByVariants(subject2) - textFilter.compareByVariants(subject1);
        });
      } else {
        return filteredSubjects;
      }
    },
    classInfoStack () {
      return this.$store.state.classInfoStack;
    },
    classStackExists: function () {
      return this.classInfoStack.length > 0;
    },
    cookiesAllowed () {
      return this.$store.state.cookiesAllowed;
    }
  },
  watch: {
    searchInput (newVal) {
      this.nameInput = newVal;
    },
    classStackExists: function (oldExists, newExists) {
      Vue.nextTick(function () {
        this.updateMenuStyle();
      }.bind(this));
    },
    'pagination.rowsPerPage': function (newRows, oldRows) {
      if (this.cookiesAllowed) {
        this.$cookies.set('paginationRows', newRows);
      }
    },
    cookiesAllowed: function (newCA) {
      if (newCA) {
        this.$cookies.set('paginationRows', this.pagination.rowsPerPage);
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.updateMenuStyle();
    });

    window.cookies = this.$cookies;
    window.addEventListener('resize', this.updateMenuStyle.bind(this));

    if (this.$cookies.isKey('paginationRows')) {
      this.pagination.rowsPerPage = parseInt(this.$cookies.get('paginationRows'));
    }
  },
  methods: {
    dragStart: function (event, classItem) {
      event.dataTransfer.setData('classData', JSON.stringify({ isNew: true, classIndex: -1 }));
      this.$store.commit('dragStartClass', {
        dragstart: event,
        classInfo: classItem.item,
        isNew: true
      });
    },
    // Change search menu size based on existence of class info card
    updateMenuStyle: function () {
      const searchInputElem = document.getElementById('searchInputTF');
      const searchInputRect = searchInputElem.getBoundingClientRect();
      const searchMenuTop = searchInputRect.top + searchInputRect.height;
      const searchInput = document.getElementById('searchInputTF');
      const menuWidth = searchInput.offsetWidth;
      const classInfoCard = document.getElementById('classInfoCard');
      const menuBottom = classInfoCard
        ? classInfoCard.getBoundingClientRect().top
        : window.innerHeight;
      const maxHeight = menuBottom - searchMenuTop - this.menuMargin;
      this.searchHeight = 'max-height: ' + maxHeight + 'px;width: ' + menuWidth + 'px;';
    },
    viewClassInfo: function (item) {
      this.$store.commit('pushClassStack', item.item.subject_id);
    },
    openFirstClass: function () {
      if (this.autocomplete.length > 0) {
        this.$store.commit('pushClassStack', this.autocomplete[0].subject_id);
      }
    }
  }
};
</script>
