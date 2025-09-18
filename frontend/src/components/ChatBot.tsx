import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: number;
}

interface ChatBotProps {
  onSendMessage: (message: string) => Promise<{
    response: string;
    confidence_score: number;
    sources_used: number;
  }>;
  isLoading?: boolean;
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({
  onSendMessage,
  isLoading = false,
  className = "",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your personal memory assistant. I'm here to help you remember important details from your life using your personal documents.\n\nI can help you with questions about:\n• Family members and relationships\n• Important dates and celebrations\n• Health information and medications\n• Work and career details\n• Where you live and daily routines\n\nWhat would you like to remember today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "I'm sorry, I encountered an error while processing your question. Please try again.",
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-3 h-3" />;
    if (confidence >= 0.6) return <Clock className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  return (
    <div
      className={`flex flex-col h-full bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-[#E02478]/20 to-purple-600/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E02478]/20 rounded-full backdrop-blur-sm">
            <Bot className="w-5 h-5 text-[#E02478]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Life Assistant</h3>
            <p className="text-sm text-white/70">
              Ask me about your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20">
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
      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your life..."
              className="w-full p-3 pr-12 border border-white/20 bg-black/20 backdrop-blur-sm rounded-lg resize-none focus:ring-2 focus:ring-[#E02478] focus:border-transparent text-white placeholder-white/50"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-[#E02478] text-white rounded-lg hover:bg-[#E02478]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#E02478]/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 text-xs text-white/50 text-center">
          Ask questions like "When is my daughter's birthday?" or "What
          medication do I take?"
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
