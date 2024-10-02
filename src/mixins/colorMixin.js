export default {
  data: function () {
    return {
      validCourses: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "14",
        "15",
        "16",
        "17",
        "18",
        "20",
        "21",
        "21A",
        "21G",
        "21H",
        "21L",
        "21M",
        "21T",
        "21W",
        "22",
        "24",
        "CC",
        "CMS",
        "CSB",
        "EC",
        "EM",
        "ES",
        "HST",
        "IDS",
        "MAS",
        "SCM",
        "STS",
        "WGS",
        "SP",
        "SWE",
        "AS",
        "MS",
        "NS",
      ],
      validGeneric: [
        "PHY1",
        "PHY2",
        "CHEM",
        "BIOL",
        "CAL1",
        "CAL2",
        "LAB",
        "REST",
        "HASS-A",
        "HASS-H",
        "HASS-S",
        "CI-H",
        "CI-HW",
      ],
      colors: {
        "course-none": "#999999",
        "course-1": "#d10d23",
        "course-2": "#f16024",
        "course-3": "#305aba",
        "course-4": "#bde788",
        "course-5": "#8abd6d",
        "course-6": "#499eda",
        "course-7": "#4365a2",
        "course-8": "#7a36bf",
        "course-9": "#4bb399",
        "course-10": "#c96b52",
        "course-11": "#81235b",
        "course-12": "#4bcb4a",
        "course-14": "#f5a623",
        "course-15": "#a40052",
        "course-16": "#64d4e3",
        "course-17": "#c80db9",
        "course-18": "#1f3573",
        "course-20": "#64a518",
        "course-21": "#a18cd3",
        "course-21A": "#9162d0",
        "course-21G": "#764e8d",
        "course-21H": "#b560c3",
        "course-21L": "#d574d7",
        "course-21M": "#f1a7e5",
        "course-21T": "#ad4096",
        "course-21W": "#d16ca4",
        "course-22": "#734954",
        "course-24": "#3f1c57",
        "course-CC": "#398486",
        "course-CMS": "#8aafb1",
        "course-CSB": "#f5889c",
        "course-EC": "#8b1d17",
        "course-EM": "#e1d059",
        "course-ES": "#b0b02e",
        "course-HST": "#90cdd0",
        "course-IDS": "#9eabd0",
        "course-MAS": "#64696d",
        "course-SCM": "#152348",
        "course-STS": "#155410",
        "course-WGS": "#44cf9d",
        "course-SP": "#deb821",
        "course-SWE": "#b82165",
        "course-AS": "#b0b0b0",
        "course-MS": "#b0b0b0",
        "course-NS": "#b0b0b0",
        "generic-GIR": "#bf6139",
        "generic-HASS": "#39bf97",
        "generic-HASS-A": "#3997bf",
        "generic-HASS-H": "#3946bf",
        "generic-HASS-S": "#7c39bf",
        "generic-CI-H": "#bf39b1",
        "generic-CI-HW": "#bf3961",
        "custom_color-0": "#b55757",
        "custom_color-1": "#b58657",
        "custom_color-2": "#b5b557",
        "custom_color-3": "#86b557",
        "custom_color-4": "#57b557",
        "custom_color-5": "#57b586",
        "custom_color-6": "#de4343",
        "custom_color-7": "#de9043",
        "custom_color-8": "#dede43",
        "custom_color-9": "#90de43",
        "custom_color-10": "#43de43",
        "custom_color-11": "#43de90",
        "custom_color-12": "#b51616",
        "custom_color-13": "#b56516",
        "custom_color-14": "#b5b516",
        "custom_color-15": "#65b516",
        "custom_color-16": "#16b516",
        "custom_color-17": "#16b565",
        "custom_color-18": "#57b5b5",
        "custom_color-19": "#5786b5",
        "custom_color-20": "#5757b5",
        "custom_color-21": "#8657b5",
        "custom_color-22": "#b557b5",
        "custom_color-23": "#b55786",
        "custom_color-24": "#43dede",
        "custom_color-25": "#4390de",
        "custom_color-26": "#4343de",
        "custom_color-27": "#9043de",
        "custom_color-28": "#de43de",
        "custom_color-29": "#de4390",
        "custom_color-30": "#16b5b5",
        "custom_color-31": "#1665b5",
        "custom_color-32": "#1616b5",
        "custom_color-33": "#6516b5",
        "custom_color-34": "#b516b5",
        "custom_color-35": "#b51665",
        "custom_color-36": "#000000",
        "custom_color-37": "#262626",
        "custom_color-38": "#4d4d4d",
        "custom_color-39": "#737373",
        "custom_color-40": "#999999",
        "custom_color-41": "#bfbfbf",
      },
    };
  },
  methods: {
    getRawColor: function (courseColor) {
      return this.colors[courseColor];
    },
    getRawTextColor: function (courseColor) {
      // See https://github.com/Myndex/max-contrast
      // https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color

      const Rs = parseInt(this.colors[courseColor].substring(1, 3), 16);
      const Gs = parseInt(this.colors[courseColor].substring(3, 5), 16);
      const Bs = parseInt(this.colors[courseColor].substring(5, 7), 16);

      const flipYs = 0.342; // based on APCA™ 0.98G middle contrast BG

      const trc = 2.4,
        Rco = 0.2126729,
        Gco = 0.7151522,
        Bco = 0.072175;

      let Ys =
        (Rs / 255.0) ** trc * Rco +
        (Gs / 255.0) ** trc * Gco +
        (Bs / 255.0) ** trc * Bco;

      return Ys < flipYs ? "#ffffffee" : "#000000cc";
    },
    // courseColor takes in subject
    courseColor: function (subject) {
      // Custom course have custom_color component
      if (subject.custom_color) {
        return "custom_color-" + subject.custom_color.slice(1);
      }
      // Otherwise it's normal class which id determines color
      return this.courseColorFromId(subject.id || subject.subject_id);
    },
    // Takes a subject ID directly
    courseColorFromId: function (id) {
      if (id !== undefined) {
        let course = id.split(".")[0];
        if (course.indexOf("GIR:") >= 0) {
          course =
            course.substring(0, course.indexOf("GIR:")) +
            course.substring(course.indexOf("GIR:") + 4);
        }
        const girAttrs = course
          .split(" ")
          .filter((c) => this.validGeneric.indexOf(c) >= 0);
        if (this.validCourses.indexOf(course) !== -1) {
          return "course-" + course;
        } else if (girAttrs.length > 0) {
          if (girAttrs.length === 1) {
            const attr = girAttrs[0];
            if (attr.indexOf("HASS") === 0) {
              return "generic-" + course;
            } else if (attr.indexOf("CI") === 0) {
              return "generic-" + course;
            }
          }
          return "generic-GIR";
        }
      }
      return "course-none";
    },
  },
};
