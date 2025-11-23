import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import api from '@/services/api';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: 'en' | 'hi') => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user, token, refreshUser } = useAuth();
  const [language, setLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language from user preference or localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || i18n.language;
    let langToUse = savedLang;
    
    if (user?.language) {
      // User is logged in, prefer their preference but use localStorage if it's been updated
      // This allows language changes to persist even if user object hasn't refreshed yet
      langToUse = savedLang || user.language;
    }
    
    // Ensure we're using a valid language
    if (langToUse !== 'en' && langToUse !== 'hi') {
      langToUse = 'en';
    }
    
    // Sync state and i18n
    if (langToUse !== language) {
      setLanguage(langToUse);
      i18n.changeLanguage(langToUse);
      localStorage.setItem('i18nextLng', langToUse);
    }
  }, [user?.language]); // Only depend on user language, not our own state

  const changeLanguage = async (lang: 'en' | 'hi') => {
    setIsLoading(true);
    try {
      // Update i18n first
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      localStorage.setItem('i18nextLng', lang);

      // Update backend if user is logged in
      if (token && user) {
        try {
          await api.put('/users/me/language', { language: lang });
          // Refresh user data to get updated language from backend
          await refreshUser();
        } catch (error) {
          console.error('Failed to update language on server:', error);
          // Still update local state even if server update fails
        }
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

