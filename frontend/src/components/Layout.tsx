import { motion } from "framer-motion";
import { ReactNode } from "react";
import { AnimatedBackground } from "./AnimatedBackground";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent text-white">
      <AnimatedBackground />
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 flex-1 pb-20 pt-24"
      >
        {children}
      </motion.main>
    </div>
  );
};
