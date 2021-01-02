// https://docs.cypress.io/api/introduction/api.html

describe('Startup Tests', () => {
  beforeEach(() => {
    cy.reload();

    // Mock Fireroad get and post requests with empty response
    cy.server();
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
  });
  it('Visits main website', () => {
    cy.visit('/');

    // Logo should be there
    cy.contains('h3', 'C o u r s e R o a d')
      .should('exist');

    // Audit should be there
    cy.getByDataCy('audit')
      .should('exist');

    // Road should be there
    cy.getByDataCy('road_$defaultroad$')
      .should('exist');

    // Searchbar should be there
    cy.getByDataCy('classSearchInput')
      .should('exist');
  });
  it('Navigates to about page', () => {
    cy.visit('/');

    // Click on about page link
    cy.getByDataCy('aboutLink')
      .click();

    // Check that we are on the about page
    cy.getByDataCy('aboutTitle')
      .should('exist');

    // Go back to main page
    cy.getByDataCy('aboutBackArrow')
      .click();

    // Check that we have left the about page
    cy.getByDataCy('aboutTitle')
      .should('not.exist');
  });
});
