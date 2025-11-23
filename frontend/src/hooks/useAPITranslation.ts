/**
 * Hook for API-based translation with automatic fallback
 * Use this for dynamic content that isn't in translation files
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/services/translationService';

export const useAPITranslation = () => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Translate text using API, with fallback to hardcoded translations
   */
  const translate = useCallback(
    async (text: string, options?: { namespace?: string; fallback?: string }) => {
      const currentLang = i18n.language;
      const fallbackLang = i18n.options.fallbackLng as string || 'en';

      // If already in fallback language, return original
      if (currentLang === fallbackLang) {
        return text;
      }

      // Try hardcoded translation first
      if (options?.namespace) {
        const hardcoded = i18n.t(text, { ns: options.namespace, defaultValue: null });
        if (hardcoded && hardcoded !== text) {
          return hardcoded;
        }
      }

      // Use API translation
      setIsTranslating(true);
      try {
        const translated = await translationService.translate(text, currentLang, fallbackLang);
        return translated;
      } catch (error) {
        console.error('API translation error:', error);
        return options?.fallback || text;
      } finally {
        setIsTranslating(false);
      }
    },
    [i18n]
  );

  /**
   * Translate multiple texts efficiently
   */
  const translateBatch = useCallback(
    async (texts: string[], options?: { namespace?: string }) => {
      const currentLang = i18n.language;
      const fallbackLang = i18n.options.fallbackLng as string || 'en';

      if (currentLang === fallbackLang) {
        return texts;
      }

      setIsTranslating(true);
      try {
        const translated = await translationService.translateBatch(texts, currentLang, fallbackLang);
        return translated;
      } catch (error) {
        console.error('Batch API translation error:', error);
        return texts;
      } finally {
        setIsTranslating(false);
      }
    },
    [i18n]
  );

  return {
    translate,
    translateBatch,
    isTranslating,
  };
};

