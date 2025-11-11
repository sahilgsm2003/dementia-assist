import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonGrid } from "@/components/shared/SkeletonGrid";
import { PersonCard } from "./PersonCard";
import { memoriesAPI } from "@/services/api";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

interface Person {
  id: string; // Composite ID based on name
  name: string;
  relationship?: string;
  photos: MemoryPhoto[];
  latestPhoto?: MemoryPhoto;
}

export const PeopleGallery = () => {
  const [memories, setMemories] = useState<MemoryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract people from memory descriptions
  // For now, we'll parse descriptions to find person names
  // In Phase 5, this will use a dedicated people API
  const people = useMemo(() => {
    const peopleMap = new Map<string, Person>();

    memories.forEach((memory) => {
      if (!memory.description) return;

      // Try to extract person name and relationship from description
      // Format: "Sarah Johnson, my daughter" or "John - Brother" or just "Sarah"
      const description = memory.description.trim();
      
      // Try to parse common patterns
      let name = description;
      let relationship: string | undefined;

      // Pattern 1: "Name, relationship" or "Name - relationship"
      const commaMatch = description.match(/^([^,]+),\s*(.+)$/);
      const dashMatch = description.match(/^([^-]+)\s*-\s*(.+)$/);
      
      if (commaMatch) {
        name = commaMatch[1].trim();
        relationship = commaMatch[2].trim();
      } else if (dashMatch) {
        name = dashMatch[1].trim();
        relationship = dashMatch[2].trim();
      } else {
        // Check if description contains relationship keywords
        const relationshipKeywords = [
          "daughter", "son", "mother", "father", "sister", "brother",
          "wife", "husband", "friend", "caregiver", "grandmother", "grandfather",
          "aunt", "uncle", "cousin", "neighbor"
        ];
        
        const lowerDesc = description.toLowerCase();
        for (const keyword of relationshipKeywords) {
          if (lowerDesc.includes(keyword)) {
            const parts = description.split(new RegExp(keyword, "i"));
            name = parts[0].trim() || parts[1]?.trim() || description;
            relationship = keyword;
            break;
          }
        }
      }

      // Normalize name (capitalize first letter of each word)
      name = name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

      if (!name || name.length < 2) return; // Skip if name is too short

      const personId = name.toLowerCase();

      if (!peopleMap.has(personId)) {
        peopleMap.set(personId, {
          id: personId,
          name,
          relationship,
          photos: [],
        });
      }

      const person = peopleMap.get(personId)!;
      person.photos.push(memory);
      
      // Set latest photo if this is more recent
      if (!person.latestPhoto || new Date(memory.created_at) > new Date(person.latestPhoto.created_at)) {
        person.latestPhoto = memory;
      }
    });

    return Array.from(peopleMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [memories]);

  useEffect(() => {
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

    loadMemories();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 bg-white/10 mb-2" />
          <Skeleton className="h-4 w-64 bg-white/10" />
        </div>
        <SkeletonGrid count={8} columns={4} showImage />
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 mb-2">No people added yet</p>
          <p className="text-sm text-white/50">
            Add photos with names and relationships to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {people.length} {people.length === 1 ? "Person" : "People"}
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Tap on a person to see their details and memories
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <PersonCard person={person} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

