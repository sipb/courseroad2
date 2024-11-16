import { useStore } from "../plugins/composition";

export const classSatisfies = (req, id, allSubjects) => {
  const store = useStore();
  if (req === id) {
    return true;
  }

  let subj;
  if (id in store.state.subjectsIndex) {
    subj = store.state.subjectsInfo[store.state.subjectsIndex[id]];
  } else if (id in store.state.genericIndex) {
    subj = store.state.genericCourses[store.state.genericIndex[id]];
  } else {
    // subj not found in known courses
    return false;
  }

  if (
    subj.equivalent_subjects !== undefined &&
    subj.equivalent_subjects.indexOf(req) >= 0
  ) {
    return true;
  }

  // ex: 6.00 satisfies the 6.0001 requirement
  if (subj.children !== undefined && subj.children.indexOf(req) >= 0) {
    return true;
  }

  // ex: 6.0001 and 6.0002 together satisfy the 6.00 requirement
  if (subj.parent !== undefined && req === subj.parent) {
    const parentCourse =
      store.state.subjectsInfo[store.state.subjectsIndex[subj.parent]];
    if (parentCourse !== undefined) {
      if (parentCourse.children.every((sid) => allSubjects.indexOf(sid) >= 0)) {
        return true;
      }
    }
  }

  if (req.indexOf(".") === -1) {
    if (req.indexOf("GIR:") >= 0) {
      req = req.substring(4);
      return subj.gir_attribute === req;
    } else if (req.indexOf("HASS") >= 0) {
      return subj.hass_attribute.split(",").indexOf(req) >= 0;
    } else if (req.indexOf("CI") >= 0) {
      return subj.communication_requirement === req;
    }
  }
  return false;
};

export const reqsFulfilled = (reqString, subjects) => {
  const allIDs = subjects.map((s) => s.subject_id);
  reqString = reqString.replace(/''/g, '"').replace(/,[\s]+/g, ",");
  const splitReq = reqString.split(/(,|\(|\)|\/)/);
  let skipNumber;
  for (let i = 0; i < splitReq.length; i++) {
    if (splitReq[i].indexOf('"') >= 0 && i !== skipNumber) {
      // if the requirement is a string instead of a class ID:
      // If the string is "One subject in X", check for any subject with X in their ID
      // things that are still not handled correctly:
      // 21M.283 doesn't work correctly because film / music
      // 24.280, 21L.709, 21L.715, 21L.S96, 21L.S97 don't work because we don't keep the count between i's
      // Set other strings (like "permission of instructor") automatically to false
      // If required as an alternative to other prereqs, will not affect fulfillment
      // If the string is a required prereq, it must be manually dismissed
      const req = splitReq[i];
      let idCategory;
      let numRequired;
      const lowercaseReq = req.toLowerCase();
      if (
        lowercaseReq.indexOf("one subject in") >= 0 ||
        lowercaseReq.indexOf("two subjects in") >= 0
      ) {
        if (lowercaseReq.indexOf("one subject in") >= 0) {
          numRequired = 1;
        } else {
          numRequired = 2;
        }
        // because "one subject in CMS / History" should be (one subject in CMS || one subject in History) not (one subject in CMS) || History
        const orcheck =
          splitReq[i + 1] === "/" &&
          (splitReq[i + 2] === '"Comparative Media Studies"' ||
            splitReq[i + 2] === '"History"');
        // because FireRoad treats "Brain and Cognitive Sciences" as (Brain) && (Cognitive Sciences) instead of (Brain and Cognitive Sciences)
        const andcheck =
          splitReq[i + 1] === "," && splitReq[i + 2] === '"Cognitive Sciences"';
        if (splitReq.length > i + 2 && (orcheck || andcheck)) {
          skipNumber = i + 2;
          idCategory = convertReqToID(splitReq[i + 2]);
          splitReq[i + 2] = checkForNumRequired(
            allIDs,
            idCategory,
            numRequired,
          );
        }
        // sometimes the string is 'two subjects in X' and sometimes it is 'any other two subjects in X'
        const parts = req.split(" ");
        const category = req.split(" ")[parts.indexOf("in") + 1];
        idCategory = convertReqToID(category);
        splitReq[i] = checkForNumRequired(allIDs, idCategory, numRequired);
        if (idCategory.toString() === "/film/i") {
          const allTitles = subjects.map((s) => s.title);
          splitReq[i] = checkForNumRequired(allTitles, idCategory, numRequired);
        }
      } else {
        splitReq[i] = "false";
      }
    } else if ("()/, ".indexOf(splitReq[i]) < 0 && i !== skipNumber) {
      if (allIDs.indexOf(splitReq[i]) >= 0) {
        splitReq[i] = "true";
      } else {
        const anyClassSatisfies = subjects.some((s) =>
          classSatisfies(splitReq[i], s.subject_id, allIDs),
        );
        splitReq[i] = anyClassSatisfies ? "true" : "false";
      }
    }
  }
  const reqExpression = splitReq
    .join("")
    .replace(/\//g, "||")
    .replace(/,/g, "&&");
  // i know this seems scary, but the above code guarantees there will only be ()/, true false in this string
  return eval(reqExpression);
};

export const convertReqToID = (category) => {
  // takes in a string like "Comparative Media Studies" or "philosophy" and outputs something that matches
  // a class ID like /CMS/ or /24\.[0-8]/
  if (category.indexOf('"') === 0) {
    category = category.slice(1);
  }
  if (category.indexOf('"') === category.length - 1) {
    category = category.slice(0, -1);
  }
  let idCategory = "";
  if (
    category === "Comparative" ||
    category === "CMS" ||
    category === "Comparative Media Studies"
  ) {
    idCategory = /CMS/;
  } else if (category === "Literature") {
    idCategory = /21L/;
  } else if (/film/i.test(category)) {
    idCategory = /film/i;
  } else if (category === "philosophy") {
    // below 900 is Linguistics
    idCategory = /24\.[0-8]/;
  } else if (category === "Anthropology") {
    idCategory = /21A/;
  } else if (
    category === "Brain" ||
    category === "Cognitive Sciences" ||
    category === "Cognitive"
  ) {
    idCategory = /^9\./;
  } else if (category === "History") {
    idCategory = /21H/;
  } else {
    idCategory = "do not match anything";
    // maybe this should create a message asking us to add it
  }
  return idCategory;
};

export const checkForNumRequired = (allIDs, idCategory, numRequired) => {
  // checks whether there are numRequired matches for idCategory in allIDs
  let satisfied = "false";
  let numMatches = 0;
  for (let i = 0; i < allIDs.length; i++) {
    if (allIDs[i].search(idCategory) >= 0) {
      numMatches += 1;
    }
  }
  if (numMatches >= numRequired) {
    satisfied = "true";
  }
  return satisfied;
};

export default {
  methods: {
    classSatisfies: classSatisfies,
    reqsFulfilled: reqsFulfilled,
    convertReqToID: convertReqToID,
    checkForNumRequired: checkForNumRequired,
  },
};
