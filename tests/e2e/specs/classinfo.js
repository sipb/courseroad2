import exampleClass from '../assets/class_10_26.js';
import girs from '../assets/reqs_girs.js';

describe('Class Info Card Tests', () => {
  it('Opens the class info card', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        exampleClass
      ]
    );

    cy.visit('/');

    // Search for class
    cy.getByDataCy('classSearchInput')
      .type('10.26');

    // Click on class
    cy.getByDataCy('classInSearch10_26')
      .click();

    // Check that class info card contains the expected information
    cy.getByDataCy('classInfoCard')
      .within(() => {
        // Check for title
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Chemical Engineering Projects Laboratory');

        // Check for units
        cy.getByDataCy('cardUnits')
          .should('contain', '15')
          .should('contain', '3-8-4');

        // Check that it shows as offered in spring
        // and not other semesters
        cy.getByDataCy('cardOffered')
          .should('contain', 'Spring')
          .should('not.contain', 'Fall')
          .should('not.contain', 'Summer')
          .should('not.contain', 'IAP');

        // Check for correct virtual status
        cy.getByDataCy('cardVirtual')
          .should('contain', 'Partly Virtual');

        // Check instructors
        cy.getByDataCy('cardInstructors')
          .should('contain', 'G. Rutledge');

        // Check average enrollment
        cy.getByDataCy('cardEnrollment')
          .should('contain', '38');

        // Check average rating
        cy.getByDataCy('cardRating')
          .should('contain', '5.05');

        // Check expecetd hours
        cy.getByDataCy('cardHours')
          .should('contain', '9.70 out of class')
          .should('contain', '10.83 in class');

        // Check description is present
        cy.getByDataCy('cardDescription')
          .should('contain', exampleClass.description);

        // Check that prereqs is functional
        cy.getByDataCy('cardPrereqs')
          .should('contain', 'Select either')
          .within(() => {
            // Prereqs are ordered with those not in catalog displayed last
            // This ordering expected and used to determine where to click

            // Click on first prereq (not permission of instructor)
            cy.getByDataCy('singleScroller10.26prereq0')
              .within(() => {
                cy.getByDataCy('subjectInScroller0')
                  .click();
              });

            // Click on first prereq within expansion (the big list)
            cy.getByDataCy('singleScroller10.26prereq0.0')
              .within(() => {
                cy.getByDataCy('subjectInScroller0')
                  .click();
              });

            // Click on second prereq within expansion (list of 5.* classes)
            cy.getByDataCy('singleScroller10.26prereq0.0.0')
              .within(() => {
                cy.getByDataCy('subjectInScroller1')
                  .click();
              });

            // Check that 5.352 is present on this level
            cy.getByDataCy('singleScroller10.26prereq0.0.0.1')
              .within(() => {
                cy.getByDataCy('subjectInScroller1')
                  .should('contain', '5.352');
              });

            // Close the last level (5.* classes)
            cy.getByDataCy('closeButton10.26prereq0.0.0.1')
              .click();

            // Check that it has been closed
            cy.getByDataCy('singleScroller10.26prereq0.0.0.1')
              .should('not.exist');

            // Close all expansions
            cy.getByDataCy('closeButton10.26prereq0.0')
              .click();

            // Check remaining expansions are closed
            cy.getByDataCy('singleScroller10.26prereq0.0.0')
              .should('not.exist');

            cy.getByDataCy('singleScroller10.26prereq0.0')
              .should('not.exist');
          });

        // Check that related subjects are present
        cy.getByDataCy('cardRelatedSubjects')
          .within(() => {
            cy.getByDataCy('subjectInScroller3')
              .should('contain', '6.914');
          });
      });
  });

  it('Opens class in class info card by clicking in audit', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', []);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/', girs);

    cy.visit('/');

    // Open girs in audit
    cy.getByDataCy('auditItemgirs')
      .click();

    // Open science requirements
    cy.getByDataCy('auditItemgirs.0')
      .click();

    // Click on chemistry requirement
    cy.getByDataCy('auditItemgirs.0.4')
      .click();

    // Check that card opened to chemistry GIR
    cy.getByDataCy('classInfoCard')
      .within(() => {
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Generic Chemistry GIR');
      });
  });

  it('Opens class in class info card by clicking in road', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          'subject_id': '3.010',
          'title': 'Structure of Materials',
          'offered_fall': true,
          'offered_spring': true
        }
      ]
    );

    cy.visit('/');

    // Search for class
    cy.getByDataCy('classSearchInput')
      .type('3.010');

    // Drag 3.010 into Freshman Spring
    cy.dragAndDrop('[data-cy="classInSearch3_010"]',
      '[data-cy="road_$defaultroad$__semester_3_dropZone"]',
      0, 0);

    // Click on class in semester
    cy.getByDataCy('road_$defaultroad$__semester_3').within(() => {
      cy.getByDataCy('classInSemester3_3_010')
        .click();
    });

    // Check that the class is open in class info card
    cy.getByDataCy('classInfoCard')
      .within(() => {
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Structure of Materials');
      });
  });

  it('Opens class in class info card by clicking in card', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        exampleClass,
        {
          'subject_id': '10.00',
          'title': 'Molecule Builders',
          'offered_fall': true,
          'offered_spring': true
        }
      ]
    );

    cy.visit('/');

    // Search for 10.26 class
    cy.getByDataCy('classSearchInput')
      .type('10.26');

    // Click on 10.26 in search results
    cy.getByDataCy('classInSearch10_26')
      .click();

    cy.getByDataCy('classInfoCard')
      .within(() => {
        // Check that card opened to 10.26
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Chemical Engineering Projects Laboratory');

        // Click on 5th related subject, 10.10
        cy.getByDataCy('cardRelatedSubjects')
          .within(() => {
            cy.getByDataCy('subjectInScroller4')
              .click();
          });

        // Check that card opened to 10.10
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Molecule Builders');
      });
  });

  it('Allows the user to go back in class info card history', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          'subject_id': '14.21',
          'title': 'Health Economics',
          'offered_fall': true,
          'offered_spring': true
        },
        {
          'subject_id': '18.100A',
          'title': 'Real Analysis',
          'offered_fall': true,
          'offered_spring': true
        }
      ]
    );

    cy.visit('/');

    // Search for class
    cy.getByDataCy('classSearchInput')
      .type('14.21');

    // Drag 14.21 into Freshman Fall
    cy.dragAndDrop('[data-cy="classInSearch14_21"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0, 0);

    // Add another class to semester
    cy.getByDataCy('classSearchInput')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
      .type('18.100A');

    // Drag 14.21 into Freshman Fall
    cy.dragAndDrop('[data-cy="classInSearch18_100A"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0, 0);

    // Click on class in semester
    cy.getByDataCy('road_$defaultroad$__semester_1').within(() => {
      cy.getByDataCy('classInSemester1_14_21')
        .click();
    });

    // Check that it's in the class info card
    cy.getByDataCy('classInfoCard')
      .within(() => {
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Health Economics');
      });

    // Click on class in semester
    cy.getByDataCy('road_$defaultroad$__semester_1').within(() => {
      cy.getByDataCy('classInSemester1_18_100A')
        .click();
    });

    // Check that it's in the class info card
    cy.getByDataCy('classInfoCard')
      .within(() => {
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Real Analysis');
      });

    // Click back button
    cy.getByDataCy('cardPreviousButton')
      .click();

    // Check that previous class is in class info card
    cy.getByDataCy('classInfoCard')
      .within(() => {
        cy.getByDataCy('cardSubjectTitle')
          .should('contain', 'Health Economics');
      });
  });
});
