import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, BellRing } from "lucide-react";
import { remindersAPI } from "@/services/api";
import { formatLocalDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { useState } from "react";
import { TimePicker } from "@/components/shared/TimePicker";

interface ReminderFormProps {
  selectedDate: Date;
  onSuccess: () => void;
}

const notificationOptions = [
  { id: "gentle-chime", label: "Gentle chime" },
  { id: "soft-bell", label: "Soft bell" },
  { id: "piano", label: "Warm piano" },
];

export const ReminderForm = ({ selectedDate, onSuccess }: ReminderFormProps) => {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    time: "09:00",
    notification_sound: "gentle-chime",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formState.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reminder title",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const isoDate = formatLocalDate(selectedDate);
      // Ensure time is in HH:MM:SS format for backend
      const timeWithSeconds = formState.time.includes(":") && formState.time.split(":").length === 2
        ? `${formState.time}:00`
        : formState.time;
      
      // Validate that we have both date and time
      if (!isoDate || !timeWithSeconds) {
        toast({
          title: "Error",
          description: "Please provide both date and time",
          variant: "destructive",
        });
        return;
      }
      
      const payload: Record<string, unknown> = {
        title: formState.title.trim(),
        reminder_type: "time",
      };
      
      // Only add optional fields if they have values
      if (formState.description.trim()) {
        payload.description = formState.description.trim();
      }
      if (isoDate) {
        payload.date = isoDate;
      }
      if (timeWithSeconds) {
        payload.time = timeWithSeconds;
      }
      if (formState.notification_sound) {
        payload.notification_sound = formState.notification_sound;
      }
      
      console.log("Sending reminder payload:", payload);
      
      await remindersAPI.createReminder(payload);

      toast({
        title: "Success",
        description: "Reminder added",
      });

      // Reset form
      setFormState({
        title: "",
        description: "",
        time: "09:00",
        notification_sound: "gentle-chime",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create reminder", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error details:", error?.response?.data?.detail);
      if (Array.isArray(error?.response?.data?.detail)) {
        error.response.data.detail.forEach((err: any, index: number) => {
          console.error(`Error ${index + 1}:`, JSON.stringify(err, null, 2));
        });
      }
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <PlusCircle className="h-5 w-5 text-[#E02478]" />
          Add Reminder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="reminder-title" className="text-white/80">
              Title *
            </Label>
            <Input
              id="reminder-title"
              placeholder="e.g., Take medication, Call Sarah..."
              value={formState.title}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-black/30"
            />
          </div>
            <TimePicker
              id="reminder-time"
              value={formState.time}
              onChange={(time) =>
                setFormState((prev) => ({ ...prev, time }))
              }
            />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder-description" className="text-white/80">
            Notes
          </Label>
          <Textarea
            id="reminder-description"
            rows={3}
            placeholder="Add details or encouragement..."
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, description: e.target.value }))
            }
            className="bg-black/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Notification Sound</Label>
          <div className="grid gap-3 md:grid-cols-3">
            {notificationOptions.map((option) => (
              <label
                key={option.id}
                className={`
                  flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm text-white/80 transition
                  ${
                    formState.notification_sound === option.id
                      ? "border-[#E02478] bg-[#E02478]/20"
                      : "border-white/10 bg-black/20 hover:border-[#E02478]/40"
                  }
                `}
              >
                <input
                  type="radio"
                  name="notification_sound"
                  value={option.id}
                  checked={formState.notification_sound === option.id}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      notification_sound: e.target.value,
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
          {submitting ? "Adding..." : "Add Reminder"}
        </Button>
      </CardContent>
    </Card>
  );
};

