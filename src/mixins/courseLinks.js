export const courseLinks = [
  {
    courses: [
      "major6-1",
      "major6-1-8-flex",
      "major6-2",
      "major6-2new",
      "major6-3",
      "major6-3new",
      "major6-4",
      "major6-7",
      "major6-14",
      "major11-6",
      "minor6",
      "master6-P",
      "meng6-14",
    ],
    link: "https://eecsis.mit.edu/checklist.cgi",
    text: "Course 6 Checklist",
  },
  {
    courses: ["major11"],
    link: "https://duspsis.mit.edu/",
    text: "Course 11 Student Status",
  },
  {
    courses: [
      "neetLM-CB",
      "neetLM-IE",
      "neetLM-TE",
      "neetLM-SB",
      "neetLM-MDE",
      "neetLM",
    ],
    link: "https://neet.mit.edu/threads/lm",
    text: "NEET Living Machines Website",
  },
  {
    courses: ["neetAM"],
    link: "https://neet.mit.edu/threads/am",
    text: "NEET Autonomous Machines Website",
  },
  {
    courses: ["neetAAM"],
    link: "https://neet.mit.edu/threads/amm",
    text: "NEET Advanced Materials Machines Website",
  },
  {
    courses: ["neetDC"],
    link: "https://neet.mit.edu/threads/dc",
    text: "NEET Digital Cities Website",
  },
  {
    courses: ["neetCES"],
    link: "https://neet.mit.edu/threads/rem",
    text: "NEET Renewable Energy Machines",
  },
];

export const getCourseLinks = (selectedReqs) => {
  const links = [];
  for (const { courses, link, text } of courseLinks) {
    if (selectedReqs.some((course) => courses.includes(course))) {
      links.push({ link, text });
    }
  }
  return links;
};

export default {
  data: function () {
    return {
      courseLinks: courseLinks,
    };
  },
  methods: {
    getCourseLinks: getCourseLinks,
  },
};
