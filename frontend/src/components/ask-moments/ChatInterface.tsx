import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { useAuth } from "@/context/AuthContext";
import { formatTodaysDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { useChatHistory, ChatMessage } from "@/hooks/useChatHistory";

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

  // Use chat history hook
  const {
    messages,
    isLoading: isLoadingHistory,
    addMessage,
    addMessages,
    updateMessage,
  } = useChatHistory(userId);

  // Get user name for personalization
  let userName = "there";
  if (user && typeof user === "object" && "username" in user) {
    userName = (user.username as string) || "there";
  }
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getWelcomeMessage = () => {
    if (!hasKnowledgeBase) {
      return `Hello! I'm Moments, your personal memory assistant. I'm here to help you remember important details from your life.\n\nTo get started, please upload a document (like a diary, care plan, or notes) so I can help answer your questions.\n\nWhat would you like to know?`;
    }
    return `${getGreeting()}, ${userName}! I'm Moments, your personal memory assistant. I'm here to help you remember important details from your life.\n\nI can help you with questions about:\n• Family members and relationships\n• Important dates and celebrations\n• Health information and medications\n• Daily routines and schedule\n• Where you live and important places\n\nWhat would you like to know today?`;
  };

  // Add welcome message if no messages exist
  useEffect(() => {
    if (!isLoadingHistory && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome-1",
        type: "bot",
        content: getWelcomeMessage(),
        timestamp: new Date(),
      };
      addMessage(welcomeMessage);
    }
  }, [isLoadingHistory, messages.length, hasKnowledgeBase, userName, addMessage]);

  // Handle initial question from navigation state
  useEffect(() => {
    if (initialQuestion && !isLoadingHistory && messages.length > 0) {
      // Only auto-send if we just loaded and have welcome message
      const hasWelcomeOnly = messages.length === 1 && messages[0].id === "welcome-1";
      if (hasWelcomeOnly) {
        const timer = setTimeout(() => {
          handleSendMessage(initialQuestion);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [initialQuestion, isLoadingHistory, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Update showSuggestions based on message count
  useEffect(() => {
    setShowSuggestions(messages.length <= 1);
  }, [messages.length]);

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

  // Handle initial question from navigation state
  useEffect(() => {
    if (initialQuestion && messages.length === 1) {
      // Auto-send initial question after a short delay
      setTimeout(() => {
        handleSendMessage(initialQuestion);
      }, 500);
    }
  }, [initialQuestion]);

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
    voices: SpeechSynthesisVoice[]
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

    const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

    if (englishVoices.length === 0) {
      return voices[0] || null;
    }

    let bestVoice: SpeechSynthesisVoice | null = null;
    let bestScore = -1;

    for (const voice of englishVoices) {
      const nameLower = voice.name.toLowerCase();
      let score = 0;

      for (let i = 0; i < preferredKeywords.length; i++) {
        if (nameLower.includes(preferredKeywords[i])) {
          score = (preferredKeywords.length - i) * 10;
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

    return bestVoice || englishVoices[0] || null;
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
        recognition.lang = "en-US";

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
        selectedVoiceRef.current = selectBestVoice(voices);
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
  }, []);

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

  // Speak message with word highlighting (simplified version)
  const speakMessage = (messageId: string, text: string) => {
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

    const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    const words = cleanText.split(/\s+/).filter((word) => word.length > 0);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    } else {
      const voices = synthesisRef.current?.getVoices() || [];
      const bestVoice = selectBestVoice(voices);
      if (bestVoice) {
        utterance.voice = bestVoice;
        selectedVoiceRef.current = bestVoice;
      } else {
        utterance.lang = "en-US";
      }
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

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
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setHighlightedWordIndex(-1);
      cancelSpeechSync();
    }
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
    setShowSuggestions(false);
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
        content:
          "I'm sorry, I encountered an error while processing your question. Please try again.",
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-3 h-3" />;
    if (confidence >= 0.6) return <Clock className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
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
                        if (speakingMessageId === message.id && isSpeaking) {
                          stopSpeaking();
                        } else {
                          speakMessage(message.id, message.content);
                        }
                      }}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors"
                      title={
                        speakingMessageId === message.id && isSpeaking
                          ? "Stop speaking"
                          : "Listen"
                      }
                    >
                      {speakingMessageId === message.id && isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-[#E02478]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white/70 hover:text-[#E02478]" />
                      )}
                    </button>
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

                {message.type === "bot" && message.confidence !== undefined && (
                  <>
                    <span>•</span>
                    <div
                      className={`flex items-center gap-1 ${getConfidenceColor(
                        message.confidence
                      )}`}
                    >
                      {getConfidenceIcon(message.confidence)}
                      <span>
                        {(message.confidence * 100).toFixed(0)}% confident
                      </span>
                    </div>
                    {message.sources && message.sources > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          {message.sources} source
                          {message.sources > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
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

        {/* Suggested Questions - Show when no messages or only welcome message */}
        {showSuggestions && messages.length <= 1 && (
          <SuggestedQuestions
            onSelectQuestion={(question) => {
              handleSendMessage(question);
            }}
            hasKnowledgeBase={hasKnowledgeBase}
          />
        )}

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
              placeholder="Ask me anything about your life..."
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
            title={isListening ? "Stop listening" : "Start voice input"}
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
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 text-xs text-white/50 text-center">
          Ask questions like "When is my daughter's birthday?" or "What medication do I take?"
        </div>
      </div>
    </div>
  );
};

