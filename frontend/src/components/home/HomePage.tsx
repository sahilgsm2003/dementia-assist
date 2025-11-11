import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { remindersAPI, medicationsAPI } from "@/services/api";
import { formatLocalDate } from "@/lib/dateUtils";
import { TodaysFocus } from "./TodaysFocus";
import { TodaysSchedule } from "./TodaysSchedule";

interface Reminder {
  id: number;
  title: string;
  time: string;
  description?: string;
}

export const HomePage = () => {
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [medicationCount, setMedicationCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const todayIso = formatLocalDate(today);

        const [remindersResponse, medicationsResponse] = await Promise.allSettled([
          remindersAPI.listReminders(todayIso),
          medicationsAPI.listMedications(),
        ]);

        if (remindersResponse.status === "fulfilled") {
          const data = remindersResponse.value ?? [];
          setTodayReminders(Array.isArray(data) ? data : []);
        }

        if (medicationsResponse.status === "fulfilled") {
          const data = medicationsResponse.value ?? [];
          setMedicationCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-10">
        {/* Today's Focus Section */}
        <TodaysFocus />

        {/* Today's Schedule Section */}
        <TodaysSchedule reminders={todayReminders} isLoading={isLoading} />

        {/* Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
};

