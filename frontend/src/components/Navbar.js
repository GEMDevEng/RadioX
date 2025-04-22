import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FiHome, FiGrid, FiSearch, FiBarChart2, FiBookOpen, FiRadio, FiMoon, FiSun, FiHeart } from 'react-icons/fi';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigation = [
    { name: t('nav.home'), href: '/', icon: FiHome, current: location.pathname === '/' },
    ...(currentUser
      ? [
          { name: t('nav.dashboard'), href: '/dashboard', icon: FiGrid, current: location.pathname === '/dashboard' },
          { name: t('nav.search'), href: '/search', icon: FiSearch, current: location.pathname === '/search' },
          { name: t('nav.smartSearch'), href: '/smart-search', icon: FiSearch, current: location.pathname === '/smart-search' },
          { name: t('nav.library'), href: '/library', icon: FiBookOpen, current: location.pathname === '/library' },
          { name: t('nav.podcast'), href: '/podcast', icon: FiRadio, current: location.pathname === '/podcast' },
          { name: t('nav.favorites'), href: '/favorites', icon: FiHeart, current: location.pathname === '/favorites' },
          { name: t('nav.analytics'), href: '/analytics', icon: FiBarChart2, current: location.pathname === '/analytics' },
        ]
      : []),
  ];

  return (
    <Disclosure as="nav" className="bg-gray-900 text-white shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="flex items-center">
                    <span className="text-white text-xl font-bold">RadioX</span>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${item.current ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200`}
                      >
                        <item.icon className="mr-1.5 h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="text-gray-300 hover:text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                    {darkMode ? (
                      <FiSun className="h-5 w-5" />
                    ) : (
                      <FiMoon className="h-5 w-5" />
                    )}
                  </button>

                  {/* Language Selector */}
                  <LanguageSelector />

                  {currentUser ? (
                    <div className="relative ml-3">
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                              {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                          </Menu.Button>
                        </div>
                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/profile"
                                  className={`${
                                    active ? 'bg-gray-700' : ''
                                  } block px-4 py-2 text-sm text-gray-300 hover:text-white`}
                                >
                                  {t('profile.title')}
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  className={`${
                                    active ? 'bg-gray-700' : ''
                                  } block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white`}
                                >
                                  {t('nav.logout')}
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  ) : (
                    <div className="flex space-x-4">
                      <Link
                        to="/login"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        {t('nav.login')}
                      </Link>
                      <Link
                        to="/register"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        {t('nav.register')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${item.current ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium flex items-center`}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              {currentUser ? (
                <div className="space-y-1 px-2">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-sm font-medium text-gray-400">
                        {currentUser.email}
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="ml-auto text-gray-400 hover:text-white p-1 rounded-full focus:outline-none"
                    >
                      {darkMode ? (
                        <FiSun className="h-6 w-6" />
                      ) : (
                        <FiMoon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {t('profile.title')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {t('nav.logout')}
                    </button>
                    <div className="px-3 py-2">
                      <LanguageSelector />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  <div className="flex items-center justify-between px-5">
                    <div className="flex items-center">
                      <LanguageSelector />
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="text-gray-400 hover:text-white p-1 rounded-full focus:outline-none"
                    >
                      {darkMode ? (
                        <FiSun className="h-6 w-6" />
                      ) : (
                        <FiMoon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  <Link
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700 mt-2"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
