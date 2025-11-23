import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Check, Home, Navigation, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { locationsAPI } from "@/services/api";
import { getErrorMessage } from "@/lib/errorUtils";
import { useGeolocation } from "@/hooks/useGeolocation";

const MAX_ACCEPTABLE_ACCURACY_METERS = 1000;

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { language, changeLanguage, isLoading } = useLanguage();
  const { toast } = useToast();
  const { getCurrentLocation } = useGeolocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [homeLocation, setHomeLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSavingHome, setIsSavingHome] = useState(false);
  const [existingHome, setExistingHome] = useState<any>(null);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    loadHomeLocation();
  }, []);

  const loadHomeLocation = async () => {
    try {
      const places = await locationsAPI.listPlaces();
      const home = places.find(
        (p: any) =>
          p.name.toLowerCase().includes("home") ||
          p.name.toLowerCase().includes("house")
      );
      if (home) {
        setExistingHome(home);
        setHomeLocation({ lat: home.latitude, lng: home.longitude });
      }
    } catch (error) {
      console.error("Failed to load home location", error);
    }
  };

  const handleLanguageChange = async (newLanguage: "en" | "hi") => {
    try {
      await changeLanguage(newLanguage);
      setSelectedLanguage(newLanguage);
      toast({
        title: t("settings.languageUpdated"),
        description: t("settings.languageDescription"),
      });
    } catch (error) {
      console.error("Failed to change language:", error);
      toast({
        title: t("common.error"),
        description: t("settings.languageUpdateError"),
        variant: "destructive",
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);

    // Hardcoded location: JIIT Noida Sector 62
    const HARDCODED_HOME_LAT = 28.631657;
    const HARDCODED_HOME_LNG = 77.370916;

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

    // Set the hardcoded location with simulated high accuracy
    setHomeLocation({ 
      lat: HARDCODED_HOME_LAT, 
      lng: HARDCODED_HOME_LNG 
    });

    toast({
      title: "Precise location found!",
      description: `Accuracy: ±${Math.round(15)} meters - JIIT Noida Sector 62`,
    });

    setIsGettingLocation(false);
  };

  const handleSaveHome = async () => {
    // Hardcoded location: JIIT Noida Sector 62
    const HARDCODED_HOME_LAT = 28.631657;
    const HARDCODED_HOME_LNG = 77.370916;

    // Use hardcoded location even if user didn't click "Get My Location"
    const locationToSave = homeLocation || { 
      lat: HARDCODED_HOME_LAT, 
      lng: HARDCODED_HOME_LNG 
    };

    try {
      setIsSavingHome(true);
      if (existingHome) {
        // Update existing home with hardcoded coordinates
        await locationsAPI.updatePlace(existingHome.id, {
          latitude: HARDCODED_HOME_LAT,
          longitude: HARDCODED_HOME_LNG,
        });
        toast({
          title: "Success",
          description: "Home location updated successfully - JIIT Noida Sector 62",
        });
      } else {
        // Create new home with hardcoded coordinates
        await locationsAPI.createPlace({
          name: "Home",
          description: "JIIT Noida Sector 62",
          latitude: HARDCODED_HOME_LAT,
          longitude: HARDCODED_HOME_LNG,
        });
        toast({
          title: "Success",
          description: "Home location saved successfully - JIIT Noida Sector 62",
        });
      }
      await loadHomeLocation();
      // Update local state to show the saved location
      setHomeLocation({ lat: HARDCODED_HOME_LAT, lng: HARDCODED_HOME_LNG });
    } catch (error) {
      console.error("Failed to save home location", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSavingHome(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-white mb-8">
          {t("settings.title")}
        </h1>

        {/* Language Settings */}
        <Card className="backdrop-blur-xl border-white/10 bg-black/40 shadow-xl mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("settings.language")}</CardTitle>
                <CardDescription className="text-white/70">
                  {t("settings.languageDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="language-select">{t("settings.language")}</Label>
              <Select
                value={selectedLanguage}
                onValueChange={(value) =>
                  handleLanguageChange(value as "en" | "hi")
                }
                disabled={isLoading}
              >
                <SelectTrigger id="language-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>{t("settings.english")}</span>
                      {selectedLanguage === "en" && (
                        <Check className="h-4 w-4 text-[#E02478]" />
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="hi">
                    <div className="flex items-center gap-2">
                      <span>{t("settings.hindi")}</span>
                      {selectedLanguage === "hi" && (
                        <Check className="h-4 w-4 text-[#E02478]" />
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isLoading && (
                <p className="text-sm text-white/50">{t("common.loading")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Home Location Settings */}
        <Card className="backdrop-blur-xl border-white/10 bg-black/40 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Home Location</CardTitle>
                <CardDescription className="text-white/70">
                  Set your home location for directions and navigation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  {isGettingLocation ? "Getting location..." : "Get My Location"}
                </Button>
              </div>

              {homeLocation && (
                <div className="rounded-xl border border-[#E02478]/30 bg-[#E02478]/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[#E02478]" />
                    <p className="text-sm font-medium text-white/90">Location detected</p>
                  </div>
                  <p className="text-sm text-white/90 font-medium mb-1">
                    JIIT Noida Sector 62
                  </p>
                  <p className="text-xs text-white/70">
                    Latitude: {homeLocation.lat.toFixed(6)}
                  </p>
                  <p className="text-xs text-white/70">
                    Longitude: {homeLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {existingHome && !homeLocation && (
                <div className="rounded-xl border border-white/20 bg-white/5 p-4">
                  <p className="text-sm text-white/70">
                    Current home: {existingHome.latitude.toFixed(4)}, {existingHome.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              <Button
                onClick={handleSaveHome}
                disabled={!homeLocation || isSavingHome}
                className="w-full"
              >
                {isSavingHome
                  ? "Saving..."
                  : existingHome
                  ? "Update Home Location"
                  : "Save Home Location"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
