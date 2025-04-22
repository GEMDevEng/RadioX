describe('Search', () => {
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
    
    // Visit search page
    cy.visit('/search');
    
    // Wait for profile request
    cy.wait('@profileRequest');
  });

  it('should display search tabs', () => {
    cy.contains('Hashtag').should('be.visible');
    cy.contains('User').should('be.visible');
    cy.contains('URL').should('be.visible');
    cy.contains('Thread').should('be.visible');
  });

  it('should search by hashtag', () => {
    // Intercept the search API call
    cy.intercept('GET', '/api/search/hashtag*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          text: 'This is a test post with #ai hashtag',
          user: {
            username: 'testuser',
            name: 'Test User',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 245,
          reposts: 89,
          createdAt: new Date().toISOString(),
          url: 'https://x.com/testuser/status/1',
        },
        {
          id: '2',
          text: 'Another post about #ai and machine learning',
          user: {
            username: 'airesearcher',
            name: 'AI Researcher',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 178,
          reposts: 42,
          createdAt: new Date().toISOString(),
          url: 'https://x.com/airesearcher/status/2',
        }
      ]
    }).as('searchRequest');
    
    // Make sure we're on the hashtag tab
    cy.contains('Hashtag').click();
    
    // Enter search term
    cy.get('input[placeholder*="Enter hashtag"]').type('ai');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchRequest');
    
    // Should display search results
    cy.contains('This is a test post with #ai hashtag').should('be.visible');
    cy.contains('Another post about #ai and machine learning').should('be.visible');
  });

  it('should search by user', () => {
    // Intercept the search API call
    cy.intercept('GET', '/api/search/user*', {
      statusCode: 200,
      body: [
        {
          id: '3',
          text: 'Just posted a new article about AI',
          user: {
            username: 'airesearcher',
            name: 'AI Researcher',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 98,
          reposts: 23,
          createdAt: new Date().toISOString(),
          url: 'https://x.com/airesearcher/status/3',
        },
        {
          id: '4',
          text: 'Working on a new machine learning project',
          user: {
            username: 'airesearcher',
            name: 'AI Researcher',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 156,
          reposts: 34,
          createdAt: new Date().toISOString(),
          url: 'https://x.com/airesearcher/status/4',
        }
      ]
    }).as('searchRequest');
    
    // Switch to user tab
    cy.contains('User').click();
    
    // Enter username
    cy.get('input[placeholder*="Enter username"]').type('airesearcher');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchRequest');
    
    // Should display search results
    cy.contains('Just posted a new article about AI').should('be.visible');
    cy.contains('Working on a new machine learning project').should('be.visible');
  });

  it('should search by URL', () => {
    // Intercept the search API call
    cy.intercept('GET', '/api/search/url*', {
      statusCode: 200,
      body: {
        id: '5',
        text: 'This is a specific post found by URL',
        user: {
          username: 'testuser',
          name: 'Test User',
          profileImageUrl: 'https://via.placeholder.com/50',
        },
        likes: 123,
        reposts: 45,
        createdAt: new Date().toISOString(),
        url: 'https://x.com/testuser/status/5',
      }
    }).as('searchRequest');
    
    // Switch to URL tab
    cy.contains('URL').click();
    
    // Enter URL
    cy.get('input[placeholder*="Enter X post URL"]').type('https://x.com/testuser/status/5');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchRequest');
    
    // Should display search result
    cy.contains('This is a specific post found by URL').should('be.visible');
  });

  it('should search by thread', () => {
    // Intercept the search API call
    cy.intercept('GET', '/api/search/thread*', {
      statusCode: 200,
      body: {
        id: 'thread_6',
        author: {
          username: 'threadauthor',
          name: 'Thread Author',
          profileImageUrl: 'https://via.placeholder.com/50',
        },
        posts: [
          {
            id: '6_1',
            text: '1/3 This is the first post in a thread',
            createdAt: new Date().toISOString(),
          },
          {
            id: '6_2',
            text: '2/3 This is the second post in the thread',
            createdAt: new Date().toISOString(),
          },
          {
            id: '6_3',
            text: '3/3 This is the third post in the thread',
            createdAt: new Date().toISOString(),
          }
        ],
        url: 'https://x.com/threadauthor/status/6_1',
      }
    }).as('searchRequest');
    
    // Switch to thread tab
    cy.contains('Thread').click();
    
    // Enter URL
    cy.get('input[placeholder*="Enter X thread URL"]').type('https://x.com/threadauthor/status/6_1');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchRequest');
    
    // Should display thread posts
    cy.contains('1/3 This is the first post in a thread').should('be.visible');
    cy.contains('2/3 This is the second post in the thread').should('be.visible');
    cy.contains('3/3 This is the third post in the thread').should('be.visible');
  });

  it('should handle search errors gracefully', () => {
    // Intercept the search API call with error
    cy.intercept('GET', '/api/search/hashtag*', {
      statusCode: 500,
      body: { message: 'Error searching X posts' }
    }).as('searchError');
    
    // Enter search term
    cy.get('input[placeholder*="Enter hashtag"]').type('ai');
    
    // Click search button
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchError');
    
    // Should display error message
    cy.contains('Error searching X posts').should('be.visible');
  });

  it('should convert selected posts to audio', () => {
    // Intercept the search API call
    cy.intercept('GET', '/api/search/hashtag*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          text: 'This is a test post with #ai hashtag',
          user: {
            username: 'testuser',
            name: 'Test User',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 245,
          reposts: 89,
          createdAt: new Date().toISOString(),
          url: 'https://x.com/testuser/status/1',
        },
        {
          id: '2',
          text: 'Another post about #ai and machine learning',
          user: {
            username: 'airesearcher',
            name: 'AI Researcher',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 178,
          reposts: 42,
          createdAt: new Date().toISOString(),
          url: 'https://x.com/airesearcher/status/2',
        }
      ]
    }).as('searchRequest');
    
    // Intercept the create audio API call
    cy.intercept('POST', '/api/audio/clips/from-post', {
      statusCode: 201,
      body: {
        _id: 'new_audio_1',
        title: 'Post by @testuser',
        duration: 30,
        fileUrl: 'https://example.com/audio.mp3',
      }
    }).as('createAudioRequest');
    
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
    
    // Select voice
    cy.get('select[name="voiceId"]').select('en-US-Standard-D');
    
    // Click create button
    cy.contains('button', 'Create Audio Clip').click();
    
    // Wait for create audio request
    cy.wait('@createAudioRequest');
    
    // Should show success message
    cy.contains('Audio clip created successfully').should('be.visible');
  });
});
