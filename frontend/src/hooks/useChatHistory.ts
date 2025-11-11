import { useState, useEffect, useCallback } from "react";
import { chatAPI } from "@/services/api";

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: number;
  highlightedWordIndex?: number;
}

/**
 * Hook for managing chat history - no persistence, refreshes every time
 */
export const useChatHistory = (userId?: string | number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add a new message
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  // Add multiple messages (e.g., user + bot response)
  const addMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages((current) => [...current, ...newMessages]);
  }, []);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  // Update a message (e.g., update confidence score)
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((current) =>
      current.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  return {
    messages,
    isLoading,
    isSyncing: false,
    addMessage,
    addMessages,
    updateMessage,
    clearHistory,
    syncWithAPI: async () => {}, // No-op since we don't sync
  };
};

