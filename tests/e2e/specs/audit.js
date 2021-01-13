import girs from '../assets/reqs_girs.js';
import major16 from '../assets/reqs_16.js';
import major21M1 from '../assets/reqs_21m_1.js';
import progMajor21M1 from '../assets/prog_ex_21m_1.js';
import reqs from '../assets/list_reqs.js';
import { objectSlice } from '../support/utilities.js'

describe('Audit Tests', () => {
  beforeEach(() => {
    cy.reload();

    // Mock Fireroad get and post requests with empty response
    cy.server();
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/**', {});
  });

  it('Adds and removes majors', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', []);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/', girs);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major21M-1/', major21M1);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major16/', major16);
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/list_reqs/',
      objectSlice(reqs, ['girs', 'major21M-1', 'major16']));

    cy.visit('/');

    // Check GIRs already present in audit
    cy.getByDataCy('auditItemgirs')
      .should('exist')
      .should('contain', 'GIRs');

    // Search and enter 16 major
    cy.getByDataCy('auditMajorChips')
      .type('16{enter}{backspace}{backspace}{esc}');

    // Check that Course 16 is in audit now
    cy.getByDataCy('auditItemmajor16')
      .should('exist')
      .should('contain', 'Aerospace Engineering');

    // Pull up course selection menu again
    cy.getByDataCy('auditMajorChips')
      .click();

    // Click on major 21M-1
    cy.get('.v-menu__content.menuable__content__active a.v-list__tile')
      .contains('21M-1')
      .click();

    // Close menu
    cy.getByDataCy('auditMajorChips')
      .type('{esc}');

    // Check that Course 21M-1 is in audit now
    cy.getByDataCy('auditItemmajor21M-1')
      .should('exist')
      .should('contain', 'Music');

    // Press close button on 16 chip
    cy.getByDataCy('auditMajorChips')
      .parents('.v-select--chips')
      .within(() => {
        cy.get('.v-chip')
          .contains('16')
          .within(() => {
            cy.get('.v-chip__close')
              .click();
          });
      });

    // Check that Course 16 is not in audit
    cy.getByDataCy('auditItemmajor16')
      .should('not.exist');

    // But the other ones still are
    cy.getByDataCy('auditItemgirs')
      .should('exist');
    cy.getByDataCy('auditItemmajor21M-1')
      .should('exist');

    // Tab over to GIRs and delete it
    cy.getByDataCy('auditMajorChips')
      .click()
      .type('{leftarrow}{leftarrow}{backspace}')
      .type('{esc}');

    // Check GIRs not in audit
    cy.getByDataCy('auditItemgirs')
      .should('not.exist');

    // But others are unchanged
    cy.getByDataCy('auditItemmajor16')
      .should('not.exist');
    cy.getByDataCy('auditItemmajor21M-1')
      .should('exist');

    // Pull up course selection menu again
    cy.getByDataCy('auditMajorChips')
      .click();

    // Click on major 21M-1 to deselect it
    cy.get('.v-menu__content.menuable__content__active a.v-list__tile')
      .contains('21M-1')
      .click();

    // Pull up course selection menu again
    cy.getByDataCy('auditMajorChips')
      .type('{esc}');

    // Check that Course 21M-1 is not in audit now
    cy.getByDataCy('auditItemmajor21M-1')
      .should('not.exist');

    // And others are gone too
    cy.getByDataCy('auditItemmajor16')
      .should('not.exist');
    cy.getByDataCy('auditItemgirs')
      .should('not.exist');
  });

  it.only('Computes progress in audit tree', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', [
      {
        'subject_id': '21M.301',
        'title': 'Harmony and Counterpoint I',
        'offered_fall': true,
        'offered_spring': true
      },
      {
        'subject_id': '21M.293',
        'title': 'Music of Africa',
        'offered_fall': true,
        'offered_spring': true
      },
      {
        'subject_id': '21M.423',
        'title': 'Conducting and Score-Reading',
        'offered_fall': true,
        'offered_spring': true
      }
    ]);

    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/', girs);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major21M-1/', major21M1);
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/list_reqs/',
      objectSlice(reqs, ['girs', 'major21M-1']));

    cy.visit('/');

    // Search and enter 21M-1 major
    cy.getByDataCy('auditMajorChips')
      .type('21M{enter}{backspace}{backspace}{backspace}{esc}');

    // Search for 21M classes
    cy.getByDataCy('classSearchInput')
      .type('21M');

    // Drag 21M.301 into Freshman Fall
    cy.dragAndDrop('[data-cy="classInSearch21M_301"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0, 0);

    // Drag 21M.293 into Freshman Spring
    cy.dragAndDrop('[data-cy="classInSearch21M_293"]',
      '[data-cy="road_$defaultroad$__semester_3_dropZone"]',
      0, 0);

    // cy.intercept('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major21M-1/', (req) => {
    //   console.log(req.body);
    //   return progMajor21M1
    // });

    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major21M-1/', (req) => {
      console.log(req);
      return progMajor21M1;
    });

    // Drag 21M.423 into Sophomore Fall
    cy.dragAndDrop('[data-cy="classInSearch21M_423"]',
      '[data-cy="road_$defaultroad$__semester_4_dropZone"]',
      0, 0);

  });

  it('Drags classes from audit to road', () => {

  });
});
