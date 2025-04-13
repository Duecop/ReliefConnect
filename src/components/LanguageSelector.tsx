import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, X } from 'lucide-react';
import { languages, LanguageCode } from '../i18n/types';

// Define the swipe threshold for the carousel
const SWIPE_THRESHOLD = 50;

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Set current language index for carousel
  useEffect(() => {
    const currentLangIndex = languages.findIndex(lang => lang.code === i18n.language);
    if (currentLangIndex !== -1) {
      setCarouselIndex(currentLangIndex);
    }
  }, [i18n.language]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Change language function with debugging and transition effect
  const changeLanguage = (langCode: LanguageCode) => {
    console.log(`LanguageSelector: Changing language to ${langCode}`);
    setIsChanging(true);
    
    // Add a small delay for the transition effect
    setTimeout(() => {
      i18n.changeLanguage(langCode)
        .then(() => {
          console.log(`LanguageSelector: Language change success for ${langCode}`);
          localStorage.setItem('preferredLanguage', langCode);
          document.documentElement.dir = languages.find(lang => lang.code === langCode)?.direction || 'ltr';
        })
        .catch((error) => {
          console.error(`LanguageSelector: Error changing language to ${langCode}`, error);
        })
        .finally(() => {
          setTimeout(() => {
            setIsChanging(false);
          }, 100);
        });
    }, 50);
    
    setIsOpen(false);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
      // Swipe left
      const nextIndex = Math.min(carouselIndex + 1, languages.length - 1);
      setCarouselIndex(nextIndex);
      changeLanguage(languages[nextIndex].code);
    } else if (touchEndX - touchStartX > SWIPE_THRESHOLD) {
      // Swipe right
      const prevIndex = Math.max(carouselIndex - 1, 0);
      setCarouselIndex(prevIndex);
      changeLanguage(languages[prevIndex].code);
    }
  };

  // Get current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div 
      className="relative z-50"
      ref={dropdownRef}
    >
      {/* Desktop Dropdown Button */}
      {!isMobile ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-700 ${
            isChanging ? 'opacity-50' : 'bg-white'
          }`}
          aria-label={t('common.selectLanguage', 'Select language')}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="flex items-center space-x-1">
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.nativeName}</span>
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
      ) : (
        // Mobile Swipeable Carousel
        <div 
          className={`flex items-center justify-center px-4 py-2 border-b border-gray-200 shadow-sm ${
            isChanging ? 'opacity-50 bg-gray-50' : 'bg-white'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 w-full justify-center"
            aria-label={t('common.selectLanguage', 'Select language')}
            disabled={isChanging}
          >
            <Globe className="h-4 w-4 text-gray-500" />
            <div className="flex items-center space-x-1">
              <span className="text-xl">{currentLanguage.flag}</span>
              <span className="font-medium text-gray-800">{currentLanguage.nativeName}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-opacity duration-200 ease-in-out animate-fade-in dropdown-menu">
          <div className="p-2 flex justify-between items-center border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">{t('common.selectLanguage', 'Select Language')}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3
                  ${language.code === i18n.language ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                `}
                disabled={isChanging}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 