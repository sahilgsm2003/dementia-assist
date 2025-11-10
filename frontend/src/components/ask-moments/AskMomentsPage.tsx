import { motion } from "framer-motion";
import { MessageCircle, Brain, Sparkles } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { SuggestedQuestions } from "./SuggestedQuestions";
import DocumentUpload from "../DocumentUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";
import { chatAPI } from "@/services/api";
import { useLocation } from "react-router-dom";

interface Document {
  id: number;
  filename: string;
  created_at: string;
  chunks_count?: number;
}

export const AskMomentsPage = () => {
  const location = useLocation();
  const defaultTab =
    (location.state?.tab as "chat" | "documents" | undefined) ?? "chat";
  const [activeTab, setActiveTab] = useState<"chat" | "documents">(defaultTab);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const hasKnowledgeBase = useMemo(
    () => documents.length > 0,
    [documents.length]
  );

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await chatAPI.getDocuments();
        setDocuments(response.data ?? []);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setLoadError(
          "We couldn't load your documents right now. Please refresh to try again."
        );
      }
    };

    fetchDocuments();
  }, []);

  const refreshDocuments = async () => {
    try {
      const response = await chatAPI.getDocuments();
      setDocuments(response.data ?? []);
      setLoadError(null);
    } catch (error) {
      console.error("Failed to refresh documents", error);
      setLoadError("Unable to refresh documents. Please try again.");
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoadingResponse(true);
    try {
      const response = await chatAPI.sendQuestion(message);
      return response.data;
    } catch (error) {
      console.error("Failed to send message", error);
      throw error;
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    setIsUploading(true);
    try {
      await chatAPI.uploadDocument(file);
      await refreshDocuments();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await chatAPI.deleteDocument(documentId);
      await refreshDocuments();
    } catch (error) {
      console.error("Failed to delete document", error);
      throw error;
    }
  };

  const handleInitializeDemo = async () => {
    setIsUploading(true);
    try {
      await chatAPI.initializeDemo();
      await refreshDocuments();
    } finally {
      setIsUploading(false);
    }
  };

  // Get initial question from location state (e.g., from PersonDetailPage)
  const initialQuestion = location.state?.initialQuestion;

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-[#E02478]" />
          Ask Moments
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Your personal memory assistant, always ready to help.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          Ask questions about your life, family, schedule, and more. 
          I remember what matters most to you.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "chat" | "documents")}
        className="space-y-8"
      >
        <TabsList className="bg-white/10">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {!hasKnowledgeBase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-yellow-50 backdrop-blur"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-yellow-100">
                    Add a document to begin chatting
                  </h3>
                  <p className="text-sm text-yellow-200">
                    Upload a diary, care plan, or set of notes so I can give thoughtful, accurate answers.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("documents")}
                  className="w-full rounded-full bg-white px-6 py-3 text-[#E02478] hover:bg-white/90 sm:w-auto font-semibold transition-colors"
                >
                  Upload a PDF
                </button>
              </div>
            </motion.div>
          )}

          <div className="max-w-5xl mx-auto rounded-2xl border border-white/15 bg-black/30 p-2 backdrop-blur-sm">
            <div className="h-[620px]">
              <ChatInterface
                onSendMessage={handleSendMessage}
                isLoading={isLoadingResponse}
                hasKnowledgeBase={hasKnowledgeBase}
                initialQuestion={initialQuestion}
                className="h-full"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="max-w-5xl mx-auto">
          <DocumentUpload
            documents={documents}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
            onInitializeDemo={handleInitializeDemo}
            isUploading={isUploading}
            className="rounded-2xl border border-white/15 bg-black/30 p-6 backdrop-blur-sm"
          />
        </TabsContent>
      </Tabs>

      {loadError && (
        <div className="max-w-5xl mx-auto rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {loadError}
        </div>
      )}
    </div>
  );
};

