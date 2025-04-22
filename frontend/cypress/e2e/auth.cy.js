describe('Authentication', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should redirect to login page when not authenticated', () => {
    // Try to access a protected route
    cy.visit('/dashboard');
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
  });

  it('should display validation errors on login form', () => {
    cy.visit('/login');
    
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should display validation errors
    cy.get('input:invalid').should('have.length', 2);
    
    // Fill email only
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    
    // Should still have one invalid field
    cy.get('input:invalid').should('have.length', 1);
  });

  it('should display error message for invalid credentials', () => {
    cy.visit('/login');
    
    // Intercept the login API call
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginRequest');
    
    // Fill form with invalid credentials
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@loginRequest');
    
    // Should display error message
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should login successfully and redirect to dashboard', () => {
    cy.visit('/login');
    
    // Intercept the login API call
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        token: 'fake-jwt-token'
      }
    }).as('loginRequest');
    
    // Fill form with valid credentials
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@loginRequest');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should display user name
    cy.contains('Welcome back, Test User!').should('be.visible');
  });

  it('should register a new user', () => {
    cy.visit('/register');
    
    // Intercept the register API call
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        userId: '123',
        name: 'New User',
        email: 'new@example.com',
        token: 'fake-jwt-token'
      }
    }).as('registerRequest');
    
    // Fill registration form
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@registerRequest');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should logout successfully', () => {
    // Set token in localStorage to simulate logged in state
    cy.window().then((window) => {
      window.localStorage.setItem('token', 'fake-jwt-token');
    });
    
    // Intercept the user profile API call
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com'
      }
    }).as('profileRequest');
    
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Wait for profile request
    cy.wait('@profileRequest');
    
    // Click on user menu
    cy.get('[data-testid="user-menu"]').click();
    
    // Click logout button
    cy.contains('Logout').click();
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
    
    // Token should be removed from localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.be.null;
    });
  });
});
