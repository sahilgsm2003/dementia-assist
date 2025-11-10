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
      await remindersAPI.createReminder({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        date: isoDate,
        time: formState.time,
        notification_sound: formState.notification_sound,
      });

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
    } catch (error) {
      console.error("Failed to create reminder", error);
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
        <div className="grid gap-4 md:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-white/80">
              Time *
            </Label>
            <Input
              id="reminder-time"
              type="time"
              value={formState.time}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, time: e.target.value }))
              }
              className="bg-black/30"
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

