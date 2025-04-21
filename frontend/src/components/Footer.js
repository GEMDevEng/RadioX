import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">RadioX</h3>
            <p className="text-gray-400">
              Transform X posts into high-quality audio clips for podcasts and accessibility.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white">
                  Search
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-gray-400 hover:text-white">
                  Audio Library
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://developer.x.com/en/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  X API Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://cloud.google.com/text-to-speech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Google Cloud TTS
                </a>
              </li>
              <li>
                <a
                  href="https://podcasters.spotify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Spotify for Podcasters
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <span className="block">Email:</span>
                <a href="mailto:support@radiox.com" className="hover:text-white">
                  support@radiox.com
                </a>
              </li>
              <li className="text-gray-400">
                <span className="block">GitHub:</span>
                <a
                  href="https://github.com/your-org/radiox-free-edition"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  RadioX Repository
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RadioX. All rights reserved.</p>
          <p className="mt-2">
            Built with ❤️ for accessibility and innovation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
