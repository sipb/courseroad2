<template>
  <v-container :style="searchHeight + 'display: flex; flex-direction:column;'">
    <div>
      <filter-set v-model="chosenFilters.girInput" :label="'GIR'" :filters="allFilters.girInput" />
      <filter-set v-model="chosenFilters.hassInput" :label="'HASS'" :filters="allFilters.hassInput" />
      <filter-set v-model="chosenFilters.ciInput" :label="'CI'" :filters="allFilters.ciInput" />
      <filter-set v-model="chosenFilters.levelInput" :label="'Level'" :filters="allFilters.levelInput" />
      <filter-set v-model="chosenFilters.unitInput" :label="'Units'" :filters="allFilters.unitInput" />
    </div>
    <h4> Search: {{ chosenFilters.nameInput }} </h4>
    <h4> Results: </h4>
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
		<center>
			<v-btn>
				Create a Custom Class 				
			</v-btn>
		</center>
      </div>
    </div>
  </v-container>
</template>

<script>
import FilterSet from './FilterSet.vue';
import $ from 'jquery';
import Vue from 'vue';

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
      chosenFilters: {
        nameInput: '',
        girInput: [],
        hassInput: [],
        ciInput: [],
        // semesterInput: [],
        levelInput: [],
        unitInput: []
      },
      // list of all filters
      // most are regex but unitInput tests math equations
      // name is the display name of the filter, short is the short display name, and filterString is the filter regex/math
      allFilters: {
        girInput: [
          { name: 'Any', short: 'Any', filterString: '.+' },
          { name: 'Lab', short: 'Lab', filterString: '.*(LAB|LAB2).*' },
          { name: 'REST', short: 'REST', filterString: '.*(REST|RST2).*' }
        ],
        hassInput: [
          { name: 'Any', short: 'Any', filterString: 'HASS' },
          { name: 'Art', short: 'A', filterString: 'HASS-A' },
          { name: 'Social Science', short: 'S', filterString: 'HASS-S' },
          { name: 'Humanity', short: 'H', filterString: 'HASS-H' }
        ],
        ciInput: [
          { name: 'Any', short: 'Any', filterString: 'CI.+' },
          { name: 'CI-H', short: 'CI-H', filterString: 'CI-H' },
          { name: 'CI-HW', short: 'CI-HW', filterString: 'CI-HW' },
          // {name: "CI-M", short: "CI-M", filterString: "CI-M"},
          { name: 'Not CI', short: 'None', filterString: '^(?!CI)' }
        ],
        levelInput: [
          { name: 'Undergraduate', short: 'UG', filterString: 'U' },
          { name: 'Graduate', short: 'G', filterString: 'G' }
        ],
        unitInput: [
          { name: '<6', short: '<6', filterString: '^[0-5]$' },
          { name: '6', short: '6', filterString: '^6$' },
          { name: '9', short: '9', filterString: '^9$' },
          { name: '12', short: '12', filterString: '^12$' },
          { name: '15', short: '15', filterString: '^15$' },
          { name: '6-15', short: '6-15', filterString: '^([7-9]|1[0-5])$' },
          { name: '>=15', short: '>15', filterString: '([2-9][0-9]|1[6-9])$' }
        ]
      },
      // modes to filter by across a filter group
      filterGroupModes: {
        'AND': function (a, b) { return a && b },
        'OR': function (a, b) { return a || b }
      },
      // set this to AND to get subjects that match all filters turned on in a group
      // set this to OR to get subjects that match any filter turned on in a group
      filterGroupMode: 'OR',
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
      // only display subjects if you are filtering by something
      let returnAny = false;
      for (const filterName in this.chosenFilters) {
        returnAny = returnAny || this.chosenFilters[filterName].length;
      }
      if (!returnAny) {
        return [];
      }

      // escapes special characters for regex in a string
      function escapeRegExp (string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      }
      // gets the .test function (which tests if a string matches regex) from each regex filter in a group
      function getRegexFuncs (regexStrings) {
        return regexStrings.map(function (rs) {
          const r = new RegExp(rs, 'i');
          const t = r.test.bind(r);
          return t;
        });
      }
      // gets functions that return a boolean if a filter is true
      const filters = {
        'subject_id,title': getRegexFuncs([this.chosenFilters.nameInput]),
        'gir_attribute': getRegexFuncs(this.chosenFilters.girInput),
        'hass_attribute': getRegexFuncs(this.chosenFilters.hassInput),
        'communication_requirement': getRegexFuncs(this.chosenFilters.ciInput),
        'level': getRegexFuncs(this.chosenFilters.levelInput),
        'total_units': getRegexFuncs(this.chosenFilters.unitInput)
      };
        // and or or function based on filter mode
      const filterAction = this.filterGroupModes[this.filterGroupMode];
      const filteredSubjects = this.allSubjects.filter(function (subject) {
        for (const attrs in filters) {
          // each test function in a filter group
          const testers = filters[attrs];
          if (testers.length) {
            // if a single attribute group in a set returns true, the filter will match it
            let passesAnyAttributeGroupInSet = false;
            const attrSet = attrs.split(',');
            for (let a = 0; a < attrSet.length; a++) {
              const attr = attrSet[a];
              let subjectattr = subject[attr];
              if (!subject[attr]) {
                subjectattr = '';
              }
              // start with false for OR mode, and true for AND mode
              let passesAttributeGroup = !filterAction(false, true);
              // use the filter mode function (OR or AND) and test all filters in a group
              for (let t = 0; t < testers.length; t++) {
                passesAttributeGroup = filterAction(passesAttributeGroup, testers[t](subjectattr));
              }
              if (passesAttributeGroup) {
                passesAnyAttributeGroupInSet = true;
              }
            }
            // if the subject passes no attribute group in the set, don't include it
            if (!passesAnyAttributeGroupInSet) {
              return false;
            }
          }
        }
        return true;
      });
      if (this.chosenFilters.nameInput.length) {
        const sortingOrder = [this.chosenFilters.nameInput, '^' + this.chosenFilters.nameInput, escapeRegExp(this.chosenFilters.nameInput), '^' + escapeRegExp(this.chosenFilters.nameInput)];
        const sortingFuncs = getRegexFuncs(sortingOrder);
        const getOrderForString = function (matchingString) {
          const matches = sortingFuncs.map((func) => func(matchingString));
          return matches.lastIndexOf(true);
        };
        const getOrder = function (subject) {
          const idMatch = getOrderForString(subject.subject_id);
          const nameMatch = getOrderForString(subject.title);
          return Math.max(idMatch, nameMatch);
        };
        return filteredSubjects.sort(function (subject1, subject2) {
          return getOrder(subject2) - getOrder(subject1);
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
      this.chosenFilters.nameInput = newVal;
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
    $(window).resize(function () {
      this.updateMenuStyle();
    }.bind(this));

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
    updateMenuStyle: function () {
      const searchInputElem = document.getElementById('searchInputTF');
      const searchInputRect = searchInputElem.getBoundingClientRect();
      const searchMenuTop = searchInputRect.top + searchInputRect.height;
      const searchInput = $('#searchInputTF');
      const menuWidth = searchInput.outerWidth();
      const classInfoCard = $('#classInfoCard');
      let menuBottom;
      if (classInfoCard.length) {
        menuBottom = classInfoCard.position().top;
      } else {
        menuBottom = $(window).innerHeight();
      }
      const maxHeight = menuBottom - searchMenuTop - this.menuMargin;
      this.searchHeight = 'max-height: ' + maxHeight + 'px;width: ' + menuWidth + 'px;';
    },
    viewClassInfo: function (item) {
      this.$store.commit('pushClassStack', item.item.subject_id);
    }
  }
};
</script>
