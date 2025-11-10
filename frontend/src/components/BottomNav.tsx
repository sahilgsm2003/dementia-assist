import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Users, MessageCircle, Images, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Calendar, label: "My Day", path: "/my-day" },
  { icon: Users, label: "My People", path: "/my-people" },
  { icon: MessageCircle, label: "Ask Moments", path: "/ask-moments" },
  { icon: Images, label: "My Memories", path: "/my-memories" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

interface BottomNavProps {
  className?: string;
}

export const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden",
        className
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            location.pathname === item.path || 
            (item.path === "/home" && location.pathname === "/dashboard") ||
            (item.path === "/my-day" && location.pathname === "/reminders") ||
            (item.path === "/my-people" && location.pathname === "/memory-vault") ||
            (item.path === "/ask-moments" && location.pathname === "/chatbot") ||
            (item.path === "/my-places" && location.pathname === "/locations");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200",
                isActive
                  ? "text-[#E02478]"
                  : "text-white/60 hover:text-white/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-t-full bg-[#E02478]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

