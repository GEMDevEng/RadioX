// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  
  // Intercept the login API call
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      userId: '123',
      name: 'Test User',
      email: email || 'test@example.com',
      token: 'fake-jwt-token'
    }
  }).as('loginRequest');
  
  // Fill form with credentials
  cy.get('input[name="email"]').type(email || 'test@example.com');
  cy.get('input[name="password"]').type(password || 'password123');
  cy.get('button[type="submit"]').click();
  
  // Wait for the API call
  cy.wait('@loginRequest');
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
