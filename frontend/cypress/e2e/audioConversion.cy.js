describe('Audio Conversion Flow', () => {
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
        },
        apiUsage: {
          postsUsed: 10,
          postsLimit: 500,
          audioClipsCreated: 5
        }
      }
    }).as('profileRequest');
    
    // Intercept the search API call
    cy.intercept('GET', '/api/search/hashtag/*', {
      statusCode: 200,
      body: {
        posts: [
          {
            id: '1',
            text: 'This is a post about #AI and machine learning',
            user: {
              username: 'airesearcher',
              name: 'AI Researcher',
              profileImageUrl: 'https://example.com/profile.jpg'
            },
            likes: 150,
            reposts: 50,
            createdAt: new Date().toISOString(),
            url: 'https://x.com/airesearcher/status/1'
          },
          {
            id: '2',
            text: 'Another post about #AI technologies',
            user: {
              username: 'techguru',
              name: 'Tech Guru',
              profileImageUrl: 'https://example.com/profile2.jpg'
            },
            likes: 200,
            reposts: 75,
            createdAt: new Date().toISOString(),
            url: 'https://x.com/techguru/status/2'
          }
        ]
      }
    }).as('searchRequest');
    
    // Intercept the create audio API call
    cy.intercept('POST', '/api/audio/create', {
      statusCode: 201,
      body: {
        _id: 'audio123',
        title: 'AI Post Audio',
        duration: 30,
        fileUrl: 'https://example.com/audio.mp3',
        sourceType: 'post',
        sourceId: '1'
      }
    }).as('createAudioRequest');
    
    // Visit search page
    cy.visit('/search');
    
    // Wait for profile request
    cy.wait('@profileRequest');
  });
  
  it('should convert a post to audio successfully', () => {
    // Enter search term
    cy.get('input[placeholder*="Enter hashtag"]').type('ai');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchRequest');
    
    // Verify search results are displayed
    cy.contains('This is a post about #AI and machine learning').should('be.visible');
    cy.contains('Another post about #AI technologies').should('be.visible');
    
    // Select the first post
    cy.get('input[type="checkbox"]').first().check();
    
    // Click convert button
    cy.contains('button', 'Convert Selected').click();
    
    // Verify conversion modal is displayed
    cy.contains('Convert to Audio').should('be.visible');
    
    // Enter title
    cy.get('input[name="title"]').clear().type('AI Post Audio');
    
    // Select voice
    cy.get('select[name="voiceId"]').select('en-US-Standard-D');
    
    // Click create button
    cy.contains('button', 'Create Audio Clip').click();
    
    // Wait for create audio request
    cy.wait('@createAudioRequest');
    
    // Verify success message
    cy.contains('Audio clip created successfully').should('be.visible');
    
    // Verify redirect to audio player page
    cy.url().should('include', '/audio/audio123');
    
    // Verify audio player is displayed
    cy.contains('AI Post Audio').should('be.visible');
    cy.get('audio').should('exist');
  });
  
  it('should show error message when conversion fails', () => {
    // Override the create audio API call to return an error
    cy.intercept('POST', '/api/audio/create', {
      statusCode: 500,
      body: {
        message: 'Failed to convert post to audio'
      }
    }).as('createAudioRequestError');
    
    // Enter search term
    cy.get('input[placeholder*="Enter hashtag"]').type('ai');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchRequest');
    
    // Select the first post
    cy.get('input[type="checkbox"]').first().check();
    
    // Click convert button
    cy.contains('button', 'Convert Selected').click();
    
    // Enter title
    cy.get('input[name="title"]').clear().type('AI Post Audio');
    
    // Select voice
    cy.get('select[name="voiceId"]').select('en-US-Standard-D');
    
    // Click create button
    cy.contains('button', 'Create Audio Clip').click();
    
    // Wait for create audio request
    cy.wait('@createAudioRequestError');
    
    // Verify error message
    cy.contains('Failed to convert post to audio').should('be.visible');
    
    // Verify we're still on the conversion modal
    cy.contains('Convert to Audio').should('be.visible');
  });
});
