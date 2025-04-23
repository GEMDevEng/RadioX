const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { createUser } = require('../helpers');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  describe('protect middleware', () => {
    it('should call next() if token is valid in Authorization header', async () => {
      // Create a user
      const user = await createUser();
      
      // Generate a valid token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Set the token in the Authorization header
      req.headers.authorization = `Bearer ${token}`;
      
      // Call the middleware
      await protect(req, res, next);
      
      // Expect next to be called
      expect(next).toHaveBeenCalled();
      
      // Expect req.user to be set
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
    });
    
    it('should call next() if token is valid in cookie', async () => {
      // Create a user
      const user = await createUser();
      
      // Generate a valid token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Set the token in the cookie
      req.cookies.token = token;
      
      // Call the middleware
      await protect(req, res, next);
      
      // Expect next to be called
      expect(next).toHaveBeenCalled();
      
      // Expect req.user to be set
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
    });
    
    it('should return 401 if no token is provided', async () => {
      // Call the middleware
      await protect(req, res, next);
      
      // Expect res.status to be called with 401
      expect(res.status).toHaveBeenCalledWith(401);
      
      // Expect res.json to be called with an error message
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      
      // Expect next not to be called
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token is invalid', async () => {
      // Set an invalid token in the Authorization header
      req.headers.authorization = 'Bearer invalidtoken';
      
      // Call the middleware
      await protect(req, res, next);
      
      // Expect res.status to be called with 401
      expect(res.status).toHaveBeenCalledWith(401);
      
      // Expect res.json to be called with an error message
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      
      // Expect next not to be called
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if user does not exist', async () => {
      // Generate a token with a non-existent user ID
      const nonExistentId = new mongoose.Types.ObjectId();
      const token = jwt.sign(
        { id: nonExistentId, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Set the token in the Authorization header
      req.headers.authorization = `Bearer ${token}`;
      
      // Call the middleware
      await protect(req, res, next);
      
      // Expect res.status to be called with 401
      expect(res.status).toHaveBeenCalledWith(401);
      
      // Expect res.json to be called with an error message
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      
      // Expect next not to be called
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('authorize middleware', () => {
    it('should call next() if user has the required role', async () => {
      // Create a user with admin role
      const user = await createUser({ role: 'admin' });
      
      // Set the user in the request
      req.user = user;
      
      // Create the middleware with admin role
      const middleware = authorize('admin');
      
      // Call the middleware
      middleware(req, res, next);
      
      // Expect next to be called
      expect(next).toHaveBeenCalled();
    });
    
    it('should call next() if user has one of the required roles', async () => {
      // Create a user with editor role
      const user = await createUser({ role: 'editor' });
      
      // Set the user in the request
      req.user = user;
      
      // Create the middleware with multiple roles
      const middleware = authorize('admin', 'editor');
      
      // Call the middleware
      middleware(req, res, next);
      
      // Expect next to be called
      expect(next).toHaveBeenCalled();
    });
    
    it('should return 403 if user does not have the required role', async () => {
      // Create a regular user
      const user = await createUser();
      
      // Set the user in the request
      req.user = user;
      
      // Create the middleware with admin role
      const middleware = authorize('admin');
      
      // Call the middleware
      middleware(req, res, next);
      
      // Expect res.status to be called with 403
      expect(res.status).toHaveBeenCalledWith(403);
      
      // Expect res.json to be called with an error message
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      
      // Expect next not to be called
      expect(next).not.toHaveBeenCalled();
    });
  });
});
