import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// Mapbox access token - should be set via environment variable
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  height?: string;
  zoom?: number;
  showMarker?: boolean;
}

export const PlaceMap = ({ 
  latitude, 
  longitude, 
  height = "300px",
  zoom = 15,
  showMarker = true 
}: PlaceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox API Key Missing");
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: zoom,
    });

    // Add marker if requested
    if (showMarker) {
      const el = document.createElement("div");
      el.className = "place-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#E02478";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";

      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    }

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom, showMarker]);

  // Update map center when coordinates change
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        duration: 500,
      });

      // Update marker position if it exists
      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      }
    }
  }, [latitude, longitude, zoom]);

  // Resize map when container size changes
  useEffect(() => {
    if (map.current && mapContainer.current) {
      const resizeObserver = new ResizeObserver(() => {
        map.current?.resize();
      });
      resizeObserver.observe(mapContainer.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-800 text-white rounded-lg"
        style={{ height }}
      >
        <p className="text-sm">Map unavailable - API key missing</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
};

