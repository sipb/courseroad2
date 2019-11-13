function getFullYear() {
    return 2019;
}

const testDate = new Date('2019-09-14T11:01:58.135Z')
const mockDate = class extends Date {
    constructor(date) {
        return testDate;
    }
}

