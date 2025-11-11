import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Pill } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotifications, Notification } from "@/context/NotificationContext";

export const NotificationBanner = () => {
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Find the most recent unread notification
    const unreadNotification = notifications.find((n) => !n.read);
    
    if (unreadNotification && unreadNotification !== currentNotification) {
      setCurrentNotification(unreadNotification);
      setIsVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Mark as read after animation completes
        setTimeout(() => {
          markAsRead(unreadNotification.id);
          setCurrentNotification(null);
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    } else if (!unreadNotification) {
      setIsVisible(false);
      setCurrentNotification(null);
    }
  }, [notifications, currentNotification, markAsRead]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (currentNotification) {
      setTimeout(() => {
        markAsRead(currentNotification.id);
        setCurrentNotification(null);
      }, 300);
    }
  };

  if (!currentNotification) return null;

  const getNotificationLabel = () => {
    if (currentNotification.type === "medication") {
      return "Medication reminder";
    }
    return "Reminder";
  };

  const Icon = currentNotification.type === "medication" ? Pill : Clock;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 left-0 right-0 z-50 mx-auto max-w-6xl px-4 sm:px-6"
        >
          <div className="rounded-lg border border-white/20 bg-gradient-to-r from-[#E02478]/20 via-purple-600/20 to-transparent p-4 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Icon className="h-5 w-5 text-[#E02478] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {getNotificationLabel()}: {currentNotification.title}
                  </p>
                  {currentNotification.description && (
                    <p className="mt-1 text-xs text-white/70">
                      {currentNotification.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

