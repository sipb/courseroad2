export const lateSchedule = (subj, genericIndex, compareDate = new Date()) => {
  if (subj.schedule === undefined && !(subj.subject_id in genericIndex)) {
    const year = compareDate.getFullYear();
    const month = compareDate.getMonth();
    const fallCutoff = new Date(year, 4, 15);
    const springCutoff =
      month === 11 ? new Date(year, 11, 15) : new Date(year - 1, 11, 15);
    const scheduleForFall = month >= 4 && month <= 10;
    const lateForFall =
      scheduleForFall && subj.offered_fall && compareDate > fallCutoff;
    const lateForSpring =
      !scheduleForFall && subj.offered_spring && compareDate > springCutoff;
    return lateForFall || lateForSpring;
  }
  return false;
};

export default {
  methods: {
    lateSchedule: lateSchedule,
  },
};
