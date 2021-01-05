describe('Classes Tests', () => {
  beforeEach(() => {
    cy.reload();

    // Mock Fireroad get and post requests with empty response
    cy.server();
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
  });
  it('Adds a class from class info card', () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          'subject_id': '6.004',
          'title': 'Computation Structures',
          'offered_fall': true,
          'offered_spring': true
        },
        {
          'subject_id': '16.004',
          'title': 'Unified Engineering: Thermodynamics and Propulsion',
          'offered_fall': true,
          'offered_spring': true
        }
      ]
    );

    cy.visit('/');

    // Search for class
    cy.getByDataCy('classSearchInput')
      .type('6.004');

    // Click on class
    cy.getByDataCy('classInSearch6004')
      .click();

    // Check that class is pulled up in class info card
    cy.getByDataCy('classInfoCard')
      .contains('h3', 'Computation Structures')
      .should('exist');

    // Add class from class info card
    cy.getByDataCy('addClassFromCardButton')
      .click();

    cy.getByDataCy('road_$defaultroad$__semester_3').as('freshmanSpring');
    // Add class by clicking on placeholder
    cy.get('@freshmanSpring').within(() => {
      cy.getByDataCy('placeholderClass').click();
    });

    // Check the class is now in the semester
    cy.get('@freshmanSpring').within(() => {
      cy.getByDataCy('classInSemester3_6004')
        .should('contain', 'Computation Structures');
    });
  });

  it('Drags a class from class search', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          'subject_id': '6.004',
          'title': 'Computation Structures',
          'offered_fall': true,
          'offered_spring': true
        },
        {
          'subject_id': '16.004',
          'title': 'Unified Engineering: Thermodynamics and Propulsion',
          'offered_fall': true,
          'offered_spring': true
        }
      ]
    );

    cy.visit('/');

    // Search for class
    cy.getByDataCy('classSearchInput')
      .type('6.004');

      // Will fix later

    // cy.dragAndDrop('[data-cy="classInSearch6004"]',
    //                 '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
    //                  0, 0);

  });

  it('Does not allow putting the class in the wrong semester', () => {
    // Set up simple test catalog to return from API
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          'subject_id': '6.004',
          'title': 'Computation Structures',
          'offered_fall': true,
          'offered_spring': false
        },
        {
          'subject_id': '16.004',
          'title': 'Unified Engineering: Thermodynamics and Propulsion',
          'offered_fall': true,
          'offered_spring': true
        }
      ]
    );

    cy.visit('/');

    // Search for class
    cy.getByDataCy('classSearchInput')
      .type('6.004');

    // Click on class
    cy.getByDataCy('classInSearch6004')
      .click();

    // Check that class is pulled up in class info card
    cy.getByDataCy('classInfoCard')
      .contains('h3', 'Computation Structures')
      .should('exist');

    // Add class from class info card
    cy.getByDataCy('addClassFromCardButton')
      .click();

    cy.getByDataCy('road_$defaultroad$__semester_3').as('freshmanSpring');
    cy.getByDataCy('road_$defaultroad$__semester_4').as('sophomoreFall');

    // Check that class can't be added to a spring semestter
    cy.get('@freshmanSpring').within(() => {
      cy.getByDataCy('placeholderClass')
        .should('not.be.visible')
    });

    // Add class by clicking on placeholder
    cy.get('@sophomoreFall').within(() => {
      cy.getByDataCy('placeholderClass').click();
    });

    // Check the class is now in the semester
    cy.get('@sophomoreFall').within(() => {
      cy.getByDataCy('classInSemester4_6004')
        .should('contain', 'Computation Structures');
    });
  });

  it('Allows for dragging a class between semesters', () => {
    // Skip until I figure out dragging
  });

  it('Displays the units for classes in semesters', () => {
    
  });

  it('Allows using search filters', () => {

  });

  it('Allows searching by text', () => {

  });

  it('Saves road on reload', () => {

  });
});
