import { remindersAPI, medicationsAPI } from "./api";

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

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  times?: string[];
  purpose?: string;
};

class NotificationService {
  private checkInterval: number | null = null;
  private checkedReminders: Set<number> = new Set();
  private checkedMedications: Set<string> = new Set(); // Use "medicationId-time" as key
  private activeSounds: Map<number, AudioBufferSourceNode> = new Map();

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.warn("Notification permission denied");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  private async playSound(
    reminderId: number,
    soundType: string | null | undefined
  ): Promise<void> {
    try {
      // Stop any existing sound for this reminder
      this.stopSound(reminderId);

      // Initialize AudioContext if needed
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create a gentle chime sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sounds
      let frequency = 800; // Default gentle chime
      if (soundType === "soft-bell") {
        frequency = 600;
      } else if (soundType === "piano") {
        frequency = 523; // C5 note
      }

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Set volume - gentle sound
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

      // Start playing
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);

      // Play a second chime after a short delay for pleasant effect
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.frequency.value = frequency * 1.2;
        oscillator2.type = "sine";

        gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 1.5);
      }, 300);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  private stopSound(reminderId: number): void {
    const sound = this.activeSounds.get(reminderId);
    if (sound) {
      try {
        sound.stop();
      } catch (e) {
        // Sound may already be stopped
      }
      this.activeSounds.delete(reminderId);
    }
  }

  private async handleMarkDone(reminderId: number): Promise<void> {
    try {
      await remindersAPI.completeReminder(reminderId);
      this.stopSound(reminderId);
      this.checkedReminders.add(reminderId);
      
      // Trigger a custom event to update the UI
      window.dispatchEvent(new CustomEvent("reminder-completed", { detail: { reminderId } }));
    } catch (error) {
      console.error("Error marking reminder as done:", error);
    }
  }

  private async handleSnooze(reminderId: number): Promise<void> {
    try {
      await remindersAPI.snoozeReminder(reminderId, 5);
      this.stopSound(reminderId);
      
      // Remove from checked so it can notify again after snooze
      this.checkedReminders.delete(reminderId);
      
      // Trigger a custom event to update the UI
      window.dispatchEvent(new CustomEvent("reminder-snoozed", { detail: { reminderId } }));
    } catch (error) {
      console.error("Error snoozing reminder:", error);
    }
  }

  private async notifyReminder(reminder: Reminder): Promise<void> {
    // Play sound only (no popup)
    await this.playSound(reminder.id, reminder.notification_sound);

    // Emit event to add notification to the notification context
    window.dispatchEvent(
      new CustomEvent("add-notification", {
        detail: {
          type: "reminder" as const,
          title: reminder.title,
          description: reminder.description || "Time for your reminder!",
          data: {
            reminderId: reminder.id,
            onMarkDone: () => this.handleMarkDone(reminder.id),
            onSnooze: () => this.handleSnooze(reminder.id),
          },
        },
      })
    );
  }

  private async checkAndNotifyReminders(): Promise<void> {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Fetch today's reminders
      const reminders = await remindersAPI.listReminders(today);

      if (!Array.isArray(reminders)) {
        return;
      }

      // Check each reminder
      for (const reminder of reminders) {
        // Skip if completed
        if (reminder.status === "completed") {
          continue;
        }

        // Skip if we've already notified this reminder (unless it's snoozed and ready)
        if (this.checkedReminders.has(reminder.id) && reminder.status !== "snoozed") {
          continue;
        }

        // Check if it's time for this reminder (within the current minute)
        const reminderTime = reminder.time.slice(0, 5); // Get HH:MM format

        if (reminderTime === currentTime) {
          // Notify reminder (sound + add to notification context)
          await this.notifyReminder(reminder);

          // Mark as checked (will be removed if snoozed)
          this.checkedReminders.add(reminder.id);
        }
      }

      // Clean up old checked reminders (older than 1 hour)
      if (this.checkedReminders.size > 100) {
        this.checkedReminders.clear();
      }
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  }

  private async notifyMedication(medication: Medication, time: string): Promise<void> {
    // Play sound (use medication ID as sound ID)
    await this.playSound(medication.id, "gentle-chime");

    // Emit event to add notification to the notification context
    window.dispatchEvent(
      new CustomEvent("add-notification", {
        detail: {
          type: "medication" as const,
          title: `Time to take ${medication.name}`,
          description: `Take ${medication.dosage}${medication.purpose ? ` - ${medication.purpose}` : ""}`,
          data: {
            medicationId: medication.id,
            onMarkDone: () => this.handleMedicationMarkDone(medication.id, time),
          },
        },
      })
    );
  }

  private async handleMedicationMarkDone(medicationId: number, time: string): Promise<void> {
    try {
      // Track medication as taken
      await medicationsAPI.trackMedication(medicationId, true);
      this.stopSound(medicationId);
      
      // Mark as checked
      this.checkedMedications.add(`${medicationId}-${time}`);
      
      // Trigger a custom event to update the UI
      window.dispatchEvent(new CustomEvent("medication-completed", { detail: { medicationId, time } }));
    } catch (error) {
      console.error("Error marking medication as done:", error);
    }
  }

  private async checkAndNotifyMedications(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Fetch today's medications
      const medications = await medicationsAPI.getTodayMedications();

      if (!Array.isArray(medications)) {
        return;
      }

        // Check each medication
        for (const medication of medications) {
          // Get all times for this medication (primary time + additional times)
          const medicationTimes: string[] = [];
          
          if (medication.time) {
            // Handle time object or string format
            let timeStr: string;
            if (typeof medication.time === "string") {
              // Already a string, extract HH:MM
              timeStr = medication.time.slice(0, 5);
            } else if (medication.time && typeof medication.time === "object") {
              // Time object with hours and minutes
              const hours = String(medication.time.hours || 0).padStart(2, "0");
              const minutes = String(medication.time.minutes || 0).padStart(2, "0");
              timeStr = `${hours}:${minutes}`;
            } else {
              continue; // Skip if time format is unexpected
            }
            medicationTimes.push(timeStr);
          }
          
          // Add additional times if they exist
          if (medication.times && Array.isArray(medication.times)) {
            medication.times.forEach((t: string) => {
              const timeStr = t.slice(0, 5); // Get HH:MM format
              if (!medicationTimes.includes(timeStr)) {
                medicationTimes.push(timeStr);
              }
            });
          }

        // Check each time slot
        for (const medTime of medicationTimes) {
          const checkKey = `${medication.id}-${medTime}`;
          
          // Skip if we've already notified this medication at this time
          if (this.checkedMedications.has(checkKey)) {
            continue;
          }

          // Check if it's time for this medication (within the current minute)
          if (medTime === currentTime) {
            // Notify medication (sound + add to notification context)
            await this.notifyMedication(medication, medTime);

            // Mark as checked
            this.checkedMedications.add(checkKey);
          }
        }
      }

      // Clean up old checked medications (older than 1 hour)
      if (this.checkedMedications.size > 100) {
        this.checkedMedications.clear();
      }
    } catch (error) {
      console.error("Error checking medications:", error);
    }
  }

  async start(): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.warn("Notification permission not granted. Notifications will not work.");
      return;
    }

    // Check immediately
    await this.checkAndNotifyReminders();
    await this.checkAndNotifyMedications();

    // Check every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkAndNotifyReminders();
      this.checkAndNotifyMedications();
    }, 30000);
  }

  stop(): void {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Stop all active sounds
    this.activeSounds.forEach((sound, reminderId) => {
      this.stopSound(reminderId);
    });
    
    this.checkedReminders.clear();
    this.checkedMedications.clear();
    this.activeSounds.clear();
  }
}

export const notificationService = new NotificationService();
