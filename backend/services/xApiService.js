const axios = require('axios');
const logger = require('../utils/logger');

/**
 * X API Service
 * Handles interactions with the X API
 */
class XApiService {
  /**
   * Search for posts by hashtag
   * @param {string} hashtag - Hashtag to search for (without #)
   * @param {Object} options - Search options
   * @param {boolean} options.textOnly - Only return text-only posts
   * @param {number} options.minLikes - Minimum number of likes
   * @param {number} options.maxResults - Maximum number of results to return
   * @param {Object} tokenData - X API token data
   * @returns {Promise<Array>} - Array of posts
   */
  async searchHashtag(hashtag, options, tokenData) {
    try {
      // In a real implementation, we would use the X API
      // For now, we'll return mock data
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockPosts = [
        {
          id: '1',
          text: `Just published a new article on #${hashtag} and its implications for the future of work. Check it out at example.com/ai-future-work`,
          user: {
            username: 'techguru',
            name: 'Tech Guru',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 245,
          reposts: 89,
          createdAt: new Date().toISOString(),
          url: `https://x.com/techguru/status/1`,
        },
        {
          id: '2',
          text: `The latest developments in #${hashtag} are truly mind-blowing. Neural networks are now capable of generating realistic images from text descriptions.`,
          user: {
            username: 'airesearcher',
            name: 'AI Researcher',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 178,
          reposts: 42,
          createdAt: new Date().toISOString(),
          url: `https://x.com/airesearcher/status/2`,
        },
        {
          id: '3',
          text: `Thread: 1/5 Let's talk about #${hashtag} ethics. As AI systems become more powerful, we need to ensure they align with human values and priorities.`,
          user: {
            username: 'ethicist',
            name: 'Tech Ethicist',
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 312,
          reposts: 156,
          createdAt: new Date().toISOString(),
          url: `https://x.com/ethicist/status/3`,
          isThread: true,
        },
      ];
      
      // Apply filters
      let filteredPosts = [...mockPosts];
      
      if (options.textOnly) {
        // Filter for text-only posts (no images, videos, etc.)
        // In a real implementation, we would check for media entities
        filteredPosts = filteredPosts.filter(post => !post.text.includes('http'));
      }
      
      if (options.minLikes > 0) {
        filteredPosts = filteredPosts.filter(post => post.likes >= options.minLikes);
      }
      
      // Limit results
      return filteredPosts.slice(0, options.maxResults);
    } catch (error) {
      logger.error(`Error searching hashtag: ${error.message}`);
      throw new Error(`Failed to search hashtag: ${error.message}`);
    }
  }

  /**
   * Search for posts by user
   * @param {string} username - Username to search for (without @)
   * @param {Object} options - Search options
   * @param {boolean} options.textOnly - Only return text-only posts
   * @param {number} options.minLikes - Minimum number of likes
   * @param {number} options.maxResults - Maximum number of results to return
   * @param {Object} tokenData - X API token data
   * @returns {Promise<Array>} - Array of posts
   */
  async searchUser(username, options, tokenData) {
    try {
      // In a real implementation, we would use the X API
      // For now, we'll return mock data
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockPosts = [
        {
          id: '4',
          text: `Just attended an amazing conference on #AI and machine learning. So many brilliant minds working on solving complex problems!`,
          user: {
            username,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 98,
          reposts: 23,
          createdAt: new Date().toISOString(),
          url: `https://x.com/${username}/status/4`,
        },
        {
          id: '5',
          text: `#AI tools for content creation are getting better every day. I've been experimenting with several for my podcast production workflow.`,
          user: {
            username,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 156,
          reposts: 34,
          createdAt: new Date().toISOString(),
          url: `https://x.com/${username}/status/5`,
        },
        {
          id: '6',
          text: `Thread: 1/3 Here's my take on the future of remote work and how technology will shape our work environments in the coming years.`,
          user: {
            username,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            profileImageUrl: 'https://via.placeholder.com/50',
          },
          likes: 212,
          reposts: 78,
          createdAt: new Date().toISOString(),
          url: `https://x.com/${username}/status/6`,
          isThread: true,
        },
      ];
      
      // Apply filters
      let filteredPosts = [...mockPosts];
      
      if (options.textOnly) {
        // Filter for text-only posts (no images, videos, etc.)
        // In a real implementation, we would check for media entities
        filteredPosts = filteredPosts.filter(post => !post.text.includes('http'));
      }
      
      if (options.minLikes > 0) {
        filteredPosts = filteredPosts.filter(post => post.likes >= options.minLikes);
      }
      
      // Limit results
      return filteredPosts.slice(0, options.maxResults);
    } catch (error) {
      logger.error(`Error searching user posts: ${error.message}`);
      throw new Error(`Failed to search user posts: ${error.message}`);
    }
  }

  /**
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @param {Object} tokenData - X API token data
   * @returns {Promise<Object>} - Post object
   */
  async getPost(postId, tokenData) {
    try {
      // In a real implementation, we would use the X API
      // For now, we'll return mock data
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockPost = {
        id: postId,
        text: `This is a sample post with ID ${postId}. It contains some text that will be converted to audio using text-to-speech technology.`,
        user: {
          username: 'sampleuser',
          name: 'Sample User',
          profileImageUrl: 'https://via.placeholder.com/50',
        },
        likes: 123,
        reposts: 45,
        createdAt: new Date().toISOString(),
        url: `https://x.com/sampleuser/status/${postId}`,
      };
      
      return mockPost;
    } catch (error) {
      logger.error(`Error getting post: ${error.message}`);
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }

  /**
   * Get a thread by the ID of any post in the thread
   * @param {string} postId - Post ID in the thread
   * @param {Object} tokenData - X API token data
   * @returns {Promise<Object>} - Thread object with posts array
   */
  async getThread(postId, tokenData) {
    try {
      // In a real implementation, we would use the X API
      // For now, we'll return mock data
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockThread = {
        id: `thread_${postId}`,
        author: {
          username: 'threadauthor',
          name: 'Thread Author',
          profileImageUrl: 'https://via.placeholder.com/50',
        },
        posts: [
          {
            id: `${postId}_1`,
            text: `1/5 This is the first post in a thread about an interesting topic. Let's explore this in detail.`,
            createdAt: new Date().toISOString(),
          },
          {
            id: `${postId}_2`,
            text: `2/5 In this second post, we'll dive deeper into the subject and explore some key concepts.`,
            createdAt: new Date().toISOString(),
          },
          {
            id: `${postId}_3`,
            text: `3/5 Now let's look at some practical applications and real-world examples of these concepts.`,
            createdAt: new Date().toISOString(),
          },
          {
            id: `${postId}_4`,
            text: `4/5 Here are some challenges and considerations to keep in mind when implementing these ideas.`,
            createdAt: new Date().toISOString(),
          },
          {
            id: `${postId}_5`,
            text: `5/5 To conclude, here's a summary of the key points and some final thoughts on the topic.`,
            createdAt: new Date().toISOString(),
          },
        ],
        url: `https://x.com/threadauthor/status/${postId}`,
      };
      
      return mockThread;
    } catch (error) {
      logger.error(`Error getting thread: ${error.message}`);
      throw new Error(`Failed to get thread: ${error.message}`);
    }
  }

  /**
   * Extract post ID from a X URL
   * @param {string} url - X post URL
   * @returns {string|null} - Post ID or null if invalid URL
   */
  extractPostIdFromUrl(url) {
    try {
      // Parse URL
      const parsedUrl = new URL(url);
      
      // Check if it's a X URL
      if (!parsedUrl.hostname.includes('x.com') && !parsedUrl.hostname.includes('twitter.com')) {
        return null;
      }
      
      // Extract post ID from path
      // Path format: /{username}/status/{id}
      const pathParts = parsedUrl.pathname.split('/');
      const statusIndex = pathParts.findIndex(part => part === 'status');
      
      if (statusIndex !== -1 && statusIndex < pathParts.length - 1) {
        return pathParts[statusIndex + 1];
      }
      
      return null;
    } catch (error) {
      logger.error(`Error extracting post ID from URL: ${error.message}`);
      return null;
    }
  }
}

module.exports = new XApiService();
