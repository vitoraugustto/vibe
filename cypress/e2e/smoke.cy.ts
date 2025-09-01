/// <reference types="@cypress/grep" />

describe('Smoke Test', { tags: '@smoke' }, () => {
  it('should load the home page', { tags: '@smoke' }, () => {
    cy.visit('/');
    cy.contains('Next.js'); 
  });
});
