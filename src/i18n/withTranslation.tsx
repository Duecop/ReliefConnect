import React, { ComponentType, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Higher-Order Component (HOC) that forces a component to re-render when the language changes
 * Use this to wrap components that aren't properly updating when language is switched
 * 
 * @param Component The component to wrap
 * @returns A new component that will re-render when language changes
 */
export function withTranslation<P extends object>(Component: ComponentType<P>): React.FC<P> {
  return function WrappedComponent(props: P) {
    const { i18n } = useTranslation();
    const [, setLanguage] = useState(i18n.language);
    
    useEffect(() => {
      // Force re-render when language changes
      const handleLanguageChange = (lng: string) => {
        console.log(`withTranslation HOC detected language change to: ${lng}`);
        setLanguage(lng);
      };
      
      i18n.on('languageChanged', handleLanguageChange);
      
      return () => {
        i18n.off('languageChanged', handleLanguageChange);
      };
    }, [i18n]);
    
    return <Component {...props} />;
  };
}

/**
 * Hook to use in components to ensure they re-render when language changes
 * Useful when component isn't using translations directly but should still re-render
 * on language change
 */
export function useForceTranslationUpdate() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  return currentLang;
} 