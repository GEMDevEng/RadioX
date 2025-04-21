import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Transform X Posts into{' '}
            <span className="text-primary-600">Audio Content</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-8">
            RadioX makes social media content more accessible and engaging by
            converting X posts into high-quality audio clips for podcasts and
            more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary text-lg px-6 py-3"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn-outline text-lg px-6 py-3"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Key Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Everything you need to convert social media content into
              professional audio.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Hashtag Search
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Find relevant X posts using hashtag search with filtering and
                sorting options.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Audio Conversion
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Convert posts to audio with customizable voices and background
                music options.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Podcast Publishing
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Generate RSS feeds for podcast distribution on platforms like
                Spotify and Apple Podcasts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Who Can Benefit
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              RadioX is designed for a variety of users who want to leverage
              audio content.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Audience 1 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Content Creators
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Repurpose your top-performing X posts into podcast episodes to
                reach new audiences.
              </p>
            </div>

            {/* Audience 2 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Accessibility Advocates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Make social media content accessible to visually impaired users
                and those who prefer audio.
              </p>
            </div>

            {/* Audience 3 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Small Businesses
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create audio versions of announcements and customer testimonials
                for broader reach.
              </p>
            </div>

            {/* Audience 4 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Niche Communities
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Convert specialized content into audio format for easier
                consumption by your audience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 bg-primary-600 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-100">
            Join RadioX today and start converting your X posts into engaging
            audio content.
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-100 md:text-lg"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
