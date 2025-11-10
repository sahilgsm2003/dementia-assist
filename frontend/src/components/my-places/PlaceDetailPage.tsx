import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Navigation, MapPin, Share2, Phone } from "lucide-react";
import { locationsAPI } from "@/services/api";
import { formatShortDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface Place {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { placeId } = useParams<{ placeId: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingDirections, setIsGettingDirections] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      if (!placeId) return;

      try {
        setIsLoading(true);
        const places = await locationsAPI.listPlaces();
        const foundPlace = places.find((p: Place) => p.id === parseInt(placeId));
        setPlace(foundPlace || null);
      } catch (error) {
        console.error("Failed to load place", error);
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlace();
  }, [placeId]);

  const handleGetDirections = () => {
    if (!place) return;

    setIsGettingDirections(true);
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
    setIsGettingDirections(false);
  };

  const handleShareLocation = async () => {
    if (!place) return;

    const shareData = {
      title: place.name,
      text: place.description || `Location: ${place.name}`,
      url: `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${place.name}\n${place.description || ""}\nhttps://www.google.com/maps?q=${place.latitude},${place.longitude}`
        );
        toast({
          title: "Copied",
          description: "Location link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Failed to share", error);
    }
  };

  const handleMarkAsHere = async () => {
    if (!place) return;

    try {
      await locationsAPI.updateLiveLocation({
        latitude: place.latitude,
        longitude: place.longitude,
        accuracy: null,
      });
      toast({
        title: "Location updated",
        description: `Marked "${place.name}" as your current location`,
      });
    } catch (error) {
      console.error("Failed to update location", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/70">Loading place...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-places")}
          className="mb-6 text-white/70 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Places
        </Button>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-2">Place not found</p>
            <p className="text-sm text-white/50">
              The place you're looking for doesn't exist
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHome =
    place.name.toLowerCase().includes("home") ||
    place.name.toLowerCase().includes("house");

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/my-places")}
        className="text-white/70 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Places
      </Button>

      {/* Place Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {isHome ? (
                <div className="p-3 rounded-full bg-[#E02478]/20">
                  <Home className="h-6 w-6 text-[#E02478]" />
                </div>
              ) : (
                <div className="p-3 rounded-full bg-white/10">
                  <MapPin className="h-6 w-6 text-white/70" />
                </div>
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {place.name}
                </h1>
                {place.description && (
                  <p className="text-xl text-white/90 mt-2">
                    {place.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-white/60 mb-1">Coordinates</p>
                <p className="text-lg font-semibold text-white">
                  {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Added</p>
                <p className="text-lg font-semibold text-white">
                  {formatShortDate(place.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleGetDirections}
            disabled={isGettingDirections}
            size="lg"
            className="rounded-full bg-[#E02478] px-8 py-6 text-base font-semibold text-white hover:bg-[#E02478]/85"
          >
            <Navigation className="mr-2 h-5 w-5" />
            {isGettingDirections ? "Opening..." : "Get Directions"}
          </Button>
          <Button
            onClick={handleMarkAsHere}
            variant="outline"
            size="lg"
            className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
          >
            <MapPin className="mr-2 h-5 w-5" />
            I'm here
          </Button>
          <Button
            onClick={handleShareLocation}
            variant="outline"
            size="lg"
            className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share Location
          </Button>
        </div>
      </motion.div>

      {/* Map Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white">Location</h2>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="h-[400px] overflow-hidden rounded-2xl border border-white/10">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6L4XZ1k&q=${place.latitude},${place.longitude}&zoom=15`}
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

