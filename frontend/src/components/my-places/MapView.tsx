import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
  Circle,
  useMap,
} from "react-leaflet";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Navigation, MapPin, Compass } from "lucide-react";
import { locationsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

// Fix default marker icons
const DefaultIcon = L.Icon.Default.prototype as L.Icon & {
  _getIconUrl?: string;
};
delete DefaultIcon._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

interface MapViewProps {
  places: Place[];
  liveLocation: LiveLocation | null;
  onPlaceAdded: () => void;
  onPlaceDeleted: () => void;
}

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209]; // Delhi, India

// Component to handle map clicks
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// Component to center map on location
function CenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export const MapView = ({
  places,
  liveLocation,
  onPlaceAdded,
  onPlaceDeleted,
}: MapViewProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);

  const mapCenter = useMemo<[number, number]>(() => {
    if (liveLocation) {
      return [liveLocation.latitude, liveLocation.longitude];
    }
    if (places.length) {
      return [places[0].latitude, places[0].longitude];
    }
    return DEFAULT_CENTER;
  }, [liveLocation, places]);

  // Watch for live location updates
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        if (position.coords.accuracy && position.coords.accuracy > 100) {
          return;
        }

        try {
          setIsSubmittingLocation(true);
          await locationsAPI.updateLiveLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        } catch (error) {
          console.error("Failed to update live location", error);
        } finally {
          setIsSubmittingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleGetCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedLocation({ lat, lng });
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Error",
          description: "Could not get your location",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleGetHome = () => {
    const homePlace = places.find(
      (p) =>
        p.name.toLowerCase().includes("home") ||
        p.name.toLowerCase().includes("house")
    );

    if (homePlace) {
      setSelectedLocation({
        lat: homePlace.latitude,
        lng: homePlace.longitude,
      });
    } else {
      toast({
        title: "No home set",
        description: "Please add a home place first",
        variant: "destructive",
      });
    }
  };

  // Create custom icons
  const placeIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#E02478" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const homeIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#E02478" stroke="white" stroke-width="2"/>
        <path d="M16 10 L20 14 L20 22 L12 22 L12 14 Z" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const liveLocationIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleDeletePlace = async (id: number) => {
    try {
      await locationsAPI.deletePlace(id);
      toast({
        title: "Deleted",
        description: "Place removed",
      });
      onPlaceDeleted();
    } catch (error) {
      console.error("Failed to delete place", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Compass className="h-5 w-5 text-[#E02478]" />
            Map View
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isGettingLocation ? "Getting location..." : "Where am I?"}
            </Button>
            <Button
              variant="outline"
              onClick={handleGetHome}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Take me home
            </Button>
            {selectedLocation && (
              <Button
                variant="outline"
                onClick={() => setSelectedLocation(null)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Clear selection
              </Button>
            )}
          </div>

          {selectedLocation && (
            <div className="rounded-xl border border-[#E02478]/30 bg-[#E02478]/10 p-4">
              <p className="text-sm text-white/90 mb-2">
                Selected location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
              <p className="text-xs text-white/70">
                Click "Add Place" button to save this location
              </p>
            </div>
          )}

          {isSubmittingLocation && (
            <p className="text-xs text-white/60">
              Updating your location...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="h-[500px] overflow-hidden rounded-2xl border border-white/10">
            <MapContainer
              key={mapCenter.join(",")}
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <CenterMap center={mapCenter} />
              <MapClickHandler onMapClick={handleMapClick} />

              {/* Places markers */}
              {places.map((place) => {
                const isHome =
                  place.name.toLowerCase().includes("home") ||
                  place.name.toLowerCase().includes("house");
                return (
                  <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]}
                    icon={isHome ? homeIcon : placeIcon}
                  >
                    <Popup>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold">{place.name}</p>
                        {place.description && (
                          <p className="text-gray-700">{place.description}</p>
                        )}
                        <p className="text-xs text-gray-600">
                          {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-auto p-1 text-xs text-red-500 hover:text-red-600"
                          onClick={() => handleDeletePlace(place.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Live location marker */}
              {liveLocation && (
                <>
                  <Marker
                    position={[liveLocation.latitude, liveLocation.longitude]}
                    icon={liveLocationIcon}
                  >
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">You are here</p>
                        {liveLocation.accuracy && (
                          <p className="text-gray-700">
                            Accuracy ±{Math.round(liveLocation.accuracy)} meters
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                  {liveLocation.accuracy && liveLocation.accuracy <= 100 && (
                    <Circle
                      center={[liveLocation.latitude, liveLocation.longitude]}
                      radius={liveLocation.accuracy}
                      pathOptions={{
                        color: "#10b981",
                        fillColor: "#10b981",
                        fillOpacity: 0.1,
                        weight: 2,
                      }}
                    />
                  )}
                </>
              )}

              {/* Selected location marker */}
              {selectedLocation && (
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={placeIcon}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">Selected location</p>
                      <p className="text-gray-700">
                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

