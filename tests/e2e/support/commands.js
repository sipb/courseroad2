// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import 'cypress-file-upload';
import girs from '../assets/reqs_girs.js';
import major16 from '../assets/reqs_16.js';
import major21M1 from '../assets/reqs_21m_1.js';
import reqs from '../assets/list_reqs.js';
import { objectSlice } from '../support/utilities.js';
import syncRoadData from '../assets/sync_roads.js';

Cypress.Commands.add('getByDataCy', (selector, ...args) => {
  return cy.get(`[data-cy='${selector}']`, ...args);
});

Cypress.Commands.add('getByDataCyPattern', (modifier, selector, ...args) => {
  return cy.get(`[data-cy${modifier}=${selector}]`, ...args);
});

Cypress.Commands.add('store', () => cy.window().its('app.$store'));

Cypress.Commands.add('resetStore', () => {
  cy.store().invoke('commit', 'resetState');
  cy.store()
    .its('cookiesAllowed')
    .should('eq', undefined);
});

Cypress.Commands.add('dragAndDrop', (subject, target, dragIndex, dropIndex) => {
  const dataTransfer = new DataTransfer();

  cy.get(subject)
    .eq(dragIndex)
    .trigger('pointerdown', { which: 1, button: 0 })
    .trigger('dragstart', { dataTransfer: dataTransfer });

  cy.get(target)
    .eq(dropIndex)
    .trigger('dragenter', { dataTransfer: dataTransfer })
    .trigger('dragover', { dataTransfer: dataTransfer })
    .trigger('drop', { dataTransfer: dataTransfer });
});

Cypress.Commands.add('setupAuth', (code, accessToken) => {
  /**
      Sets up a mocked auth to test site while logged in
      By default user has 3 roads: 123, 456, 1089
      Parameters:
      code [string] : Mocked code for user
      accessToken [string] : Fake auth token for user
    */

  // Fake authorization data
  const fakeAccessInfo = {
    academic_id: 'tester@mit.edu',
    access_token: accessToken,
    current_semester: 4,
    success: true,
    username: '893465234'
  };

  // Mock the requirements routes
  cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/courses/all?full=true', []);
  cy.route(
    'POST',
    Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/girs/',
    girs
  );
  cy.route(
    'POST',
    Cypress.env('VUE_APP_FIREROAD_URL') + '/requirements/progress/major21M-1/',
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
    Cypress.env('VUE_APP_FIREROAD_URL') + '/fetch_token/?code=' + code,
    {
      success: true,
      access_info: fakeAccessInfo
    }
  );

  // Mock verify route
  cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/verify', {
    current_semester: 4,
    success: true
  });

  // Mock cgi people directory script
  cy.route('/cgi-bin/people.py?kerb=tester', { year: 1 });

  // Mock road syncing
  cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads', {
    files: syncRoadData.files,
    success: true
  });

  cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads/?id=123', {
    file: syncRoadData.file123,
    success: true
  });

  cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads/?id=456', {
    file: syncRoadData.file456,
    success: true
  });

  cy.route(Cypress.env('VUE_APP_FIREROAD_URL') + '/sync/roads/?id=1089', {
    file: syncRoadData.file1089,
    success: true
  });
});

Cypress.Commands.add('login', code => {
  /**
   * Mocks login redirect and logs in
   * Assumes you have just called cy.visit('/') and cy.setupAuth(accessToken)
   * Params:
   * code [string] : Mocked code for user
   */

  // Prevent redirecting to Fireroad to login
  // Check that window location is correct and redirect back with fake code
  // (This is what Fireroad would do)
  cy.window().then(window => {
    cy.stub(window, 'setLocationHref', url => {
      // Expect to login via fireroad
      expect(url).to.equal(
        Cypress.env('VUE_APP_FIREROAD_URL') +
        '/login/?redirect=' +
        Cypress.env('VUE_APP_URL')
      );
      // Redirect with a fake code
      window.location.search = 'code=' + code;
    });
  });

  // Click login button
  cy.getByDataCy('loginButton').click();
});

// // Uncomment for help debugging
// Cypress.on('uncaught:exception', (err, runnable) => {
//   // returning false here prevents Cypress from
//   // failing the test
//   console.log(err);
//   return false
// });

Cypress.on('window:before:load', win => {
  cy.stub(win.console, 'error', msg => {
    cy.now('task', 'error', msg);
  });

  cy.stub(win.console, 'warn', msg => {
    cy.now('task', 'warn', msg);
  });
});
