/**
 * i18next backend that uses API translation for missing keys
 * Falls back to hardcoded translations, then API translation
 */
import i18next from 'i18next';
import { translationService } from '@/services/translationService';

interface TranslationOptions {
  lng?: string;
  fallbackLng?: string;
  [key: string]: any;
}

class APITranslationBackend {
  type = 'backend';
  init() {
    // Backend initialized
  }

  async read(
    language: string,
    namespace: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    try {
      // First, try to load from existing resources (hardcoded translations)
      const existingResources = i18next.getResourceBundle(language, namespace);
      
      if (existingResources) {
        callback(null, existingResources);
        return;
      }

      // If no hardcoded translations exist, we could translate the default language
      // For now, return empty object and let i18next handle fallback
      callback(null, {});
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * Create a custom i18next plugin that translates missing keys via API
   */
  static createPlugin() {
    return {
      type: 'postProcessor',
      name: 'api-translate',
      process: async function (value: string, key: string[], options: TranslationOptions) {
        // If translation exists, return it
        if (value && value !== key.join('.')) {
          return value;
        }

        // If translation is missing and we're not in default language, try API translation
        const currentLang = options.lng || i18next.language;
        const fallbackLang = options.fallbackLng || 'en';

        if (currentLang !== fallbackLang && key.length > 0) {
          try {
            // Use the last part of the key as the text to translate
            const textToTranslate = key[key.length - 1];
            const translated = await translationService.translate(
              textToTranslate,
              currentLang,
              fallbackLang
            );
            return translated;
          } catch (error) {
            console.error('API translation failed:', error);
            return value;
          }
        }

        return value;
      },
    };
  }
}

export default APITranslationBackend;

