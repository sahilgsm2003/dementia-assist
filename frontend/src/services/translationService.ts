/**
 * API-based translation service with caching and fallback
 */
import api from './api';

interface TranslationCache {
  [key: string]: string;
}

class TranslationService {
  private cache: TranslationCache = {};
  private cacheKey = 'translation_cache';
  private maxCacheSize = 1000;

  constructor() {
    this.loadCache();
  }

  /**
   * Load cache from localStorage
   */
  private loadCache(): void {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
      this.cache = {};
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(): void {
    try {
      // Limit cache size
      const entries = Object.entries(this.cache);
      if (entries.length > this.maxCacheSize) {
        // Remove oldest entries (simple FIFO)
        const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
        toRemove.forEach(([key]) => delete this.cache[key]);
      }
      localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  /**
   * Generate cache key
   */
  private getActiveProvider(): string {
    try {
      const storedProvider = localStorage.getItem('translation_provider');
      if (storedProvider) {
        return storedProvider;
      }
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.translation_provider) {
          return user.translation_provider;
        }
      }
    } catch (error) {
      console.error('Failed to read translation provider from storage:', error);
    }
    return 'libretranslate';
  }

  private getCacheKey(
    text: string,
    targetLang: string,
    sourceLang: string = 'en',
    provider?: string
  ): string {
    const activeProvider = provider || this.getActiveProvider();
    return `${activeProvider}:${sourceLang}:${targetLang}:${text}`;
  }

  /**
   * Translate text using API
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en'
  ): Promise<string> {
    // If same language, return original
    if (sourceLang === targetLang) {
      return text;
    }

    // Check cache first
    const provider = this.getActiveProvider();
    const cacheKey = this.getCacheKey(text, targetLang, sourceLang, provider);
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      // Call backend translation API
      const response = await api.post('/translation/translate', {
        text,
        target_lang: targetLang,
        source_lang: sourceLang,
      });

      const translatedText = response.data.translated_text || text;

      // Cache the result
      if (translatedText !== text) {
        this.cache[cacheKey] = translatedText;
        this.saveCache();
      }

      return translatedText;
    } catch (error) {
      console.error('Translation API error:', error);
      // Return original text on error (fallback)
      return text;
    }
  }

  /**
   * Translate multiple texts efficiently
   */
  async translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang: string = 'en'
  ): Promise<string[]> {
    const provider = this.getActiveProvider();

    // Check cache for each text
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    const results: string[] = [];

    texts.forEach((text, index) => {
      const cacheKey = this.getCacheKey(text, targetLang, sourceLang, provider);
      if (this.cache[cacheKey]) {
        results[index] = this.cache[cacheKey];
      } else {
        uncachedTexts.push(text);
        uncachedIndices.push(index);
        results[index] = text; // Placeholder
      }
    });

    // If all cached, return results
    if (uncachedTexts.length === 0) {
      return results;
    }

    try {
      // Batch translate uncached texts
      const response = await api.post('/translation/translate/batch', {
        texts: uncachedTexts,
        target_lang: targetLang,
        source_lang: sourceLang,
      });

      const translatedTexts = response.data.translated_texts || uncachedTexts;

      // Update results and cache
      uncachedIndices.forEach((originalIndex, batchIndex) => {
        const translated = translatedTexts[batchIndex];
        results[originalIndex] = translated;

        // Cache the result
        const text = uncachedTexts[batchIndex];
        const cacheKey = this.getCacheKey(text, targetLang, sourceLang, provider);
        if (translated !== text) {
          this.cache[cacheKey] = translated;
        }
      });

      this.saveCache();
    } catch (error) {
      console.error('Batch translation API error:', error);
      // Return original texts on error
    }

    return results;
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(this.cacheKey);
  }

  /**
   * Force provider change and reset caches so future translations use new service.
   */
  setActiveProvider(provider: string): void {
    try {
      localStorage.setItem('translation_provider', provider);
    } catch (error) {
      console.error('Failed to persist translation provider:', error);
    }
    this.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: Object.keys(this.cache).length,
      maxSize: this.maxCacheSize,
    };
  }
}

// Export singleton instance
export const translationService = new TranslationService();

