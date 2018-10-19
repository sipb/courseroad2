"use strict";


class Subject {
    constructor() {
        this.semester = 0;
        this.title = "";
        this.id = "6.009";
        this.units = 12;
        this.overrideWarnings = false;
    }
}

const sourceOfTruth = {
    coursesOfStudy: ["girs"],
    selectedSubjects: [new Subject()],
}


// export default sourceOfTruth;
