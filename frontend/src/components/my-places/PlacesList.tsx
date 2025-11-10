import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Navigation, Map } from "lucide-react";
import { formatShortDate } from "@/lib/dateUtils";
import { PlaceCard } from "./PlaceCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonGrid } from "@/components/shared/SkeletonGrid";

interface Place {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface LiveLocation {
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  updated_at: string;
}

interface PlacesListProps {
  places: Place[];
  liveLocation: LiveLocation | null;
  onDelete: () => void;
  isLoading: boolean;
}

export const PlacesList = ({ places, liveLocation, onDelete, isLoading }: PlacesListProps) => {
  const navigate = useNavigate();

  // Separate "Home" from other places
  const homePlace = places.find((p) => 
    p.name.toLowerCase().includes("home") || 
    p.name.toLowerCase().includes("house")
  );
  const otherPlaces = places.filter((p) => p.id !== homePlace?.id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <SkeletonCard />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 bg-white/10" />
          <SkeletonGrid count={6} columns={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Home Section */}
      {homePlace && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#E02478]" />
            <h2 className="text-xl font-semibold text-white">Home</h2>
          </div>
          <PlaceCard
            place={homePlace}
            isHome={true}
            onView={() => navigate(`/my-places/${homePlace.id}`)}
            onDelete={onDelete}
          />
        </motion.section>
      )}

      {/* Other Places */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#E02478]" />
            <h2 className="text-xl font-semibold text-white">
              Other Places ({otherPlaces.length})
            </h2>
          </div>
        </div>

        {otherPlaces.length === 0 ? (
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <MapPin className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 mb-2">No other places added yet</p>
              <p className="text-sm text-white/50">
                Add places you visit frequently
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <PlaceCard
                  place={place}
                  isHome={false}
                  onView={() => navigate(`/my-places/${place.id}`)}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Live Location Card */}
      {liveLocation && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Current Location</h2>
          </div>
          <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white">You are here</p>
                  {liveLocation.accuracy && (
                    <p className="text-sm text-white/70">
                      Accuracy: ±{Math.round(liveLocation.accuracy)} meters
                    </p>
                  )}
                  <p className="text-xs text-white/60">
                    Updated {formatShortDate(liveLocation.updated_at)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/my-places", { state: { tab: "map" } })}
                  className="border-green-500/50 text-green-200 hover:bg-green-500/20"
                >
                  <Map className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </div>
  );
};

