import exampleSubjects from '../assets/example_road_subjs.js';
import girs from '../assets/reqs_girs.js';
import major21M1 from '../assets/reqs_21m_1.js';
import reqs from '../assets/list_reqs.js';
import { objectSlice } from '../support/utilities.js';
import syncedRoads from '../assets/sync_roads.js';

const path = require('path');

describe('Road tests', () => {
  it('Adds, renames, and deletes roads', () => {
    cy.visit('/');

    // Click add road button
    cy.getByDataCy('addRoadButton')
      .click();

    // Add road named "Test Road abc"
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('newRoadName')
          .type('Test Road abc');

        cy.getByDataCy('createRoadButton')
          .click();
      });

    // Select "Test Road abc" tab and click edit button
    cy.getByDataCyPattern('^', 'roadTab')
      .contains('Test Road abc', { matchCase: false })
      .within(() => {
        cy.getByDataCy('editRoadButton')
          .click();
      });

    // Rename to "Test Road 123"
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('renameRoadField')
          .type('{backspace}{backspace}{backspace}')
          .type('123');

        cy.getByDataCy('editRoadSubmitButton')
          .click();
      });

    // Select "Test Road 123" tab and click edit button
    cy.getByDataCyPattern('^', 'roadTab')
      .contains('Test Road 123', { matchCase: false })
      .within(() => {
        cy.getByDataCy('editRoadButton')
          .click();
      });

    // Click delete road button
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('deleteRoadButton')
          .click();
      });

    // Confirm deletion of road
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('deleteRoadConfirmButton')
          .click();
      });

    // Confirm road is gone
    cy.getByDataCyPattern('^', 'roadTab')
      .should('have.length', 1)
      .contains('Test Road 123', { matchCase: false })
      .should('not.exist');
  });

  it('Duplicates roads', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          subject_id: '3.45',
          title: 'Magnetic Materials',
          offered_fall: true,
          offered_spring: true
        },
        {
          subject_id: '7.46',
          title: 'Building with Cells',
          offered_fall: true,
          offered_spring: true
        }
      ]
    );

    cy.visit('/');

    // Add 3.45 to default road
    cy.getByDataCy('classSearchInput')
      .type('3.45');

    cy.dragAndDrop('[data-cy="classInSearch3_45"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0, 0);

    cy.getByDataCy('classSearchInput')
      .click();

    // Click add new road button
    cy.getByDataCy('addRoadButton')
      .click();

    // Add new road with name "Duplicate Test Road"
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('newRoadName')
          .type('Duplicate Test Road');

        cy.get('.v-input[data-cy="duplicateSwitch"]')
          .click();

        cy.get('.v-select')
          .click();
      });

    // Select duplicate source to be "My First Road"
    cy.get('.v-menu__content.menuable__content__active')
      .within(() => {
        cy.get('.v-list__tile')
          .contains('My First Road')
          .click();
      });

    // Submit to create new road
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('createRoadButton')
          .click();
      });

    // Identify road ID and ensure we are clicked to that road tab
    cy.getByDataCyPattern('^', 'roadTab')
      .contains('Duplicate Test Road', { matchCase: false })
      .parent()
      .then((el) => {
        const dataCy = el.eq(0).attr('data-cy');
        const roadID = dataCy.substring(dataCy.indexOf('roadTab') + 7);
        return roadID;
      })
      .as('roadID')
      .then(function () {
        cy.getByDataCy('roadTab' + this.roadID)
          .click();
      });

    // Ensure 3.45 is in duplicated road
    cy.get('@roadID').then((roadID) => {
      cy.getByDataCy('road_' + roadID + '__semester_1')
        .within(() => {
          cy.getByDataCy('classInSemester1_3_45')
            .should('exist');
        });
    });

    // Go back to default road
    cy.getByDataCy('roadTab$defaultroad$')
      .click();

    // Add 7.46 to default road
    cy.getByDataCy('classSearchInput')
      .type('{backspace}{backspace}{backspace}{backspace}')
      .type('7.46');

    cy.dragAndDrop('[data-cy="classInSearch7_46"]',
      '[data-cy="road_$defaultroad$__semester_3_dropZone"]',
      0, 0);

    // Check that 3.45 and 7.46 are in default road
    cy.getByDataCy('road_$defaultroad$__semester_1')
      .within(() => {
        cy.getByDataCy('classInSemester1_3_45')
          .should('exist');
      });

    cy.getByDataCy('road_$defaultroad$__semester_3')
      .within(() => {
        cy.getByDataCy('classInSemester3_7_46')
          .should('exist');
      });

    // Check that 3.45 but NOT 7.46 is in the duplicated road
    cy.get('@roadID').then((roadID) => {
      cy.getByDataCy('roadTab' + roadID)
        .click();

      cy.getByDataCy('road_' + roadID + '__semester_1')
        .within(() => {
          cy.getByDataCy('classInSemester1_3_45')
            .should('exist');
        });

      cy.getByDataCy('road_' + roadID + '__semester_3')
        .within(() => {
          cy.getByDataCy('classInSemester3_7_46')
            .should('not.exist');
        });
    });
  });

  it('Imports roads', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', exampleSubjects);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/', girs);
    // Mock stripped down version of requirements
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/master6-P/', {
      'title-no-degree': 'Electrical Engineering and Computer Science',
      'list-id': 'master6-P.reql',
      percent_fulfilled: 0,
      fulfilled: false,
      reqs: []
    });
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/minor18/', {
      'title-no-degree': 'Mathematics',
      'list-id': 'minor18.reql',
      percent_fulfilled: 0,
      fulfilled: false,
      reqs: []
    });
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major6-2/', {
      'title-no-degree': 'Electrical Engineering and Computer Science',
      'list-id': 'major6-2.reql',
      percent_fulfilled: 0,
      fulfilled: false,
      reqs: []
    });

    cy.visit('/');

    cy.getByDataCy('importRoadButton')
      .click();

    cy.get('.v-dialog--active')
      .within(() => {
        const roadFilePath = '../assets/example.road';

        cy.getByDataCy('importRoadFileInput')
          .attachFile(roadFilePath);

        cy.getByDataCy('importRoadTitle')
          .clear()
          .type('My Imported Road');

        cy.getByDataCy('importRoadSubmitButton')
          .click();
      });

    // Identify road ID and ensure we are clicked to that road tab
    cy.getByDataCyPattern('^', 'roadTab')
      .contains('My Imported Road', { matchCase: false })
      .parent()
      .then((el) => {
        const dataCy = el.eq(0).attr('data-cy');
        const roadID = dataCy.substring(dataCy.indexOf('roadTab') + 7);
        return roadID;
      })
      .as('roadID')
      .then(function () {
        cy.getByDataCy('roadTab' + this.roadID)
          .click();
      });

    // Check that a representative sample of classes is there
    cy.get('@roadID').then((roadID) => {
      cy.getByDataCy('roadTab' + roadID)
        .click();

      cy.getByDataCy('road_' + roadID + '__semester_0')
        .within(() => {
          cy.getByDataCy('classInSemester0_8_01')
            .should('exist');
        });

      cy.getByDataCy('road_' + roadID + '__semester_4')
        .within(() => {
          cy.getByDataCy('classInSemester4_6_002')
            .should('exist');
        });

      cy.getByDataCy('road_' + roadID + '__semester_4')
        .within(() => {
          cy.getByDataCy('classInSemester4_21M_080')
            .should('exist');
        });

      cy.getByDataCy('road_' + roadID + '__semester_7')
        .within(() => {
          cy.getByDataCy('classInSemester7_18_100A')
            .should('exist');
        });

      cy.getByDataCy('road_' + roadID + '__semester_15')
        .within(() => {
          cy.getByDataCy('classInSemester15_6_839')
            .should('exist');
        });
    });

    cy.getByDataCy('auditItemgirs')
      .should('exist');

    cy.getByDataCy('auditItemmaster6-P')
      .should('exist');

    cy.getByDataCy('auditItemminor18')
      .should('exist');

    cy.getByDataCy('auditItemmajor6-2')
      .should('exist');
  });

  it('Exports roads', () => {
    // Set up downloads
    cy.task('clearDownloads');

    const downloadsFolder = 'tests/e2e/downloads';

    console.log(Cypress.browser);
    if (Cypress.browser.family !== 'firefox') {
      cy.log('Page.setDownloadBehavior');
      cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
          command: 'Page.setDownloadBehavior',
          params: { behavior: 'allow', downloadPath: downloadsFolder }
        }),
        { log: false }
      );
    }

    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/', girs);
    cy.route('POST', Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major21M-1/', major21M1);
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/list_reqs/',
      objectSlice(reqs, ['girs', 'major21M-1']));
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          subject_id: '12.001',
          title: 'Introduction to Geology',
          offered_fall: true,
          offered_spring: true
        },
        {
          subject_id: '17.01',
          title: 'Justice',
          offered_fall: true,
          offered_spring: true
        }
      ]
    );

    cy.visit('/');

    // Open Sophomore IAP semester
    cy.getByDataCy('road_$defaultroad$__semester_5')
      .click();

    // Add 17.01 to Sophomore IAP
    cy.getByDataCy('classSearchInput')
      .type('17.01');

    cy.dragAndDrop('[data-cy="classInSearch17_01"]',
      '[data-cy="road_$defaultroad$__semester_5_dropZone"]',
      0, 0);

    // Add 12.001 to Sophomore Spring
    cy.getByDataCy('classSearchInput')
      .clear()
      .type('12.001');

    cy.dragAndDrop('[data-cy="classInSearch12_001"]',
      '[data-cy="road_$defaultroad$__semester_6_dropZone"]',
      0, 0);

    // Add 21M-1 major
    cy.getByDataCy('auditMajorChips')
      .type('21M{enter}{backspace}{backspace}{backspace}{esc}');

    cy.getByDataCy('auditItemmajor21M-1')
      .should('exist');

    // Click to export road
    cy.getByDataCy('exportRoadButton')
      .click();

    const filename = path.join(downloadsFolder, 'My First Road.road');

    // Check downloaded road is accurate
    cy.readFile(filename, { timeout: 15000 })
      .should((file) => {
        const road = JSON.parse(file);

        expect(road.coursesOfStudy).to.deep.equal(['girs', 'major21M-1']);
        expect(road.selectedSubjects).to.have.lengthOf(2);
        expect(road.selectedSubjects[0].subject_id).to.equal('17.01');
        expect(road.selectedSubjects[1].subject_id).to.equal('12.001');
      });
  });

  it('Loads correct road based on url (Logged Out)', () => {
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      [
        {
          subject_id: '3.45',
          title: 'Magnetic Materials',
          offered_fall: true,
          offered_spring: true
        },
        {
          subject_id: '7.46',
          title: 'Building with Cells',
          offered_fall: true,
          offered_spring: true
        }
      ]
    );
    cy.visit('/');

    // Add 3.45 to default road
    cy.getByDataCy('classSearchInput')
      .type('3.45');

    cy.dragAndDrop('[data-cy="classInSearch3_45"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0, 0);

    cy.getByDataCy('classSearchInput')
      .click();

    // Click add new road button
    cy.getByDataCy('addRoadButton')
      .click();

    // Add road named "Test Road - Router"
    cy.get('.v-dialog--active')
      .within(() => {
        cy.getByDataCy('newRoadName')
          .type('Test Road - Router');

        cy.getByDataCy('createRoadButton')
          .click();
      });

    // Identify road ID and ensure we are clicked to that road tab
    cy.getByDataCyPattern('^', 'roadTab')
      .contains('Test Road - Router', { matchCase: false })
      .parent()
      .then((el) => {
        const dataCy = el.eq(0).attr('data-cy');
        const roadID = dataCy.substring(dataCy.indexOf('roadTab') + 7);
        return roadID;
      })
      .as('roadID')
      .then(function () {
        cy.getByDataCy('roadTab' + this.roadID)
          .click();

        // Add 7.46 to 'Test Road - Router'
        cy.getByDataCy('classSearchInput')
          .type('{backspace}{backspace}{backspace}{backspace}')
          .type('7.46');

        cy.dragAndDrop('[data-cy="classInSearch7_46"]',
          `[data-cy="road_${this.roadID}__semester_1_dropZone"]`,
          0, 0);

        cy.getByDataCy('classSearchInput')
          .click();
      });

    cy.get('@roadID')
      .then(roadID => {
        cy.visit(`/road/${roadID}`);
        cy.url().should('include', `/road/${roadID}`);

        // Ensure 7.46 in Router Road
        cy.getByDataCy(`road_${roadID}__semester_1`)
          .within(() => {
            cy.getByDataCy('classInSemester1_7_46')
              .should('be.visible');
          });
      });

    cy.visit('/');
    // Ensure 3.45 in default road
    cy.getByDataCy('road_$defaultroad$__semester_1')
      .within(() => {
        cy.getByDataCy('classInSemester1_3_45')
          .should('exist');
      });
  });

  it('Loads correct road based on url (Logged In)', () => {
    const fakeCode = 'abcdefg';
    const fakeAccessToken = 'jGWHEO2IfpdSEt1dyDkf';
    cy.setupAuth(fakeCode, fakeAccessToken);
    cy.visit('/');
    cy.login(fakeCode);

    // Should be file 123, which contains 14.03
    const defaultRoadId = Object.keys(syncedRoads.files)[0];

    // Test whether the site navigates to the correct road based on the url and loads its content
    const testRoad = syncedRoads.file456;
    cy.visit(`/road/${testRoad.id}`);
    cy.url().should('include', `/road/${testRoad.id}`);

    // Ensure 6.042 in test road semester 3
    cy.getByDataCy(`road_${testRoad.id}__semester_3`)
      .within(() => {
        cy.getByDataCy('classInSemester3_6_042')
          .should('exist');
      });

    // Test whether default road gets correctly loaded when no road id given
    cy.visit('/');
    // Ensure 14.03 in default road
    cy.getByDataCy(`road_${defaultRoadId}__semester_1`)
      .within(() => {
        cy.getByDataCy('classInSemester1_14_03')
          .should('exist');
      });
  });

  it('Handles unknown road ids in url correctly (Logged Out)', () => {
    // Two things should occur, the user is redirected to the default road
    // and the url shows the id of the default road instead of the unknown road
    cy.visit('/');

    const randomId = 909258;
    cy.visit(`/road/${randomId}`);

    cy.url().should('not.include', `/road/${randomId}`);
    cy.url().should('include', '/road/$defaultroad$');
  });

  it('Handles unknown road ids in url correctly (Logged In)', () => {
    // Two things should occur, the user is redirected to the default road
    // and the url shows the id of the default road instead of the unknown road
    const fakeCode = 'abcdefg';
    const fakeAccessToken = 'jGWHEO2IfpdSEt1dyDkf';
    cy.setupAuth(fakeCode, fakeAccessToken);
    cy.visit('/');
    cy.login(fakeCode);

    const randomId = 909258;
    cy.visit(`/road/${randomId}`);

    // Should be the road that is defaulted to when no road id is specified
    const defaultRoadId = Object.keys(syncedRoads.files)[0];
    cy.url().should('include', `/road/${defaultRoadId}`);
  });
});
