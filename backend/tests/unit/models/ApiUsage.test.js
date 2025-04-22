const mongoose = require('mongoose');
const ApiUsage = require('../../../models/ApiUsage');

describe('ApiUsage Model', () => {
  it('should create a new API usage record with required fields', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const apiUsageData = {
      user: userId,
      month: 5, // May
      year: 2023,
    };

    const apiUsage = await ApiUsage.create(apiUsageData);

    // Check if API usage record was created successfully
    expect(apiUsage).toBeDefined();
    expect(apiUsage.user.toString()).toBe(userId.toString());
    expect(apiUsage.month).toBe(apiUsageData.month);
    expect(apiUsage.year).toBe(apiUsageData.year);
    
    // Default values
    expect(apiUsage.postsUsed).toBe(0);
    expect(apiUsage.postsLimit).toBe(500);
    expect(apiUsage.readRequestsUsed).toBe(0);
    expect(apiUsage.readRequestsLimit).toBe(100);
    expect(apiUsage.audioClipsCreated).toBe(0);
    expect(apiUsage.totalAudioDuration).toBe(0);
    expect(apiUsage.totalStorageUsed).toBe(0);
  });

  it('should not save API usage record without required fields', async () => {
    const apiUsage = new ApiUsage({
      // Missing required fields
    });

    let error;
    try {
      await apiUsage.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.month).toBeDefined();
    expect(error.errors.year).toBeDefined();
  });

  it('should validate month range (1-12)', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    // Test with invalid month (13)
    const apiUsageData = {
      user: userId,
      month: 13, // Invalid month
      year: 2023,
    };

    let error;
    try {
      await ApiUsage.create(apiUsageData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.month).toBeDefined();
  });

  it('should enforce unique compound index for user, month, and year', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    // Create first record
    await ApiUsage.create({
      user: userId,
      month: 6,
      year: 2023,
    });

    // Try to create duplicate record
    let error;
    try {
      await ApiUsage.create({
        user: userId,
        month: 6,
        year: 2023,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should update usage statistics correctly', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    // Create initial record
    const apiUsage = await ApiUsage.create({
      user: userId,
      month: 7,
      year: 2023,
    });

    // Update usage statistics
    apiUsage.postsUsed = 10;
    apiUsage.readRequestsUsed = 5;
    apiUsage.audioClipsCreated = 3;
    apiUsage.totalAudioDuration = 360; // 6 minutes
    apiUsage.totalStorageUsed = 6144000; // 6MB

    await apiUsage.save();

    // Fetch updated record
    const updatedApiUsage = await ApiUsage.findOne({
      user: userId,
      month: 7,
      year: 2023,
    });

    expect(updatedApiUsage.postsUsed).toBe(10);
    expect(updatedApiUsage.readRequestsUsed).toBe(5);
    expect(updatedApiUsage.audioClipsCreated).toBe(3);
    expect(updatedApiUsage.totalAudioDuration).toBe(360);
    expect(updatedApiUsage.totalStorageUsed).toBe(6144000);
  });
});
