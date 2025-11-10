import { SkeletonGrid } from "@/components/shared/SkeletonGrid";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

interface MemoryCollectionsProps {
  memories: MemoryPhoto[];
  view: "all" | "people" | "places" | "time" | "stories";
  isLoading: boolean;
  onRefresh: () => void;
}

export const MemoryCollections = ({
  memories,
  view,
  isLoading,
  onRefresh,
}: MemoryCollectionsProps) => {
  // Group memories by people (extract names from descriptions)
  const memoriesByPeople = useMemo(() => {
    const groups: Record<string, MemoryPhoto[]> = {};
    memories.forEach((memory) => {
      if (!memory.description) {
        if (!groups["Unknown"]) groups["Unknown"] = [];
        groups["Unknown"].push(memory);
        return;
      }

      // Try to extract person names from description
      // This is a simple heuristic - in production, you'd use proper tagging
      const words = memory.description.split(/\s+/);
      let foundPerson = false;

      words.forEach((word) => {
        // Capitalized words might be names
        if (word[0] === word[0]?.toUpperCase() && word.length > 2) {
          if (!groups[word]) groups[word] = [];
          groups[word].push(memory);
          foundPerson = true;
        }
      });

      if (!foundPerson) {
        if (!groups["Other"]) groups["Other"] = [];
        groups["Other"].push(memory);
      }
    });
    return groups;
  }, [memories]);

  // Group memories by time periods
  const memoriesByTime = useMemo(() => {
    const groups: Record<string, MemoryPhoto[]> = {
      "This Week": [],
      "This Month": [],
      "This Year": [],
      "Older": [],
    };

    const now = new Date();
    memories.forEach((memory) => {
      const date = new Date(memory.created_at);
      const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 7) {
        groups["This Week"].push(memory);
      } else if (daysDiff <= 30) {
        groups["This Month"].push(memory);
      } else if (daysDiff <= 365) {
        groups["This Year"].push(memory);
      } else {
        groups["Older"].push(memory);
      }
    });

    return groups;
  }, [memories]);

  // Group memories by places (extract place names from descriptions)
  const memoriesByPlaces = useMemo(() => {
    const groups: Record<string, MemoryPhoto[]> = {};
    const placeKeywords = ["home", "park", "beach", "restaurant", "store", "hospital", "church"];

    memories.forEach((memory) => {
      if (!memory.description) {
        if (!groups["Unknown"]) groups["Unknown"] = [];
        groups["Unknown"].push(memory);
        return;
      }

      const descLower = memory.description.toLowerCase();
      let foundPlace = false;

      placeKeywords.forEach((keyword) => {
        if (descLower.includes(keyword)) {
          const placeName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          if (!groups[placeName]) groups[placeName] = [];
          groups[placeName].push(memory);
          foundPlace = true;
        }
      });

      if (!foundPlace) {
        if (!groups["Other"]) groups["Other"] = [];
        groups["Other"].push(memory);
      }
    });

    return groups;
  }, [memories]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={6} columns={3} showImage />
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Images className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 mb-2">No memories yet</p>
          <p className="text-sm text-white/50">
            Add your first memory to start building your collection
          </p>
        </CardContent>
      </Card>
    );
  }

  if (view === "all") {
    return <MemoryGallery memories={memories} onRefresh={onRefresh} />;
  }

  if (view === "people") {
    const groups = Object.entries(memoriesByPeople);
    return (
      <div className="space-y-8">
        {groups.map(([person, personMemories], index) => (
          <motion.section
            key={person}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#E02478]/20">
                <Users className="h-5 w-5 text-[#E02478]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{person}</h2>
              <span className="text-sm text-white/60">({personMemories.length})</span>
            </div>
            <MemoryGallery memories={personMemories} onRefresh={onRefresh} />
          </motion.section>
        ))}
      </div>
    );
  }

  if (view === "places") {
    const groups = Object.entries(memoriesByPlaces);
    return (
      <div className="space-y-8">
        {groups.map(([place, placeMemories], index) => (
          <motion.section
            key={place}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{place}</h2>
              <span className="text-sm text-white/60">({placeMemories.length})</span>
            </div>
            <MemoryGallery memories={placeMemories} onRefresh={onRefresh} />
          </motion.section>
        ))}
      </div>
    );
  }

  if (view === "time") {
    const groups = Object.entries(memoriesByTime).filter(([_, mems]) => mems.length > 0);
    return (
      <div className="space-y-8">
        {groups.map(([period, periodMemories], index) => (
          <motion.section
            key={period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{period}</h2>
              <span className="text-sm text-white/60">({periodMemories.length})</span>
            </div>
            <MemoryGallery memories={periodMemories} onRefresh={onRefresh} />
          </motion.section>
        ))}
      </div>
    );
  }

  if (view === "stories") {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 mb-2">Stories coming soon</p>
          <p className="text-sm text-white/50">
            Group your memories into beautiful stories and narratives
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

