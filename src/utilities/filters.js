class Filter {
  constructor (name, shortName, filter, attributeNames, mode) {
    this.name = name;
    this.short = shortName;
    this.filter = filter;
    this.attributes = attributeNames;
    if (mode === undefined) {
      mode = 'OR';
    }
    this.combine = {
      'AND': (a, b) => a && b,
      'OR': (a, b) => a || b
    }[mode];
  }

  setupInputs (input) {}

  matches (subject) {
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
    super(name, shortName, testFunction, attributeNames, mode);
    this.regex = regex;
    this.originalFilter = testFunction;
    // Input required to construct the regex (for filters that change based on input)
    this.requires = requires;
  }

  static escapeRegex (regex) {
    return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static getRegexTestFunction (regex) {
    var regexObject;
    try {
      regexObject = new RegExp(regex, 'i');
    } catch (e) {
      // If a regex cannot be constructed, default to matching the literal
      regexObject = new RegExp(RegexFilter.escapeRegex(regex), 'i');
    }
    // Regex test function only works when bound to the regex object
    return regexObject.test.bind(regexObject);
  }

  setupInputs (inputs) {
    if (this.requires !== undefined) {
      var regexAddOn = inputs[this.requires];
      this.filter = RegexFilter.getRegexTestFunction(this.regex + regexAddOn);
    } else {
      this.filter = this.originalFilter;
    }
  }

  // Set up the priorities of variants of the regex
  setupVariants (inputs, priorityDirections, priorityOrder) {
    var atStart = function (regex) {
      return '^' + regex;
    };
    var asLiteral = function (regex) {
      return RegexFilter.escapeRegex(regex);
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
    super(name, shortName, comparator, attributeNames, mode);
  }
}

class BooleanFilter extends Filter {
  constructor (name, shortName, attributeNames, negated, mode) {
    var match = (input) => input === !negated;
    super(name, shortName, match, attributeNames, mode);
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

  matches (subject, active, inputs) {
    if (!active.some((a) => a)) {
      return true;
    }
    const baseCombinationValue = !this.combine(true, false);
    var isMatch = baseCombinationValue;
    for (var f = 0; f < this.filters.length; f++) {
      if (active[f]) {
        isMatch = this.combine(isMatch, this.filters[f].matches(subject));
        if (isMatch !== baseCombinationValue) {
          return isMatch;
        }
      }
    }
    return isMatch;
  }
}

export { FilterGroup, Filter, RegexFilter, MathFilter, BooleanFilter };
