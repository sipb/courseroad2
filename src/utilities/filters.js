class Filter {
  /*
  Constructs a filter which can evaluate whether a subject matches
  a particular pattern

  name: long name for the filter
  shortName: short display name for the filter
  filter: function to be evaluated on a subject's attributes, should
          return true if the attribute matches the pattern and false
          otherwise
  attributeNames: list of attributes on the subject to test against
          the filter
  mode: 'AND' if all attributes in attributeNames must match the filter,
        'OR' if only one must match
  */
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

  /*
  Set up inputs which can be used to adjust the filter.  Unimplemented for
  simple filter but used on subclasses
  */
  setupInputs (input) {}

  /*
  Test if a particular subject matches the filter

  subject: a subject object, must contain all attributes in this.attributes
  returns: true if the attributes of the subject return true when passed through
            the filter function; if mode is OR any attribute in attributes can
            match, otherwise all attributes must match
  */
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
  /*
  Constructs a regex filter which will test subject attributes against a
  specified regex.

  regex: a regex string that the subject's attributes must match
  requires: input which is required to adjust the regex
  */
  constructor (name, shortName, regex, requires, attributeNames, mode) {
    var testFunction = RegexFilter.getRegexTestFunction(regex);
    super(name, shortName, testFunction, attributeNames, mode);
    this.regex = regex;
    this.originalFilter = testFunction;
    // Input required to construct the regex (for filters that change based on input)
    this.requires = requires;
  }

  /*
  Escape all special characters in a regex

  regex: A regex string
  return: A new regex string which escapes all special characters with a
          backslash
  */
  static escapeRegex (regex) {
    return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /*
  Constructs a regex from a given string

  regex: a (potentially valid) regex string
  returns: a regex which is either represented by the given string, or by the
           given string as a literal if a regex cannot be constructed from it
  */
  static constructRegex (regex) {
    try {
      return new RegExp(regex, 'i');
    } catch (e) {
      // If a regex cannot be constructed, default to matching the literal
      return new RegExp(RegexFilter.escapeRegex(regex), 'i');
    }
  }

  /*
  Constructs a function to test strings against a given regex

  regex: a (potentially valid) regex string
  addon: a (potentially valid) regex addon string, undefined for no add-on
  returns: a function which will return true if a given string matches the regex
          and false otherwise.  If the regex is not valid it will be escaped
          and matched literally.
  */
  static getRegexTestFunction (regex, addon) {
    let regexObject = RegexFilter.constructRegex(regex);

    if (addon !== undefined) {
      const addonObject = RegexFilter.constructRegex(addon);
      regexObject = new RegExp(regexObject.source + addonObject.source, 'i');
    }

    // Regex test function only works when bound to the regex object
    return regexObject.test.bind(regexObject);
  }

  /*
  Appends values from an input to the end of the regex the filter tests against

  inputs: an object which contains the required information to add to the regex
          (the field with name equal to this.requires)
  If this.requires is defined, changes the filter to test against the original
  regex plus the required field from the input
  */
  setupInputs (inputs) {
    if (this.requires !== undefined) {
      var regexAddOn = inputs[this.requires];
      this.filter = RegexFilter.getRegexTestFunction(this.regex, regexAddOn);
    } else {
      this.filter = this.originalFilter;
    }
  }

  /*
  Sets up rankings of different variants of matches to the regex

  inputs: an object which contains the required information to add to the regex
          (the field with name equal to this.requires)
  priorityDirections: an object which maps the names of supported variants to
          a boolean specifying whether that variant is prioritized (true) or
          deprioritized (false).
  priorityOrder: list of supported variants, which are the same as the keys in
          priorityDirections, in order from most important to least important

  Sets the property this.priorities, which is a ranking from worst to best of
  functions to test against a subject's attributes, such that subjects passing
  the functions at higher indices in this list are of higher priority variants
  */
  setupVariants (inputs, priorityDirections, priorityOrder) {
    // Set up the priorities of variants of the regex
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
    let indexMap = [0];

    priorityOrder.reverse();
    for (var p = 0; p < priorityOrder.length; p++) {
      var isPrioritized = priorityDirections[priorityOrder[p]];
      // Create two lists; one with priority applied, the other without
      var arrayWithPriority = regexPriorities.map((funcNames) => funcNames.concat([priorityOrder[p]]));

      regexPriorities.push(...arrayWithPriority);
      const priorityIndices = indexMap.map((i) => i + indexMap.length);

      // If this priority is prioritized, give it higher ranks (later indices)
      if (isPrioritized) {
        indexMap.push(...priorityIndices);
      } else {
        priorityIndices.push(...indexMap);
        indexMap = priorityIndices;
      }
    }

    // Apply these functions to the base regex, in the application order
    var priorities = regexPriorities.map(function (priorityFuncs) {
      return priorityFuncs
        .sort((a, b) => applicationOrder.indexOf(a) - applicationOrder.indexOf(b))
        .reduce((acc, func) => (priorityFunctions[func])(acc), regex);
    }).map((r) => RegexFilter.getRegexTestFunction(r));

    // Set member variable to use in future prioritization checks
    this.priorities = priorities;
    this.priorityIndexMap = indexMap;
  }

  /*
  Gives a subject a rank based on what variant of regex match it is

  subject: a subject object
  returns: a ranking where a higher number indicates that it matches a higher
        priority variant, as set up in setupVariants, and a value of -1
        indicates that it matches no variants at all
  */
  compareByVariants (subject) {
    // List of sort numbers for different attributes
    var orders = [];

    for (var a = 0; a < this.attributes.length; a++) {
      // Get last index where the regex in the priority list matches
      // The priority list is in reverse order of priority
      var matches = this.priorities.map((test) => test(subject[this.attributes[a]]));
      orders.push(matches.lastIndexOf(true));
    }

    orders = orders.map((order) => {
      if (order === -1) {
        return -1;
      } else {
        return this.priorityIndexMap[order];
      }
    });

    // Get largest sort priority of all the matching attributes
    return Math.max(...orders);
  }
}

class MathFilter extends Filter {
  /*
  Constructs a filter which tests if a numerical value is within a particular range

  range: a 2-element list where the first element is the lower bound of the range
        and the second element is the upper bound of the range.  A lower bound of
        undefined indicates negative infinity, and an upper bound of undefined
        indicates positive infinity
  inclusive: a boolean which is true if numbers equaling either bound should be
        counted as passing the filter
  */
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
  /*
  Constructs a filter which tests a subject's boolean attribute values

  negated: true if the filter should pass attributes are false, false if it
          should pass values which are true
  */
  constructor (name, shortName, negated, attributeNames, mode) {
    var match = (input) => input === !negated;
    super(name, shortName, match, attributeNames, mode);
  }
}

class FilterGroup {
  /*
  Constructs a group of related filters to be tested for together

  name: name of the filter
  filters: list of Filter objects to include in the group
  combination: 'AND' if all filters in the group must match a subject for the
        group to match the subject, 'OR' if only one must match
  */
  constructor (name, filters, combination) {
    this.name = name;
    this.filters = filters;
    this.combine = {
      'AND': (a, b) => a && b,
      'OR': (a, b) => a || b
    }[combination];
  }

  /*
  Tests if a particular subject matches the filter group

  subject: a subject object
  active: a list of length equal to the number of filters in the group, where
          each value is a boolean that is true if the filter at that index
          is turned on
  inputs: object which contains keys of the required values for all filters
          in the group

  returns: true if the subject matches the active filters in the group; if the
          mode is OR then it only needs to match one filter, if the mode is AND
          it must match all filters; returns true if no filters are active
  */
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

class ArrayFilter extends Filter {
  /*
  Constructs a filter which tests if any of the elements of an attribute of an array matches the subfilter.
  */
  constructor (name, shortName, SubfilterType, subfilterArguments, attributeNames, mode) {
    var subfilter = new SubfilterType(name, shortName, ...subfilterArguments, attributeNames, mode);
    var comparator = subfilter.filter;
    super(name, shortName, comparator, attributeNames, mode);
    this.subfilter = subfilter;
  }
  matches (subject) {
    // starting value of true for and, false for or
    var isMatch = !this.combine(true, false);
    // check each attribute for a match
    for (var a = 0; a < this.attributes.length; a++) {
      var attribute = this.attributes[a];
      if (Array.isArray(subject[attribute])) {
        isMatch = this.combine(isMatch, this.subfilter.filter(subject[attribute]));
      } else {
        isMatch = false;
      }
    }
    return isMatch;
  }
  setupInputs (inputs) {
    this.subfilter.setupInputs(inputs);
  }
}

export { FilterGroup, Filter, RegexFilter, MathFilter, BooleanFilter, ArrayFilter };
