import React, { useEffect, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '../i18n/types';

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  // Add a state variable to force re-renders when language changes
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Set document direction based on language and force re-renders
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log('LanguageProvider detected language change:', lng);
      setCurrentLang(lng); // Update state to trigger re-render
      
      const langConfig = languages.find(lang => lang.code === lng);
      if (langConfig) {
        document.documentElement.dir = langConfig.direction || 'ltr';
        document.documentElement.lang = lng;
        
        // Add a class for CSS transitions
        document.body.classList.add('lang-transition');
        
        // Remove the transition class after the transition is complete
        const timer = setTimeout(() => {
          document.body.classList.remove('lang-transition');
        }, 300);
        
        return () => {
          clearTimeout(timer);
        };
      }
    };

    // Handle initial language
    handleLanguageChange(i18n.language);
    
    // Add event listener for language changes
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Use key prop to force re-render of the entire tree when language changes
  return (
    <div className="lang-transition" key={currentLang}>
      {children}
    </div>
  );
};

export default LanguageProvider; 