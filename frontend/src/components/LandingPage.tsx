import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Users, Clock, Brain, Camera } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: any;
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

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const words = ["Rediscover", "Precious", "Moments"];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold leading-tight"
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
                    ease: "easeOut"
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              Helping caregivers create meaningful connections through gentle family recognition exercises designed with love and understanding.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <Button
              size="lg"
              className="text-lg px-12 py-6 hover:scale-105 transition-all duration-300"
              onClick={scrollToFeatures}
            >
              Get Started
            </Button>
          </motion.div>
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
              Every feature is crafted with empathy and understanding to support both caregivers and their loved ones.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Heart}
              title="Gentle Recognition"
              description="Compassionate exercises designed to stimulate memory and create joyful moments of recognition."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Secure Photo Vault"
              description="Your family memories are protected with enterprise-grade security and privacy measures."
              delay={0.2}
            />
            <FeatureCard
              icon={Users}
              title="Family Collaboration"
              description="Multiple family members can contribute photos and participate in creating meaningful experiences."
              delay={0.3}
            />
            <FeatureCard
              icon={Brain}
              title="Memory Stimulation"
              description="Research-based approaches to gently exercise memory and cognitive function through familiar faces."
              delay={0.4}
            />
            <FeatureCard
              icon={Camera}
              title="Easy Photo Management"
              description="Simple tools to upload, organize, and manage family photos with intuitive interfaces."
              delay={0.5}
            />
            <FeatureCard
              icon={Clock}
              title="Progress Tracking"
              description="Monitor engagement and celebrate small victories with gentle progress insights."
              delay={0.6}
            />
          </div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={() => onNavigate('register')}
              className="text-lg px-12 py-6"
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-6 w-6 text-[#E02478]" />
            <span className="text-xl font-bold">Moments</span>
          </div>
          <p className="text-white/60 mb-4">
            Creating meaningful connections through technology and compassion.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-white/50">
            <button className="hover:text-[#E02478] transition-colors">Privacy Policy</button>
            <button className="hover:text-[#E02478] transition-colors">Terms of Service</button>
            <button className="hover:text-[#E02478] transition-colors">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
};