export default {
  methods: {
    getSimpleSelectedSubjects (selectedSubjects) {
      const simpless = Array.from(Array(16), () => []);
      for (let i = 0; i < selectedSubjects.length; i++) {
        const s = selectedSubjects[i];
        if (s.semester === undefined || s.semester < 0) {
          s.semester = 0;
        }
        this.migrateOldSubject(s);
        simpless[s.semester].push(s);
      }
      return simpless;
    },
    async migrateOldSubject (subject) {
      await this.$nextTick();
      await this.$store.dispatch("waitLoadSubjects");

      const subjectIndex = this.$store.state.subjectsIndex[subject.subject_id];
      const genericIndex = this.$store.state.genericIndex[subject.subject_id];

      const notInCatalog = subjectIndex == undefined && genericIndex == undefined;
      const isHistorical = subjectIndex != undefined && this.$store.state.subjectsInfo[subjectIndex].is_historical;

      if (notInCatalog || isHistorical) {
        // Look for subject with old ID
        const oldSubjects = this.$store.state.subjectsInfo.filter((subj) => {
          return subj.old_id == subject.subject_id;
        });

        if (oldSubjects.length > 0) {
          const oldSubject = oldSubjects[0];
          subject.subject_id = oldSubject.subject_id;
          subject.title = oldSubject.title;
          subject.units = oldSubject.total_units;
        }
      }
    }
  }
};
