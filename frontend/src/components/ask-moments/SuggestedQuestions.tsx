import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { chatAPI } from "@/services/api";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  hasKnowledgeBase: boolean;
}

export const SuggestedQuestions = ({ onSelectQuestion, hasKnowledgeBase }: SuggestedQuestionsProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultQuestions = [
    "How do I add documents?",
    "What can you help me with?",
    "How does this work?",
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!hasKnowledgeBase) {
        setQuestions(defaultQuestions);
        return;
      }

      setIsLoading(true);
      try {
        const response = await chatAPI.getSuggestedQuestions();
        if (response.questions && response.questions.length > 0) {
          setQuestions(response.questions);
        } else {
          setQuestions([
            "What medicine do I take?",
            "What's happening today?",
            "Tell me about my family",
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch suggested questions:", error);
        setQuestions([
          "What medicine do I take?",
          "What's happening today?",
          "Tell me about my family",
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [hasKnowledgeBase]);

  if (questions.length === 0 && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Sparkles className="h-4 w-4 text-[#E02478]" />
        <span className="font-medium">Suggested questions</span>
        {isLoading && (
          <div className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={question}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelectQuestion(question)}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 hover:border-[#E02478]/50 hover:bg-[#E02478]/10 transition-all duration-200 text-left"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
