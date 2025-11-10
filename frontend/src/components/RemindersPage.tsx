import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlarmClock, BellRing, CalendarIcon, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { remindersAPI } from "@/services/api";

type Reminder = {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  notification_sound?: string | null;
  status?: string;
  created_at: string;
};

const notificationOptions = [
  { id: "gentle-chime", label: "Gentle chime" },
  { id: "soft-bell", label: "Soft bell" },
  { id: "piano", label: "Warm piano" },
];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function generateCalendar(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const days: Date[] = [];
  const startOffset = start.getDay();

  for (let i = 0; i < startOffset; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() - (startOffset - i));
    days.push(day);
  }

  for (let day = 1; day <= end.getDate(); day++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    const lastDay = days[days.length - 1];
    const next = new Date(lastDay);
    next.setDate(next.getDate() + 1);
    days.push(next);
  }

  return days;
}

export const RemindersPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    time: "09:00",
    notification_sound: "gentle-chime",
  });
  const [submitting, setSubmitting] = useState(false);

  // Format date in local timezone (YYYY-MM-DD) to avoid UTC conversion issues
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isoDate = formatLocalDate(selectedDate);

  const calendarDays = useMemo(() => generateCalendar(selectedDate), [selectedDate]);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        setIsLoading(true);
        const data = await remindersAPI.listReminders(isoDate);
        setReminders(data ?? []);
      } finally {
        setIsLoading(false);
      }
    };

    loadReminders();

    // Listen for reminder completion/snooze events from notifications
    const handleReminderCompleted = (event: CustomEvent) => {
      setReminders((prev) => prev.filter((r) => r.id !== event.detail.reminderId));
    };

    const handleReminderSnoozed = () => {
      loadReminders(); // Reload to get updated snooze status
    };

    window.addEventListener("reminder-completed", handleReminderCompleted as EventListener);
    window.addEventListener("reminder-snoozed", handleReminderSnoozed as EventListener);

    return () => {
      window.removeEventListener("reminder-completed", handleReminderCompleted as EventListener);
      window.removeEventListener("reminder-snoozed", handleReminderSnoozed as EventListener);
    };
  }, [isoDate]);

  const handleSubmit = async () => {
    if (!formState.title.trim()) return;

    try {
      setSubmitting(true);
      await remindersAPI.createReminder({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        date: isoDate,
        time: formState.time,
        notification_sound: formState.notification_sound,
      });
      const data = await remindersAPI.listReminders(isoDate);
      setReminders(data ?? []);
      setFormState({
        title: "",
        description: "",
        time: "09:00",
        notification_sound: "gentle-chime",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await remindersAPI.deleteReminder(id);
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <AlarmClock className="h-4 w-4 text-[#E02478]" />
          Memory Calendar
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Gentle reminders for routines, celebrations, and cherished moments.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          Create daily reminders and jot down notes that help you and your loved ones stay in
          rhythm.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Select a date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-white/70">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
                  )
                }
              >
                Previous
              </Button>
              <span className="font-medium text-white">
                {selectedDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
                  )
                }
              >
                Next
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs text-white/50">
              {weekdayLabels.map((weekday) => (
                <div key={weekday} className="text-center uppercase">
                  {weekday}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {calendarDays.map((day) => {
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isSelected =
                  day.toDateString() === selectedDate.toDateString() && isCurrentMonth;
                const dateLabel = day.getDate();
                return (
                  <button
                    key={`${day.toISOString()}-calendar`}
                    onClick={() => setSelectedDate(day)}
                    className={`rounded-lg px-2 py-3 transition ${
                      isSelected
                        ? "bg-[#E02478] text-white shadow-lg shadow-[#E02478]/30"
                        : isCurrentMonth
                        ? "bg-white/10 text-white hover:bg-white/15"
                        : "bg-black/20 text-white/40 hover:bg-black/10"
                    }`}
                  >
                    {dateLabel}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PlusCircle className="h-5 w-5 text-[#E02478]" />
                Create a reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reminder-title" className="text-white/80">
                    Title
                  </Label>
                  <Input
                    id="reminder-title"
                    placeholder="Take a walk, call Anya..."
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="bg-black/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="text-white/80">
                    Time
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={formState.time}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, time: event.target.value }))
                    }
                    className="bg-black/30 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-description" className="text-white/80">
                  Notes
                </Label>
                <Textarea
                  id="reminder-description"
                  rows={3}
                  placeholder="Add details or encouragement to remember later."
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="bg-black/30 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Notification sound</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {notificationOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm text-white/80 transition ${
                        formState.notification_sound === option.id
                          ? "border-[#E02478] bg-[#E02478]/20"
                          : "border-white/10 bg-black/20 hover:border-[#E02478]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="notification_sound"
                        value={option.id}
                        checked={formState.notification_sound === option.id}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            notification_sound: event.target.value,
                          }))
                        }
                        className="hidden"
                      />
                      <BellRing className="h-4 w-4 text-[#E02478]" />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!formState.title.trim() || submitting}
                className="w-full rounded-full bg-[#E02478] py-5 text-base font-semibold text-white hover:bg-[#E02478]/85 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save reminder"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarIcon className="h-5 w-5 text-[#E02478]" />
                Reminders for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-white/70">
                  Loading reminders...
                </div>
              ) : reminders.length ? (
                <div className="space-y-4">
                  {reminders
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-white">
                              {reminder.time.slice(0, 5)}
                            </span>
                            <span className="text-xs uppercase tracking-wide text-white/50">
                              {reminder.notification_sound?.replace("-", " ") || "gentle chime"}
                            </span>
                          </div>
                          <p className="text-base font-semibold text-white">{reminder.title}</p>
                          {reminder.description && (
                            <p className="text-sm text-white/70">{reminder.description}</p>
                          )}
                          <p className="text-xs text-white/40">
                            Added {new Date(reminder.created_at).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-white/60 hover:text-red-400"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 text-sm text-white/60">
                  No reminders yet. Create one to keep the day on track.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;

