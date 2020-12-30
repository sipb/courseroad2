# How to write Cypress End-To-End Tests

## Basic Test Setup

To create a new set of tests, first create a "[test name].js" file under the
tests/e2e folder.  The general test will consist of a "describe" statement
with the test name, with "it" statements underneath that state specific things
that the application should do.  Within those "it" statements, buttons can
be clicked, text can be entered, etc into the overall application and
different properties can be checked - e.g. whether certain elements are present.

For example:

```javascript
describe('Basic Tests', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.contains('h3', 'C o u r s e R o a d');
  });
});
```

In this example, there is one basic tests that goes to the main application page
and checks for an h3 tag containing the CourseRoad logo.

## Resources

API queries from the [DOM testing library](https://testing-library.com/docs/dom-testing-library/api-queries) can be used to find elements.

[Cypress Documentation](https://docs.cypress.io/guides/references/best-practices.html) has details on best practices and the different types of
assertions that can be made about the application.
