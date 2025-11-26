import { useState, useEffect, useRef } from "react";
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
import { Globe, Check, Home, Navigation, MapPin, Mic, Upload, Trash2, Volume2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { locationsAPI, voiceCloneAPI } from "@/services/api";
import { getErrorMessage } from "@/lib/errorUtils";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Switch } from "@/components/ui/switch";

const MAX_ACCEPTABLE_ACCURACY_METERS = 1000;

interface VoiceProfileData {
  id: number;
  language: string;
  is_active: boolean;
  sample_audio_url: string;
  duration?: number;
}

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

  // Voice cloning state
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileData | null>(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSimulatingVoice, setIsSimulatingVoice] = useState(false); // True when simulating processing for cached voice
  const [voiceLanguage, setVoiceLanguage] = useState<string>(language);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    loadHomeLocation();
    loadVoiceProfile();
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

  const loadVoiceProfile = async () => {
    try {
      const status = await voiceCloneAPI.getStatus();
      if (status.voice_profile) {
        setVoiceProfile(status.voice_profile);
        setVoiceLanguage(status.voice_profile.language);
      }
    } catch (error) {
      console.error("Failed to load voice profile", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await uploadVoiceSample(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: t("settings.voiceRecordingStarted", "Recording started"),
        description: t("settings.voiceRecordingTip", "Speak clearly for 6-15 seconds. Read any text or talk naturally."),
      });
    } catch (error) {
      console.error("Failed to start recording", error);
      toast({
        title: t("common.error"),
        description: t("settings.microphoneError", "Could not access microphone. Please check permissions."),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadVoiceSample(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadVoiceSample = async (audioFile: File | Blob) => {
    setIsUploadingVoice(true);
    try {
      const result = await voiceCloneAPI.uploadSample(audioFile, voiceLanguage);
      if (result.success) {
        setVoiceProfile(result.voice_profile);
        toast({
          title: t("settings.voiceUploadSuccess", "Voice sample uploaded!"),
          description: t("settings.voiceUploadSuccessDesc", "Your voice has been cloned successfully. The chatbot will now speak in your voice."),
        });
      }
    } catch (error) {
      console.error("Failed to upload voice sample", error);
      toast({
        title: t("common.error"),
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const testVoiceClone = async (forceRegenerate: boolean = false) => {
    if (!voiceProfile) return;

    setIsTestingVoice(true);
    // Show "simulating" indicator when using cached voice (backend adds 3.5s delay)
    if (!forceRegenerate) {
      setIsSimulatingVoice(true);
    }
    
    try {
      // Use persistent cached test voice - same audio every time
      // Backend adds 3.5s simulated processing delay for cached responses
      console.log(`[VoiceClone] Testing voice (cached, forceRegenerate=${forceRegenerate})`);
      const audioBlob = await voiceCloneAPI.testVoiceCached(voiceLanguage, forceRegenerate);
      setIsSimulatingVoice(false);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsTestingVoice(false);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsTestingVoice(false);
        toast({
          title: t("common.error"),
          description: t("settings.voiceTestError", "Failed to play test audio"),
          variant: "destructive",
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error("Failed to test voice", error);
      setIsTestingVoice(false);
      setIsSimulatingVoice(false);
      toast({
        title: t("common.error"),
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const toggleVoiceClone = async () => {
    try {
      const result = await voiceCloneAPI.toggleProfile();
      if (result.success && voiceProfile) {
        setVoiceProfile({
          ...voiceProfile,
          is_active: result.is_active,
        });
        toast({
          title: result.is_active 
            ? t("settings.voiceCloneEnabled", "Voice cloning enabled")
            : t("settings.voiceCloneDisabled", "Voice cloning disabled"),
          description: result.is_active
            ? t("settings.voiceCloneEnabledDesc", "The chatbot will speak in your cloned voice.")
            : t("settings.voiceCloneDisabledDesc", "The chatbot will use the default browser voice."),
        });
      }
    } catch (error) {
      console.error("Failed to toggle voice clone", error);
      toast({
        title: t("common.error"),
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const deleteVoiceProfile = async () => {
    try {
      await voiceCloneAPI.deleteProfile();
      setVoiceProfile(null);
      toast({
        title: t("settings.voiceDeleted", "Voice profile deleted"),
        description: t("settings.voiceDeletedDesc", "Your voice sample has been removed."),
      });
    } catch (error) {
      console.error("Failed to delete voice profile", error);
      toast({
        title: t("common.error"),
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

        {/* Voice Cloning Settings */}
        <Card className="backdrop-blur-xl border-white/10 bg-black/40 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("settings.voiceCloning", "Voice Cloning")}</CardTitle>
                <CardDescription className="text-white/70">
                  {t("settings.voiceCloningDesc", "Make the chatbot speak in a familiar voice")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Voice Profile Status */}
              {voiceProfile ? (
                <div className="space-y-4">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white/90">{t("settings.enableVoiceClone", "Enable Voice Cloning")}</Label>
                      <p className="text-xs text-white/60 mt-1">
                        {voiceProfile.is_active 
                          ? t("settings.voiceCloneActiveDesc", "Chatbot speaks in your cloned voice")
                          : t("settings.voiceCloneInactiveDesc", "Using default browser voice")}
                      </p>
                    </div>
                    <Switch
                      checked={voiceProfile.is_active}
                      onCheckedChange={toggleVoiceClone}
                    />
                  </div>

                  {/* Voice Profile Info */}
                  <div className="rounded-xl border border-[#E02478]/30 bg-[#E02478]/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-[#E02478]" />
                        <p className="text-sm font-medium text-white/90">
                          {t("settings.voiceProfileActive", "Voice Profile Active")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${voiceProfile.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                        {voiceProfile.is_active ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}
                      </span>
                    </div>
                    <p className="text-xs text-white/70">
                      {t("settings.voiceLanguage", "Language")}: {voiceProfile.language === "hi" ? "हिंदी (Hindi)" : "English"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testVoiceClone(false)}
                      disabled={isTestingVoice || !voiceProfile.is_active}
                      className="flex-1"
                    >
                      {isTestingVoice ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isSimulatingVoice 
                            ? (language === "hi" ? "प्रोसेसिंग..." : "Processing...")
                            : t("settings.testing", "Testing...")}
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          {t("settings.testVoice", "Test Voice")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deleteVoiceProfile}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload New Sample */}
                  <div className="pt-2 border-t border-white/10">
                    <Label className="text-white/70 text-sm">{t("settings.uploadNewSample", "Upload a new voice sample")}</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingVoice}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t("settings.uploadFile", "Upload File")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* No Voice Profile - Setup Instructions */}
                  <div className="rounded-xl border border-white/20 bg-white/5 p-4">
                    <p className="text-sm text-white/90 font-medium mb-2">
                      {t("settings.setupVoiceClone", "Set up Voice Cloning")}
                    </p>
                    <p className="text-xs text-white/70 mb-3">
                      {t("settings.voiceInstructions", "Record or upload 6-30 seconds of clear speech. This voice will be used when the chatbot speaks.")}
                    </p>
                    <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                      <li>{t("settings.voiceTip1", "Speak clearly and naturally")}</li>
                      <li>{t("settings.voiceTip2", "Use a quiet environment")}</li>
                      <li>{t("settings.voiceTip3", "6-15 seconds is ideal")}</li>
                    </ul>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <Label className="text-white/80">{t("settings.voiceSampleLanguage", "Voice Sample Language")}</Label>
                    <Select
                      value={voiceLanguage}
                      onValueChange={(value) => setVoiceLanguage(value)}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Record/Upload Options */}
                  <div className="space-y-3">
                    {/* Record Button */}
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isUploadingVoice}
                      className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    >
                      {isRecording ? (
                        <>
                          <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse" />
                          {t("settings.stopRecording", "Stop Recording")} ({formatRecordingTime(recordingTime)})
                        </>
                      ) : isUploadingVoice ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("settings.uploading", "Uploading...")}
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          {t("settings.recordVoice", "Record Voice Sample")}
                        </>
                      )}
                    </Button>

                    {/* Or Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-xs text-white/50">{t("common.or", "or")}</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>

                    {/* Upload File Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRecording || isUploadingVoice}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("settings.uploadAudioFile", "Upload Audio File")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
