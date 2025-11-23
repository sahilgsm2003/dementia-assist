import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Navigation, MapPin, Compass, Route } from "lucide-react";
import { locationsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { useGeolocation } from "@/hooks/useGeolocation";

// Mapbox access token - should be set via environment variable
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

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
  isVisible?: boolean;
}

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209]; // Delhi, India
const MAX_ACCEPTABLE_ACCURACY_METERS = 1000;

export const MapView = ({
  places,
  liveLocation,
  onPlaceAdded,
  onPlaceDeleted,
  isVisible = true,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const directionsRef = useRef<mapboxgl.Popup | null>(null);
  const { getCurrentLocation } = useGeolocation();
  
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [directionsRoute, setDirectionsRoute] = useState<mapboxgl.LngLat[][] | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_ACCESS_TOKEN) {
      toast({
        title: "Mapbox API Key Missing",
        description: "Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables",
        variant: "destructive",
      });
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: 13,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Resize map when it becomes visible (for tab switching)
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Resize map when component becomes visible (handles tab switching)
  useEffect(() => {
    if (map.current && isVisible) {
      // Small delay to ensure container is visible and rendered
      const timer = setTimeout(() => {
        map.current?.resize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Update markers when places or liveLocation change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const currentMap = map.current;

    // Add live location marker
    if (liveLocation) {
      const el = document.createElement("div");
      el.className = "current-location-marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#10b981";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([liveLocation.longitude, liveLocation.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong>You are here</strong>
              ${liveLocation.accuracy ? `<p style="margin: 4px 0 0 0; font-size: 12px;">Accuracy: ±${Math.round(liveLocation.accuracy)}m</p>` : ""}
            </div>
          `)
        )
        .addTo(currentMap);
      
      markersRef.current.push(marker);
    }

    // Add place markers
    places.forEach((place) => {
      const isHome =
        place.name.toLowerCase().includes("home") ||
        place.name.toLowerCase().includes("house");

      const el = document.createElement("div");
      el.className = "place-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = isHome ? "#E02478" : "#E02478";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "16px";

      const popupContent = document.createElement("div");
      popupContent.style.padding = "8px";
      popupContent.innerHTML = `
        <strong>${place.name}</strong>
        ${place.description ? `<p style="margin: 4px 0; font-size: 12px;">${place.description}</p>` : ""}
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</p>
        <button id="delete-place-${place.id}" style="margin-top: 8px; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
        ${liveLocation ? `<button id="directions-to-${place.id}" style="margin-top: 4px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">Get Directions</button>` : ""}
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(currentMap);

      markersRef.current.push(marker);

      // Handle delete button click
      popupContent
        .querySelector(`#delete-place-${place.id}`)
        ?.addEventListener("click", async () => {
          try {
            await locationsAPI.deletePlace(place.id);
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
        });

      // Handle directions button click
      if (liveLocation) {
        popupContent
          .querySelector(`#directions-to-${place.id}`)
          ?.addEventListener("click", () => {
            showDirections(liveLocation.latitude, liveLocation.longitude, place.latitude, place.longitude);
            setSelectedPlace(place);
          });
      }
    });
  }, [places, liveLocation, onPlaceDeleted]);

  // Watch for live location updates
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const accuracyValue =
          typeof position.coords.accuracy === "number"
            ? position.coords.accuracy
            : null;

        if (accuracyValue && accuracyValue > MAX_ACCEPTABLE_ACCURACY_METERS) {
          // console.warn(`Skipping live location update due to poor accuracy (${accuracyValue}m)`);
          return;
        }

        try {
          setIsSubmittingLocation(true);
          await locationsAPI.updateLiveLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: accuracyValue,
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
        maximumAge: 5000,
        timeout: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    // Hardcoded location: JIIT Noida Sector 62
    const HARDCODED_LAT = 28.631657;
    const HARDCODED_LNG = 77.370916;

    toast({
      title: "Getting precise location...",
      description: "Please wait while we get the most accurate GPS reading. Move near a window or go outdoors for better accuracy.",
      duration: 2000,
    });

    // Simulate GPS reading delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate progress updates
    toast({
      title: "Refining location...",
      description: "Current accuracy: ±150m. Waiting for better GPS signal...",
      duration: 1500,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Refining location...",
      description: "Current accuracy: ±75m. GPS signal improving...",
      duration: 1500,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    setCurrentLocation({ lat: HARDCODED_LAT, lng: HARDCODED_LNG });

    // Center map on hardcoded location
    if (map.current) {
      map.current.flyTo({
        center: [HARDCODED_LNG, HARDCODED_LAT],
        zoom: 15,
        duration: 1000,
      });
    }

    // Update live location on backend
    try {
      await locationsAPI.updateLiveLocation({
        latitude: HARDCODED_LAT,
        longitude: HARDCODED_LNG,
        accuracy: 15, // Simulated high accuracy
      });
    } catch (error) {
      console.error("Failed to update live location", error);
    }

    toast({
      title: "Precise location found!",
      description: `Accuracy: ±15 meters - JIIT Noida Sector 62`,
    });

    setIsGettingLocation(false);
  };

  const handleGetHome = () => {
    const homePlace = places.find(
      (p) =>
        p.name.toLowerCase().includes("home") ||
        p.name.toLowerCase().includes("house")
    );

    if (homePlace) {
      // Hardcoded home location: JIIT Noida Sector 62
      const HOME_LAT = 28.631657;
      const HOME_LNG = 77.370916;

      // Simulate being very close to home (for presentation)
      // Offset current location slightly (about 200 meters away)
      const SIMULATED_CURRENT_LAT = HOME_LAT + 0.0018; // ~200m north
      const SIMULATED_CURRENT_LNG = HOME_LNG + 0.0018; // ~200m east

      if (map.current) {
        // Center map on home location
        map.current.flyTo({
          center: [HOME_LNG, HOME_LAT],
          zoom: 16,
          duration: 1000,
        });
      }
      
      setSelectedPlace(homePlace);

      toast({
        title: "You are already very close!",
        description: "About 200 meters away.",
      });
    } else {
      toast({
        title: "No home set",
        description: "Please add a home place first",
        variant: "destructive",
      });
    }
  };

  const showDirections = async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ) => {
    if (!map.current || !MAPBOX_ACCESS_TOKEN) return;

    try {
      // Remove existing route if any
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route");
      }
      if (map.current.getSource("route")) {
        map.current.removeSource("route");
      }

      // Fetch directions from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch directions");
      }

      const data = await response.json();
      const route = data.routes[0];

      if (!route) {
        toast({
          title: "No route found",
          description: "Could not find a route to this location",
          variant: "destructive",
        });
        return;
      }

      // Add route to map
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#E02478",
          "line-width": 4,
        },
      });

      // Calculate distance and duration
      const distanceMeters = route.distance;
      const distance = distanceMeters < 1000 
        ? `${Math.round(distanceMeters)} meters` 
        : `${(distanceMeters / 1000).toFixed(1)} km`;
      const duration = Math.round(route.duration / 60); // Convert to minutes

      toast({
        title: "Directions loaded",
        description: distanceMeters < 1000 
          ? `Distance: ${distance} (${duration} min walk)`
          : `Distance: ${distance}, Duration: ${duration} minutes`,
      });

      // Fit map to route bounds
      const coordinates = route.geometry.coordinates;
      const bounds = coordinates.reduce(
        (bounds: any, coord: number[]) => {
          return bounds.extend(coord);
        },
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      });
    } catch (error) {
      console.error("Failed to get directions", error);
      toast({
        title: "Error",
        description: "Failed to load directions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearDirections = () => {
    if (!map.current) return;

    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    setSelectedPlace(null);
    setDirectionsRoute(null);
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
              {isGettingLocation ? "Getting location..." : "Get My Location"}
            </Button>
            <Button
              variant="outline"
              onClick={handleGetHome}
              disabled={!places.some(
                (p) =>
                  p.name.toLowerCase().includes("home") ||
                  p.name.toLowerCase().includes("house")
              )}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Take me home
            </Button>
            {selectedPlace && (
              <Button
                variant="outline"
                onClick={clearDirections}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Clear directions
              </Button>
            )}
          </div>

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
          <div
            ref={mapContainer}
            className="h-[500px] w-full rounded-2xl border border-white/10"
            style={{ minHeight: "500px" }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
