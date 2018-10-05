const fakeData = {
    degrees: ["6-3", "18"],
    classes: {
        sp18: ["6.031", "6.042"],
        fa18: ["6.046", "6.034"],
    }
}





function() getDegrees {
    return fakeData.degrees;
}

function(term) getClasses {
    return fakeData.classes[term];
}
