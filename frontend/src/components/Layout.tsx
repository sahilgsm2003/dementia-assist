import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  currentPage?: string;
}

export const Layout = ({ 
  children, 
  onNavigate, 
  isAuthenticated, 
  onLogout, 
  currentPage = 'landing' 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#101010] text-white relative">
      <AnimatedBackground />
      <Navbar 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative z-10"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
};