import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
  Circle,
} from "react-leaflet";
import { motion } from "framer-motion";
import { Compass, Globe, MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locationsAPI } from "@/services/api";

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

type MemoryPlace = {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

type LiveLocation = {
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  updated_at: string;
};

type DraftPlace = {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
};

const defaultDraft: DraftPlace = {
  name: "",
  description: "",
  latitude: "",
  longitude: "",
};

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209]; // Delhi, India

function MapClickCapture({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export const LocationsPage = () => {
  const [places, setPlaces] = useState<MemoryPlace[]>([]);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [draft, setDraft] = useState<DraftPlace>(defaultDraft);
  const [saving, setSaving] = useState(false);
  const [submittingLocation, setSubmittingLocation] = useState(false);

  const mapCenter = useMemo<[number, number]>(() => {
    if (liveLocation) {
      return [liveLocation.latitude, liveLocation.longitude];
    }
    if (places.length) {
      return [places[0].latitude, places[0].longitude];
    }
    return DEFAULT_CENTER;
  }, [liveLocation, places]);

  const latitudeNumber = parseFloat(draft.latitude);
  const longitudeNumber = parseFloat(draft.longitude);
  const canSavePlace =
    Boolean(draft.name.trim()) &&
    !Number.isNaN(latitudeNumber) &&
    !Number.isNaN(longitudeNumber);

  useEffect(() => {
    const loadPlaces = async () => {
      const data = await locationsAPI.listPlaces();
      setPlaces(data ?? []);
    };

    const loadLiveLocation = async () => {
      const data = await locationsAPI.getLiveLocation();
      if (data) {
        setLiveLocation(data);
      }
    };

    loadPlaces();
    loadLiveLocation();
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        // Filter out readings with poor accuracy (more than 100 meters)
        if (position.coords.accuracy && position.coords.accuracy > 100) {
          console.warn(
            `Location accuracy is poor: ${position.coords.accuracy}m`
          );
          return;
        }

        try {
          setSubmittingLocation(true);
          const payload = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          const data = await locationsAPI.updateLiveLocation(payload);
          setLiveLocation(data);
        } finally {
          setSubmittingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Show user-friendly error message
        if (error.code === error.PERMISSION_DENIED) {
          console.warn("Location permission denied");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          console.warn("Location information unavailable");
        } else if (error.code === error.TIMEOUT) {
          console.warn("Location request timed out");
        }
      },
      {
        enableHighAccuracy: true, // Use GPS if available
        maximumAge: 0, // Don't use cached positions
        timeout: 30000, // Wait up to 30 seconds for accurate reading
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleCreatePlace = async () => {
    if (!canSavePlace) return;

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      latitude: latitudeNumber,
      longitude: longitudeNumber,
    };

    try {
      setSaving(true);
      const created = await locationsAPI.createPlace(payload);
      setPlaces((prev) => [created, ...prev]);
      setDraft(defaultDraft);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlace = async (id: number) => {
    await locationsAPI.deletePlace(id);
    setPlaces((prev) => prev.filter((place) => place.id !== id));
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

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Compass className="h-4 w-4 text-[#E02478]" />
          Memory Map
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Keep familiar places close and loved ones within reach.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          Pin safe locations, track live whereabouts, and offer gentle
          directions for daily routines.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Navigation className="h-5 w-5 text-[#E02478]" />
              Add a familiar place
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="place-name" className="text-white/80">
                Name
              </Label>
              <Input
                id="place-name"
                placeholder="Home, market, park..."
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                className="bg-black/30 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="place-description" className="text-white/80">
                Notes
              </Label>
              <Input
                id="place-description"
                placeholder="Add a gentle hint or detail"
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="bg-black/30 text-sm"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/80">Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="28.6139"
                  value={draft.latitude}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      latitude: event.target.value,
                    }))
                  }
                  className="bg-black/30 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="77.209"
                  value={draft.longitude}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      longitude: event.target.value,
                    }))
                  }
                  className="bg-black/30 text-sm"
                />
              </div>
            </div>
            <Button
              className="w-full rounded-full bg-[#E02478] py-5 text-base font-semibold text-white hover:bg-[#E02478]/85 disabled:opacity-50"
              onClick={handleCreatePlace}
              disabled={!canSavePlace || saving}
            >
              {saving ? "Saving..." : "Save place"}
            </Button>
            <p className="text-xs text-white/50">
              Tip: Click anywhere on the map to fill latitude and longitude
              automatically.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-[#E02478]" />
              Familiar places & live location
            </CardTitle>
            <span className="text-xs text-white/60">
              {submittingLocation
                ? "Updating location…"
                : "Tap map to select coordinates."}
            </span>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[360px] overflow-hidden rounded-2xl border border-white/10">
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
                <MapClickCapture
                  onSelect={(lat, lng) =>
                    setDraft((prev) => ({
                      ...prev,
                      latitude: lat.toFixed(6),
                      longitude: lng.toFixed(6),
                    }))
                  }
                />
                {places.map((place) => (
                  <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]}
                    icon={placeIcon}
                  >
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">{place.name}</p>
                        {place.description && (
                          <p className="text-white/70">{place.description}</p>
                        )}
                        <Button
                          variant="ghost"
                          className="mt-2 h-auto p-0 text-xs text-red-500 hover:text-red-600"
                          onClick={() => handleDeletePlace(place.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {liveLocation && (
                  <>
                    <Marker
                      position={[liveLocation.latitude, liveLocation.longitude]}
                      icon={liveLocationIcon}
                    >
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold">Live location</p>
                          {liveLocation.accuracy && (
                            <p className="text-white/70">
                              Accuracy ±{Math.round(liveLocation.accuracy)}{" "}
                              meters
                            </p>
                          )}
                          <p className="text-xs text-white/60">
                            Updated{" "}
                            {new Date(
                              liveLocation.updated_at
                            ).toLocaleTimeString()}
                          </p>
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
              </MapContainer>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Saved places
                </h3>
                <span className="text-xs text-white/50">
                  {places.length
                    ? `${places.length} places saved`
                    : "No places yet"}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {places.map((place) => (
                  <div
                    key={place.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-4 w-4 text-[#E02478]" />
                        <span className="font-semibold">{place.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-white/60 hover:text-red-400"
                        onClick={() => handleDeletePlace(place.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    {place.description && (
                      <p className="mt-2 text-sm text-white/60">
                        {place.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-white/40">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </p>
                    <p className="text-xs text-white/40">
                      Added {new Date(place.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {!places.length && (
                  <div className="col-span-full flex h-32 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 text-sm text-white/60">
                    Add a safe place to start building your personal map.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationsPage;
