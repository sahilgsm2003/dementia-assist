import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Users, 
  MessageCircle, 
  Images, 
  MapPin,
  Shield,
  Pill,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const mainNavItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Calendar, label: "My Day", path: "/my-day" },
  { icon: Users, label: "My People", path: "/my-people" },
  { icon: MessageCircle, label: "Ask Moments", path: "/ask-moments" },
  { icon: Images, label: "My Memories", path: "/my-memories" },
  { icon: MapPin, label: "My Places", path: "/my-places" },
];

const secondaryNavItems = [
  { icon: Shield, label: "Safety", path: "/safety" },
  { icon: Pill, label: "Medications", path: "/medications" },
];

const settingsNavItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safely get auth context
  let logout = () => {};
  try {
    const auth = useAuth();
    logout = auth.logout;
  } catch (error) {
    // AuthProvider not available - return null
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/home") return location.pathname === "/home" || location.pathname === "/dashboard";
    if (path === "/my-day") return location.pathname === "/my-day" || location.pathname === "/reminders";
    if (path === "/my-people") return location.pathname === "/my-people" || location.pathname === "/memory-vault";
    if (path === "/ask-moments") return location.pathname === "/ask-moments" || location.pathname === "/chatbot";
    if (path === "/my-places") return location.pathname === "/my-places" || location.pathname === "/locations";
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 md:pt-20 md:z-40",
        "border-r border-white/10 bg-black/40 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <div className="mb-6">
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Main
            </h2>
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-[#E02478]/20 text-[#E02478] shadow-lg shadow-[#E02478]/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "text-[#E02478]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <nav className="mt-8 space-y-1">
          <div className="mb-6">
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Important
            </h2>
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-[#E02478]/20 text-[#E02478] shadow-lg shadow-[#E02478]/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "text-[#E02478]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings Navigation */}
        <nav className="mt-auto space-y-1 pt-8 pb-4">
          <div className="mb-6">
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Settings
            </h2>
          </div>
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-[#E02478]/20 text-[#E02478] shadow-lg shadow-[#E02478]/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "text-[#E02478]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            type="button"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};
