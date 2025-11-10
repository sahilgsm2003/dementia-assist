import { SkeletonList } from "@/components/shared/SkeletonList";

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
    <div className="space-y-8">
      {/* Day Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">{todayDisplay}</h2>
            <p className="text-sm text-white/70 mt-1">
              {totalReminders} {totalReminders === 1 ? "reminder" : "reminders"} scheduled
            </p>
          </div>
          {totalReminders > 0 && (
            <div className="text-right">
              <p className="text-sm text-white/70">Progress</p>
              <p className="text-2xl font-bold text-white">
                {completedReminders}/{totalReminders}
              </p>
              <div className="mt-2 h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-[#E02478]"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-8">
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
          className="text-center py-12"
        >
          <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg mb-2">No reminders scheduled for today</p>
          <p className="text-sm text-white/50">
            Add reminders to organize your day and stay on track
          </p>
        </motion.div>
      )}
    </div>
  );
};

