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

Cypress.Commands.add('getByDataCy', (selector, ...args) => {
  return cy.get(`[data-cy='${selector}']`, ...args);
});

Cypress.Commands.add('getByDataCyPattern', (modifier, selector, ...args) => {
  return cy.get(`[data-cy${modifier}=${selector}]`, ...args);
});

Cypress.Commands.add('store', () =>
  cy.window().its('app.$store')
);

Cypress.Commands.add('resetStore', () => {
  cy.store().invoke('commit', 'resetState');
  cy.store().its('cookiesAllowed').should('eq', undefined);
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

// Uncomment for help debugging
// Cypress.on('uncaught:exception', (err, runnable) => {
//   // returning false here prevents Cypress from
//   // failing the test
//   return false
// });
