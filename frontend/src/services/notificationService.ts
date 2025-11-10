import { remindersAPI } from "./api";

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

class NotificationService {
  private checkInterval: number | null = null;
  private checkedReminders: Set<number> = new Set();
  private activeSounds: Map<number, AudioBufferSourceNode> = new Map();
  private activeNotifications: Map<number, Notification> = new Map();

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

  private async playContinuousSound(
    reminderId: number,
    soundType: string | null | undefined
  ): Promise<void> {
    try {
      // Stop any existing sound for this reminder
      this.stopSound(reminderId);

      // Initialize AudioContext if needed
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create a continuous tone
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

      // Set volume
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      // Start playing
      oscillator.start(audioContext.currentTime);

      // Store reference so we can stop it later
      this.activeSounds.set(reminderId, oscillator);

      // Play a second tone for chime effect every 2 seconds
      const chimeInterval = setInterval(() => {
        if (!this.activeSounds.has(reminderId)) {
          clearInterval(chimeInterval);
          return;
        }

        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.frequency.value = frequency * 1.2;
        oscillator2.type = "sine";

        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
      }, 2000);
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

  private async showInteractiveNotification(reminder: Reminder): Promise<void> {
    if (Notification.permission !== "granted") {
      return;
    }

    // Close any existing notification for this reminder
    const existingNotification = this.activeNotifications.get(reminder.id);
    if (existingNotification) {
      existingNotification.close();
    }

    // Create notification with actions (if supported)
    const notificationOptions: NotificationOptions = {
      body: reminder.description || "Time for your reminder!",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `reminder-${reminder.id}`,
      requireInteraction: true, // Keep notification visible until user interacts
      silent: false, // Allow sound
    };

    // Note: Actions are only supported in Service Workers
    // For regular notifications, we'll use click handlers instead
    const notification = new Notification(`Reminder: ${reminder.title}`, notificationOptions);

    // Store notification reference
    this.activeNotifications.set(reminder.id, notification);

    // Handle notification click - open the app
    notification.onclick = () => {
      window.focus();
      // You could navigate to reminders page here if needed
      // window.location.href = '/reminders';
      notification.close();
    };

    // Handle notification close
    notification.onclose = () => {
      this.stopSound(reminder.id);
      this.activeNotifications.delete(reminder.id);
    };

    // Start continuous sound
    await this.playContinuousSound(reminder.id, reminder.notification_sound);
    
    // Emit a custom event for reminder interaction
    // Components can listen to this event and show a dialog
    setTimeout(() => {
      if (this.activeNotifications.has(reminder.id)) {
        // Emit event instead of using confirm()
        window.dispatchEvent(
          new CustomEvent("reminder-notification", {
            detail: {
              reminderId: reminder.id,
              title: reminder.title,
              description: reminder.description || "Time for your reminder!",
              onConfirm: () => this.handleMarkDone(reminder.id),
              onCancel: () => this.handleSnooze(reminder.id),
            },
          })
        );
      }
    }, 1000); // Show dialog after 1 second
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
          // Show interactive notification
          await this.showInteractiveNotification(reminder);

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

  async start(): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.warn("Notification permission not granted. Notifications will not work.");
      return;
    }

    // Check immediately
    await this.checkAndNotifyReminders();

    // Check every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkAndNotifyReminders();
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
    
    // Close all active notifications
    this.activeNotifications.forEach((notification) => {
      notification.close();
    });
    
    this.checkedReminders.clear();
    this.activeSounds.clear();
    this.activeNotifications.clear();
  }
}

export const notificationService = new NotificationService();
