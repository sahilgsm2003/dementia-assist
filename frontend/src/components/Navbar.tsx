import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export const Navbar = ({ onSearchClick }: { onSearchClick?: () => void }) => {
  // Safely get auth context - return null if not available
  let isAuthenticated = false;
  let logout = () => {};
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
  } catch (error) {
    // AuthProvider not available - this is OK for public routes
    console.debug("Auth context not available");
  }
  
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  const background = useTransform(
    scrollY,
    [0, 120],
    [
      "rgba(5, 6, 10, 0.15)",
      "rgba(5, 6, 10, 0.75)",
    ]
  );
  const borderOpacity = useTransform(scrollY, [0, 120], [0, 0.4]);

  const border = useMotionTemplate`1px solid rgba(255,255,255, ${borderOpacity})`;

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        background,
        backdropFilter: "blur(16px)",
        borderBottom: border,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.span
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.span>
          <span className="text-lg sm:text-xl font-semibold tracking-tight text-white group-hover:text-[#E02478] transition-colors">
            Moments
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          {isAuthenticated ? (
            <>
              {onSearchClick && (
                <Button
                  variant="outline"
                  onClick={onSearchClick}
                  className="hidden sm:inline-flex items-center gap-2 border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  title="Search (Ctrl+K)"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden md:inline">Search</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/safety")}
                className="hidden sm:inline-flex items-center gap-2 border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20"
              >
                <Shield className="h-4 w-4" />
                Emergency
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-xs sm:text-sm"
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="text-white/70 hover:text-white text-xs sm:text-sm px-2 sm:px-4">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#E02478] text-white hover:bg-[#E02478]/85 text-xs sm:text-sm px-3 sm:px-4">
                  <span className="hidden sm:inline">Create account</span>
                  <span className="sm:hidden">Sign up</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};
