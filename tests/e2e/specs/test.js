// https://docs.cypress.io/api/introduction/api.html

describe('Basic Tests', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.contains('h3', 'C o u r s e R o a d');
  });
  it('Adds a class', () => {
    cy.visit('/');

    // Search for class
    cy.getByDataCy("classSearchInput")
      .type('6.004');

    // Click on class
    cy.getByDataCy("classInSearch6004")
      .click();

    // Check that class is pulled up in class info card
    cy.getByDataCy("classInfoCard")
      .contains('h3', 'Computation Structures');

    // Add class from class info card
    cy.getByDataCy("addClassFromCardButton")
      .click();

    cy.getByDataCy('road_$defaultroad$__semester_3').as('freshmanSpring');
    // Add class by clicking on placeholder
    cy.get('@freshmanSpring').within(() => {
      cy.getByDataCy('placeholderClass').click();
    });

    // Check the class is now in the semester
    cy.get('@freshmanSpring').within(() => {
      cy.getByDataCy('classInSemester3_6004')
        .contains('', 'Computation Structures');
    });
  });
});
