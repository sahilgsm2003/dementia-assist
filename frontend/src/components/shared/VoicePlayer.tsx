import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { motion } from "framer-motion";

interface VoicePlayerProps {
  audioUrl: string | Blob;
  title?: string;
  className?: string;
  onDelete?: () => void;
}

export const VoicePlayer = ({
  audioUrl,
  title = "Voice Note",
  className = "",
  onDelete,
}: VoicePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    
    // Handle blob URLs
    if (audioUrl instanceof Blob) {
      audio.src = URL.createObjectURL(audioUrl);
    } else {
      audio.src = audioUrl;
    }

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      setIsLoading(false);
    });

    audioRef.current = audio;

    return () => {
      if (audioUrl instanceof Blob) {
        URL.revokeObjectURL(audio.src);
      }
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <p className="text-sm text-white/70">Loading audio...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <p className="text-sm font-medium text-white/90">{title}</p>
      )}
      
      <div className="flex items-center gap-3">
        <Button
          onClick={togglePlayPause}
          variant="outline"
          size="sm"
          className="border-[#E02478]/50 bg-[#E02478]/10 text-[#E02478] hover:bg-[#E02478]/20"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              className="h-full bg-[#E02478]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

