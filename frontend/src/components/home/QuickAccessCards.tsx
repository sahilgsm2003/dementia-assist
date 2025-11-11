import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Info, ChevronRight } from "lucide-react";
import { memoriesAPI, locationsAPI, emergencyAPI } from "@/services/api";
import { useEffect, useState } from "react";

interface QuickAccessCardsProps {
  className?: string;
}

export const QuickAccessCards = ({ className }: QuickAccessCardsProps) => {
  const navigate = useNavigate();
  const [peopleCount, setPeopleCount] = useState(0);
  const [placesCount, setPlacesCount] = useState(0);
  const [hasEmergencyInfo, setHasEmergencyInfo] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load people count
        const memories = await memoriesAPI.listPhotos();
        setPeopleCount(Array.isArray(memories) ? memories.length : 0);

        // Load places count
        const places = await locationsAPI.listPlaces();
        setPlacesCount(Array.isArray(places) ? places.length : 0);

        // Check if emergency info exists
        try {
          await emergencyAPI.getEmergencyInfo();
          setHasEmergencyInfo(true);
        } catch {
          setHasEmergencyInfo(false);
        }
      } catch (error) {
        console.error("Failed to load quick access data", error);
      }
    };

    loadData();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      <h2 className="text-xl font-semibold text-white">Quick Access</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* My People Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 h-full"
            onClick={() => navigate("/my-people")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white/70">
                  My People
                </CardTitle>
                <Users className="h-5 w-5 text-[#E02478]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-white">{peopleCount}</p>
              <p className="text-xs text-white/60">
                {peopleCount === 0
                  ? "Add photos of family and friends"
                  : `${peopleCount} ${peopleCount === 1 ? "person" : "people"} saved`}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>View all</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Places Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 h-full"
            onClick={() => navigate("/my-places")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white/70">
                  My Places
                </CardTitle>
                <MapPin className="h-5 w-5 text-[#E02478]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-white">{placesCount}</p>
              <p className="text-xs text-white/60">
                {placesCount === 0
                  ? "Add important locations"
                  : `${placesCount} ${placesCount === 1 ? "place" : "places"} saved`}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>View all</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Information Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 h-full"
            onClick={() => navigate("/safety")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white/70">
                  My Information
                </CardTitle>
                <Info className="h-5 w-5 text-[#E02478]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-white">
                {hasEmergencyInfo ? "✓" : "—"}
              </p>
              <p className="text-xs text-white/60">
                {hasEmergencyInfo
                  ? "Emergency info set up"
                  : "Set up emergency information"}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
};

