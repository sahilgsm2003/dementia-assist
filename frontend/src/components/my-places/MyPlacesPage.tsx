import { motion } from "framer-motion";
import { MapPin, Sparkles, Plus } from "lucide-react";
import { PlacesList } from "./PlacesList";
import { MapView } from "./MapView";
import { AddPlaceForm } from "./AddPlaceForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { locationsAPI } from "@/services/api";
import { useLocation } from "react-router-dom";

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

export const MyPlacesPage = () => {
  const location = useLocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "map">(
    (location.state?.tab as "list" | "map") || "list"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [placesData, liveLocationData] = await Promise.allSettled([
        locationsAPI.listPlaces(),
        locationsAPI.getLiveLocation(),
      ]);

      if (placesData.status === "fulfilled") {
        setPlaces(Array.isArray(placesData.value) ? placesData.value : []);
      }

      if (liveLocationData.status === "fulfilled" && liveLocationData.value) {
        setLiveLocation(liveLocationData.value);
      }
    } catch (error) {
      console.error("Failed to load places", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceAdded = () => {
    setIsFormOpen(false);
    loadData();
  };

  const handlePlaceDeleted = () => {
    loadData();
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-[#E02478]" />
          My Places
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Familiar places, always close at hand.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          Keep track of important locations, find your way home, and share your location with loved ones.
        </p>
      </div>

      {/* Add Place Button */}
      <div className="flex justify-end">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#E02478] px-6 py-6 text-base font-semibold text-white hover:bg-[#E02478]/85">
              <Plus className="mr-2 h-5 w-5" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add a Place</DialogTitle>
              <DialogDescription>
                Add a familiar location to your places
              </DialogDescription>
            </DialogHeader>
            <AddPlaceForm
              onSuccess={handlePlaceAdded}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs: List and Map View */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        <TabsList className="bg-white/10">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Places List
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <PlacesList
            places={places}
            liveLocation={liveLocation}
            onDelete={handlePlaceDeleted}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="map">
          <MapView
            places={places}
            liveLocation={liveLocation}
            onPlaceAdded={handlePlaceAdded}
            onPlaceDeleted={handlePlaceDeleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

