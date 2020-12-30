// https://docs.cypress.io/api/introduction/api.html

describe('Basic Tests', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.contains('h3', 'C o u r s e R o a d');
  });
  it('Adds a class', () => {
    cy.visit('/');

    // Search for class
    cy.get('#searchInputTF')
      .type('6.004');

    // Click on class
    cy.get('[id="6.004"]')
      .click();

    // Check that class is pulled up in class info card
    cy.get('#classInfoCard')
      .contains('h3', 'Computation Structures');

    // Add class from class info card
    cy.get('#addClassFromCard')
      .click();

    cy.get('[id="road_$defaultroad$_semester_3"]').as('freshmanSpring');
    // Add class by clicking on placeholder
    cy.get('@freshmanSpring').within(() => {
      cy.get('.placeholder').click();
    });

    // Check the class is now in the semester
    cy.get('@freshmanSpring').within(() => {
      cy.contains('#class60043', '6.004');
    });
  });
});
