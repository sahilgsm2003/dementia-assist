import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photoUrl: string;
}

interface Question {
  correctMember: FamilyMember;
  options: FamilyMember[];
}

interface FamilyMemberQuizProps {
  familyMembers: FamilyMember[];
  onBack: () => void;
}

export const FamilyMemberQuiz = ({ familyMembers, onBack }: FamilyMemberQuizProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Generate questions on component mount
  useEffect(() => {
    if (familyMembers.length < 2) return;

    const generateQuestions = () => {
      const numQuestions = Math.min(familyMembers.length, 5);
      const shuffledMembers = [...familyMembers].sort(() => Math.random() - 0.5);
      const newQuestions: Question[] = [];

      for (let i = 0; i < numQuestions; i++) {
        const correctMember = shuffledMembers[i];
        const otherMembers = familyMembers.filter(m => m.id !== correctMember.id);
        const wrongOptions = otherMembers
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(2, otherMembers.length));
        
        const options = [correctMember, ...wrongOptions]
          .sort(() => Math.random() - 0.5);

        newQuestions.push({ correctMember, options });
      }

      return newQuestions;
    };

    setQuestions(generateQuestions());
  }, [familyMembers]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (memberId: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(memberId);
    
    if (memberId === currentQuestion.correctMember.id) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    // Regenerate questions
    const generateQuestions = () => {
      const numQuestions = Math.min(familyMembers.length, 5);
      const shuffledMembers = [...familyMembers].sort(() => Math.random() - 0.5);
      const newQuestions: Question[] = [];

      for (let i = 0; i < numQuestions; i++) {
        const correctMember = shuffledMembers[i];
        const otherMembers = familyMembers.filter(m => m.id !== correctMember.id);
        const wrongOptions = otherMembers
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(2, otherMembers.length));
        
        const options = [correctMember, ...wrongOptions]
          .sort(() => Math.random() - 0.5);

        newQuestions.push({ correctMember, options });
      }

      return newQuestions;
    };
    setQuestions(generateQuestions());
  };

  if (familyMembers.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <p className="text-lg mb-6">
              You need at least 2 family members to start a quiz.
            </p>
            <Button onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-6"
              >
                <CheckCircle className="h-16 w-16 text-[#E02478] mx-auto" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Great Job!</h2>
              <p className="text-xl mb-2">
                You got {score} out of {questions.length} correct!
              </p>
              <p className="text-white/70 mb-8">
                {score === questions.length 
                  ? "Perfect! You know your family well!" 
                  : score > questions.length / 2 
                    ? "Well done! Keep practicing!" 
                    : "Good effort! Try again to improve!"
                }
              </p>
              <div className="flex flex-col space-y-4">
                <Button onClick={resetQuiz}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={onBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto w-full">
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-white/70">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <img
                    src={currentQuestion.correctMember.photoUrl}
                    alt="Family member"
                    className="w-48 h-48 rounded-full mx-auto object-cover ring-4 ring-[#E02478]/20 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                </motion.div>

                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Who is this person?
                </motion.h2>

                <motion.div
                  className="grid gap-4 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.id === currentQuestion.correctMember.id;
                    const showResult = selectedAnswer !== null;
                    
                    let buttonStyle = "w-full p-4 text-left border-2 transition-all duration-300";
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonStyle += " bg-green-500/20 border-green-500 text-green-300";
                      } else if (isSelected && !isCorrect) {
                        buttonStyle += " bg-red-500/20 border-red-500 text-red-300";
                      } else {
                        buttonStyle += " bg-white/5 border-white/10 text-white/50";
                      }
                    } else {
                      buttonStyle += " bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#E02478]/50 text-white";
                    }

                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className={buttonStyle}
                        onClick={() => handleAnswerSelect(option.id)}
                        disabled={selectedAnswer !== null}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-medium">
                            {option.name}
                          </div>
                          <div className="text-sm opacity-70">
                            ({option.relationship})
                          </div>
                          {showResult && isCorrect && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto"
                            >
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <AnimatePresence>
                  {selectedAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Button
                        size="lg"
                        onClick={handleNext}
                        className="w-full"
                      >
                        {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};