import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { withTranslation, useForceTranslationUpdate } from '../i18n/withTranslation';

// Example of a component NOT using useTranslation correctly
const BrokenComponent = () => {
  // Problem: This will only run once when the component mounts
  // It won't update when the language changes
  const greeting = useMemo(() => {
    const { t } = useTranslation();
    return t('common.appName');
  }, []); // No dependency on language change
  
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
      <h3 className="text-red-600 font-medium">❌ Broken Translation</h3>
      <p>App Name: {greeting}</p>
      <p className="text-sm text-red-500">This won't update when language changes because it caches the translation.</p>
    </div>
  );
};

// Example of a component correctly using useTranslation
const WorkingComponent = () => {
  const { t } = useTranslation(); // Correct usage: in the component body
  
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
      <h3 className="text-green-600 font-medium">✅ Working Translation</h3>
      <p>App Name: {t('common.appName')}</p>
      <p className="text-sm text-green-600">This updates correctly when language changes.</p>
    </div>
  );
};

// Example of a React.memo component that needs withTranslation HOC
const MemoizedComponent = React.memo(() => {
  const { t } = useTranslation();
  
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
      <h3 className="text-yellow-600 font-medium">⚠️ Memoized Component</h3>
      <p>App Name: {t('common.appName')}</p>
      <p className="text-sm text-yellow-600">
        Without special handling, memoized components might not update.
        React.memo prevents re-renders unless props change.
      </p>
    </div>
  );
});

// Wrap the memoized component with our HOC to force updates on language change
const FixedMemoizedComponent = withTranslation(MemoizedComponent);

// Example component using the Trans component for complex translations
const TransComponent = () => {
  return (
    <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-4">
      <h3 className="text-purple-600 font-medium">🔄 Trans Component</h3>
      <Trans i18nKey="common.appName" />
      <p className="text-sm text-purple-600">
        The Trans component is useful for complex translations with embedded HTML or components.
      </p>
    </div>
  );
};

// A component using the force update hook
const ForceUpdateComponent = () => {
  const currentLang = useForceTranslationUpdate();
  
  // This variable won't automatically update with language changes
  const staticText = "Static Text";
  
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
      <h3 className="text-blue-600 font-medium">🔄 Force Update Hook</h3>
      <p>Current Language: {currentLang}</p>
      <p>Static Text: {staticText}</p>
      <p className="text-sm text-blue-600">
        Using the useForceTranslationUpdate hook ensures this component re-renders
        on language change even if it doesn't use t() directly.
      </p>
    </div>
  );
};

// Main demo component
const TranslationDemo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [fadeIn, setFadeIn] = useState(true);
  
  // Add fade-in effect when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setFadeIn(false);
      setTimeout(() => setFadeIn(true), 50);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  return (
    <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">{t('common.selectLanguage')} - {t('common.appName')}</h2>
        
        <p className="mb-4 text-gray-700">
          This page demonstrates different approaches to handling translations in React components.
          Change the language and observe which components update correctly.
        </p>
        
        <WorkingComponent />
        <BrokenComponent />
        <FixedMemoizedComponent />
        <TransComponent />
        <ForceUpdateComponent />
      </div>
    </div>
  );
};

export default TranslationDemo; 