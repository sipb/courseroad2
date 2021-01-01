describe('Classes Tests', () => {
  beforeEach(() => {
    cy.reload();

    // Mock Fireroad get and post requests with empty response
    cy.server();
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
  });
  it('Adds a class', () => {
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
});
