import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Clock, Pill, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications, Notification } from "@/context/NotificationContext";
import { formatTime, getRelativeTime } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { remindersAPI } from "@/services/api";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "reminder":
      return Clock;
    case "medication":
      return Pill;
    default:
      return Bell;
  }
};

export const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    markAsRead(notification.id);
    
    // If it's a reminder or medication and has mark done handler, execute it
    if ((notification.type === "reminder" || notification.type === "medication") && notification.data?.onMarkDone) {
      notification.data.onMarkDone();
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  // Sort notifications: unread first, then by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-16 z-50 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#E02478]" />
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#E02478] px-2 py-0.5 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs text-white/70 hover:text-white"
                  >
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-white/30 mx-auto mb-3" />
                  <p className="text-sm text-white/70">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {sortedNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 transition-colors hover:bg-white/5 ${
                          notification.read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            notification.read 
                              ? "bg-white/5" 
                              : "bg-[#E02478]/15"
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              notification.read 
                                ? "text-white/50" 
                                : "text-[#E02478]"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  notification.read ? "text-white/70" : "text-white"
                                }`}>
                                  {notification.title}
                                </p>
                                {notification.description && (
                                  <p className="mt-1 text-xs text-white/60 line-clamp-2">
                                    {notification.description}
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-white/40">
                                  {getRelativeTime(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-[#E02478] mt-1" />
                              )}
                            </div>
                            {(notification.type === "reminder" || notification.type === "medication") && !notification.read && (
                              <div className="mt-3 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleNotificationClick(notification)}
                                  className="h-7 text-xs"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Mark Done
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

