import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface ReminderNotificationEvent {
  reminderId: number;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReminderNotificationHandler = () => {
  const [reminderDialog, setReminderDialog] = useState<ReminderNotificationEvent | null>(null);

  useEffect(() => {
    const handleReminderNotification = (event: Event) => {
      const customEvent = event as CustomEvent<ReminderNotificationEvent>;
      setReminderDialog(customEvent.detail);
    };

    window.addEventListener("reminder-notification", handleReminderNotification as EventListener);

    return () => {
      window.removeEventListener("reminder-notification", handleReminderNotification as EventListener);
    };
  }, []);

  const handleConfirm = () => {
    if (reminderDialog) {
      reminderDialog.onConfirm();
      setReminderDialog(null);
    }
  };

  const handleCancel = () => {
    if (reminderDialog) {
      reminderDialog.onCancel();
      setReminderDialog(null);
    }
  };

  if (!reminderDialog) return null;

  return (
    <ConfirmDialog
      open={!!reminderDialog}
      onOpenChange={(open) => {
        if (!open) {
          setReminderDialog(null);
        }
      }}
      title={`Reminder: ${reminderDialog.title}`}
      description={`${reminderDialog.description}\n\nClick "Mark Done" to complete, or "Snooze" to remind again in 5 minutes.`}
      confirmText="Mark Done"
      cancelText="Snooze"
      variant="default"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

