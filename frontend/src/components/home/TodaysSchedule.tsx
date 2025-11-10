import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, AlarmClock, Plus } from "lucide-react";
import { formatTime } from "@/lib/dateUtils";
import { SkeletonList } from "@/components/shared/SkeletonList";

interface Reminder {
  id: number;
  title: string;
  time: string;
  description?: string;
}

interface TodaysScheduleProps {
  reminders: Reminder[];
  isLoading?: boolean;
  className?: string;
}

export const TodaysSchedule = ({ reminders, isLoading, className }: TodaysScheduleProps) => {
  const navigate = useNavigate();
  
  // Get next 3 reminders, sorted by time
  const nextReminders = reminders
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Today's Schedule</h2>
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Today's Schedule</h2>
          <p className="text-sm text-white/70 mt-1">
            {reminders.length === 0
              ? "No reminders scheduled for today"
              : `${reminders.length} reminder${reminders.length === 1 ? "" : "s"} today`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/my-day")}
          className="text-white/70 hover:text-white"
        >
          View All
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {nextReminders.length === 0 ? (
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlarmClock className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-2">No reminders scheduled</p>
            <p className="text-sm text-white/50 mb-4">
              Add reminders to keep your day organized
            </p>
            <Button
              onClick={() => navigate("/my-day")}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {nextReminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => navigate("/my-day")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/20 text-[#E02478]">
                          <AlarmClock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            {formatTime(reminder.time)}
                          </p>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {reminder.title}
                      </h3>
                      {reminder.description && (
                        <p className="text-sm text-white/70">{reminder.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/40 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

