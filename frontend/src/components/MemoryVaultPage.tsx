import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { memoriesAPI } from "@/services/api";

type MemoryPhoto = {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
};

type MemoryMatch = {
  image_url: string;
  description?: string;
  created_at?: string;
  confidence: number;
};

export const MemoryVaultPage = () => {
  const [memories, setMemories] = useState<MemoryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [description, setDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [matches, setMatches] = useState<MemoryMatch[]>([]);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMemories = async () => {
      try {
        setIsLoading(true);
        const data = await memoriesAPI.listPhotos();
        setMemories(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, []);

  const handleUploadMemory = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile);
    if (description) {
      formData.append("description", description);
    }

    try {
      setUploading(true);
      const created = await memoriesAPI.uploadPhoto(formData);
      setMemories((prev) => [created, ...prev]);
      setDescription("");
      setUploadFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSearchMemory = async () => {
    if (!searchFile) return;

    const formData = new FormData();
    formData.append("file", searchFile);

    try {
      setSearching(true);
      const data = await memoriesAPI.searchByPhoto(formData);
      setMatches(data.matches ?? []);
    } finally {
      setSearching(false);
    }
  };

  const previewUpload = useMemo(() => {
    if (!uploadFile) return null;
    return URL.createObjectURL(uploadFile);
  }, [uploadFile]);

  const previewSearch = useMemo(() => {
    if (!searchFile) return null;
    return URL.createObjectURL(searchFile);
  }, [searchFile]);

  useEffect(() => {
    return () => {
      if (previewUpload) URL.revokeObjectURL(previewUpload);
      if (previewSearch) URL.revokeObjectURL(previewSearch);
    };
  }, [previewUpload, previewSearch]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-[#E02478]" />
          Memory Vault
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Capture faces, recall stories, keep loved ones close.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          Upload photos with gentle notes, find a familiar face in a moment, and curate a
          gallery of cherished memories.
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-white/10">
          <TabsTrigger value="create">Create Memory</TabsTrigger>
          <TabsTrigger value="search">Find a Memory</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ImagePlus className="h-5 w-5 text-[#E02478]" />
                Upload a new memory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-white/80">Photo</Label>
                  <label
                    htmlFor="memory-photo"
                    className="mt-2 flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 text-center transition hover:border-[#E02478]/60 hover:bg-black/10"
                  >
                    {previewUpload ? (
                      <img
                        src={previewUpload}
                        alt="Preview"
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="space-y-3 text-white/70">
                        <Camera className="mx-auto h-10 w-10 text-[#E02478]" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Drag & drop or click to upload</p>
                          <p className="text-xs text-white/50">JPEG or PNG, up to 10MB</p>
                        </div>
                      </div>
                    )}
                    <Input
                      id="memory-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setUploadFile(file);
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memory-description" className="text-white/80">
                      Description
                    </Label>
                    <Textarea
                      id="memory-description"
                      placeholder="Who is in this photo? Add a warm note or memory."
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="min-h-[160px] bg-black/30 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleUploadMemory}
                    disabled={!uploadFile || uploading}
                    className="w-full rounded-full bg-[#E02478] py-5 text-base font-semibold text-white hover:bg-[#E02478]/85 disabled:opacity-50"
                  >
                    {uploading ? "Saving..." : "Save memory"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="h-5 w-5 text-[#E02478]" />
                Find a memory by face
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                <label
                  htmlFor="memory-search"
                  className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 text-center transition hover:border-[#E02478]/60 hover:bg-black/10"
                >
                  {previewSearch ? (
                    <img
                      src={previewSearch}
                      alt="Search preview"
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="space-y-3 text-white/70">
                      <Camera className="mx-auto h-10 w-10 text-[#E02478]" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Upload a photo to search</p>
                        <p className="text-xs text-white/50">
                          Moments will look for familiar faces in your vault.
                        </p>
                      </div>
                    </div>
                  )}
                  <Input
                    id="memory-search"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSearchFile(file);
                    }}
                  />
                </label>

                <div className="space-y-4">
                  <p className="text-sm text-white/70">
                    Upload a fresh photo and we&apos;ll suggest memories that include the same
                    person. Confidence scores help you see how close a match may be.
                  </p>
                  <Button
                    onClick={handleSearchMemory}
                    disabled={!searchFile || searching}
                    className="rounded-full bg-white/20 px-6 py-4 text-sm font-semibold text-white hover:bg-white/30 disabled:opacity-50"
                  >
                    {searching ? "Searching..." : "Find matching memories"}
                  </Button>

                  <div className="grid gap-4 md:grid-cols-2">
                    {matches.map((match, index) => (
                      <div
                        key={`${match.image_url}-${index}`}
                        className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
                      >
                        <img
                          src={match.image_url}
                          alt={match.description ?? "Memory match"}
                          className="h-40 w-full object-cover"
                        />
                        <div className="space-y-2 p-4">
                          <div className="flex items-center justify-between text-sm text-white/70">
                            <span>{match.description ?? "Unnamed memory"}</span>
                            <span className="text-white">
                              {(match.confidence * 100).toFixed(0)}% match
                            </span>
                          </div>
                          {match.created_at && (
                            <p className="text-xs text-white/50">
                              Saved {new Date(match.created_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {!matches.length && (
                      <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                        Upload a photo to see matching memories.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-white">Saved memories</CardTitle>
              <Button
                variant="ghost"
                className="text-sm text-white/70 hover:text-white"
                onClick={() => {
                  galleryRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {isLoading ? "Refreshing..." : "Scroll to latest"}
              </Button>
            </CardHeader>
            <CardContent ref={galleryRef}>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-white/70">
                  Loading memories...
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {memories.map((memory) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition-all duration-300 hover:border-white/20"
                    >
                      <img
                        src={memory.image_url}
                        alt={memory.description ?? "Memory"}
                        className="h-48 w-full object-cover"
                      />
                      <div className="space-y-3 p-5">
                        <p className="text-sm font-medium text-white">
                          {memory.description ?? "Untitled memory"}
                        </p>
                        <p className="text-xs text-white/50">
                          Saved {new Date(memory.created_at).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {!memories.length && (
                    <div className="col-span-full flex h-32 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 text-sm text-white/60">
                      No memories yet. Create your first one to see it here.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemoryVaultPage;

