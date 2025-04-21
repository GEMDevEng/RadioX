const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');

describe('User Model', () => {
  it('should create a new user with encrypted password', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await User.create(userData);

    // Check if user was created successfully
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    
    // Password should be encrypted
    expect(user.password).not.toBe(userData.password);
    
    // Check if password is valid
    const isMatch = await bcrypt.compare(userData.password, user.password);
    expect(isMatch).toBe(true);
  });

  it('should not save user without required fields', async () => {
    const user = new User({
      name: 'Test User',
      // Missing email and password
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('should not save user with invalid email', async () => {
    const user = new User({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should generate a JWT token', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const token = user.getSignedJwtToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should match password correctly', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const isMatch = await user.matchPassword('password123');
    const isNotMatch = await user.matchPassword('wrongpassword');
    
    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});
