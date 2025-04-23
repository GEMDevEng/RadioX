const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createUser, generateToken } = require('../helpers');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify user was created in the database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 if email is already in use', async () => {
      // Create a user first
      await createUser();
      
      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a user first
      const user = await createUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', user.name);
      expect(response.body.user).toHaveProperty('email', user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 401 with invalid credentials', async () => {
      // Create a user first
      await createUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 404 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('GET /api/auth/me', () => {
    it('should return the current user', async () => {
      // Create a user first
      const user = await createUser();
      const token = generateToken(user);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', user.name);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('PUT /api/auth/me', () => {
    it('should update the current user', async () => {
      // Create a user first
      const user = await createUser();
      const token = generateToken(user);
      
      const updatedData = {
        name: 'Updated Name'
      };
      
      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('email', user.email);
      
      // Verify user was updated in the database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(updatedData.name);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .put('/api/auth/me')
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
});
