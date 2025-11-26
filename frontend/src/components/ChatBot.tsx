import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import {
  Send,
  Bot,
  User,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { voiceCloneAPI } from "@/services/api";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: number;
  highlightedWordIndex?: number;
}

interface ChatBotProps {
  onSendMessage: (message: string) => Promise<{
    response: string;
    confidence_score: number;
    sources_used: number;
  }>;
  isLoading?: boolean;
  className?: string;
  hasKnowledgeBase?: boolean;
}

interface SpeechSyncState {
  startTime: number;
  wordsPerSecond: number;
  totalWords: number;
  lastEstimatedIndex: number;
  lastBoundaryIndex: number;
}

interface VoiceCloneStatus {
  has_voice_profile: boolean;
  voice_profile: {
    id: number;
    language: string;
    is_active: boolean;
  } | null;
}

const ChatBot: React.FC<ChatBotProps> = ({
  onSendMessage,
  isLoading = false,
  className = "",
  hasKnowledgeBase = false,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const speechLocale = language === "hi" ? "hi-IN" : "en-US";
  const WELCOME_MESSAGE_ID = "welcome-message";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    setMessages((prev) => {
      const otherMessages = prev.filter(
        (message) => message.id !== WELCOME_MESSAGE_ID
      );
      return [
        {
          id: WELCOME_MESSAGE_ID,
          type: "bot",
          content: hasKnowledgeBase
            ? t("chat.welcomeWithDocs")
            : t("chat.welcomeNoDocs"),
          timestamp: new Date(),
        },
        ...otherMessages,
      ];
    });
  }, [hasKnowledgeBase, t, language]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const boundaryEventFiredRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const speechSyncRef = useRef<SpeechSyncState | null>(null);
  
  // Voice cloning state
  const [voiceCloneStatus, setVoiceCloneStatus] = useState<VoiceCloneStatus | null>(null);
  const [isLoadingVoiceClone, setIsLoadingVoiceClone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getNow = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const cancelSpeechSync = () => {
    if (typeof window !== "undefined" && animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = null;
    speechSyncRef.current = null;
  };

  const startSpeechSync = (totalWords: number, rate: number) => {
    if (typeof window === "undefined" || totalWords <= 0) {
      return;
    }

    cancelSpeechSync();

    const baseWordsPerSecond = 3.2;
    const initialWordsPerSecond = Math.max(
      1.8,
      Math.min(baseWordsPerSecond * rate, 5.5)
    );

    const state: SpeechSyncState = {
      startTime: getNow(),
      wordsPerSecond: initialWordsPerSecond,
      totalWords,
      lastEstimatedIndex: 0,
      lastBoundaryIndex: 0,
    };

    speechSyncRef.current = state;

    const tick = () => {
      const syncState = speechSyncRef.current;
      if (!syncState) {
        return;
      }

      const elapsedSeconds = (getNow() - syncState.startTime) / 1000;
      const predictedIndex = Math.floor(
        elapsedSeconds * syncState.wordsPerSecond
      );
      const boundedIndex = Math.min(
        syncState.totalWords - 1,
        Math.max(0, predictedIndex)
      );

      if (boundedIndex > syncState.lastEstimatedIndex) {
        syncState.lastEstimatedIndex = boundedIndex;
        setHighlightedWordIndex(boundedIndex);
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load voice clone status on mount and when language changes
  useEffect(() => {
    const loadVoiceCloneStatus = async () => {
      try {
        const status = await voiceCloneAPI.getStatus();
        setVoiceCloneStatus(status);
      } catch (error) {
        console.log("Voice cloning not available:", error);
        setVoiceCloneStatus(null);
      }
    };
    loadVoiceCloneStatus();
  }, [language]);

  // Select the best available voice for natural-sounding speech
  const selectBestVoice = (
    voices: SpeechSynthesisVoice[],
    targetLanguage: string
  ): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    // Priority order for voice selection (most natural-sounding first)
    const preferredKeywords = [
      "neural", // Neural voices are usually more natural
      "premium", // Premium voices
      "enhanced", // Enhanced voices
      "natural", // Natural voices
      "google", // Google voices (often high quality)
      "microsoft", // Microsoft voices
      "zira", // Windows natural voice
      "samantha", // macOS natural voice
      "karen", // macOS natural voice
      "moira", // macOS natural voice
      "susan", // macOS natural voice
    ];

    // For Hindi, prioritize Indian voices and specific high-quality voice names
    const hindiIndianKeywords = [
      "india",
      "indian",
      "hi-in",
      "hindi-india",
      "hindi-in",
    ];
    
    // Specific high-quality Hindi voice names (in priority order)
    const preferredHindiVoices = [
      "kalpana",        // Microsoft Kalpana - very natural female Hindi voice
      "madhur",         // Microsoft Madhur - natural male Hindi voice
      "google हिन्दी",  // Google Hindi (Devanagari)
      "google hindi",   // Google Hindi (Latin)
      "wavenet",        // Google Wavenet voices (high quality)
      "neural2",        // Google Neural2 voices (very natural)
      "neural",         // Neural voices in general
    ];

    const targetPrefix = targetLanguage === "hi" ? "hi" : "en";
    
    // For Hindi, first try to find Indian Hindi voices (hi-IN)
    let localeVoices: SpeechSynthesisVoice[] = [];
    if (targetLanguage === "hi") {
      // Prioritize Indian Hindi voices (hi-IN)
      const indianHindiVoices = voices.filter((v) =>
        v.lang?.toLowerCase().startsWith("hi-in") || 
        v.lang?.toLowerCase() === "hi-in"
      );
      
      // Also check for generic Hindi voices (hi)
      const genericHindiVoices = voices.filter((v) =>
        v.lang?.toLowerCase().startsWith("hi") && 
        !v.lang?.toLowerCase().startsWith("hi-in")
      );
      
      localeVoices = [...indianHindiVoices, ...genericHindiVoices];
    } else {
      // For English, filter by en prefix
      localeVoices = voices.filter((v) =>
        v.lang?.toLowerCase().startsWith(targetPrefix)
      );
    }

    const fallbackVoices =
      targetPrefix === "en"
        ? localeVoices
        : voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
    const candidateVoices =
      localeVoices.length > 0
        ? localeVoices
        : fallbackVoices.length > 0
        ? fallbackVoices
        : voices;

    // Score voices based on preferred keywords
    let bestVoice: SpeechSynthesisVoice | null = null;
    let bestScore = -1;

    for (const voice of candidateVoices) {
      const nameLower = voice.name.toLowerCase();
      const langLower = voice.lang?.toLowerCase() || "";
      let score = 0;

      // For Hindi, heavily prioritize Indian voices and specific high-quality voices
      if (targetLanguage === "hi") {
        // Check if it's an Indian Hindi voice
        if (langLower.startsWith("hi-in") || langLower === "hi-in") {
          score += 100; // Very high priority for Indian Hindi voices
        }
        
        // Prioritize specific known high-quality Hindi voices
        for (let i = 0; i < preferredHindiVoices.length; i++) {
          if (nameLower.includes(preferredHindiVoices[i])) {
            score += (preferredHindiVoices.length - i) * 30; // Higher score for better voices
            break;
          }
        }
        
        // Check for Indian keywords in voice name
        for (const keyword of hindiIndianKeywords) {
          if (nameLower.includes(keyword)) {
            score += 50; // High priority for Indian keywords
            break;
          }
        }
      }

      // Check for preferred keywords (higher score for earlier keywords)
      for (let i = 0; i < preferredKeywords.length; i++) {
        if (nameLower.includes(preferredKeywords[i])) {
          score += (preferredKeywords.length - i) * 10; // Higher score for earlier keywords
          break;
        }
      }

      // Prefer cloud-based voices (usually better quality)
      if (!voice.localService) {
        score += 5;
      }

      // Prefer female voices (often sound more natural and warm)
      if (
        nameLower.includes("female") ||
        nameLower.includes("woman") ||
        nameLower.includes("samantha") ||
        nameLower.includes("karen") ||
        nameLower.includes("zira") ||
        nameLower.includes("moira") ||
        nameLower.includes("susan") ||
        nameLower.includes("aria")
      ) {
        score += 3;
      }

      // Avoid robotic-sounding voices
      if (nameLower.includes("robotic") || nameLower.includes("monotone")) {
        score -= 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestVoice = voice;
      }
    }

    // If no preferred voice found, use first matching voice
    return bestVoice || candidateVoices[0] || null;
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition: { new (): SpeechRecognition };
          }
        ).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = speechLocale;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    // Initialize speech synthesis and select best voice
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;

      // Load voices and select the best one
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        selectedVoiceRef.current = selectBestVoice(voices, language);

        if (selectedVoiceRef.current) {
          console.log("Selected voice:", selectedVoiceRef.current.name);
        }
      };

      // Voices may not be immediately available, so we need to wait
      loadVoices();
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (utteranceRef.current && synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      cancelSpeechSync();
    };
  }, [speechLocale, language]);

  // Start/stop speech recognition
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: t("chat.speechUnsupportedTitle"),
        description: t("chat.speechUnsupportedDescription"),
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
    }
  };

  // Speak message with cloned voice (using API)
  const speakWithClonedVoice = async (messageId: string, text: string) => {
    console.log("[VoiceClone] speakWithClonedVoice called");
    
    // Stop any ongoing speech first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    if (isSpeaking && speakingMessageId === messageId) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setHighlightedWordIndex(-1);
      return;
    }

    setIsLoadingVoiceClone(true);
    setSpeakingMessageId(messageId);
    
    try {
      // Get synthesized audio from API
      console.log("[VoiceClone] Requesting synthesis for:", text.substring(0, 50) + "...", "language:", language);
      const audioBlob = await voiceCloneAPI.synthesizeStream(text, language);
      console.log("[VoiceClone] Got audio blob:", audioBlob.size, "bytes");
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Preload the audio to prevent first words from being clipped
      audio.preload = "auto";
      
      // Set up word highlighting estimation
      const words = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(w => w.length > 0);
      const estimatedDuration = words.length * 0.3; // Rough estimate: 0.3 seconds per word
      
      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoadingVoiceClone(false);
        setHighlightedWordIndex(0);
        
        // Simple word highlighting based on time
        let wordIndex = 0;
        const highlightInterval = setInterval(() => {
          if (wordIndex < words.length - 1) {
            wordIndex++;
            setHighlightedWordIndex(wordIndex);
          } else {
            clearInterval(highlightInterval);
          }
        }, (estimatedDuration / words.length) * 1000);
        
        audio.onended = () => {
          clearInterval(highlightInterval);
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          setHighlightedWordIndex(-1);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };
        
        audio.onpause = () => {
          clearInterval(highlightInterval);
        };
      };
      
      audio.onerror = () => {
        setIsLoadingVoiceClone(false);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        
        // Fallback to browser TTS
        console.log("Cloned voice failed, falling back to browser TTS");
        speakWithBrowserTTS(messageId, text);
      };
      
      // Wait for audio to be ready, then add a small delay to prevent first words from being clipped
      await new Promise<void>((resolve) => {
        audio.oncanplaythrough = () => resolve();
        audio.load();
      });
      
      // Add 150ms delay to let audio system warm up
      await new Promise(resolve => setTimeout(resolve, 150));
      await audio.play();
    } catch (error) {
      console.error("Voice clone synthesis error:", error);
      setIsLoadingVoiceClone(false);
      setSpeakingMessageId(null);
      
      // Fallback to browser TTS
      speakWithBrowserTTS(messageId, text);
    }
  };

  // Speak message with browser TTS (original implementation)
  const speakWithBrowserTTS = (messageId: string, text: string) => {
    if (!synthesisRef.current) {
      toast({
        title: t("chat.ttsUnsupportedTitle"),
        description: t("chat.ttsUnsupportedDescription"),
        variant: "destructive",
      });
      return;
    }

    // Stop any ongoing speech
    if (isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setHighlightedWordIndex(-1);
      cancelSpeechSync();
      return;
    }

    // Cancel any pending speech and give audio system time to initialize
    synthesisRef.current.cancel();

    // Clean text and split into words for highlighting
    // Preserve the original text structure for accurate word matching
    const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    const words = cleanText.split(/\s+/).filter((word) => word.length > 0);

    // Add a small delay before speaking to prevent first words from being clipped
    // This gives the audio system time to warm up
    setTimeout(() => {
      if (!synthesisRef.current) return;
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechLocale;

    // Use the selected voice if available
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    } else {
      // Fallback: try to select a voice now (in case voices loaded late)
      const voices = synthesisRef.current?.getVoices() || [];
      const bestVoice = selectBestVoice(voices, language);
      if (bestVoice) {
        utterance.voice = bestVoice;
        selectedVoiceRef.current = bestVoice;
      } else {
        utterance.lang = speechLocale;
      }
    }

    // Optimized parameters for natural-sounding speech
    // For Hindi, use slightly slower rate for better clarity and naturalness
    if (language === "hi") {
      utterance.rate = 0.9; // Slightly slower for Hindi (better for natural pronunciation)
      utterance.pitch = 1.0; // Natural pitch
    } else {
      utterance.rate = 0.95; // Slightly slower for more natural pace (0.9-1.0 is ideal)
      utterance.pitch = 1.0; // Natural pitch (1.0 is neutral)
    }
    utterance.volume = 1.0; // Full volume

    // Track word boundaries using character positions
    // Build a character-to-word-index mapping for accurate highlighting
    const wordsForHighlighting = words;
    const charToWordMap: number[] = [];
    let charPos = 0;

    for (let i = 0; i < wordsForHighlighting.length; i++) {
      const word = wordsForHighlighting[i];
      // Map each character in this word to this word's index
      for (let j = 0; j < word.length; j++) {
        charToWordMap[charPos + j] = i;
      }
      charPos += word.length;
      // Add space after word (except last word)
      if (i < wordsForHighlighting.length - 1) {
        charToWordMap[charPos] = i; // Space belongs to current word
        charPos += 1;
      }
    }

    // Track if boundary events are firing
    boundaryEventFiredRef.current = false;

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      const charIndex =
        event.charIndex === undefined || event.charIndex === null
          ? -1
          : event.charIndex;

      if (charIndex < 0) {
        return;
      }

      // Use the pre-built mapping for fast lookup
      let wordIndex = charToWordMap[charIndex];

      // Fallback: if index is out of bounds, find closest valid word
      if (wordIndex === undefined) {
        if (charIndex >= charPos) {
          wordIndex = wordsForHighlighting.length - 1;
        } else {
          for (let i = 0; i < wordsForHighlighting.length; i++) {
            let wordStart = 0;
            for (let j = 0; j < i; j++) {
              wordStart += wordsForHighlighting[j].length + 1;
            }
            if (
              charIndex >= wordStart &&
              charIndex < wordStart + wordsForHighlighting[i].length
            ) {
              wordIndex = i;
              break;
            }
          }
          if (wordIndex === undefined) {
            if (charPos === 0) {
              wordIndex = 0;
            } else {
              wordIndex = Math.min(
                Math.floor((charIndex / charPos) * wordsForHighlighting.length),
                wordsForHighlighting.length - 1
              );
            }
          }
        }
      }

      if (
        wordIndex === undefined ||
        wordIndex < 0 ||
        wordIndex >= wordsForHighlighting.length
      ) {
        return;
      }

      boundaryEventFiredRef.current = true;

      const syncState = speechSyncRef.current;

      if (syncState) {
        const elapsedSecondsFromEvent =
          typeof event.elapsedTime === "number" &&
          !Number.isNaN(event.elapsedTime)
            ? event.elapsedTime
            : (getNow() - syncState.startTime) / 1000;

        const wordsSpoken = wordIndex + 1;

        if (elapsedSecondsFromEvent > 0 && wordsSpoken > 0) {
          const measuredWordsPerSecond = Math.max(
            1.8,
            Math.min(wordsSpoken / elapsedSecondsFromEvent, 6)
          );

          syncState.wordsPerSecond =
            syncState.wordsPerSecond * 0.6 + measuredWordsPerSecond * 0.4;
        }

        syncState.lastBoundaryIndex = Math.max(
          syncState.lastBoundaryIndex,
          wordIndex
        );
        syncState.lastEstimatedIndex = wordIndex;
      }

      setHighlightedWordIndex((prev) =>
        wordIndex === prev ? prev : wordIndex
      );
    };

    utterance.onstart = () => {
      if (wordsForHighlighting.length > 0) {
        setHighlightedWordIndex(0);
        startSpeechSync(wordsForHighlighting.length, utterance.rate);
      } else {
        setHighlightedWordIndex(-1);
        cancelSpeechSync();
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setHighlightedWordIndex(-1);
      cancelSpeechSync();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setHighlightedWordIndex(-1);
      cancelSpeechSync();
    };

      utteranceRef.current = utterance;
      setSpeakingMessageId(messageId);
      setIsSpeaking(true);
      synthesisRef.current.speak(utterance);
    }, 150); // 150ms delay to let audio system warm up and prevent first words from being clipped
  };

  // Speak message - chooses between cloned voice and browser TTS
  const speakMessage = async (messageId: string, text: string) => {
    // For English, always use browser TTS - no voice cloning
    if (language !== "hi") {
      console.log("[VoiceClone] English language - using browser TTS only");
      speakWithBrowserTTS(messageId, text);
      return;
    }
    
    // For Hindi, check voice cloning status
    let currentStatus = voiceCloneStatus;
    try {
      const freshStatus = await voiceCloneAPI.getStatus();
      setVoiceCloneStatus(freshStatus);
      currentStatus = freshStatus;
    } catch (e) {
      console.log("Could not refresh voice clone status:", e);
    }

    // Check if voice cloning is available and active
    console.log("[VoiceClone] Status:", currentStatus);
    if (currentStatus?.has_voice_profile && currentStatus?.voice_profile?.is_active) {
      console.log("[VoiceClone] Using cloned voice");
      speakWithClonedVoice(messageId, text);
      return;
    }
    
    // Fall back to browser TTS
    console.log("[VoiceClone] Using browser TTS");
    speakWithBrowserTTS(messageId, text);
  };

  // Stop speaking (handles both cloned voice and browser TTS)
  const stopSpeaking = () => {
    // Stop cloned voice audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Stop browser TTS
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
      setIsSpeaking(false);
    setIsLoadingVoiceClone(false);
      setSpeakingMessageId(null);
      setHighlightedWordIndex(-1);
      cancelSpeechSync();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await onSendMessage(inputMessage.trim());

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.response,
        timestamp: new Date(),
        confidence: response.confidence_score,
        sources: response.sources_used,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Auto-play the bot's response
      setTimeout(() => {
        speakMessage(botMessage.id, response.response);
      }, 500);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: t("chat.apiError"),
        timestamp: new Date(),
        confidence: 0,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-[#E02478]/20 to-purple-500/20 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E02478]/20 rounded-full backdrop-blur-sm">
            <Bot className="w-5 h-5 text-[#E02478]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {t("chat.headerTitle", "Life Assistant")}
            </h3>
            <p className="text-sm text-white/70">
              {t("chat.headerSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-transparent to-black/10 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "bot" && (
              <div className="flex-shrink-0 p-2 bg-[#E02478]/20 backdrop-blur-sm rounded-full">
                <Bot className="w-4 h-4 text-[#E02478]" />
              </div>
            )}

            <div
              className={`max-w-[80%] ${
                message.type === "user" ? "order-2" : ""
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-[#E02478] text-white ml-auto shadow-lg shadow-[#E02478]/30"
                    : "bg-white/10 backdrop-blur-sm text-white border border-white/20"
                }`}
              >
                {message.type === "bot" ? (
                  <div className="text-sm leading-relaxed">
                    {(() => {
                      // Split by lines for display
                      const lines = message.content.split("\n");
                      let globalWordIndex = 0;

                      return lines.map((line, lineIndex) => {
                        if (line.trim() === "") {
                          return <p key={lineIndex} className="h-2" />;
                        }

                        const lineWords = line.trim().split(/\s+/);

                        return (
                          <p key={lineIndex} className="mb-2 last:mb-0">
                            {lineWords.map((word, wordIdx) => {
                              const currentWordIndex = globalWordIndex;
                              const isHighlighted =
                                speakingMessageId === message.id &&
                                highlightedWordIndex === currentWordIndex;

                              globalWordIndex++;

                              return (
                                <span
                                  key={wordIdx}
                                  className={`transition-all duration-200 ${
                                    isHighlighted
                                      ? "bg-[#E02478]/50 text-white font-semibold px-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {word}
                                  {wordIdx < lineWords.length - 1 && " "}
                                </span>
                              );
                            })}
                          </p>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {message.content.split("\n").map((line, index) => (
                      <p
                        key={index}
                        className={`${
                          line.trim() === "" ? "h-2" : "mb-2 last:mb-0"
                        }`}
                      >
                        {line.trim() || "\u00A0"}
                      </p>
                    ))}
                  </div>
                )}

                {/* TTS controls for bot messages */}
                {message.type === "bot" && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (speakingMessageId === message.id && (isSpeaking || isLoadingVoiceClone)) {
                          stopSpeaking();
                        } else {
                          speakMessage(message.id, message.content);
                        }
                      }}
                      disabled={isLoadingVoiceClone && speakingMessageId !== message.id}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                      title={
                        speakingMessageId === message.id && isSpeaking
                          ? t("chat.stopSpeaking")
                          : speakingMessageId === message.id && isLoadingVoiceClone
                          ? t("chat.loadingVoice", "Loading voice...")
                          : t("chat.listen")
                      }
                    >
                      {speakingMessageId === message.id && isLoadingVoiceClone ? (
                        <Loader2 className="w-4 h-4 text-[#E02478] animate-spin" />
                      ) : speakingMessageId === message.id && isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-[#E02478]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white/70 hover:text-[#E02478]" />
                      )}
                    </button>
                    {/* Voice clone indicator */}
                    {voiceCloneStatus?.has_voice_profile && voiceCloneStatus?.voice_profile?.is_active && (
                      <span className="text-[10px] text-[#E02478]/70 flex items-center gap-1" title={t("chat.clonedVoice", "Using cloned voice")}>
                        <Mic className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div
                className={`flex items-center gap-2 mt-1 text-xs text-white/60 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span>
                  {message.timestamp.toLocaleTimeString(speechLocale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {message.type === "bot" && message.sources && message.sources > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {t("chat.sourceCount", { count: message.sources })}
                    </span>
                  </>
                )}
              </div>
            </div>

            {message.type === "user" && (
              <div className="flex-shrink-0 p-2 bg-[#E02478] rounded-full order-3 shadow-lg shadow-[#E02478]/30">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 p-2 bg-[#E02478]/20 backdrop-blur-sm rounded-full">
              <Bot className="w-4 h-4 text-[#E02478]" />
            </div>
            <div className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-lg border border-white/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#E02478] rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-[#E02478] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#E02478] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="rounded-b-2xl border-t border-white/10 bg-black/30 p-4 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.typeMessage")}
              className="min-h-[52px] resize-none bg-black/30 pr-12 text-sm text-white placeholder:text-white/45"
              rows={1}
              disabled={isLoading || isListening}
              style={{ maxHeight: "120px" }}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <button
            onClick={toggleSpeechRecognition}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              isListening
                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
            }`}
            title={
              isListening
                ? t("chat.stopListening")
                : t("chat.startListening")
            }
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isListening}
            className="px-4 py-2 bg-[#E02478] text-white rounded-lg hover:bg-[#E02478]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#E02478]/30"
          title={t("chat.send")}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 text-xs text-white/50 text-center">
          {t(
            "chat.samplePrompts",
            'Ask questions like "When is my daughter\'s birthday?" or "What medication do I take?"'
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
