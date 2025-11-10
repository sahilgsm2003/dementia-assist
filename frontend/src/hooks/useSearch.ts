import { useState, useCallback } from "react";
import { searchAPI } from "@/services/api";

export interface SearchResult {
  id: number | string;
  type: "person" | "memory" | "reminder" | "place" | "document";
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface UseSearchReturn {
  results: SearchResult[];
  isLoading: boolean;
  search: (query: string, types?: string[]) => Promise<void>;
  recentSearches: string[];
  clearRecentSearches: () => void;
}

const RECENT_SEARCHES_KEY = "moments_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export const useSearch = (): UseSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const search = useCallback(
    async (query: string, types?: string[]) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const data = await searchAPI.globalSearch(query, types);
        setResults(data || []);
        saveRecentSearch(query);
      } catch (error) {
        console.error("Search failed", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [saveRecentSearch]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  return {
    results,
    isLoading,
    search,
    recentSearches,
    clearRecentSearches,
  };
};

