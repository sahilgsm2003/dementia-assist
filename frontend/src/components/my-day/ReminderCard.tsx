import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trash2, BellRing } from "lucide-react";
import { formatTime } from "@/lib/dateUtils";
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

interface ReminderCardProps {
  reminder: Reminder;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  color: "yellow" | "orange" | "purple";
}

const colorClasses = {
  yellow: {
    completed: "bg-green-500/10 border-green-500/30",
    incomplete: "bg-yellow-500/10 border-yellow-500/30",
    check: "text-green-400",
  },
  orange: {
    completed: "bg-green-500/10 border-green-500/30",
    incomplete: "bg-orange-500/10 border-orange-500/30",
    check: "text-green-400",
  },
  purple: {
    completed: "bg-green-500/10 border-green-500/30",
    incomplete: "bg-purple-500/10 border-purple-500/30",
    check: "text-green-400",
  },
};

export const ReminderCard = ({
  reminder,
  onComplete,
  onDelete,
  color,
}: ReminderCardProps) => {
  const isCompleted = reminder.status === "completed";
  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        "border backdrop-blur-sm transition-all",
        isCompleted ? colors.completed : colors.incomplete,
        isCompleted && "opacity-75"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onComplete(reminder.id)}
            className={cn(
              "flex-shrink-0 mt-1 p-2 rounded-full transition-all",
              isCompleted
                ? "bg-green-500/30 border-2 border-green-400/50"
                : "bg-white/10 border-2 border-white/20 hover:bg-white/20"
            )}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isCompleted ? (
              <CheckCircle2 className={cn("h-5 w-5", colors.check)} />
            ) : (
              <Circle className="h-5 w-5 text-white/60" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-1 rounded">
                    {formatTime(reminder.time)}
                  </span>
                  {reminder.notification_sound && (
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <BellRing className="h-3 w-3" />
                      {reminder.notification_sound.replace("-", " ")}
                    </span>
                  )}
                </div>
                <h3
                  className={cn(
                    "text-base font-semibold",
                    isCompleted ? "text-white/60 line-through" : "text-white"
                  )}
                >
                  {reminder.title}
                </h3>
                {reminder.description && (
                  <p
                    className={cn(
                      "text-sm mt-1",
                      isCompleted ? "text-white/50" : "text-white/70"
                    )}
                  >
                    {reminder.description}
                  </p>
                )}
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(reminder.id)}
                className="text-white/40 hover:text-red-400 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

