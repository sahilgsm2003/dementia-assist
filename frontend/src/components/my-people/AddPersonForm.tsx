import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ImagePlus } from "lucide-react";
import { memoriesAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface AddPersonFormProps {
  onSuccess?: () => void;
}

export const AddPersonForm = ({ onSuccess }: AddPersonFormProps) => {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!photoFile) return null;
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  const handleSubmit = async () => {
    if (!photoFile) {
      toast({
        title: "Error",
        description: "Please select a photo",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter the person's name",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", photoFile);

      // Build description with name, relationship, and notes
      let description = name.trim();
      if (relationship.trim()) {
        description += `, ${relationship.trim()}`;
      }
      if (notes.trim()) {
        description += ` - ${notes.trim()}`;
      }
      formData.append("description", description);

      await memoriesAPI.uploadPhoto(formData);

      toast({
        title: "Success",
        description: `${name} has been added to My People`,
      });

      // Reset form
      setName("");
      setRelationship("");
      setNotes("");
      setPhotoFile(null);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to add person", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ImagePlus className="h-5 w-5 text-[#E02478]" />
          Add a Person
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Photo Upload */}
          <div>
            <Label className="text-white/80 mb-2 block">Photo</Label>
            <label
              htmlFor="person-photo"
              className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 text-center transition hover:border-[#E02478]/60 hover:bg-black/10"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="space-y-3 text-white/70">
                  <Camera className="mx-auto h-10 w-10 text-[#E02478]" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload photo</p>
                    <p className="text-xs text-white/50">JPEG or PNG, up to 10MB</p>
                  </div>
                </div>
              )}
              <Input
                id="person-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setPhotoFile(file);
                }}
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="person-name" className="text-white/80">
                Name *
              </Label>
              <Input
                id="person-name"
                placeholder="e.g., Sarah Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="person-relationship" className="text-white/80">
                Relationship
              </Label>
              <Input
                id="person-relationship"
                placeholder="e.g., Daughter, Friend, Brother"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="bg-black/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="person-notes" className="text-white/80">
                Notes
              </Label>
              <Textarea
                id="person-notes"
                placeholder="Add any helpful notes about this person..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] bg-black/30"
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!photoFile || !name.trim() || uploading}
              className="w-full rounded-full bg-[#E02478] py-5 text-base font-semibold text-white hover:bg-[#E02478]/85 disabled:opacity-50"
            >
              {uploading ? "Adding..." : "Add Person"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

