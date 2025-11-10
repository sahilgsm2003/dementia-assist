import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon, Mic } from "lucide-react";
import { memoriesAPI, voiceNotesAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { VoiceRecorder } from "@/components/shared/VoiceRecorder";
import { VoicePlayer } from "@/components/shared/VoicePlayer";

interface AddMemoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddMemoryForm = ({ onSuccess, onCancel }: AddMemoryFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const memory = await memoriesAPI.uploadPhoto(formData);

      // If voice note exists, create it separately and link to memory
      if (voiceNote && memory.id) {
        try {
          await voiceNotesAPI.createVoiceNote(voiceNote, {
            memory_id: memory.id,
            description: `Voice note for memory: ${description.trim() || "Untitled"}`,
          });
        } catch (error) {
          console.error("Failed to save voice note", error);
          // Don't fail the whole operation if voice note fails
        }
      }

      toast({
        title: "Success",
        description: "Memory added successfully",
      });

      // Reset form
      setFile(null);
      setDescription("");
      setPreview(null);
      setVoiceNote(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to add memory", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="memory-file" className="text-white/80">
          Photo *
        </Label>
        {preview ? (
          <div className="relative">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/20 p-12 transition-colors hover:border-white/30 hover:bg-black/30"
          >
            <ImageIcon className="h-12 w-12 text-white/40 mb-4" />
            <p className="text-sm font-medium text-white/70 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-white/50">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="memory-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="memory-description" className="text-white/80">
          Description
        </Label>
        <Textarea
          id="memory-description"
          placeholder="Who's in this photo? Where was it taken? What's happening?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-black/30 min-h-[100px] text-white placeholder:text-white/50"
          rows={4}
        />
        <p className="text-xs text-white/50">
          Add details about this memory to help you remember it later
        </p>
      </div>

      {/* Voice Note */}
      <div className="space-y-2">
        <Label className="text-white/80">Voice Note (Optional)</Label>
        {voiceNote ? (
          <div className="space-y-2">
            <VoicePlayer
              audioUrl={voiceNote}
              title="Recorded voice note"
              onDelete={() => setVoiceNote(null)}
            />
          </div>
        ) : (
          <VoiceRecorder
            onRecordingComplete={(blob) => setVoiceNote(blob)}
            maxDuration={60}
          />
        )}
        <p className="text-xs text-white/50">
          Add a voice note to describe this memory
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !file}>
          {isSubmitting ? "Adding..." : "Add Memory"}
        </Button>
      </div>
    </form>
  );
};

