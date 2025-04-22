# RadioX Troubleshooting Guide

This guide provides solutions to common issues you might encounter while using RadioX.

## Table of Contents

1. [Installation and Setup Issues](#installation-and-setup-issues)
2. [Authentication Problems](#authentication-problems)
3. [X API Connection Issues](#x-api-connection-issues)
4. [Audio Conversion Problems](#audio-conversion-problems)
5. [Podcast Publishing Issues](#podcast-publishing-issues)
6. [Performance Concerns](#performance-concerns)
7. [Docker and Deployment Issues](#docker-and-deployment-issues)
8. [Common Error Messages](#common-error-messages)

## Installation and Setup Issues

### MongoDB Connection Failures

**Symptoms:**
- Error message: "MongoNetworkError: failed to connect to server"
- Backend service fails to start

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   docker ps | grep mongo
   ```
2. Check MongoDB connection string in `.env` file
3. Ensure MongoDB port (27017) is not blocked by firewall
4. Try restarting the MongoDB container:
   ```bash
   docker-compose restart mongo
   ```

### Redis Connection Issues

**Symptoms:**
- Error message: "Error connecting to Redis"
- Job queue processing fails

**Solutions:**
1. Verify Redis is running:
   ```bash
   docker ps | grep redis
   ```
2. Check Redis connection string in `.env` file
3. Ensure Redis port (6379) is not blocked by firewall
4. Try restarting the Redis container:
   ```bash
   docker-compose restart redis
   ```

### Frontend Build Failures

**Symptoms:**
- Error during `npm run build`
- Missing dependencies errors

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```
2. Check for Node.js version compatibility (Node.js 16+ recommended)
3. Verify all required environment variables are set

## Authentication Problems

### Registration Failures

**Symptoms:**
- Error message when trying to register
- Registration form submission doesn't complete

**Solutions:**
1. Ensure email address is not already registered
2. Check password meets minimum requirements (at least 6 characters)
3. Verify backend server is running and accessible
4. Check browser console for specific error messages

### Login Issues

**Symptoms:**
- Unable to log in with correct credentials
- "Invalid credentials" error

**Solutions:**
1. Reset your password using the "Forgot Password" link
2. Clear browser cookies and cache
3. Ensure you're using the correct email address
4. Check if your account has been locked due to too many failed attempts

### JWT Token Problems

**Symptoms:**
- Frequent logouts
- "Not authorized" errors when accessing protected routes

**Solutions:**
1. Check JWT_SECRET and JWT_EXPIRES_IN in your environment variables
2. Ensure your system clock is synchronized correctly
3. Clear browser local storage and try logging in again

## X API Connection Issues

### Failed X Account Connection

**Symptoms:**
- Error when trying to connect X account
- "Failed to connect X account" message

**Solutions:**
1. Verify API Key and API Secret are correct
2. Ensure your X developer account is in good standing
3. Check if you've exceeded X API rate limits
4. Verify your X account has the necessary permissions

### X API Rate Limiting

**Symptoms:**
- "Rate limit exceeded" errors
- Searches or conversions fail intermittently

**Solutions:**
1. Reduce the frequency of API requests
2. Implement caching for frequently accessed data
3. Use the dashboard to monitor your API usage
4. Consider upgrading to a plan with higher limits

## Audio Conversion Problems

### Conversion Failures

**Symptoms:**
- Error message when trying to convert posts to audio
- Conversion process starts but never completes

**Solutions:**
1. Check if the post contains unsupported content (e.g., excessive emojis)
2. Verify Google Cloud TTS API key is valid
3. Ensure the post text is not too long (try splitting into smaller chunks)
4. Check backend logs for specific error messages

### Audio Quality Issues

**Symptoms:**
- Poor audio quality
- Mispronunciations or incorrect pauses

**Solutions:**
1. Try a different voice option
2. Edit the text to improve pronunciation (e.g., spell out abbreviations)
3. Adjust background music volume if it's drowning out the speech
4. For important content, use the custom text input to refine the text

### Missing Audio Files

**Symptoms:**
- Audio clip shows in library but doesn't play
- "File not found" errors

**Solutions:**
1. Check S3 bucket configuration in environment variables
2. Verify AWS credentials are correct
3. Ensure the S3 bucket has proper permissions
4. Try recreating the audio clip

## Podcast Publishing Issues

### RSS Feed Problems

**Symptoms:**
- Podcast directories reject your RSS feed
- Episodes don't appear in podcast apps

**Solutions:**
1. Validate your RSS feed using a tool like [Cast Feed Validator](https://castfeedvalidator.com/)
2. Ensure all required podcast fields are completed (title, description, author, etc.)
3. Check that episode audio URLs are publicly accessible
4. Verify your podcast artwork meets requirements (1400x1400px, under 512KB)

### Episode Ordering Issues

**Symptoms:**
- Episodes appear in the wrong order in podcast apps
- New episodes don't show up at the top

**Solutions:**
1. Check the episode order in the RadioX podcast management interface
2. Ensure episode publish dates are set correctly
3. Update the RSS feed by clicking "Regenerate RSS Feed"
4. Allow 24-48 hours for podcast directories to update

## Performance Concerns

### Slow Dashboard Loading

**Symptoms:**
- Dashboard takes a long time to load
- Usage statistics don't appear

**Solutions:**
1. Check your internet connection
2. Clear browser cache
3. Verify backend services are running properly
4. Check for high server load in monitoring tools

### Delayed Audio Processing

**Symptoms:**
- Audio conversion takes longer than expected
- Status remains "Processing" for extended periods

**Solutions:**
1. Check processing service logs for errors
2. Verify Redis is running properly for job queue processing
3. For large threads, expect longer processing times
4. Ensure your system has adequate resources (CPU/memory)

## Docker and Deployment Issues

### Container Startup Failures

**Symptoms:**
- Containers exit immediately after starting
- "Exit code 1" in docker logs

**Solutions:**
1. Check container logs:
   ```bash
   docker-compose logs backend
   ```
2. Verify all required environment variables are set
3. Ensure dependent services (MongoDB, Redis) are running
4. Check for port conflicts with other applications

### Volume Mount Problems

**Symptoms:**
- Changes to code don't reflect in the application
- Data persistence issues

**Solutions:**
1. Check volume configurations in docker-compose.yml
2. Ensure proper permissions on mounted directories
3. Try rebuilding the containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## Common Error Messages

### "Not authorized, no token"

**Cause:** JWT token is missing or invalid

**Solutions:**
1. Log out and log back in
2. Clear browser local storage
3. Check if token is being properly set in API requests

### "Failed to fetch data"

**Cause:** API request failed due to network or server issues

**Solutions:**
1. Check your internet connection
2. Verify backend services are running
3. Check browser console for specific error details
4. Retry the operation

### "You have reached your monthly posts limit"

**Cause:** You've used all your allocated X post conversions for the month

**Solutions:**
1. Wait until the next billing cycle
2. Use custom text input instead of X posts
3. Consider upgrading to a plan with higher limits

### "Error generating audio: Invalid text"

**Cause:** The text contains characters or formatting that the TTS service cannot process

**Solutions:**
1. Remove special characters, emojis, or excessive punctuation
2. Break long text into smaller chunks
3. Use custom text input to clean up the content before conversion

If you encounter issues not covered in this guide, please contact support at support@radiox.com or open an issue on our [GitHub repository](https://github.com/GEMDevEng/RadioX/issues).
