const { create } = require('xmlbuilder2');
const logger = require('../utils/logger');

/**
 * RSS Service
 * Handles RSS feed generation for podcasts
 */
class RssService {
  /**
   * Generate RSS feed for a podcast
   * @param {Object} podcast - Podcast object with populated episodes
   * @returns {Promise<string>} - RSS feed XML string
   */
  async generateRssFeed(podcast) {
    try {
      // Create RSS feed XML
      const rss = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('rss', {
          version: '2.0',
          'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
          'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
          'xmlns:atom': 'http://www.w3.org/2005/Atom',
        });

      // Add channel information
      const channel = rss.ele('channel');
      channel.ele('title').txt(podcast.title);
      channel.ele('description').txt(podcast.description);
      channel.ele('link').txt(podcast.rssUrl);
      channel.ele('language').txt(podcast.language);
      channel.ele('lastBuildDate').txt(new Date(podcast.lastBuildDate).toUTCString());
      channel.ele('pubDate').txt(new Date(podcast.createdAt).toUTCString());
      channel.ele('ttl').txt('60');
      channel.ele('atom:link', {
        href: podcast.rssUrl,
        rel: 'self',
        type: 'application/rss+xml',
      });

      // Add iTunes specific tags
      channel.ele('itunes:author').txt(podcast.author);
      channel.ele('itunes:summary').txt(podcast.description);
      channel.ele('itunes:explicit').txt(podcast.explicit ? 'yes' : 'no');
      channel.ele('itunes:owner')
        .ele('itunes:name').txt(podcast.author).up()
        .ele('itunes:email').txt(podcast.email);
      
      // Add podcast image
      if (podcast.imageUrl) {
        channel.ele('itunes:image', { href: podcast.imageUrl });
        channel.ele('image')
          .ele('url').txt(podcast.imageUrl).up()
          .ele('title').txt(podcast.title).up()
          .ele('link').txt(podcast.rssUrl);
      }

      // Add podcast category
      channel.ele('itunes:category', { text: podcast.category });

      // Add episodes
      if (podcast.episodes && podcast.episodes.length > 0) {
        // Sort episodes by order
        const sortedEpisodes = [...podcast.episodes].sort((a, b) => a.order - b.order);
        
        for (const episode of sortedEpisodes) {
          // Skip if audio clip is not populated
          if (!episode.audioClip) continue;
          
          const audioClip = episode.audioClip;
          const pubDate = new Date(episode.publishedAt).toUTCString();
          
          const item = channel.ele('item');
          item.ele('title').txt(audioClip.title);
          item.ele('description').txt(audioClip.description || '');
          item.ele('pubDate').txt(pubDate);
          item.ele('enclosure', {
            url: audioClip.fileUrl,
            length: audioClip.fileSize,
            type: `audio/${audioClip.format}`,
          });
          item.ele('guid', { isPermaLink: 'false' }).txt(audioClip._id.toString());
          item.ele('itunes:duration').txt(this.formatDuration(audioClip.duration));
          item.ele('itunes:summary').txt(audioClip.description || '');
          item.ele('itunes:explicit').txt(podcast.explicit ? 'yes' : 'no');
          
          // Add image if available
          if (audioClip.imageUrl) {
            item.ele('itunes:image', { href: audioClip.imageUrl });
          }
        }
      }

      // Convert to XML string
      const xmlString = rss.end({ prettyPrint: true });
      
      return xmlString;
    } catch (error) {
      logger.error(`Error generating RSS feed: ${error.message}`);
      throw new Error(`Failed to generate RSS feed: ${error.message}`);
    }
  }

  /**
   * Format duration in seconds to HH:MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} - Formatted duration
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}

module.exports = new RssService();
