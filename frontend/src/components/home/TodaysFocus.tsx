import { motion } from "framer-motion";
import { formatDate, getDayName } from "@/lib/dateUtils";
import { useAuth } from "@/context/AuthContext";
import { Cloud, Sun, CloudRain } from "lucide-react";

interface TodaysFocusProps {
  className?: string;
}

export const TodaysFocus = ({ className }: TodaysFocusProps) => {
  const { user } = useAuth();
  const today = new Date();
  const dayName = getDayName(today);
  const formattedDate = formatDate(today);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Placeholder weather - in Phase 5 we can integrate real weather API
  const weather = {
    condition: "sunny",
    temperature: 72,
    description: "Partly cloudy",
  };

  const WeatherIcon = weather.condition === "sunny" ? Sun : weather.condition === "rainy" ? CloudRain : Cloud;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl border border-white/10 bg-gradient-to-br from-[#E02478]/15 via-purple-600/10 to-transparent p-8 md:p-12 shadow-xl backdrop-blur ${className}`}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70 uppercase tracking-wide">
              {getGreeting()}, {user?.username || "there"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {formattedDate}
            </h1>
            <p className="text-lg md:text-xl text-white/70">
              {dayName} • A beautiful day ahead
            </p>
          </div>
        </div>

        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <WeatherIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{weather.temperature}°</p>
            <p className="text-sm text-white/70">{weather.description}</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

