import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReminderCard } from "./ReminderCard";
import { cn } from "@/lib/utils";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  notification_sound?: string | null;
  status?: string;
  created_at: string;
}

interface DaySectionProps {
  title: string;
  icon: LucideIcon;
  timeRange: string;
  reminders: Reminder[];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  color: "yellow" | "orange" | "purple";
}

const colorClasses = {
  yellow: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: "text-yellow-400",
    accent: "text-yellow-300",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: "text-orange-400",
    accent: "text-orange-300",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: "text-purple-400",
    accent: "text-purple-300",
  },
};

export const DaySection = ({
  title,
  icon: Icon,
  timeRange,
  reminders,
  onComplete,
  onDelete,
  color,
}: DaySectionProps) => {
  const colors = colorClasses[color];

  if (reminders.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", colors.bg, colors.border, "border")}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/60">{timeRange}</p>
        </div>
        <div className="ml-auto">
          <span className={cn("text-sm font-medium", colors.accent)}>
            {reminders.length} {reminders.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="space-y-3 pl-12">
        {reminders.map((reminder, index) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ReminderCard
              reminder={reminder}
              onComplete={onComplete}
              onDelete={onDelete}
              color={color}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

