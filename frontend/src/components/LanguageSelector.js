import React, { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current language object
  const currentLangObj = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Handle language change
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
      .then(() => {
        setIsOpen(false);
      })
      .catch(error => {
        console.error('Error changing language:', error);
      });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 text-gray-300 hover:text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiGlobe className="w-5 h-5" />
        <span className="hidden md:inline-block">{currentLangObj.flag}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-700">
          {languages.map((language) => (
            <button
              key={language.code}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="mr-2">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === currentLanguage && (
                <FiCheck className="ml-auto text-indigo-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
