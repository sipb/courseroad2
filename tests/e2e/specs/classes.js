describe("Classes Tests", () => {
  it("Adds a class from class info card", () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "6.004",
        title: "Computation Structures",
        offered_fall: true,
        offered_spring: true,
      },
      {
        subject_id: "16.004",
        title: "Unified Engineering: Thermodynamics and Propulsion",
        offered_fall: true,
        offered_spring: true,
      },
    ]);

    cy.visit("/");

    // Search for class
    cy.getByDataCy("classSearchInput").type("6.004");

    // Click on class
    cy.getByDataCy("classInSearch6_004").click();

    // Check that class is pulled up in class info card
    cy.getByDataCy("classInfoCard")
      .contains("h3", "Computation Structures")
      .should("exist");

    // Add class from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    cy.getByDataCy("road_$defaultroad$__semester_3").as("freshmanSpring");
    // Add class by clicking on placeholder
    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    // Check the class is now in the semester
    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("classInSemester3_6_004").should(
        "contain",
        "Computation Structures",
      );
    });
  });

  it("Drags a class from class search", () => {
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "6.004",
        title: "Computation Structures",
        offered_fall: true,
        offered_spring: true,
      },
      {
        subject_id: "16.004",
        title: "Unified Engineering: Thermodynamics and Propulsion",
        offered_fall: true,
        offered_spring: true,
      },
    ]);

    cy.visit("/");

    // Search for class
    cy.getByDataCy("classSearchInput").type("6.004");

    // Drag 6.004 into Freshman Fall
    cy.dragAndDrop(
      '[data-cy="classInSearch6_004"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0,
      0,
    );

    // Check the class is now in the semester
    cy.getByDataCy("road_$defaultroad$__semester_1").within(() => {
      cy.getByDataCy("classInSemester1_6_004").should(
        "contain",
        "Computation Structures",
      );
    });
  });

  it("Does not allow putting the class in the wrong semester", () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "6.004",
        title: "Computation Structures",
        offered_fall: true,
        offered_spring: false,
      },
      {
        subject_id: "16.004",
        title: "Unified Engineering: Thermodynamics and Propulsion",
        offered_fall: true,
        offered_spring: true,
      },
    ]);

    cy.visit("/");

    // Search for class
    cy.getByDataCy("classSearchInput").type("6.004");

    // Click on class
    cy.getByDataCy("classInSearch6_004").click();

    // Check that class is pulled up in class info card
    cy.getByDataCy("classInfoCard")
      .contains("h3", "Computation Structures")
      .should("exist");

    // Add class from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    cy.getByDataCy("road_$defaultroad$__semester_3").as("freshmanSpring");
    cy.getByDataCy("road_$defaultroad$__semester_4").as("sophomoreFall");

    // Check that class can't be added to a spring semestter
    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("placeholderClass").should("not.be.visible");
    });

    // Add class by clicking on placeholder
    cy.get("@sophomoreFall").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    // Check the class is now in the semester
    cy.get("@sophomoreFall").within(() => {
      cy.getByDataCy("classInSemester4_6_004").should(
        "contain",
        "Computation Structures",
      );
    });
  });

  it("Allows for dragging a class between semesters", () => {
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "2.003",
        title: "Dynamics and Control I",
        offered_fall: true,
        offered_spring: true,
      },
      {
        subject_id: "4.021",
        title: "Design Studio: How to Design",
        offered_fall: true,
        offered_spring: true,
      },
    ]);

    cy.visit("/");

    // Search for class
    cy.getByDataCy("classSearchInput").type("2.003");

    cy.getByDataCy("road_$defaultroad$__semester_1").as("freshmanFall");
    cy.getByDataCy("road_$defaultroad$__semester_3").as("freshmanSpring");

    // Drag 2.003 into Freshman Fall
    cy.dragAndDrop(
      '[data-cy="classInSearch2_003"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0,
      0,
    );

    // Check the class is now in the semester
    cy.get("@freshmanFall").within(() => {
      cy.getByDataCy("classInSemester1_2_003").should(
        "contain",
        "Dynamics and Control I",
      );
    });

    // Drag 2.003 into Freshman Spring
    cy.dragAndDrop(
      '[data-cy="classInSemester1_2_003"]',
      '[data-cy="road_$defaultroad$__semester_3_dropZone"]',
      0,
      0,
    );

    // Check the class is now in the semester
    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("classInSemester3_2_003").should(
        "contain",
        "Dynamics and Control I",
      );
    });
  });

  it("Displays the units for classes in semesters", () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "6.004",
        title: "Computation Structures",
        offered_fall: true,
        offered_spring: true,
        total_units: 12,
        lab_units: 0,
        lecture_units: 4,
        preparation_units: 8,
      },
      {
        subject_id: "5.111",
        title: "Principals of Chemical Science",
        offered_fall: true,
        offered_spring: true,
        total_units: 12,
        lab_units: 0,
        lecture_units: 5,
        preparation_units: 7,
      },
    ]);

    cy.visit("/");

    // Search for class
    cy.getByDataCy("classSearchInput").type(".");

    // Click on class
    cy.getByDataCy("classInSearch5_111").click();

    // Add class 5.111 from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    cy.getByDataCy("road_$defaultroad$__semester_7").as("juniorFall");

    // Add class by clicking on placeholder
    cy.get("@juniorFall").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    // Close class info card
    cy.getByDataCy("closeClassInfoButton").click();

    // Enter class search again
    cy.getByDataCy("classSearchInput").click();

    // Click on 6.004 in class search
    cy.getByDataCy("classInSearch6_004").click();

    // Add 6.004 from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    // Select junior fall semester to add it to
    cy.get("@juniorFall").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    // Ensure display shows 24 total units
    cy.get("@juniorFall").within(() => {
      cy.getByDataCy("semesterUnits").should("contain", "Units: 24");
    });
  });

  it("Allows using search filters", () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "14.02",
        title: "Principles of Macroeconomics",
        hass_attribute: "HASS-S",
      },
      {
        subject_id: "5.111",
        title: "Principals of Chemical Science",
      },
    ]);

    cy.visit("/");

    // Open class search
    cy.getByDataCy("classSearchInput").click();

    // Click on HASS any filter button
    cy.getByDataCy("filter_HASS").within(() => {
      cy.getByDataCy("filterButton_HASS:Any").click();
    });

    // Ensure 5.111 is not in results
    cy.getByDataCy("classInSearch5_111").should("not.exist");

    // Ensure 14.02 is in results
    cy.getByDataCy("classInSearch14_02").should("exist");
  });

  it("Allows searching by text", () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "18.03",
        title: "Differential Equations",
      },
      {
        subject_id: "7.012",
        title: "Introductory Biology",
      },
    ]);

    cy.visit("/");

    cy.getByDataCy("classSearchInput").type("7.");

    cy.getByDataCy("classInSearch18_03").should("not.exist");

    cy.getByDataCy("classInSearch7_012").should("exist");
  });

  it("Saves road on reload", () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env("VUE_APP_FIREROAD_URL") + "/courses/all?full=true", [
      {
        subject_id: "5.12",
        title: "Organic Chemistry I",
        offered_fall: true,
        offered_spring: true,
      },
      {
        subject_id: "10.466",
        title: "Structure of Soft Matter",
        offered_fall: true,
        offered_spring: true,
      },
      {
        subject_id: "24.118",
        title: "Paradox and Infinity",
        offered_fall: true,
        offered_spring: true,
      },
    ]);

    cy.visit("/");

    // Open class search
    cy.getByDataCy("classSearchInput").type(".");

    // Click on 5.12 in class search
    cy.getByDataCy("classInSearch5_12").click();

    // Add 5.12 from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    cy.getByDataCy("road_$defaultroad$__semester_1").as("freshmanFall");
    cy.getByDataCy("road_$defaultroad$__semester_3").as("freshmanSpring");

    // Select freshman fall semester to add it to
    cy.get("@freshmanFall").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    // Close class info card
    cy.getByDataCy("closeClassInfoButton").click();

    cy.getByDataCy("classSearchInput").click();

    cy.getByDataCy("classInSearch10_466").click();

    // Add 10.466 from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    // Select freshman spring semester to add it to
    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    // Close class info card
    cy.getByDataCy("closeClassInfoButton").click();

    cy.getByDataCy("classSearchInput").click();

    cy.getByDataCy("classInSearch24_118").click();

    // Add 24.118 from class info card
    cy.getByDataCy("addClassFromCardButton").click();

    // Select freshman spring semester to add it to
    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("placeholderClass").click();
    });

    cy.reload();

    // Check the classes are still in the semester
    cy.get("@freshmanFall").within(() => {
      cy.getByDataCy("classInSemester1_5_12").should("exist");
    });

    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("classInSemester3_10_466").should("exist");
    });

    cy.get("@freshmanSpring").within(() => {
      cy.getByDataCy("classInSemester3_24_118").should("exist");
    });
  });
});
