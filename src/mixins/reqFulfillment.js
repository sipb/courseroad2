export default {
  methods: {
    classSatisfies: function (req, id, allSubjects) {
      if (req === id) {
        return true;
      }

      let subj;
      if (id in this.$store.state.subjectsIndex) {
        subj = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[id]];
      } else if (id in this.$store.state.genericIndex) {
        subj = this.$store.state.genericCourses[this.$store.state.genericIndex[id]];
      } else {
        // subj not found in known courses
        return false;
      }

      if (subj.equivalent_subjects !== undefined && subj.equivalent_subjects.indexOf(req) >= 0) {
        return true;
      }

      // ex: 6.00 satisfies the 6.0001 requirement
      if (subj.children !== undefined && subj.children.indexOf(req) >= 0) {
        return true;
      }

      // ex: 6.0001 and 6.0002 together satisfy the 6.00 requirement
      if (subj.parent !== undefined && req === subj.parent) {
        const parentCourse = this.$store.state.subjectsInfo[this.$store.state.subjectsIndex[subj.parent]];
        if (parentCourse !== undefined) {
          if (parentCourse.children.every((sid) => allSubjects.indexOf(sid) >= 0)) {
            return true;
          }
        }
      }

      if (req.indexOf('.') === -1) {
        if (req.indexOf('GIR:') >= 0) {
          req = req.substring(4);
          return subj.gir_attribute === req;
        } else if (req.indexOf('HASS') >= 0) {
          return subj.hass_attribute.split(',').indexOf(req) >= 0;
        } else if (req.indexOf('CI') >= 0) {
          return subj.communication_requirement === req;
        }
      }
      return false;
    },
    reqsFulfilled: function (reqString, subjects) {
      const allIDs = subjects.map((s) => s.id);
      reqString = reqString.replace(/''/g, '"').replace(/,[\s]+/g, ',');
      const splitReq = reqString.split(/(,|\(|\)|\/)/);
      const _this = this;
      for (let i = 0; i < splitReq.length; i++) {
        if (splitReq[i].indexOf('"') >= 0) {
          // Set strings (like "permission of instructor") automatically to false
          // If required as an alternative to other prereqs, will not affect fulfillment
          // If the string is a required prereq, it must be manually dismissed
          splitReq[i] = 'false';
        } else if ('()/, '.indexOf(splitReq[i]) < 0) {
          if (allIDs.indexOf(splitReq[i]) >= 0) {
            splitReq[i] = 'true';
          } else {
            const anyClassSatisfies = subjects.some((s) => _this.classSatisfies(splitReq[i], s.id, allIDs));
            splitReq[i] = anyClassSatisfies ? 'true' : 'false';
          }
        }
      }
      const reqExpression = splitReq.join('').replace(/\//g, '||').replace(/,/g, '&&');
      // i know this seems scary, but the above code guarantees there will only be ()/, true false in this string
      // eslint-disable-next-line no-eval
      return eval(reqExpression);
    },
    reqFulfilled: function(reqString, subjects) {
      const allIDs = subjects.map((s) => s.id);
      const _this = this;
      if (reqString.indexOf('\'\'') >= 0) {
        // Set strings (like "permission of instructor") automatically to false
        // If required as an alternative to other prereqs, will not affect fulfillment
        // If the string is a required prereq, it must be manually dismissed
        return false;
      } else {
        if (allIDs.indexOf(reqString) >= 0) {
          return true;
        } else {
          const anyClassSatisfies = subjects.some((s) => _this.classSatisfies(reqString, s.id, allIDs));
          return anyClassSatisfies;
        }
      }
    }
  }
}
