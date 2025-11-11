import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Users,
  Calendar,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Users,
    title: "Who is this person?",
    description: "Identify family members instantly",
  },
  {
    icon: Calendar,
    title: "What medicine do I take?",
    description: "Gentle medication reminders",
  },
  {
    icon: Calendar,
    title: "When is my appointment?",
    description: "Daily schedule at a glance",
  },
  {
    icon: Shield,
    title: "Where am I?",
    description: "Stay oriented with safe places",
  },
];

const steps = [
  {
    step: "1",
    title: "Add people & information",
    description: "Set up in minutes",
  },
  {
    step: "2",
    title: "Ask questions naturally",
    description: "Get instant answers",
  },
  {
    step: "3",
    title: "Receive gentle reminders",
    description: "Stay on track daily",
  },
];

export const LandingPage = () => {
  return (
    <div className="space-y-12 md:space-y-20 pb-12 md:pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 pt-8 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center space-y-6 md:space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white text-balance px-2"
          >
            Help your loved one remember what matters most
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-xl text-base md:text-lg text-white/70 leading-relaxed px-4"
          >
            A memory care companion for people with dementia and their caregivers
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3 px-4"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-semibold">
                <Heart className="mr-2 h-5 w-5" />
                Get started for free
              </Button>
            </Link>
            <p className="text-sm text-white/60">
              Set up in minutes
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 pt-16 md:pt-24 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl space-y-6 md:space-y-8"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center text-balance px-2">
            When memory fades, connection shouldn't
          </h2>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-white/70">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center text-balance px-2"
          >
            How it works
          </motion.h2>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center text-center space-y-3"
              >
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#E02478] to-purple-600 text-xl sm:text-2xl font-bold text-white shadow-lg shadow-[#E02478]/30">
                  {step.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/70">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
