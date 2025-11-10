import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds, default 60
  className?: string;
}

export const VoiceRecorder = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 60,
  className = "",
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType });
        setAudioChunks([]);
        setIsProcessing(true);
        
        // Process the recording
        setTimeout(() => {
          onRecordingComplete(audioBlob);
          setIsProcessing(false);
          setIsRecording(false);
          setRecordingTime(0);
        }, 100);
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event);
        toast({
          title: "Error",
          description: "An error occurred while recording",
          variant: "destructive",
        });
        stopRecording();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Permission denied",
        description: error.message || "Please allow microphone access to record voice notes",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setMediaRecorder(null);
  };

  const handleCancel = () => {
    stopRecording();
    setIsRecording(false);
    setRecordingTime(0);
    setAudioChunks([]);
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">Recording...</p>
                  <p className="text-xs text-white/70">
                    {formatTime(recordingTime)} / {formatTime(maxDuration)}
                  </p>
                </div>
              </div>
              <Button
                onClick={stopRecording}
                variant="outline"
                size="sm"
                className="border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">Processing recording...</p>
        </div>
      )}

      {!isRecording && !isProcessing && (
        <div className="flex items-center gap-3">
          <Button
            onClick={startRecording}
            variant="outline"
            className="border-[#E02478]/50 bg-[#E02478]/10 text-[#E02478] hover:bg-[#E02478]/20"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
          {onCancel && (
            <Button onClick={handleCancel} variant="ghost" size="sm">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

