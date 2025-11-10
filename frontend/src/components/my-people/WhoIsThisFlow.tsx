import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Search, Users } from "lucide-react";
import { memoriesAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { useNavigate } from "react-router-dom";

interface MemoryMatch {
  image_url: string;
  description?: string;
  created_at?: string;
  confidence: number;
}

export const WhoIsThisFlow = () => {
  const navigate = useNavigate();
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<MemoryMatch[]>([]);

  const previewUrl = useMemo(() => {
    if (!searchFile) return null;
    return URL.createObjectURL(searchFile);
  }, [searchFile]);

  const handleSearch = async () => {
    if (!searchFile) {
      toast({
        title: "Error",
        description: "Please select a photo to search",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearching(true);
      const formData = new FormData();
      formData.append("file", searchFile);

      const data = await memoriesAPI.searchByPhoto(formData);
      setMatches(data.matches ?? []);

      if (!data.matches || data.matches.length === 0) {
        toast({
          title: "No matches found",
          description: "We couldn't find this person in your memories. Try adding them first!",
        });
      }
    } catch (error) {
      console.error("Failed to search", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-[#E02478]" />
            Who is this?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            {/* Photo Upload */}
            <label
              htmlFor="who-is-this-photo"
              className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 text-center transition hover:border-[#E02478]/60 hover:bg-black/10"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Search preview"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="space-y-3 text-white/70">
                  <Camera className="mx-auto h-10 w-10 text-[#E02478]" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload a photo</p>
                    <p className="text-xs text-white/50">
                      We'll find this person in your memories
                    </p>
                  </div>
                </div>
              )}
              <Input
                id="who-is-this-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSearchFile(file);
                }}
              />
            </label>

            {/* Search Results */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/70 mb-4">
                  Upload a photo and we'll search your memories to find this person. 
                  If we find a match, you can see their details and all memories together.
                </p>
                <Button
                  onClick={handleSearch}
                  disabled={!searchFile || searching}
                  className="rounded-full bg-[#E02478] px-6 py-4 text-sm font-semibold text-white hover:bg-[#E02478]/85 disabled:opacity-50"
                >
                  {searching ? "Searching..." : "Find This Person"}
                </Button>
              </div>

              {/* Matches */}
              {matches.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Found {matches.length} {matches.length === 1 ? "match" : "matches"}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {matches.map((match, index) => {
                      // Extract person name from description
                      const personName = match.description?.split(",")[0]?.trim() || "Unknown";
                      
                      return (
                        <motion.div
                          key={`${match.image_url}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="overflow-hidden rounded-xl border border-white/10 bg-black/30 cursor-pointer hover:border-[#E02478]/50 transition-all"
                          onClick={() => {
                            // Navigate to person detail
                            navigate(`/my-people/${encodeURIComponent(personName)}`, {
                              state: { fromSearch: true, match },
                            });
                          }}
                        >
                          <img
                            src={match.image_url}
                            alt={match.description || "Memory match"}
                            className="h-40 w-full object-cover"
                          />
                          <div className="space-y-2 p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white">
                                {personName}
                              </p>
                              <span className="text-xs font-medium text-[#E02478]">
                                {(match.confidence * 100).toFixed(0)}% match
                              </span>
                            </div>
                            {match.description && (
                              <p className="text-xs text-white/60">
                                {match.description}
                              </p>
                            )}
                            {match.created_at && (
                              <p className="text-xs text-white/50">
                                Saved {new Date(match.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!matches.length && searchFile && !searching && (
                <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center">
                  <Users className="h-8 w-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/60">
                    No matches found. This person might not be in your memories yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

