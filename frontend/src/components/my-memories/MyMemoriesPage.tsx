import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Images, Plus, Search, Calendar, Users, MapPin, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ExportDialog } from "@/components/shared/ExportDialog";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

export const MyMemoriesPage = () => {
  const [memories, setMemories] = useState<MemoryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "people" | "places" | "time" | "stories">("all");

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      const data = await memoriesAPI.listPhotos();
      setMemories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load memories", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemoryAdded = () => {
    setIsFormOpen(false);
    loadMemories();
  };

  const filteredMemories = memories.filter((memory) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      memory.description?.toLowerCase().includes(query) ||
      memory.created_at.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Images className="h-4 w-4 text-[#E02478]" />
          My Memories
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Your precious moments, beautifully organized.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          Browse your memories by people, places, time, or create stories that bring them together.
        </p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/30 pl-10 text-white placeholder:text-white/50"
          />
        </div>
        <div className="flex items-center gap-3">
          {memories.length > 0 && (
            <ExportDialog
              type="memory-book"
              elementId="memory-book-print"
              title="Memory Book"
            />
          )}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#E02478] px-6 py-6 text-base font-semibold text-white hover:bg-[#E02478]/85">
              <Plus className="mr-2 h-5 w-5" />
              Add Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add a Memory</DialogTitle>
              <DialogDescription>
                Upload a photo and add details to preserve this moment
              </DialogDescription>
            </DialogHeader>
            <AddMemoryForm
              onSuccess={handleMemoryAdded}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections Tabs */}
      <div id="memory-book-print" className="print-view hidden print:block">
        <h2 className="text-2xl font-bold mb-4">Memory Book</h2>
        <p className="text-sm text-gray-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
        <MemoryCollections
          memories={filteredMemories}
          view="all"
          isLoading={isLoading}
          onRefresh={loadMemories}
        />
      </div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6 print:hidden">
        <TabsList className="bg-white/10">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            All Memories
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By People
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            By Places
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            By Time
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MemoryCollections
            memories={filteredMemories}
            view="all"
            isLoading={isLoading}
            onRefresh={loadMemories}
          />
        </TabsContent>

        <TabsContent value="people">
          <MemoryCollections
            memories={filteredMemories}
            view="people"
            isLoading={isLoading}
            onRefresh={loadMemories}
          />
        </TabsContent>

        <TabsContent value="places">
          <MemoryCollections
            memories={filteredMemories}
            view="places"
            isLoading={isLoading}
            onRefresh={loadMemories}
          />
        </TabsContent>

        <TabsContent value="time">
          <MemoryCollections
            memories={filteredMemories}
            view="time"
            isLoading={isLoading}
            onRefresh={loadMemories}
          />
        </TabsContent>

        <TabsContent value="stories">
          <MemoryCollections
            memories={filteredMemories}
            view="stories"
            isLoading={isLoading}
            onRefresh={loadMemories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

