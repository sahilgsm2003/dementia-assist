import { useState, useEffect, useCallback, useRef } from "react";
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

const STORAGE_KEY = "moments_chat_history";
const MAX_LOCAL_MESSAGES = 100; // Keep last 100 messages locally
const SYNC_INTERVAL = 30000; // Sync with API every 30 seconds

/**
 * Hook for managing chat history with localStorage and API sync
 */
export const useChatHistory = (userId?: string | number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  // Load messages from localStorage
  const loadFromLocalStorage = useCallback((): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error("Failed to load chat history from localStorage:", error);
      return [];
    }
  }, []);

  // Save messages to localStorage
  const saveToLocalStorage = useCallback((msgs: ChatMessage[]) => {
    try {
      // Keep only last MAX_LOCAL_MESSAGES messages
      const toSave = msgs.slice(-MAX_LOCAL_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error("Failed to save chat history to localStorage:", error);
    }
  }, []);

  // Load chat history from API
  const loadFromAPI = useCallback(async () => {
    if (!userId) return [];

    try {
      const response = await chatAPI.getChatHistory(50);
      const history = response.data || [];

      // Convert API format to ChatMessage format
      const chatMessages: ChatMessage[] = [];
      history.forEach((item: any) => {
        // Add user message
        chatMessages.push({
          id: `user-${item.id}`,
          type: "user",
          content: item.question,
          timestamp: new Date(item.created_at),
        });

        // Add bot response
        chatMessages.push({
          id: `bot-${item.id}`,
          type: "bot",
          content: item.response,
          timestamp: new Date(item.created_at),
          confidence: item.confidence_score,
        });
      });

      return chatMessages;
    } catch (error) {
      console.error("Failed to load chat history from API:", error);
      return [];
    }
  }, [userId]);

  // Sync local messages with API
  const syncWithAPI = useCallback(async () => {
    if (!userId || isSyncing) return;

    try {
      setIsSyncing(true);
      const apiMessages = await loadFromAPI();

      if (apiMessages.length > 0) {
        // Merge with local messages, preferring API data for conflicts
        setMessages((current) => {
          const merged = [...current];
          
          // Add API messages that aren't already in local storage
          apiMessages.forEach((apiMsg) => {
            const exists = merged.some((msg) => msg.id === apiMsg.id);
            if (!exists) {
              merged.push(apiMsg);
            }
          });

          // Sort by timestamp
          merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          // Save merged messages
          saveToLocalStorage(merged);
          lastSyncRef.current = Date.now();
          return merged;
        });
      }
    } catch (error) {
      console.error("Failed to sync chat history:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [userId, isSyncing, loadFromAPI, saveToLocalStorage]);

  // Initialize: Load from localStorage first, then sync with API
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      // Load from localStorage immediately for instant display
      const localMessages = loadFromLocalStorage();
      setMessages(localMessages);

      // Then sync with API if user is logged in
      if (userId) {
        await syncWithAPI();
      }

      setIsLoading(false);
    };

    initialize();
  }, [userId, loadFromLocalStorage, syncWithAPI]);

  // Periodic sync with API
  useEffect(() => {
    if (!userId) return;

    const scheduleSync = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync >= SYNC_INTERVAL) {
          syncWithAPI();
        }
        scheduleSync();
      }, SYNC_INTERVAL);
    };

    scheduleSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [userId, syncWithAPI]);

  // Add a new message
  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((current) => {
        const updated = [...current, message];
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // Add multiple messages (e.g., user + bot response)
  const addMessages = useCallback(
    (newMessages: ChatMessage[]) => {
      setMessages((current) => {
        const updated = [...current, ...newMessages];
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Update a message (e.g., update confidence score)
  const updateMessage = useCallback(
    (id: string, updates: Partial<ChatMessage>) => {
      setMessages((current) => {
        const updated = current.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        );
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  return {
    messages,
    isLoading,
    isSyncing,
    addMessage,
    addMessages,
    updateMessage,
    clearHistory,
    syncWithAPI,
  };
};

