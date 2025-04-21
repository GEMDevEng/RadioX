const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  res.json({
    userId: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: user.getSignedJwtToken(),
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      xApiConnection: user.xApiConnection,
      settings: user.settings,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.settings) {
      user.settings = {
        ...user.settings,
        ...req.body.settings,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      settings: updatedUser.settings,
      token: updatedUser.getSignedJwtToken(),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal that the user doesn't exist
    return res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link',
    });
  }

  // In a real implementation, we would:
  // 1. Generate a reset token
  // 2. Save it to the user record with an expiration
  // 3. Send an email with a reset link

  // For now, we'll just return a success message
  res.status(200).json({
    message: 'If your email is registered, you will receive a password reset link',
  });
});

/**
 * @desc    Connect X account
 * @route   POST /api/auth/connect-x
 * @access  Private
 */
const connectXAccount = asyncHandler(async (req, res) => {
  const { username, tokenData } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.xApiConnection = {
      connected: true,
      username,
      tokenData,
    };

    await user.save();

    res.json({
      success: true,
      message: 'X account connected successfully',
      xApiConnection: user.xApiConnection,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  connectXAccount,
};
