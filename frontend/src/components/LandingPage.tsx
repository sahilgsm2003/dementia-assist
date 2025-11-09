import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Clock,
  Heart,
  MessageCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";

const featureItems = [
  {
    icon: Brain,
    title: "Personal assistant",
    description:
      "A calm, conversational guide that recalls the names, places, and routines that matter most.",
  },
  {
    icon: Upload,
    title: "Document memory bank",
    description:
      "Upload caregiver notes, diaries, or schedules. Moments organises every detail for quick recall.",
  },
  {
    icon: MessageCircle,
    title: "Gentle conversation",
    description:
      "Simple prompts, warm responses, and speech support keep every interaction approachable.",
  },
];

const supportHighlights = [
  {
    icon: Heart,
    title: "Care-first design",
    description:
      "Language tuned for dementia care—reassuring, clear, and kind.",
  },
  {
    icon: Clock,
    title: "Always on time",
    description:
      "Surface birthdays, appointments, and routines without digging through notes.",
  },
  {
    icon: Sparkles,
    title: "Five-minute setup",
    description: "Sign in, upload a PDF, and start chatting in moments.",
  },
];

export const LandingPage = () => {
  return (
    <div className="space-y-24">
      <section className="container mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center space-y-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/70 ring-1 ring-white/10 backdrop-blur">
            <Heart className="h-4 w-4 text-[#E02478]" />
            Gentle care companion
          </span>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Help loved ones remember the moments that matter.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl">
              Moments keeps personal memories close at hand—combining your own
              notes with an empathetic assistant designed for dementia care.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="h-12 rounded-full px-8">
                Start for free
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-white/10 px-8 text-white hover:bg-white/20"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6">
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {featureItems.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl space-y-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Built to support thoughtful caregiving
            </h2>
            <p className="text-base text-white/70 md:text-lg">
              Every interaction is crafted to feel calm, clear, and
              effortless—for you and the person you care for.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {supportHighlights.map((item) => (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <Card className="h-full border-white/10 bg-black/40 backdrop-blur">
                  <CardContent className="space-y-4 p-6 text-left">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/60">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#E02478]/15 via-purple-600/10 to-transparent p-10 text-center shadow-xl backdrop-blur"
        >
          <h3 className="text-2xl font-semibold text-white md:text-3xl">
            Ready to create calmer, more connected days?
          </h3>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            Join caregivers using Moments to keep every important detail within
            reach.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="h-12 rounded-full px-8">
                Create your account
              </Button>
            </Link>
            <Link to="/chatbot">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-white/10 px-8 text-white hover:bg-white/20"
              >
                See the assistant
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
