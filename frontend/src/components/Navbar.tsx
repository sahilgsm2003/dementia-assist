import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const isOnDashboard = location.pathname.startsWith("/dashboard");
  const isOnAssistant = location.pathname.startsWith("/chatbot");

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        background,
        backdropFilter: "blur(16px)",
        borderBottom: border,
      }}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <motion.span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <Heart className="h-5 w-5" />
          </motion.span>
          <span className="text-xl font-semibold tracking-tight text-white">
            Moments
          </span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                className={cn(
                  "text-white/70 hover:text-white",
                  isOnDashboard && "text-white font-semibold"
                )}
                aria-current={isOnDashboard ? "page" : undefined}
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="secondary"
                className={cn(
                  "hidden sm:inline-flex items-center gap-2 border border-white/10 bg-white/5 text-white hover:bg-white/10",
                  isOnAssistant &&
                    "border-transparent bg-[#E02478] text-white shadow-lg shadow-[#E02478]/30 hover:bg-[#E02478]/85"
                )}
                aria-current={isOnAssistant ? "page" : undefined}
                onClick={() => navigate("/chatbot")}
              >
                <MessageCircle className="h-4 w-4" />
                Open Assistant
              </Button>
              <Button
                variant="outline"
                className="border-white/15 text-white hover:bg-white/10"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#E02478] text-white hover:bg-[#E02478]/85">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};
