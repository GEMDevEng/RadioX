const request = require('supertest');
const app = require('../../app');
const Favorite = require('../../models/Favorite');
const { createUser, generateToken, createAudioClip, createPodcast, createFavorite, generateObjectId } = require('../helpers');

describe('Favorites Controller', () => {
  let user, token, audioClip, podcast;
  
  beforeEach(async () => {
    // Create test user and generate token
    user = await createUser();
    token = generateToken(user);
    
    // Create test audio clip and podcast
    audioClip = await createAudioClip({}, user);
    podcast = await createPodcast({}, user);
  });
  
  describe('GET /api/favorites', () => {
    it('should return all favorites for the current user', async () => {
      // Create some favorites
      await createFavorite(user, audioClip, 'audio');
      await createFavorite(user, podcast, 'podcast');
      
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      
      // Check that favorites contain the correct data
      expect(response.body[0]).toHaveProperty('item');
      expect(response.body[0]).toHaveProperty('itemType');
      expect(response.body[0].user.toString()).toBe(user._id.toString());
    });
    
    it('should return empty array if user has no favorites', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/favorites');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('POST /api/favorites', () => {
    it('should create a new favorite for audio clip', async () => {
      const favoriteData = {
        item: audioClip._id,
        itemType: 'audio'
      };
      
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send(favoriteData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('item', audioClip._id.toString());
      expect(response.body).toHaveProperty('itemType', 'audio');
      expect(response.body).toHaveProperty('user', user._id.toString());
      
      // Verify favorite was created in the database
      const favorite = await Favorite.findOne({ user: user._id, item: audioClip._id });
      expect(favorite).toBeTruthy();
      expect(favorite.itemType).toBe('audio');
    });
    
    it('should create a new favorite for podcast', async () => {
      const favoriteData = {
        item: podcast._id,
        itemType: 'podcast'
      };
      
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send(favoriteData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('item', podcast._id.toString());
      expect(response.body).toHaveProperty('itemType', 'podcast');
      
      // Verify favorite was created in the database
      const favorite = await Favorite.findOne({ user: user._id, item: podcast._id });
      expect(favorite).toBeTruthy();
      expect(favorite.itemType).toBe('podcast');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ item: audioClip._id });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 if item already favorited', async () => {
      // Create a favorite first
      await createFavorite(user, audioClip, 'audio');
      
      // Try to favorite the same item again
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          item: audioClip._id,
          itemType: 'audio'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already favorited');
    });
    
    it('should return 404 if item does not exist', async () => {
      const nonExistentId = generateObjectId();
      
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          item: nonExistentId,
          itemType: 'audio'
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('DELETE /api/favorites/:id', () => {
    it('should delete a favorite', async () => {
      // Create a favorite first
      const favorite = await createFavorite(user, audioClip, 'audio');
      
      const response = await request(app)
        .delete(`/api/favorites/${favorite._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('removed');
      
      // Verify favorite was deleted from the database
      const deletedFavorite = await Favorite.findById(favorite._id);
      expect(deletedFavorite).toBeNull();
    });
    
    it('should return 404 if favorite does not exist', async () => {
      const nonExistentId = generateObjectId();
      
      const response = await request(app)
        .delete(`/api/favorites/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 403 if trying to delete another user\'s favorite', async () => {
      // Create another user
      const anotherUser = await createUser({ email: 'another@example.com' });
      
      // Create a favorite for the other user
      const favorite = await createFavorite(anotherUser, audioClip, 'audio');
      
      // Try to delete it with the first user's token
      const response = await request(app)
        .delete(`/api/favorites/${favorite._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      
      // Verify favorite was not deleted
      const notDeletedFavorite = await Favorite.findById(favorite._id);
      expect(notDeletedFavorite).toBeTruthy();
    });
  });
  
  describe('GET /api/favorites/check/:itemType/:itemId', () => {
    it('should check if an item is favorited', async () => {
      // Create a favorite first
      await createFavorite(user, audioClip, 'audio');
      
      const response = await request(app)
        .get(`/api/favorites/check/audio/${audioClip._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isFavorited', true);
    });
    
    it('should return false if item is not favorited', async () => {
      const response = await request(app)
        .get(`/api/favorites/check/audio/${audioClip._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isFavorited', false);
    });
  });
});
