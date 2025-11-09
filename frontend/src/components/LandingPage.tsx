import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Clock,
  Brain,
  Upload,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <Card className="p-6 h-full hover:scale-105 hover:shadow-[#E02478]/30 cursor-pointer group">
        <CardContent className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center group-hover:bg-[#E02478]/30 transition-colors">
            <Icon className="h-8 w-8 text-[#E02478]" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-white/70 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const LandingPage = () => {
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const words = ["Rediscover", "Precious", "Moments"];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center px-6 py-12"
      >
        <div className="max-w-5xl text-center space-y-12">
          <div className="space-y-8">
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {words.map((word, index) => (
                <motion.span
                  key={word}
                  className="inline-block mr-4"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.3,
                    ease: "easeOut",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              A gentle memory companion that answers personal questions with
              warmth, keeps important details organised, and helps caregivers
              build a living library of cherished moments.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <Button
              size="lg"
              className="text-lg px-16 py-8 hover:scale-105 transition-all duration-300 shadow-lg"
              onClick={scrollToFeatures}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className="py-24 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How Moments Helps
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything revolves around your Personal Life Assistant—powered by
              your documents, memories, and supportive conversations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <Card className="p-8 h-full hover:scale-105 hover:shadow-[#E02478]/30 transition-all duration-300">
                <CardContent className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-[#E02478]/20 rounded-full flex items-center justify-center group-hover:bg-[#E02478]/30 transition-colors">
                    <Brain className="h-10 w-10 text-[#E02478]" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    Personal Life Assistant
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Chat with an AI that understands your loved one's story.
                    Share questions, get warm reminders, and surface details
                    that make every conversation easier.
                  </p>
                  <Link to="/register" className="mt-6 block">
                    <Button size="lg" className="w-full">
                      Start Chatting
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <Card className="p-8 h-full hover:scale-105 hover:shadow-[#E02478]/30 transition-all duration-300">
                <CardContent className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-[#E02478]/20 rounded-full flex items-center justify-center group-hover:bg-[#E02478]/30 transition-colors">
                    <Upload className="h-10 w-10 text-[#E02478]" />
                  </div>
                  <h3 className="text-2xl font-bold">Document Memory Bank</h3>
                  <p className="text-white/70 leading-relaxed">
                    Securely upload diaries, schedules, and notes. Moments
                    curates the important people, dates, and events so answers
                    feel personal and dependable.
                  </p>
                  <Link to="/register" className="mt-6 block">
                    <Button size="lg" className="w-full">
                      Build Your Library
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Thoughtfully Designed for
              <span className="text-[#E02478]"> Connection</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Simple tools that keep families in sync, reduce stress, and
              celebrate memories with compassion.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Heart}
              title="Compassionate Support"
              description="Warm, reassuring responses tuned for dementia care and supportive caregiving conversations."
              delay={0.1}
            />
            <FeatureCard
              icon={Upload}
              title="Centralised Memories"
              description="Upload diaries, medical notes, and schedules to keep everything your assistant needs in one place."
              delay={0.2}
            />
            <FeatureCard
              icon={Brain}
              title="Smart Recall"
              description="Moments learns from every document to surface names, events, and routines exactly when you need them."
              delay={0.3}
            />
            <FeatureCard
              icon={MessageCircle}
              title="Ongoing Conversations"
              description="Review past chats to spot patterns, celebrate progress, and keep everyone informed."
              delay={0.4}
            />
            <FeatureCard
              icon={Clock}
              title="Timely Reminders"
              description="Capture upcoming visits, appointments, and celebrations so nothing meaningful slips through the cracks."
              delay={0.5}
            />
            <FeatureCard
              icon={Sparkles}
              title="Set Up in Minutes"
              description="Upload a document or start chatting right away—no complex configuration required."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-6 w-6 text-[#E02478]" />
            <span className="text-xl font-bold">Moments</span>
          </div>
          <p className="text-white/60">
            Creating meaningful connections through technology and compassion.
          </p>
        </div>
      </footer>
    </div>
  );
};
