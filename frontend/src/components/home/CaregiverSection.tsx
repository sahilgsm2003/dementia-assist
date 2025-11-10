import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Activity, FileText, Calendar } from "lucide-react";
import { useState } from "react";

interface CaregiverSectionProps {
  className?: string;
}

export const CaregiverSection = ({ className }: CaregiverSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Placeholder data - in Phase 5 we can add real activity tracking
  const activitySummary = {
    medicationsTaken: 2,
    medicationsTotal: 3,
    remindersCompleted: 1,
    remindersTotal: 4,
  };

  const upcomingAppointments = [
    {
      id: 1,
      title: "Doctor's Appointment",
      date: "Tomorrow at 2:00 PM",
      type: "medical",
    },
    {
      id: 2,
      title: "Family Visit",
      date: "Friday at 10:00 AM",
      type: "social",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={className}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Caregiver View
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/70 hover:text-white"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-6 pt-0">
                {/* Activity Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#E02478]" />
                    <h3 className="text-base font-semibold text-white">Today's Activity</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="text-sm text-white/70 mb-2">Medications</p>
                      <p className="text-2xl font-bold text-white">
                        {activitySummary.medicationsTaken} / {activitySummary.medicationsTotal}
                      </p>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E02478] transition-all"
                          style={{
                            width: `${(activitySummary.medicationsTaken / activitySummary.medicationsTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="text-sm text-white/70 mb-2">Reminders</p>
                      <p className="text-2xl font-bold text-white">
                        {activitySummary.remindersCompleted} / {activitySummary.remindersTotal}
                      </p>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${(activitySummary.remindersCompleted / activitySummary.remindersTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#E02478]" />
                    <h3 className="text-base font-semibold text-white">Notes</h3>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">
                      No notes added today. Add notes to track important observations or updates.
                    </p>
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#E02478]" />
                    <h3 className="text-base font-semibold text-white">Upcoming</h3>
                  </div>
                  <div className="space-y-2">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-xl border border-white/10 bg-black/30 p-4"
                      >
                        <p className="text-sm font-medium text-white">{appointment.title}</p>
                        <p className="text-xs text-white/60 mt-1">{appointment.date}</p>
                      </div>
                    ))}
                    {upcomingAppointments.length === 0 && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <p className="text-sm text-white/60">No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.section>
  );
};

