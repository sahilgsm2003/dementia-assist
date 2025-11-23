/**
 * Smart translation hook that combines hardcoded translations with API translation
 * Automatically uses API for missing translations
 */
import { useTranslation } from 'react-i18next';
import { useMemo, useCallback } from 'react';
import { translationService } from '@/services/translationService';

interface TranslationOptions {
  defaultValue?: string;
  [key: string]: any;
}

export const useSmartTranslation = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const fallbackLang = i18n.options.fallbackLng as string || 'en';

  /**
   * Smart translate: tries hardcoded first, then API
   */
  const smartTranslate = useCallback(
    async (key: string, options?: TranslationOptions): Promise<string> => {
      // Try hardcoded translation first
      const hardcoded = t(key, { ...options, defaultValue: null });
      
      // If we got a valid translation (not the key itself), return it
      if (hardcoded && hardcoded !== key && !hardcoded.startsWith(key)) {
        return hardcoded;
      }

      // If in fallback language, return the key or default
      if (currentLang === fallbackLang) {
        return options?.defaultValue || key;
      }

      // Use API translation for missing keys
      try {
        const textToTranslate = options?.defaultValue || key.split('.').pop() || key;
        const translated = await translationService.translate(
          textToTranslate,
          currentLang,
          fallbackLang
        );
        return translated;
      } catch (error) {
        console.error('API translation error:', error);
        return options?.defaultValue || key;
      }
    },
    [t, currentLang, fallbackLang]
  );

  /**
   * Synchronous translate (uses hardcoded only, faster)
   */
  const translate = useCallback(
    (key: string, options?: TranslationOptions): string => {
      return t(key, options);
    },
    [t]
  );

  /**
   * Translate with API fallback (async)
   */
  const translateWithAPI = useCallback(
    async (key: string, options?: TranslationOptions): Promise<string> => {
      return smartTranslate(key, options);
    },
    [smartTranslate]
  );

  return {
    t: translate, // Synchronous (hardcoded only)
    smartTranslate, // Async (hardcoded + API)
    translateWithAPI, // Alias for smartTranslate
    currentLang,
    isReady: i18n.isInitialized,
  };
};

