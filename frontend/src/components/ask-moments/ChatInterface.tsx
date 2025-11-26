import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useAuth } from "@/context/AuthContext";
import { formatTodaysDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { useChatHistory, ChatMessage } from "@/hooks/useChatHistory";
import { voiceCloneAPI } from "@/services/api";

interface VoiceCloneStatus {
  has_voice_profile: boolean;
  voice_profile: {
    id: number;
    language: string;
    is_active: boolean;
  } | null;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<{
    response: string;
    confidence_score: number;
    sources_used: number;
  }>;
  isLoading?: boolean;
  hasKnowledgeBase?: boolean;
  initialQuestion?: string;
  className?: string;
}

interface SpeechSyncState {
  startTime: number;
  wordsPerSecond: number;
  totalWords: number;
  lastEstimatedIndex: number;
  lastBoundaryIndex: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  isLoading = false,
  hasKnowledgeBase = false,
  initialQuestion,
  className = "",
}) => {
  // Get user info for personalization and history
  const auth = useAuth();
  const user = auth.user;
  const userId = user && typeof user === "object" && "id" in user ? user.id : undefined;

  // Use chat history hook (no persistence - refreshes every time)
  const {
    messages,
    addMessage,
    addMessages,
    updateMessage,
  } = useChatHistory(userId);

  // Track if welcome message has been added
  const welcomeMessageAddedRef = useRef(false);

  const { t, i18n } = useTranslation();
  
  // Get user name for personalization
  let userName = "there";
  if (user && typeof user === "object" && "username" in user) {
    userName = (user.username as string) || "there";
  }
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("chat.goodMorning");
    if (hour < 18) return t("chat.goodAfternoon");
    return t("chat.goodEvening");
  };

  const getWelcomeMessage = () => {
    if (!hasKnowledgeBase) {
      return t("chat.welcomeNoDocs");
    }
    return `${getGreeting()}, ${userName}! ${t("chat.welcomeWithDocs")}`;
  };

  // Add welcome message if no messages exist (only once)
  useEffect(() => {
    // Check if welcome message already exists
    const hasWelcomeMessage = messages.some((msg) => msg.id === "welcome-1");
    
    // Only add welcome message if:
    // 1. No messages exist
    // 2. We haven't already added a welcome message in this session
    // 3. No welcome message exists in the current messages
    if (
      messages.length === 0 &&
      !welcomeMessageAddedRef.current &&
      !hasWelcomeMessage
    ) {
      welcomeMessageAddedRef.current = true; // Set ref BEFORE adding message to prevent race conditions
      const welcomeMessage: ChatMessage = {
        id: "welcome-1",
        type: "bot",
        content: getWelcomeMessage(),
        timestamp: new Date(),
      };
      addMessage(welcomeMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]); // Only depend on messages.length, not addMessage

  // Handle initial question from navigation state
  useEffect(() => {
    if (initialQuestion && messages.length > 0) {
      // Only auto-send if we just loaded and have welcome message
      const hasWelcomeOnly = messages.length === 1 && messages[0].id === "welcome-1";
      if (hasWelcomeOnly) {
        const timer = setTimeout(() => {
          handleSendMessage(initialQuestion);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [initialQuestion, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false); // True when serving cached response with simulated delay
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
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

  // Demo questions state (for quick demos)
  const [demoQuestions, setDemoQuestions] = useState<string[]>([]);
  const [cachedAnswers, setCachedAnswers] = useState<Record<string, { answer: string; hasVoice: boolean }>>({});
  // Map message IDs to their original demo questions (for cached voice playback)
  const demoMessageMapRef = useRef<Record<string, string>>({});

  // Handle initial question from navigation state
  useEffect(() => {
    if (initialQuestion && messages.length === 1) {
      // Auto-send initial question after a short delay
      setTimeout(() => {
        handleSendMessage(initialQuestion);
      }, 500);
    }
  }, [initialQuestion]);

  // Load voice clone status on mount and when language changes
  useEffect(() => {
    const loadVoiceCloneStatus = async () => {
      try {
        const status = await voiceCloneAPI.getStatus();
        console.log("[VoiceClone] Loaded status:", status);
        setVoiceCloneStatus(status);
      } catch (error) {
        console.log("Voice cloning not available:", error);
        setVoiceCloneStatus(null);
      }
    };
    loadVoiceCloneStatus();
  }, [i18n.language]);

  // Load demo questions when language is Hindi
  useEffect(() => {
    const loadDemoQuestions = async () => {
      // Only show demo questions for Hindi
      if (i18n.language !== "hi") {
        setDemoQuestions([]);
        return;
      }
      
      try {
        const data = await voiceCloneAPI.getDemoQuestions("hi");
        console.log("[Demo] Loaded demo questions:", data);
        setDemoQuestions(data.questions || []);
        
        // Build cached answers map
        const cached: Record<string, { answer: string; hasVoice: boolean }> = {};
        for (const qa of data.cached_qa || []) {
          cached[qa.question] = { answer: qa.answer, hasVoice: qa.has_voice };
        }
        setCachedAnswers(cached);
      } catch (error) {
        console.log("Demo questions not available:", error);
        setDemoQuestions([]);
      }
    };
    loadDemoQuestions();
  }, [i18n.language]);

  // Handle demo question click - use cached answer if available
  const handleDemoQuestionClick = async (question: string) => {
    if (isLoading) return;
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setIsTyping(true);

    try {
      // Check if we have a cached answer (backend adds 3.5s simulated delay for cached responses)
      setIsSimulating(true); // Show "simulating" indicator
      const cachedData = await voiceCloneAPI.getCachedDemo(question, "hi");
      console.log("[Demo] Cached data for question:", cachedData);
      
      let response: string;
      let hasVoiceCache = false;
      
      if (cachedData.found && cachedData.answer) {
        // Use cached answer (backend already added simulated delay)
        response = cachedData.answer;
        hasVoiceCache = cachedData.has_voice;
        console.log("[Demo] Using cached answer (simulated processing), has voice:", hasVoiceCache);
        setIsSimulating(false);
      } else {
        setIsSimulating(false);
        // Get fresh answer from RAG
        const result = await onSendMessage(question);
        response = result.response;
        console.log("[Demo] Got fresh answer from RAG");
        
        // Cache this answer for future use (this also generates voice)
        try {
          await voiceCloneAPI.cacheDemoAnswer(question, response, "hi");
          hasVoiceCache = true;
          console.log("[Demo] Cached the answer with voice");
          // Update local state so green dot shows
          setCachedAnswers(prev => ({
            ...prev,
            [question]: { answer: response, hasVoice: true }
          }));
        } catch (e) {
          console.log("[Demo] Failed to cache answer:", e);
        }
      }
      
      // Add bot response
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      addMessage(botMsg);
      
      // Track this message as a demo answer (for cached voice playback when clicking speaker)
      demoMessageMapRef.current[botMsg.id] = question;
      
      // Auto-speak: use cached voice if available, otherwise synthesize
      if (voiceCloneStatus?.has_voice_profile && voiceCloneStatus?.voice_profile?.is_active) {
        setTimeout(async () => {
          try {
            if (hasVoiceCache) {
              // Play cached voice directly (instant!)
              console.log("[Demo] Playing cached voice for:", question);
              setSpeakingMessageId(botMsg.id);
              setIsSpeaking(true);
              
              const audioBlob = await voiceCloneAPI.playCachedVoice(question, "hi");
              const audioUrl = URL.createObjectURL(audioBlob);
              
              if (audioRef.current) {
                audioRef.current.pause();
              }
              
              const audio = new Audio(audioUrl);
              audioRef.current = audio;
              audio.preload = "auto";
              
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                setIsSpeaking(false);
                setSpeakingMessageId(null);
                setHighlightedWordIndex(-1);
              };
              
              audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                setIsSpeaking(false);
                setSpeakingMessageId(null);
                // Fallback to browser TTS
                speakWithBrowserTTS(botMsg.id, response);
              };
              
              // Wait for audio to be ready, then add delay to prevent first words from being clipped
              await new Promise<void>((resolve) => {
                audio.oncanplaythrough = () => resolve();
                audio.load();
              });
              await new Promise(resolve => setTimeout(resolve, 150));
              await audio.play();
            } else {
              // No cached voice, synthesize new
              speakMessage(botMsg.id, response);
            }
          } catch (e) {
            console.error("[Demo] Error playing voice:", e);
            speakMessage(botMsg.id, response);
          }
        }, 300);
      }
      
    } catch (error) {
      console.error("[Demo] Error:", error);
      toast({
        title: t("common.error"),
        description: t("chat.errorFetchingResponse"),
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

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

  // Select the best available voice for natural-sounding speech
  const selectBestVoice = (
    voices: SpeechSynthesisVoice[],
    targetLanguage: string
  ): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    const preferredKeywords = [
      "neural",
      "premium",
      "enhanced",
      "natural",
      "google",
      "microsoft",
      "zira",
      "samantha",
      "karen",
      "moira",
      "susan",
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

      for (let i = 0; i < preferredKeywords.length; i++) {
        if (nameLower.includes(preferredKeywords[i])) {
          score += (preferredKeywords.length - i) * 10;
          break;
        }
      }

      if (!voice.localService) {
        score += 5;
      }

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

      if (nameLower.includes("robotic") || nameLower.includes("monotone")) {
        score -= 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestVoice = voice;
      }
    }

    return bestVoice || candidateVoices[0] || null;
  };

  // Initialize speech recognition and synthesis
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
        const speechLocale = i18n.language === "hi" ? "hi-IN" : "en-US";
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

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        selectedVoiceRef.current = selectBestVoice(voices, i18n.language);
      };

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
  }, [i18n.language]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
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
      console.log("[VoiceClone] Requesting synthesis for:", text.substring(0, 50) + "...", "language:", i18n.language);
      const audioBlob = await voiceCloneAPI.synthesizeStream(text, i18n.language);
      console.log("[VoiceClone] Got audio blob:", audioBlob.size, "bytes");
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Preload the audio to prevent first words from being clipped
      audio.preload = "auto";
      
      const words = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(w => w.length > 0);
      const estimatedDuration = words.length * 0.3;
      
      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoadingVoiceClone(false);
        setHighlightedWordIndex(0);
        
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
        console.log("[VoiceClone] Audio error, falling back to browser TTS");
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
      console.error("[VoiceClone] Synthesis error:", error);
      setIsLoadingVoiceClone(false);
      setSpeakingMessageId(null);
      speakWithBrowserTTS(messageId, text);
    }
  };

  // Speak message with browser TTS
  const speakWithBrowserTTS = (messageId: string, text: string) => {
    if (!synthesisRef.current) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

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
    
    const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    const words = cleanText.split(/\s+/).filter((word) => word.length > 0);

    // Add a small delay before speaking to prevent first words from being clipped
    // This gives the audio system time to warm up
    setTimeout(() => {
      if (!synthesisRef.current) return;
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const speechLocale = i18n.language === "hi" ? "hi-IN" : "en-US";
      utterance.lang = speechLocale;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      } else {
        const voices = synthesisRef.current?.getVoices() || [];
        const bestVoice = selectBestVoice(voices, i18n.language);
        if (bestVoice) {
          utterance.voice = bestVoice;
          selectedVoiceRef.current = bestVoice;
        }
      }

      // Optimized parameters for natural-sounding speech
      // For Hindi, use slightly slower rate for better clarity and naturalness
      if (i18n.language === "hi") {
        utterance.rate = 0.9; // Slightly slower for Hindi (better for natural pronunciation)
        utterance.pitch = 1.0; // Natural pitch
      } else {
        utterance.rate = 0.95; // Slightly slower for more natural pace
        utterance.pitch = 1.0; // Natural pitch
      }
      utterance.volume = 1.0; // Full volume

    const wordsForHighlighting = words;
    const charToWordMap: number[] = [];
    let charPos = 0;

    for (let i = 0; i < wordsForHighlighting.length; i++) {
      const word = wordsForHighlighting[i];
      for (let j = 0; j < word.length; j++) {
        charToWordMap[charPos + j] = i;
      }
      charPos += word.length;
      if (i < wordsForHighlighting.length - 1) {
        charToWordMap[charPos] = i;
        charPos += 1;
      }
    }

    boundaryEventFiredRef.current = false;

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      const charIndex =
        event.charIndex === undefined || event.charIndex === null
          ? -1
          : event.charIndex;

      if (charIndex < 0) return;

      let wordIndex = charToWordMap[charIndex];

      if (wordIndex === undefined) {
        if (charIndex >= charPos) {
          wordIndex = wordsForHighlighting.length - 1;
        } else {
          wordIndex = Math.min(
            Math.floor((charIndex / charPos) * wordsForHighlighting.length),
            wordsForHighlighting.length - 1
          );
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

  // Main speak function - chooses between cloned voice and browser TTS
  const speakMessage = async (messageId: string, text: string) => {
    // For English, always use browser TTS - no voice cloning
    if (i18n.language !== "hi") {
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
      console.log("[VoiceClone] Could not refresh status:", e);
    }

    console.log("[VoiceClone] Status:", currentStatus);
    
    if (currentStatus?.has_voice_profile && currentStatus?.voice_profile?.is_active) {
      // Check if this is a demo message with cached voice
      const demoQuestion = demoMessageMapRef.current[messageId];
      if (demoQuestion) {
        console.log("[VoiceClone] This is a demo message, checking for cached voice:", demoQuestion);
        try {
          // Try to play cached demo voice
          setSpeakingMessageId(messageId);
          setIsSpeaking(true);
          setIsLoadingVoiceClone(true);
          
          const audioBlob = await voiceCloneAPI.playCachedVoice(demoQuestion, "hi");
          setIsLoadingVoiceClone(false);
          
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.preload = "auto";
          
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            setHighlightedWordIndex(-1);
          };
          
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            setIsLoadingVoiceClone(false);
            console.log("[VoiceClone] Cached voice failed, falling back to synthesis");
            speakWithClonedVoice(messageId, text);
          };
          
          // Wait for audio to be ready, then add delay to prevent first words from being clipped
          await new Promise<void>((resolve) => {
            audio.oncanplaythrough = () => resolve();
            audio.load();
          });
          await new Promise(resolve => setTimeout(resolve, 150));
          await audio.play();
          console.log("[VoiceClone] Playing cached demo voice");
          return;
        } catch (e) {
          console.log("[VoiceClone] No cached voice for demo, falling back to synthesis:", e);
          setIsLoadingVoiceClone(false);
        }
      }
      
      console.log("[VoiceClone] Using cloned voice synthesis");
      speakWithClonedVoice(messageId, text);
      return;
    }
    
    console.log("[VoiceClone] Using browser TTS");
    speakWithBrowserTTS(messageId, text);
  };

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

  const handleSendMessage = async (question?: string) => {
    const messageToSend = question || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await onSendMessage(messageToSend);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: response.response,
        timestamp: new Date(),
        confidence: response.confidence_score,
        sources: response.sources_used,
      };

      addMessage(botMessage);

      // Auto-play the bot's response
      setTimeout(() => {
        speakMessage(botMessage.id, response.response);
      }, 500);
    } catch {
      const errorMessage: ChatMessage = {
        id: `bot-error-${Date.now()}`,
        type: "bot",
        content: t("chat.errorSending"),
        timestamp: new Date(),
        confidence: 0,
      };

      addMessage(errorMessage);
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
            <h3 className="font-semibold text-white">Moments Assistant</h3>
            <p className="text-sm text-white/70">
              {formatTodaysDate()}
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
                          ? t("chat.clickToStop")
                          : speakingMessageId === message.id && isLoadingVoiceClone
                          ? "Loading voice..."
                          : t("chat.clickToSpeak")
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
                    {voiceCloneStatus?.has_voice_profile && voiceCloneStatus?.voice_profile?.is_active && (
                      <span className="text-[10px] text-[#E02478]/70 flex items-center gap-1" title="Using cloned voice">
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
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {message.type === "bot" && message.sources && message.sources > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {message.sources} source
                      {message.sources > 1 ? "s" : ""}
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
              {isSimulating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#E02478] animate-spin" />
                  <span className="text-sm text-white/70">
                    {i18n.language === "hi" ? "प्रोसेसिंग हो रही है..." : "Processing..."}
                  </span>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Demo Questions (Hindi only) */}
      {i18n.language === "hi" && demoQuestions.length > 0 && messages.length <= 2 && (
        <div className="border-t border-white/10 bg-black/20 px-4 py-3">
          <p className="text-xs text-white/50 mb-2">डेमो प्रश्न (Demo Questions):</p>
          <div className="flex flex-wrap gap-2">
            {demoQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleDemoQuestionClick(question)}
                disabled={isLoading || isTyping}
                className="px-3 py-1.5 text-xs bg-[#E02478]/20 text-[#E02478] rounded-full border border-[#E02478]/30 hover:bg-[#E02478]/30 hover:border-[#E02478]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {cachedAnswers[question]?.hasVoice && (
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" title="Cached with voice"></span>
                )}
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

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
            title={isListening ? t("chat.clickToStop") : t("chat.clickToSpeak")}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading || isListening}
            className="px-4 py-2 bg-[#E02478] text-white rounded-lg hover:bg-[#E02478]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#E02478]/30"
            title={t("chat.send")}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

