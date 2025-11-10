import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Users, Mic } from "lucide-react";
import { memoriesAPI, voiceNotesAPI } from "@/services/api";
import { formatShortDate } from "@/lib/dateUtils";
import { VoiceRecorder } from "@/components/shared/VoiceRecorder";
import { VoicePlayer } from "@/components/shared/VoicePlayer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

interface Person {
  id: string;
  name: string;
  relationship?: string;
  photos: MemoryPhoto[];
  latestPhoto?: MemoryPhoto;
}

export const PersonDetailPage = () => {
  const navigate = useNavigate();
  const { personName } = useParams<{ personName: string }>();
  const decodedName = personName ? decodeURIComponent(personName) : "";
  const [person, setPerson] = useState<Person | null>(null);
  const [memories, setMemories] = useState<MemoryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [savedVoiceNoteId, setSavedVoiceNoteId] = useState<number | null>(null);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);

  useEffect(() => {
    const loadPersonMemories = async () => {
      try {
        setIsLoading(true);
        const allMemories = await memoriesAPI.listPhotos();
        
        // Filter memories that match this person's name
        const personMemories = allMemories.filter((memory: MemoryPhoto) => {
          if (!memory.description) return false;
          const desc = memory.description.toLowerCase();
          const nameLower = decodedName.toLowerCase();
          return desc.includes(nameLower);
        });

        setMemories(personMemories);

        // Build person object if not provided
        if (personMemories.length > 0) {
          const firstMemory = personMemories[0];
          const desc = firstMemory.description || "";
          
          // Extract name and relationship
          let name = decodedName;
          let relationship: string | undefined;
          
          const commaMatch = desc.match(new RegExp(`^${decodedName}[,\\s]+(.+)$`, "i"));
          if (commaMatch) {
            relationship = commaMatch[1].trim();
          }

          setPerson({
            id: decodedName.toLowerCase(),
            name,
            relationship,
            photos: personMemories,
            latestPhoto: personMemories[0],
          });
        }

        // Load voice notes for this person
        try {
          const voiceNotes = await voiceNotesAPI.listVoiceNotes({ person_id: decodedName });
          if (voiceNotes && voiceNotes.length > 0) {
            // Get the audio URL for the latest voice note
            const latestVoiceNote = voiceNotes[0];
            if (latestVoiceNote.audio_url) {
              // Fetch the audio blob
              const response = await fetch(latestVoiceNote.audio_url);
              const blob = await response.blob();
              setVoiceNote(blob);
              setSavedVoiceNoteId(latestVoiceNote.id);
            }
          }
        } catch (error) {
          console.error("Failed to load voice notes", error);
        }
      } catch (error) {
        console.error("Failed to load person memories", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedName) {
      loadPersonMemories();
    }
  }, [decodedName]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!decodedName) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-people")}
          className="mb-6 text-white/70 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My People
        </Button>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <p className="text-white/70">Invalid person name</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && (!person || memories.length === 0)) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-people")}
          className="mb-6 text-white/70 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My People
        </Button>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-2">Person not found</p>
            <p className="text-sm text-white/50">
              We couldn't find memories for this person
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAskAbout = () => {
    navigate("/ask-moments", {
      state: { 
        initialQuestion: `Tell me about ${person.name}`,
      },
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/my-people")}
        className="text-white/70 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My People
      </Button>

      {/* Person Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {person.latestPhoto && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <img
              src={person.latestPhoto.image_url}
              alt={person.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {person.name}
              </h1>
              {person.relationship && (
                <p className="text-xl text-white/90">
                  This is your {person.relationship}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Facts */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-white/60 mb-1">Memories</p>
                <p className="text-2xl font-bold text-white">{memories.length}</p>
              </div>
              {person.relationship && (
                <div>
                  <p className="text-sm text-white/60 mb-1">Relationship</p>
                  <p className="text-lg font-semibold text-white capitalize">
                    {person.relationship}
                  </p>
                </div>
              )}
              {person.latestPhoto && (
                <div>
                  <p className="text-sm text-white/60 mb-1">Last Added</p>
                  <p className="text-lg font-semibold text-white">
                    {formatShortDate(person.latestPhoto.created_at)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ask About Button */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAskAbout}
            size="lg"
            className="rounded-full bg-[#E02478] px-8 py-6 text-base font-semibold text-white hover:bg-[#E02478]/85"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Ask Moments about {person.name}
          </Button>
          
          {/* Voice Note Button */}
          <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
              >
                <Mic className="mr-2 h-5 w-5" />
                Add Voice Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Voice Note for {person.name}</DialogTitle>
                <DialogDescription>
                  Record a voice note about this person
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {voiceNote ? (
                  <VoicePlayer
                    audioUrl={voiceNote}
                    title={`Voice note about ${person.name}`}
                    onDelete={async () => {
                      if (savedVoiceNoteId) {
                        try {
                          await voiceNotesAPI.deleteVoiceNote(savedVoiceNoteId);
                          toast({
                            title: "Deleted",
                            description: "Voice note deleted",
                          });
                        } catch (error) {
                          console.error("Failed to delete voice note", error);
                        }
                      }
                      setVoiceNote(null);
                      setSavedVoiceNoteId(null);
                    }}
                  />
                ) : (
                  <VoiceRecorder
                    onRecordingComplete={async (blob) => {
                      try {
                        const created = await voiceNotesAPI.createVoiceNote(blob, {
                          person_id: decodedName,
                          description: `Voice note about ${person.name}`,
                        });
                        toast({
                          title: "Success",
                          description: "Voice note saved",
                        });
                        setVoiceNote(blob);
                        setSavedVoiceNoteId(created.id);
                      } catch (error) {
                        console.error("Failed to save voice note", error);
                        toast({
                          title: "Error",
                          description: "Failed to save voice note",
                          variant: "destructive",
                        });
                      }
                    }}
                    maxDuration={120}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Memories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-white">
          Memories with {person.name}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/30 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => {
                // Could open a memory detail modal or navigate to memory page
              }}
            >
              <img
                src={memory.image_url}
                alt={memory.description || "Memory"}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                {memory.description && (
                  <p className="text-sm text-white/80 line-clamp-2">
                    {memory.description}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  {formatShortDate(memory.created_at)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

