import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";
import { Navbar } from "./Navbar";
import { Navigation } from "./Navigation";
import { SearchBar } from "./shared/SearchBar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";
  const isPublicRoute = ["/", "/auth", "/register"].includes(location.pathname);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent text-white">
      <AnimatedBackground />
      {!isOnboarding && <Navbar onSearchClick={() => setIsSearchOpen(true)} />}
      {!isOnboarding && !isPublicRoute && <Navigation />}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={cn(
          "relative z-10 flex-1 pb-20 pt-24",
          !isOnboarding && !isPublicRoute && "md:pl-64 md:pb-6",
          isOnboarding && "pb-6"
        )}
      >
        {children}
      </motion.main>
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
