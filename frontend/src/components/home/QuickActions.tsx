import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  Pill,
  Shield,
} from "lucide-react";

interface QuickActionsProps {
  className?: string;
}

export const QuickActions = ({ className }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Ask Moments",
      icon: MessageCircle,
      path: "/ask-moments",
      color: "bg-[#E02478] hover:bg-[#E02478]/85",
    },
    {
      label: "My People",
      icon: Users,
      path: "/my-people",
      color: "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50",
    },
    {
      label: "My Day",
      icon: Calendar,
      path: "/my-day",
      color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50",
    },
    {
      label: "My Places",
      icon: MapPin,
      path: "/my-places",
      color: "bg-green-500/20 hover:bg-green-500/30 border-green-500/50",
    },
    {
      label: "Medications",
      icon: Pill,
      path: "/medications",
      color: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50",
    },
    {
      label: "Safety",
      icon: Shield,
      path: "/safety",
      color: "bg-red-500/20 hover:bg-red-500/30 border-red-500/50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`space-y-4 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Button
                onClick={() => navigate(action.path)}
                className={`w-full h-auto flex-col gap-2 py-4 px-3 border ${action.color} text-white transition-all`}
                variant="outline"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

