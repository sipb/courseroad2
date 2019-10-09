<template>
  <v-container :style="searchHeight + 'display: flex; flex-direction:column;'">
    <div>
      <filter-set v-model="chosenFilters.girs" :label="'GIR'" :filters="allFilters.girs.filters" />
      <filter-set v-model="chosenFilters.hass" :label="'HASS'" :filters="allFilters.hass.filters" />
      <filter-set v-model="chosenFilters.ci" :label="'CI'" :filters="allFilters.ci.filters" />
      <filter-set v-model="chosenFilters.level" :label="'Level'" :filters="allFilters.level.filters" />
      <filter-set v-model="chosenFilters.units" :label="'Units'" :filters="allFilters.units.filters" />
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
import $ from 'jquery';
import Vue from 'vue';

class Filter {
  constructor (name, shortName, filter, attributeNames, requires, mode) {
    this.name = name;
    this.short = shortName;
    this.filter = filter;
    this.attributes = attributeNames;
    this.requires = requires;
    if (mode === undefined) {
      mode = 'OR';
    }
    this.combine = {
      'AND': (a, b) => a && b,
      'OR': (a, b) => a || b
    }[mode];
  }

  matches (subject, inputs) {
    // starting value of true for and, false for or
    var isMatch = !this.combine(true, false);
    // check each attribute for a match
    for (var a = 0; a < this.attributes.length; a++) {
      var attribute = this.attributes[a];
      isMatch = this.combine(isMatch, this.filter(subject[attribute]));
    }
    return isMatch;
  }
}

class RegexFilter extends Filter {
  constructor (name, shortName, regex, attributeNames, requires, mode) {
    var testFunction = RegexFilter.getRegexTestFunction(regex);
    super(name, shortName, testFunction, attributeNames, requires, mode);
    this.regex = regex;
  }

  static getRegexTestFunction (regex) {
    var regexObject = new RegExp(regex, 'i');
    // Regex test function only works when bound to the regex object
    return regexObject.test.bind(regexObject);
  }

  matches (subject, inputs) {
    var oldTestFunction = this.filter;

    // Add input to regex test function if applicable
    if (this.requires !== undefined) {
      var regexAddOn = inputs[this.requires];
      this.filter = RegexFilter.getRegexTestFunction(this.regex + regexAddOn);
    }

    var result = super.matches.call(this, subject, inputs);
    this.filter = oldTestFunction;
    return result;
  }

  // Set up the priorities of variants of the regex
  setupVariants (inputs, priorityDirections, priorityOrder) {
    var atStart = function (regex) {
      return '^' + regex;
    };
    var asLiteral = function (regex) {
      return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Functions to transform regex by a priority
    var priorityFunctions = {
      'atStart': atStart,
      'asLiteral': asLiteral
    };

    // Order to apply functions (must add ^ after escaping, for example)
    var applicationOrder = ['asLiteral', 'atStart'];

    // Get regex from inputs
    var regexAddOn = '';

    if (this.requires !== undefined) {
      regexAddOn = inputs[this.requires];
    }

    var regex = this.regex + regexAddOn;

    // Create list of different combinations of functions to apply
    // Prioritized functions last; which priority to consider first by priority order
    var regexPriorities = [[]];

    priorityOrder.reverse();
    for (var p = 0; p < priorityOrder.length; p++) {
      var isPrioritized = priorityDirections[priorityOrder[p]];
      // Create two lists; one with priority applied, the other without
      var arrayWithPriority = regexPriorities.map((funcNames) => funcNames.concat([priorityOrder[p]]));

      // If this priority is prioritized, put it last
      if (isPrioritized) {
        regexPriorities.push(...arrayWithPriority);
      } else {
        arrayWithPriority.push(...regexPriorities);
        regexPriorities = arrayWithPriority;
      }
    }

    // Apply these functions to the base regex, in the application order
    var priorities = regexPriorities.map(function (priorityFuncs) {
      return priorityFuncs
        .sort((a, b) => applicationOrder.indexOf(a) - applicationOrder.indexOf(b))
        .reduce((acc, func) => (priorityFunctions[func])(acc), regex);
    }).map(RegexFilter.getRegexTestFunction);

    // Set member variable to use in future prioritization checks
    this.priorities = priorities;
  }

  compareByVariants (subject) {
    // List of sort numbers for different attributes
    var orders = [];

    for (var a = 0; a < this.attributes.length; a++) {
      // Get last index where the regex in the priority list matches
      // The priority list is in reverse order of priority
      var matches = this.priorities.map((test) => test(subject[this.attributes[a]]));
      orders.push(matches.lastIndexOf(true));
    }

    // Get largest sort priority of all the matching attributes
    return Math.max(...orders);
  }
}

class MathFilter extends Filter {
  constructor (name, shortName, range, inclusive, attributeNames, mode) {
    var comparator = function (input) {
      if ((range[0] === undefined || input > range[0]) && (range[1] === undefined || input < range[1])) {
        return true;
      } else if (inclusive && (input === range[0] || input === range[1])) {
        return true;
      }
      return false;
    };
    super(name, shortName, comparator, attributeNames, [], mode);
  }
}

class FilterGroup {
  constructor (name, filters, combination) {
    this.name = name;
    this.filters = filters;
    this.combine = {
      'AND': (a, b) => a && b,
      'OR': (a, b) => a || b
    }[combination];
  }

  matches (subject, applied, inputs) {
    var isMatch = !this.combine(true, false);
    var noFilters = true;
    for (var f = 0; f < this.filters.length; f++) {
      if (applied[f]) {
        isMatch = this.combine(isMatch, this.filters[f].matches(subject, inputs));
      }
      noFilters = noFilters && !applied[f];
    }
    return noFilters || isMatch;
  }
}

var girAny = new RegexFilter('GIR:Any', 'Any', '.+', ['gir_attribute']);
var girLab = new RegexFilter('GIR:Lab', 'Lab', '.*(LAB|LAB2).*', ['gir_attribute']);
var girRest = new RegexFilter('GIR:REST', 'REST', '.*(REST|RST2).*', ['gir_attribute']);
var hassAny = new RegexFilter('HASS:Any', 'Any', 'HASS', ['hass_attribute']);
var hassArt = new RegexFilter('HASS-A', 'A', 'HASS-A', ['hass_attribute']);
var hassSocialScience = new RegexFilter('HASS-S', 'S', 'HASS-S', ['hass_attribute']);
var hassHumanity = new RegexFilter('HASS-H', 'H', 'HASS-H', ['hass_attribute']);
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
var textFilter = new RegexFilter('Subject ID', 'ID', '', ['subject_id', 'title'], 'nameInput', 'OR');

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
        hass: [false, false, false, false],
        ci: [false, false, false],
        level: [false, false],
        units: [false, false, false, false, false, false, false]
      },
      allFilters: {
        girs: new FilterGroup('GIR', [girAny, girLab, girRest], 'OR'),
        hass: new FilterGroup('HASS', [hassAny, hassArt, hassSocialScience, hassHumanity], 'OR'),
        ci: new FilterGroup('CI', [ciAny, ciH, ciHW, ciNone], 'OR'),
        level: new FilterGroup('Level', [levelUG, levelG], 'OR'),
        units: new FilterGroup('Units', [unitsLt6, units6, units9, units12, units15, units6To15, unitsGte15], 'OR')
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
        returnAny = returnAny || this.chosenFilters[filterName].reduce((acc, applied) => acc || applied, false);
      }
      if (!returnAny) {
        return [];
      }

      // Filter subjects that match all filter sets and the text filter
      const filteredSubjects = this.allSubjects.filter(function (subject) {
        var matches = true;
        for (var filterGroup in this.allFilters) {
          matches = matches && this.allFilters[filterGroup].matches(subject, this.chosenFilters[filterGroup], { nameInput: this.nameInput });
        }
        matches = matches & textFilter.matches(subject, { nameInput: this.nameInput });
        return matches;
      }.bind(this));

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
