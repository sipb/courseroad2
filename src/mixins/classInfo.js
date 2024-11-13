import { useStore } from "../plugins/composition";

export const classInfo = (req) => {
  const store = useStore();
  if ("req" in req) {
    if (req.req in store.state.subjectsIndex) {
      return store.state.subjectsInfo[store.state.subjectsIndex[req.req]];
    }
    let attributeReq = req.req;
    if (attributeReq.indexOf("GIR:") === 0) {
      attributeReq = attributeReq.substring(4);
    }
    if (attributeReq in store.state.genericIndex) {
      return store.state.genericCourses[store.state.genericIndex[attributeReq]];
    }
  }
  return undefined;
};

export const canDrag = (req) => {
  const store = useStore();
  return (
    classInfo(req) !== undefined ||
    ("req" in req && Object.keys(store.state.subjectsIndex).length === 0)
  );
};

export default {
  methods: {
    classInfo: classInfo,
    canDrag: canDrag,
  },
};
