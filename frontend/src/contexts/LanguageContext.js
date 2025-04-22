import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Create a context for language
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Update the context state when the language changes
  const changeLanguage = (langCode) => {
    return i18n.changeLanguage(langCode)
      .then(() => {
        setCurrentLanguage(langCode);
        localStorage.setItem('i18nextLng', langCode);
      });
  };

  // Initialize the language from localStorage or browser settings
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      i18n.changeLanguage(savedLanguage)
        .then(() => {
          setCurrentLanguage(savedLanguage);
        })
        .catch(error => {
          console.error('Error initializing language:', error);
        });
    }
  }, [i18n, currentLanguage]);

  // Listen for language changes from outside the context
  useEffect(() => {
    const handleLanguageChanged = () => {
      if (i18n.language !== currentLanguage) {
        setCurrentLanguage(i18n.language);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, currentLanguage]);

  // Value to be provided by the context
  const value = {
    currentLanguage,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
