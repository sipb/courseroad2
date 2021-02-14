import girs from '../assets/reqs_girs.js';
import major16 from '../assets/reqs_16.js';
import major21M1 from '../assets/reqs_21m_1.js';
import reqs from '../assets/list_reqs.js';
import { objectSlice } from '../support/utilities.js';
import syncRoadData from '../assets/sync_roads.js';

// Fake authorization data
const fakeCode = 'abcdefg';
const fakeAccessToken = 'jGWHEO2IfpdSEt1dyDkf';
const fakeAccessInfo = {
  academic_id: 'tester@mit.edu',
  access_token: fakeAccessToken,
  current_semester: 4,
  success: true,
  username: '893465234'
};

describe('Auth Tests', () => {
  beforeEach(() => {
    // Mock the requirements routes
    cy.route(
      Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true',
      []
    );
    cy.route(
      'POST',
      Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/',
      girs
    );
    cy.route(
      'POST',
      Cypress.env('VUE_APP_FIREROAD_URL') +
        '/requirements/progress/major21M-1/',
      major21M1
    );
    cy.route(
      'POST',
      Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major16/',
      major16
    );
    cy.route(
      Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/list_reqs/',
      objectSlice(reqs, ['girs', 'major21M-1', 'major16'])
    );

    // Mock getting an authorization token from a code through Fireroad
    cy.route(
      Cypress.env('VUE_APP_FIREROAD_URL') + '/fetch_token/?code=' + fakeCode,
      {
        success: true,
        access_info: fakeAccessInfo
      }
    ).as('fetchToken');

    // Mock verify route
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/verify', {
      current_semester: 4,
      success: true
    }).as('verify');

    // Mock cgi people directory script
    cy.route('/cgi-bin/people.py?kerb=tester', { year: 1 }).as('getYear');

    // Mock road syncing
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads', {
      files: syncRoadData.files,
      success: true
    }).as('syncRoads');

    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads/?id=123', {
      file: syncRoadData.file123,
      success: true
    }).as('syncRoad123');

    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads/?id=456', {
      file: syncRoadData.file456,
      success: true
    }).as('syncRoad456');

    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads/?id=1089', {
      file: syncRoadData.file1089,
      success: true
    }).as('syncRoad1089');
  });

  it('Logs in and out', () => {
    cy.visit('/');

    cy.login(fakeCode);

    // Ensure correct headers are set
    cy.wait('@verify').then(req => {
      expect(req.request.headers.Authorization).to.equal(
        'Bearer ' + fakeAccessToken
      );
    });

    cy.wait('@syncRoads').then(req => {
      expect(req.request.headers.Authorization).to.equal(
        'Bearer ' + fakeAccessToken
      );
    });

    // Check road 123 has loaded
    cy.getByDataCy('roadTab123')
      .should('contain', 'Best Road Ever')
      .click();

    // Check road 123 contains correct classes
    cy.getByDataCy('road_123__semester_1').within(() => {
      cy.getByDataCy('classInSemester1_14_03').should('exist');
    });

    // Check road 123 contains correct majors
    cy.getByDataCy('auditItemgirs').should('contain', 'GIRs');

    // Check road 456 has loaded
    cy.getByDataCy('roadTab456')
      .should('contain', 'A Good Road')
      .click();

    // Check road 456 contains correct classes
    cy.getByDataCy('road_456__semester_4').within(() => {
      cy.getByDataCy('classInSemester4_21M_080').should('exist');
    });

    cy.getByDataCy('road_456__semester_3').within(() => {
      cy.getByDataCy('classInSemester3_6_042').should('exist');
    });

    // Check road 456 doesn't contain class from other road
    cy.getByDataCy('road_456__semester_1').within(() => {
      cy.getByDataCy('classInSemester1_14_03').should('not.exist');
    });

    // Check road 456 contains correct majors
    cy.getByDataCy('auditItemgirs').should('contain', 'GIRs');

    cy.getByDataCy('auditItemmajor21M-1').should('contain', 'Music');

    // Check that road 1089 has been loaded
    cy.getByDataCy('roadTab1089')
      .should('contain', 'Example')
      .click();

    // Check that road 1089 contains the correct classes
    cy.getByDataCy('road_1089__semester_1').within(() => {
      cy.getByDataCy('classInSemester1_18_02').should('exist');
    });

    cy.getByDataCy('road_1089__semester_2').within(() => {
      cy.getByDataCy('classInSemester2_8_01').should('exist');
    });

    // Check that road 1089 contains the correct majors
    cy.getByDataCy('auditItemgirs').should('contain', 'GIRs');

    cy.getByDataCy('auditItemmajor16').should(
      'contain',
      'Aerospace Engineering'
    );

    // Log out
    cy.getByDataCy('logoutButton').click();

    // Check that there's only one road and it's the default road
    cy.getByDataCyPattern('^', 'roadTab')
      .should('have.length', 1)
      .should('contain', 'My First Road');

    // Check that there's no classes
    cy.getByDataCyPattern('^', 'classInSemester').should('not.exist');

    // Check that the login button is there
    cy.getByDataCy('loginButton').should('exist');
  });

  it('Logs in after creating a road', () => {
    // Add some classes to course catalog
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', [
      {
        subject_id: '3.042',
        title: 'Materials Project Laboratory',
        offered_fall: true,
        offered_spring: true
      },
      {
        subject_id: '3.048',
        title: 'Advanced Materials Processing',
        offered_fall: true,
        offered_spring: true
      },
      {
        subject_id: '3.07',
        title: 'Introduction to Ceramics',
        offered_fall: true,
        offered_spring: true
      }
    ]);

    cy.visit('/');

    // Search for course 3 classes
    cy.getByDataCy('classSearchInput').type('3.');

    // Drag some classes into the road
    cy.dragAndDrop(
      '[data-cy="classInSearch3_042"]',
      '[data-cy="road_$defaultroad$__semester_1_dropZone"]',
      0,
      0
    );

    cy.dragAndDrop(
      '[data-cy="classInSearch3_048"]',
      '[data-cy="road_$defaultroad$__semester_3_dropZone"]',
      0,
      0
    );

    cy.dragAndDrop(
      '[data-cy="classInSearch3_07"]',
      '[data-cy="road_$defaultroad$__semester_3_dropZone"]',
      0,
      0
    );

    // Add major 16
    cy.getByDataCy('auditMajorChips').type(
      '16{enter}{backspace}{backspace}{esc}'
    );

    cy.login(fakeCode);

    // Make sure all 4 roads exist
    cy.getByDataCy('roadTab123').should('exist');

    cy.getByDataCy('roadTab456').should('exist');

    cy.getByDataCy('roadTab1089').should('exist');

    // Click to My First Road
    cy.getByDataCyPattern('^', 'roadTab')
      .should('have.length', 4)
      .contains('My First Road')
      .click();

    // Make sure right classes are there
    cy.getByDataCy('classInSemester1_3_042')
      .should('be.visible')
      .should('have.length', 1);

    cy.getByDataCy('classInSemester3_3_048')
      .should('be.visible')
      .should('have.length', 1);

    cy.getByDataCy('classInSemester3_3_07')
      .should('be.visible')
      .should('have.length', 1);

    // Make sure correct major is there
    cy.getByDataCy('auditItemmajor16').should(
      'contain',
      'Aerospace Engineering'
    );
  });

  it('Logs in after creating a road with a conflicting name', () => {
    // Add some classes to course catalog
    cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', [
      {
        subject_id: '15.000',
        title: 'Explorations in Management',
        offered_fall: true,
        offered_spring: true
      },
      {
        subject_id: '15.021',
        title: 'Real Estate Economics',
        offered_fall: true,
        offered_spring: true
      },
      {
        subject_id: '15.036',
        title: 'Dimensions of Geoengineering',
        offered_fall: true,
        offered_spring: true
      }
    ]);

    cy.visit('/');

    // Search for course 3 classes
    cy.getByDataCy('classSearchInput').type('15.');

    // Drag some classes into the road
    cy.dragAndDrop(
      '[data-cy="classInSearch15_000"]',
      '[data-cy="road_$defaultroad$__semester_6_dropZone"]',
      0,
      0
    );

    cy.dragAndDrop(
      '[data-cy="classInSearch15_036"]',
      '[data-cy="road_$defaultroad$__semester_7_dropZone"]',
      0,
      0
    );

    cy.dragAndDrop(
      '[data-cy="classInSearch15_021"]',
      '[data-cy="road_$defaultroad$__semester_9_dropZone"]',
      0,
      0
    );

    // Add major 16
    cy.getByDataCy('auditMajorChips').type(
      '21M{enter}{backspace}{backspace}{backspace}{esc}'
    );

    // Select "My First Road" tab and click edit button
    cy.getByDataCy('roadTab$defaultroad$').within(() => {
      cy.getByDataCy('editRoadButton').click();
    });

    // Rename to "A Good Road"
    cy.get('.v-dialog--active').within(() => {
      cy.getByDataCy('renameRoadField')
        .clear()
        .type('A Good Road');

      cy.getByDataCy('editRoadSubmitButton').click();
    });

    cy.login(fakeCode);

    // Make sure all 4 roads exist
    cy.getByDataCy('roadTab123').should('exist');

    cy.getByDataCy('roadTab456').should('exist');

    cy.getByDataCy('roadTab1089').should('exist');

    // Click to My First Road
    cy.getByDataCyPattern('^', 'roadTab')
      .should('have.length', 4)
      .contains('A Good Road (2)')
      .click();

    // Make sure right classes are there
    cy.getByDataCy('classInSemester6_15_000')
      .should('be.visible')
      .should('have.length', 1);

    cy.getByDataCy('classInSemester7_15_036')
      .should('be.visible')
      .should('have.length', 1);

    cy.getByDataCy('classInSemester9_15_021')
      .should('be.visible')
      .should('have.length', 1);

    // Make sure correct major is there
    cy.getByDataCy('auditItemmajor21M-1').should('contain', 'Music');
  });
});
