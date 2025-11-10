import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";
import { SearchFilters } from "./SearchFilters";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { results, isLoading, search, recentSearches, clearRecentSearches } = useSearch();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    await search(searchQuery, selectedTypes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  const handleResultClick = (result: any) => {
    onClose();
    // Navigate based on result type
    if (result.type === "person") {
      navigate(`/my-people/${encodeURIComponent(result.name)}`);
    } else if (result.type === "memory") {
      navigate(`/my-memories/${result.id}`);
    } else if (result.type === "reminder") {
      navigate("/my-day");
    } else if (result.type === "place") {
      navigate(`/my-places/${result.id}`);
    } else if (result.type === "document") {
      navigate("/ask-moments", { state: { tab: "documents" } });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-white/10 p-4">
                <Search className="h-5 w-5 text-white/50" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search people, memories, reminders, places..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch(query);
                    }
                  }}
                  className="flex-1 border-0 bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-8 w-8 p-0 ${showFilters ? "bg-white/10" : ""}`}
                >
                  <Filter className="h-4 w-4 text-white/70" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4 text-white/70" />
                </Button>
              </form>

              {/* Filters */}
              {showFilters && (
                <div className="border-b border-white/10 p-4">
                  <SearchFilters
                    selectedTypes={selectedTypes}
                    onTypesChange={setSelectedTypes}
                  />
                </div>
              )}

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() ? (
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    query={query}
                    onResultClick={handleResultClick}
                  />
                ) : (
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white/70">Recent Searches</h3>
                      {recentSearches.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="h-6 text-xs text-white/50 hover:text-white/70"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {recentSearches.length === 0 ? (
                      <p className="text-sm text-white/50">
                        No recent searches. Start typing to search...
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recentSearches.map((recentQuery, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(recentQuery)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Clock className="h-4 w-4" />
                            <span>{recentQuery}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-3 text-center">
                <p className="text-xs text-white/40">
                  Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">Esc</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

