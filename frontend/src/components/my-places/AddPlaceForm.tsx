import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation } from "lucide-react";
import { locationsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface AddPlaceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlaceForm = ({ onSuccess, onCancel }: AddPlaceFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setIsGettingLocation(false);
        toast({
          title: "Location found",
          description: "Your current location has been added",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Error",
          description: "Could not get your location. Please enter coordinates manually.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a place name",
        variant: "destructive",
      });
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Error",
        description: "Please enter valid coordinates or use 'Get Current Location'",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await locationsAPI.createPlace({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        latitude: lat,
        longitude: lng,
      });

      toast({
        title: "Success",
        description: "Place added successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        latitude: "",
        longitude: "",
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to add place", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="place-name" className="text-white/80">
          Place Name *
        </Label>
        <Input
          id="place-name"
          placeholder="e.g., Home, Grocery Store, Park..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-black/30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="place-description" className="text-white/80">
          Why is this place important?
        </Label>
        <Textarea
          id="place-description"
          placeholder="e.g., My home address, Where I buy groceries, My favorite park..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-black/30 min-h-[100px]"
          rows={4}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-white/80">Location</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isGettingLocation ? "Getting location..." : "Get Current Location"}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="place-latitude" className="text-white/80">
              Latitude
            </Label>
            <Input
              id="place-latitude"
              type="number"
              step="0.000001"
              placeholder="28.6139"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="bg-black/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="place-longitude" className="text-white/80">
              Longitude
            </Label>
            <Input
              id="place-longitude"
              type="number"
              step="0.000001"
              placeholder="77.209"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="bg-black/30"
            />
          </div>
        </div>
        <p className="text-xs text-white/50">
          Tip: Click "Get Current Location" or enter coordinates manually. You can also click on the map to select a location.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Place"}
        </Button>
      </div>
    </form>
  );
};

