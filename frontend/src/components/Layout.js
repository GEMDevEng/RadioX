import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Main layout component that wraps all pages
 * Includes the navigation bar and footer
 */
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
