import { motion } from "framer-motion";
import { Users, Images, Calendar, MapPin, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SearchResult {
  id: number | string;
  type: "person" | "memory" | "reminder" | "place" | "document";
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
}

const typeIcons = {
  person: Users,
  memory: Images,
  reminder: Calendar,
  place: MapPin,
  document: FileText,
};

const typeLabels = {
  person: "Person",
  memory: "Memory",
  reminder: "Reminder",
  place: "Place",
  document: "Document",
};

export const SearchResults = ({
  results,
  isLoading,
  query,
  onResultClick,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        <span className="ml-3 text-sm text-white/70">Searching...</span>
      </div>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="p-12 text-center">
        <p className="text-white/70 mb-2">No results found</p>
        <p className="text-sm text-white/50">
          Try a different search term or check your filters
        </p>
      </div>
    );
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="p-4 space-y-6">
      {Object.entries(groupedResults).map(([type, typeResults]) => {
        const Icon = typeIcons[type as keyof typeof typeIcons];
        const label = typeLabels[type as keyof typeof typeLabels];

        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <Icon className="h-4 w-4 text-[#E02478]" />
              <h3 className="text-sm font-semibold text-white/70">{label}</h3>
              <span className="text-xs text-white/50">({typeResults.length})</span>
            </div>
            <div className="space-y-1">
              {typeResults.map((result, index) => (
                <motion.div
                  key={`${result.type}-${result.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                    onClick={() => onResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {result.imageUrl && (
                          <img
                            src={result.imageUrl}
                            alt={result.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {result.title}
                          </h4>
                          {result.description && (
                            <p className="mt-1 text-xs text-white/70 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.metadata && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {result.metadata.date && (
                                <span className="text-xs text-white/50">
                                  {result.metadata.date}
                                </span>
                              )}
                              {result.metadata.location && (
                                <span className="text-xs text-white/50">
                                  {result.metadata.location}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

