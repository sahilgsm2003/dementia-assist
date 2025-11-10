import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, MessageSquare, Upload } from "lucide-react";

import ChatBot from "./ChatBot";
import DocumentUpload from "./DocumentUpload";
import { chatAPI } from "../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface Document {
  id: number;
  filename: string;
  created_at: string;
  chunks_count?: number;
}

const ChatPage: React.FC = () => {
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
      console.error("Failed to refresh documents:", error);
      setLoadError("Unable to refresh documents. Please try again.");
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoadingResponse(true);
    try {
      const response = await chatAPI.sendQuestion(message);
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
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
      console.error("Failed to delete document:", error);
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

  return (
    <div className="container mx-auto px-6">
      <div className="space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E02478]/15 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-[#E02478]">
                <Brain className="h-4 w-4" />
                Life assistant
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Ask gentle questions. Get warm, personal answers.
                </h1>
                <p className="max-w-2xl text-base text-white/70 md:text-lg">
                  Moments remembers the people, dates, and routines inside your documents. Keep
                  conversations reassuring and accurate—whenever you need support.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                  {documents.length} document{documents.length === 1 ? "" : "s"} loaded
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                  Speech + voice support built in
                </span>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-black/30 p-6 text-left backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Quick actions
              </h2>
              <div className="mt-4 space-y-3">
                <Button
                  className="w-full justify-between rounded-xl bg-[#E02478] px-5 py-6 text-base font-semibold hover:bg-[#E02478]/85"
                  onClick={() => setActiveTab("chat")}
                >
                  Start a conversation
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl border-white/15 bg-white/5 px-5 py-6 text-base font-semibold text-white hover:bg-white/15"
                  onClick={() => setActiveTab("documents")}
                >
                  Manage documents
                  <Upload className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "chat" | "documents")}
          className="space-y-8"
        >
          <TabsList className="bg-white/5">
            <TabsTrigger value="chat">Conversation</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            {!hasKnowledgeBase ? (
              <div className="max-w-4xl rounded-2xl border border-white/15 bg-yellow-500/10 p-8 text-yellow-50 backdrop-blur">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-yellow-100">
                      Add a document to begin chatting
                    </h3>
                    <p className="text-sm text-yellow-200">
                      Upload a diary, care plan, or set of notes so the assistant can give thoughtful,
                      accurate answers.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("documents")}
                    className="w-full rounded-full bg-white px-6 py-3 text-[#E02478] hover:bg-white/90 sm:w-auto"
                  >
                    Upload a PDF
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="max-w-5xl rounded-2xl border border-white/15 bg-black/30 p-2 backdrop-blur-sm">
              <div className="h-[620px]">
                <ChatBot
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingResponse}
                  className="h-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="max-w-5xl">
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
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {loadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

