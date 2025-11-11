import { motion } from "framer-motion";
import { Calendar, Sun, Sunset, Moon } from "lucide-react";
import { SkeletonList } from "@/components/shared/SkeletonList";
import { formatLocalDate, formatDate } from "@/lib/dateUtils";
import { DaySection } from "./DaySection";

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

interface TimelineViewProps {
  reminders: Reminder[];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const TimelineView = ({ reminders, onComplete, onDelete, isLoading }: TimelineViewProps) => {
  const today = new Date();
  const todayFormatted = formatLocalDate(today);
  const todayDisplay = formatDate(today);

  // Categorize reminders by time of day
  const categorizeReminders = (reminders: Reminder[]) => {
    const morning: Reminder[] = [];
    const afternoon: Reminder[] = [];
    const evening: Reminder[] = [];

    reminders.forEach((reminder) => {
      const [hours] = reminder.time.split(":").map(Number);
      const hour = hours;

      if (hour >= 6 && hour < 12) {
        morning.push(reminder);
      } else if (hour >= 12 && hour < 18) {
        afternoon.push(reminder);
      } else if (hour >= 18 && hour < 22) {
        evening.push(reminder);
      } else {
        // Early morning or late night goes to appropriate section
        if (hour < 6) {
          morning.push(reminder);
        } else {
          evening.push(reminder);
        }
      }
    });

    // Sort each section by time
    const sortByTime = (a: Reminder, b: Reminder) => a.time.localeCompare(b.time);
    morning.sort(sortByTime);
    afternoon.sort(sortByTime);
    evening.sort(sortByTime);

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = categorizeReminders(reminders);
  const totalReminders = reminders.length;
  const completedReminders = reminders.filter((r) => r.status === "completed").length;
  const progress = totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Header */}
      {totalReminders > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">{todayDisplay}</h2>
              <p className="text-sm text-white/70">
                {totalReminders} {totalReminders === 1 ? "reminder" : "reminders"} scheduled
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70 mb-1">Progress</p>
              <p className="text-2xl font-bold text-white mb-2">
                {completedReminders}/{totalReminders}
              </p>
              <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-[#E02478]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {/* Morning Section */}
        <DaySection
          title="Morning"
          icon={Sun}
          timeRange="6 AM - 12 PM"
          reminders={morning}
          onComplete={onComplete}
          onDelete={onDelete}
          color="yellow"
        />

        {/* Afternoon Section */}
        <DaySection
          title="Afternoon"
          icon={Sunset}
          timeRange="12 PM - 6 PM"
          reminders={afternoon}
          onComplete={onComplete}
          onDelete={onDelete}
          color="orange"
        />

        {/* Evening Section */}
        <DaySection
          title="Evening"
          icon={Moon}
          timeRange="6 PM - 10 PM"
          reminders={evening}
          onComplete={onComplete}
          onDelete={onDelete}
          color="purple"
        />
      </div>

      {/* Empty State */}
      {totalReminders === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6 rounded-full bg-white/5 p-6">
              <Calendar className="h-16 w-16 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No reminders scheduled for today</h3>
            <p className="text-sm text-white/50 max-w-md">
              Add reminders to organize your day and stay on track throughout the day.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

