export default {
  methods: {
    classInfo: function (req) {
      if ("req" in req) {
        if (req.req in this.$store.state.subjectsIndex) {
          return this.$store.state.subjectsInfo[
            this.$store.state.subjectsIndex[req.req]
          ];
        }
        let attributeReq = req.req;
        if (attributeReq.indexOf("GIR:") === 0) {
          attributeReq = attributeReq.substring(4);
        }
        if (attributeReq in this.$store.state.genericIndex) {
          return this.$store.state.genericCourses[
            this.$store.state.genericIndex[attributeReq]
          ];
        }
      }
      return undefined;
    },
    canDrag: function (req) {
      return (
        this.classInfo(req) !== undefined ||
        ("req" in req &&
          Object.keys(this.$store.state.subjectsIndex).length === 0)
      );
    },
  },
};
