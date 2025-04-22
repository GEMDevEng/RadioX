import React, { useState } from 'react';
import { FiExternalLink, FiCheck, FiCopy, FiInfo } from 'react-icons/fi';
import Card from './Card';
import api from '../services/api';

const PodcastDistribution = ({ podcast }) => {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Copy RSS feed URL to clipboard
  const copyRssUrl = () => {
    navigator.clipboard.writeText(podcast.rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit podcast to a platform
  const submitToPlatform = async (platform) => {
    try {
      setSubmitting(true);
      setSubmitSuccess(null);
      setSubmitError(null);

      // In a real implementation, this would be a separate API endpoint
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitSuccess(`Successfully submitted to ${platform}`);
      setSubmitting(false);
    } catch (error) {
      setSubmitError(`Failed to submit to ${platform}: ${error.message}`);
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Podcast Distribution</h3>
      
      {/* RSS Feed URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          RSS Feed URL
        </label>
        <div className="flex">
          <input
            type="text"
            value={podcast.rssUrl}
            readOnly
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={copyRssUrl}
            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copied ? <FiCheck className="mr-2" /> : <FiCopy className="mr-2" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Use this URL to submit your podcast to various platforms.
        </p>
      </div>
      
      {/* Status Messages */}
      {submitSuccess && (
        <div className="mb-4 p-4 rounded-md bg-green-50 text-green-700">
          <div className="flex">
            <FiCheck className="h-5 w-5 text-green-400 mr-2" />
            <p>{submitSuccess}</p>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700">
          <div className="flex">
            <FiInfo className="h-5 w-5 text-red-400 mr-2" />
            <p>{submitError}</p>
          </div>
        </div>
      )}
      
      {/* Distribution Platforms */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-700">Submit to Platforms</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Apple Podcasts */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-10 w-10">
                <img className="h-10 w-10 rounded" src="https://via.placeholder.com/40" alt="Apple Podcasts" />
              </div>
              <div className="ml-4">
                <h5 className="text-sm font-medium text-gray-900">Apple Podcasts</h5>
                <p className="text-xs text-gray-500">Most popular podcast platform</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <a
                href="https://podcastsconnect.apple.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                <FiExternalLink className="mr-1" /> Submit Manually
              </a>
              <button
                onClick={() => submitToPlatform('Apple Podcasts')}
                disabled={submitting}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          
          {/* Spotify */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-10 w-10">
                <img className="h-10 w-10 rounded" src="https://via.placeholder.com/40" alt="Spotify" />
              </div>
              <div className="ml-4">
                <h5 className="text-sm font-medium text-gray-900">Spotify</h5>
                <p className="text-xs text-gray-500">Fast-growing podcast platform</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <a
                href="https://podcasters.spotify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                <FiExternalLink className="mr-1" /> Submit Manually
              </a>
              <button
                onClick={() => submitToPlatform('Spotify')}
                disabled={submitting}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          
          {/* Google Podcasts */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-10 w-10">
                <img className="h-10 w-10 rounded" src="https://via.placeholder.com/40" alt="Google Podcasts" />
              </div>
              <div className="ml-4">
                <h5 className="text-sm font-medium text-gray-900">Google Podcasts</h5>
                <p className="text-xs text-gray-500">Android's native podcast app</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <a
                href="https://podcastsmanager.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                <FiExternalLink className="mr-1" /> Submit Manually
              </a>
              <button
                onClick={() => submitToPlatform('Google Podcasts')}
                disabled={submitting}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          
          {/* Amazon Music */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-10 w-10">
                <img className="h-10 w-10 rounded" src="https://via.placeholder.com/40" alt="Amazon Music" />
              </div>
              <div className="ml-4">
                <h5 className="text-sm font-medium text-gray-900">Amazon Music</h5>
                <p className="text-xs text-gray-500">Includes distribution to Audible</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <a
                href="https://podcasters.amazon.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                <FiExternalLink className="mr-1" /> Submit Manually
              </a>
              <button
                onClick={() => submitToPlatform('Amazon Music')}
                disabled={submitting}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Distribution Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h4 className="text-md font-medium text-blue-700 mb-2">Distribution Tips</h4>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>Make sure your podcast artwork is at least 1400x1400 pixels and less than 512KB.</li>
          <li>Include detailed show notes with each episode to improve discoverability.</li>
          <li>Consistency is key - maintain a regular publishing schedule.</li>
          <li>Promote your podcast on social media and other channels to grow your audience.</li>
          <li>Consider cross-promotion with other podcasts in your niche.</li>
        </ul>
      </div>
    </Card>
  );
};

export default PodcastDistribution;
