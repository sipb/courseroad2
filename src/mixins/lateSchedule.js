export default {
  methods: {
    lateSchedule: function(subj, genericIndex) {
      if (subj.schedule === undefined && !(subj.subject_id in genericIndex)) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const fallCutoff = new Date(year, 4, 15);
        const springCutoff = month === 11 ? new Date(year, 11, 15) : new Date(year-1, 11, 15);
        const scheduleForFall = month >= 4 && month <= 10;
        const lateForFall = scheduleForFall && today > fallCutoff;
        const lateForSpring = !scheduleForFall && today > springCutoff;
        return lateForFall || lateForSpring;
      }
      return false;
    }
  }
}
