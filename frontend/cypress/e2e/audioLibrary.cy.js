describe('Audio Library', () => {
  beforeEach(() => {
    // Set up a logged-in state
    cy.window().then((window) => {
      window.localStorage.setItem('token', 'fake-token');
    });
    
    // Intercept the me API call to simulate a logged-in user
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    // Intercept the audio clips API call
    cy.intercept('GET', '/api/audio/clips*', {
      statusCode: 200,
      body: [
        {
          _id: '1',
          title: 'Test Audio Clip 1',
          description: 'This is a test audio clip',
          audioUrl: 'https://example.com/test-audio-1.mp3',
          duration: '2:00',
          sourceUrl: 'https://x.com/test/status/123456789',
          createdAt: '2023-01-01T00:00:00.000Z',
          user: {
            _id: '1',
            name: 'Test User',
            username: 'testuser'
          }
        },
        {
          _id: '2',
          title: 'Test Audio Clip 2',
          description: 'This is another test audio clip',
          audioUrl: 'https://example.com/test-audio-2.mp3',
          duration: '3:00',
          sourceUrl: 'https://x.com/test/status/987654321',
          createdAt: '2023-01-02T00:00:00.000Z',
          user: {
            _id: '1',
            name: 'Test User',
            username: 'testuser'
          }
        }
      ]
    }).as('getAudioClips');
  });
  
  it('should navigate to the audio library page', () => {
    cy.visit('/');
    cy.get('a[href="/library"]').click();
    cy.url().should('include', '/library');
    cy.get('h1').should('contain', 'Audio Library');
  });
  
  it('should display audio clips', () => {
    cy.visit('/library');
    
    // Wait for the API call to complete
    cy.wait('@getAudioClips');
    
    // Check that the audio clips are displayed
    cy.get('.card').should('have.length', 2);
    cy.get('.card').first().should('contain', 'Test Audio Clip 1');
    cy.get('.card').first().should('contain', 'This is a test audio clip');
    cy.get('.card').last().should('contain', 'Test Audio Clip 2');
  });
  
  it('should filter audio clips by search term', () => {
    // Intercept the search API call
    cy.intercept('GET', '/api/audio/clips*', (req) => {
      if (req.url.includes('Test Audio Clip 1')) {
        req.reply({
          statusCode: 200,
          body: [
            {
              _id: '1',
              title: 'Test Audio Clip 1',
              description: 'This is a test audio clip',
              audioUrl: 'https://example.com/test-audio-1.mp3',
              duration: '2:00',
              sourceUrl: 'https://x.com/test/status/123456789',
              createdAt: '2023-01-01T00:00:00.000Z',
              user: {
                _id: '1',
                name: 'Test User',
                username: 'testuser'
              }
            }
          ]
        });
      }
    }).as('searchAudioClips');
    
    cy.visit('/library');
    
    // Wait for the initial API call to complete
    cy.wait('@getAudioClips');
    
    // Search for a specific audio clip
    cy.get('input[placeholder*="Search"]').type('Test Audio Clip 1');
    
    // Wait for the search API call to complete
    cy.wait('@searchAudioClips');
    
    // Check that only the matching audio clip is displayed
    cy.get('.card').should('have.length', 1);
    cy.get('.card').should('contain', 'Test Audio Clip 1');
    cy.get('.card').should('not.contain', 'Test Audio Clip 2');
  });
  
  it('should sort audio clips', () => {
    cy.visit('/library');
    
    // Wait for the API call to complete
    cy.wait('@getAudioClips');
    
    // Check the default sort order (newest first)
    cy.get('.card').first().should('contain', 'Test Audio Clip 1');
    
    // Change the sort order to oldest first
    cy.get('select').select('oldest');
    
    // Check that the order is reversed
    cy.get('.card').first().should('contain', 'Test Audio Clip 2');
  });
  
  it('should play an audio clip', () => {
    cy.visit('/library');
    
    // Wait for the API call to complete
    cy.wait('@getAudioClips');
    
    // Click the play button on the first audio clip
    cy.get('.card').first().find('button').contains('Play').click();
    
    // Check that the audio player is displayed
    cy.get('audio').should('exist');
    
    // Check that the audio source is correct
    cy.get('audio').should('have.attr', 'src', 'https://example.com/test-audio-1.mp3');
  });
  
  it('should favorite an audio clip', () => {
    // Intercept the favorite check API call
    cy.intercept('GET', '/api/favorites/check/audio/*', {
      statusCode: 200,
      body: { isFavorited: false }
    }).as('checkFavorite');
    
    // Intercept the favorite API call
    cy.intercept('POST', '/api/favorites', {
      statusCode: 201,
      body: {
        _id: '1',
        item: '1',
        itemType: 'audio'
      }
    }).as('addFavorite');
    
    cy.visit('/library');
    
    // Wait for the API calls to complete
    cy.wait('@getAudioClips');
    cy.wait('@checkFavorite');
    
    // Click the favorite button on the first audio clip
    cy.get('.card').first().find('button[aria-label="Add to favorites"]').click();
    
    // Wait for the favorite API call to complete
    cy.wait('@addFavorite');
    
    // Check that the favorite button is now active
    cy.get('.card').first().find('button[aria-label="Remove from favorites"]').should('exist');
  });
  
  it('should delete an audio clip', () => {
    // Intercept the delete API call
    cy.intercept('DELETE', '/api/audio/clips/*', {
      statusCode: 200,
      body: { message: 'Audio clip deleted successfully' }
    }).as('deleteAudioClip');
    
    cy.visit('/library');
    
    // Wait for the API call to complete
    cy.wait('@getAudioClips');
    
    // Click the delete button on the first audio clip
    cy.get('.card').first().find('button').contains('Delete').click();
    
    // Confirm the deletion in the modal
    cy.get('button').contains('Confirm').click();
    
    // Wait for the delete API call to complete
    cy.wait('@deleteAudioClip');
    
    // Check that the audio clip is removed
    cy.get('.card').should('have.length', 1);
    cy.get('.card').should('not.contain', 'Test Audio Clip 1');
  });
});
