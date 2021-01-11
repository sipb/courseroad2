
describe('Settings/Persistency Tests', () => {
  beforeEach(() => {
    cy.reload();

    // Mock Fireroad get and post requests with empty response
    cy.server();
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
  });
  it('Can change class year', () => {
    cy.clock(new Date(2020, 10, 24, 0, 0, 0).getTime(), ['Date']);
    cy.visit('/');

    // Click on the semester title in semester 5
    // (and verify it originally shows date for assumed Freshman)
    cy.getByDataCy('road_$defaultroad$__semester_5').within(() => {
      cy.getByDataCy('semester_title')
        .should('contain', 'Sophomore')
        .should('contain', '\'22')
        .should('contain', 'IAP')
        .click();
    });

    // Wait until v-dialog leaves brief "transition state" where clicking on it
    // has unintended effects
    cy.get('.v-dialog--active:not(.dialog-transition-enter-active)');

    // Fudge factor so it truly settles
    // (no discernible difference between html in state where it fails
    // to open correctly and state where it succeeds)
    cy.wait(500);

    // Open dropdown
    cy.getByDataCy('selectClassYear')
      .parent()
      .click();

    // Find and click the displayed option in the dropdown that says 'Junior'
    cy.get('.v-menu__content')
      .contains('Junior')
      .click();

    // Submit dialog, closing it
    cy.getByDataCy('submitRoadSettingsButton')
      .click();

    // Check that the semester has changed to correct date
    cy.getByDataCy('road_$defaultroad$__semester_1').within(() => {
      cy.getByDataCy('semester_title')
        .should('contain', '\'18')
        .should('contain', 'Freshman')
        .should('contain', 'Fall');
    });
  });

  it('Saves open/close semester states', () => {
    cy.visit('/');

    cy.getByDataCy('acceptCookies')
      .click();

    cy.getByDataCy('road_$defaultroad$__semester_0')
      .as('priorCredit');

    cy.getByDataCy('road_$defaultroad$__semester_0_dropZone')
      .as('priorCreditPanel');

    cy.getByDataCy('road_$defaultroad$__semester_1')
      .as('freshmanFall');

    cy.getByDataCy('road_$defaultroad$__semester_1_dropZone')
      .as('freshmanFallPanel');

    cy.getByDataCy('road_$defaultroad$__semester_7')
      .as('juniorFall');

    cy.getByDataCy('road_$defaultroad$__semester_7_dropZone')
      .as('juniorFallPanel');

    cy.get('@priorCreditPanel')
      .should('not.be.visible');

    cy.get('@priorCredit')
      .click();

    cy.get('@priorCreditPanel')
      .should('be.visible');

    cy.get('@freshmanFallPanel')
      .should('be.visible');

    cy.get('@freshmanFall')
      .click();

    cy.get('@freshmanFallPanel')
      .should('not.be.visible');

    cy.get('@juniorFallPanel')
      .should('be.visible');

    cy.get('@juniorFall')
      .click();

    cy.get('@juniorFallPanel')
      .should('not.be.visible');

    cy.reload();

    cy.get('@priorCreditPanel')
      .should('be.visible');

    cy.get('@freshmanFallPanel')
      .should('not.be.visible');

    cy.get('@juniorFallPanel')
      .should('not.be.visible');
  });
});
