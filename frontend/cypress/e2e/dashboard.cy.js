describe('Dashboard', () => {
  beforeEach(() => {
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
        email: 'test@example.com',
        xApiConnection: {
          connected: true,
          username: 'testuser'
        }
      }
    }).as('profileRequest');
    
    // Intercept the usage stats API call
    cy.intercept('GET', '/api/usage/stats', {
      statusCode: 200,
      body: {
        audioClips: 10,
        podcasts: 2,
        apiUsage: {
          postsUsed: 50,
          postsLimit: 500,
          postsPercentage: 10,
          readRequestsUsed: 25,
          readRequestsLimit: 100,
          readRequestsPercentage: 25,
          audioClipsCreated: 10,
          totalAudioDuration: 1200,
          totalStorageUsed: 24000000,
        },
        month: 5,
        year: 2023,
      }
    }).as('usageStatsRequest');
    
    // Intercept the audio clips API call
    cy.intercept('GET', '/api/audio/clips*', {
      statusCode: 200,
      body: {
        audioClips: [
          {
            _id: '1',
            title: 'Recent Audio Clip 1',
            duration: 120,
            createdAt: new Date().toISOString(),
            sourceType: 'post',
            playCount: 5,
          },
          {
            _id: '2',
            title: 'Recent Audio Clip 2',
            duration: 180,
            createdAt: new Date().toISOString(),
            sourceType: 'thread',
            playCount: 10,
          },
        ],
        pagination: {
          page: 1,
          limit: 5,
          total: 2,
          pages: 1,
        },
      }
    }).as('audioClipsRequest');
    
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Wait for API requests
    cy.wait(['@profileRequest', '@usageStatsRequest', '@audioClipsRequest']);
  });

  it('should display welcome message with user name', () => {
    cy.contains('Welcome back, Test User!').should('be.visible');
  });

  it('should display usage statistics', () => {
    // Check audio clips count
    cy.contains('Audio Clips').parent().contains('10').should('be.visible');
    
    // Check podcasts count
    cy.contains('Podcasts').parent().contains('2').should('be.visible');
    
    // Check API usage
    cy.contains('X Posts Usage').parent().contains('50 / 500').should('be.visible');
    cy.contains('Read Requests').parent().contains('25 / 100').should('be.visible');
  });

  it('should display recent audio clips', () => {
    cy.contains('Recent Audio Clips').should('be.visible');
    cy.contains('Recent Audio Clip 1').should('be.visible');
    cy.contains('Recent Audio Clip 2').should('be.visible');
  });

  it('should navigate to search page when clicking Search X Posts', () => {
    cy.contains('Search X Posts').click();
    cy.url().should('include', '/search');
  });

  it('should navigate to create page when clicking Create Audio Clip', () => {
    cy.contains('Create Audio Clip').click();
    cy.url().should('include', '/create');
  });

  it('should navigate to podcasts page when clicking Manage Podcasts', () => {
    cy.contains('Manage Podcasts').click();
    cy.url().should('include', '/podcasts');
  });

  it('should handle API error gracefully', () => {
    // Clear previous intercepts
    cy.intercept('GET', '/api/usage/stats', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('usageStatsError');
    
    // Reload the page
    cy.reload();
    
    // Wait for API request
    cy.wait('@usageStatsError');
    
    // Should display error message
    cy.contains('Error loading dashboard data').should('be.visible');
  });
});
