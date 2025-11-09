import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageCircle, Upload, BarChart3 } from "lucide-react";
import { chatAPI } from "@/services/api";

type KnowledgeBaseStats = {
  total_documents: number;
  total_text_chunks: number;
  total_conversations: number;
  knowledge_base_ready: boolean;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await chatAPI.getKnowledgeBaseStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load knowledge base stats:", err);
        setError("Unable to load your assistant status right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Brain className="h-10 w-10 text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Your Personal Life Assistant
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Ask warm, memory-friendly questions, review past conversations, and
            build a personal knowledge base that keeps important details close.
          </p>
          <Button
            size="lg"
            className="px-10 py-6 bg-purple-600 hover:bg-purple-700 text-lg shadow-lg shadow-purple-500/30"
            onClick={() => navigate("/chatbot")}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Open Life Assistant
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Knowledge Base Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-10 text-center text-white/70">
                  Loading your assistant data...
                </div>
              ) : error ? (
                <div className="py-10 text-center text-red-400">{error}</div>
              ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                    <div className="flex justify-center mb-3">
                      <Upload className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.total_documents}
                    </div>
                    <p className="text-sm text-white/70 mt-1">Documents</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                    <div className="flex justify-center mb-3">
                      <BarChart3 className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.total_text_chunks}
                    </div>
                    <p className="text-sm text-white/70 mt-1">Indexed Chunks</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                    <div className="flex justify-center mb-3">
                      <MessageCircle className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.total_conversations}
                    </div>
                    <p className="text-sm text-white/70 mt-1">Conversations</p>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-white/70">
                  No activity yet. Upload a document or start a conversation to
                  begin building your assistant.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
