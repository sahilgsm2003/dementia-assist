import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Cloud, Activity, Clock } from "lucide-react";
import { locationsAPI, remindersAPI } from "@/services/api";
import { formatLocalDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface SmartReminderFormProps {
  onSave: (reminder: any) => void;
  onCancel: () => void;
  selectedDate?: Date;
}

export const SmartReminderForm = ({ onSave, onCancel, selectedDate }: SmartReminderFormProps) => {
  const [reminderType, setReminderType] = useState<"time" | "location" | "activity" | "weather" | "context">("time");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate ? formatLocalDate(selectedDate) : "");
  const [time, setTime] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [radius, setRadius] = useState("100"); // meters
  const [activity, setActivity] = useState("");
  const [weatherCondition, setWeatherCondition] = useState("");
  const [contextDay, setContextDay] = useState("");
  const [contextTime, setContextTime] = useState("");

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const data = await locationsAPI.listPlaces();
      setPlaces(data || []);
    } catch (error) {
      console.error("Failed to load places", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reminder title",
        variant: "destructive",
      });
      return;
    }

    let triggerConditions: any = {};

    switch (reminderType) {
      case "location":
        if (!selectedPlaceId) {
          toast({
            title: "Error",
            description: "Please select a location",
            variant: "destructive",
          });
          return;
        }
        const selectedPlace = places.find((p) => p.id === selectedPlaceId);
        triggerConditions = {
          type: "location",
          place_id: selectedPlaceId,
          place_name: selectedPlace?.name,
          latitude: selectedPlace?.latitude,
          longitude: selectedPlace?.longitude,
          radius: parseInt(radius) || 100,
        };
        break;
      case "activity":
        if (!activity.trim()) {
          toast({
            title: "Error",
            description: "Please specify an activity",
            variant: "destructive",
          });
          return;
        }
        triggerConditions = {
          type: "activity",
          activity: activity.trim(),
        };
        break;
      case "weather":
        if (!weatherCondition) {
          toast({
            title: "Error",
            description: "Please select a weather condition",
            variant: "destructive",
          });
          return;
        }
        triggerConditions = {
          type: "weather",
          condition: weatherCondition,
        };
        break;
      case "context":
        if (!contextDay) {
          toast({
            title: "Error",
            description: "Please select a day",
            variant: "destructive",
          });
          return;
        }
        triggerConditions = {
          type: "context",
          day: contextDay,
          time: contextTime || null,
        };
        break;
      case "time":
      default:
        if (!date || !time) {
          toast({
            title: "Error",
            description: "Please provide date and time",
            variant: "destructive",
          });
          return;
        }
        triggerConditions = {
          type: "time",
        };
        break;
    }

    try {
      await remindersAPI.createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        date: reminderType === "time" ? date : undefined,
        time: reminderType === "time" ? time : undefined,
        reminder_type: reminderType,
        trigger_conditions: triggerConditions,
      });

      toast({
        title: "Success",
        description: "Smart reminder created",
      });

      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        date: reminderType === "time" ? date : undefined,
        time: reminderType === "time" ? time : undefined,
        reminder_type: reminderType,
        trigger_conditions: triggerConditions,
      });
    } catch (error) {
      console.error("Failed to create smart reminder", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reminder-title" className="text-white/80">
          Reminder Title *
        </Label>
        <Input
          id="reminder-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Pick up prescription"
          className="bg-black/30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder-description" className="text-white/80">
          Description
        </Label>
        <Textarea
          id="reminder-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          className="bg-black/30 min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder-type" className="text-white/80">
          Reminder Type *
        </Label>
        <Select value={reminderType} onValueChange={(value: any) => setReminderType(value)}>
          <SelectTrigger id="reminder-type" className="bg-black/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Time-based</span>
              </div>
            </SelectItem>
            <SelectItem value="location">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Location-based</span>
              </div>
            </SelectItem>
            <SelectItem value="activity">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Activity-based</span>
              </div>
            </SelectItem>
            <SelectItem value="weather">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>Weather-based</span>
              </div>
            </SelectItem>
            <SelectItem value="context">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Context-aware</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time-based reminder fields */}
      {reminderType === "time" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reminder-date" className="text-white/80">
              Date *
            </Label>
            <Input
              id="reminder-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-black/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-white/80">
              Time *
            </Label>
            <Input
              id="reminder-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-black/30"
              required
            />
          </div>
        </div>
      )}

      {/* Location-based reminder fields */}
      {reminderType === "location" && (
        <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
          <div className="space-y-2">
            <Label htmlFor="reminder-place" className="text-white/80">
              Location *
            </Label>
            <Select
              value={selectedPlaceId?.toString() || ""}
              onValueChange={(value) => setSelectedPlaceId(parseInt(value))}
            >
              <SelectTrigger id="reminder-place" className="bg-black/30">
                <SelectValue placeholder="Select a place" />
              </SelectTrigger>
              <SelectContent>
                {places.length === 0 ? (
                  <SelectItem value="" disabled>
                    No places available. Add places in "My Places" first.
                  </SelectItem>
                ) : (
                  places.map((place) => (
                    <SelectItem key={place.id} value={place.id.toString()}>
                      {place.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-radius" className="text-white/80">
              Trigger Radius (meters)
            </Label>
            <Input
              id="reminder-radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="100"
              className="bg-black/30"
              min="50"
              max="1000"
            />
            <p className="text-xs text-white/50">
              Reminder will trigger when you're within this distance of the location
            </p>
          </div>
        </div>
      )}

      {/* Activity-based reminder fields */}
      {reminderType === "activity" && (
        <div className="space-y-2 p-4 border border-white/10 rounded-lg bg-white/5">
          <Label htmlFor="reminder-activity" className="text-white/80">
            After Activity *
          </Label>
          <Input
            id="reminder-activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g., breakfast, morning walk, medication"
            className="bg-black/30"
            required
          />
          <p className="text-xs text-white/50">
            Reminder will trigger after you complete this activity
          </p>
        </div>
      )}

      {/* Weather-based reminder fields */}
      {reminderType === "weather" && (
        <div className="space-y-2 p-4 border border-white/10 rounded-lg bg-white/5">
          <Label htmlFor="reminder-weather" className="text-white/80">
            Weather Condition *
          </Label>
          <Select value={weatherCondition} onValueChange={setWeatherCondition}>
            <SelectTrigger id="reminder-weather" className="bg-black/30">
              <SelectValue placeholder="Select weather condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunny">Sunny</SelectItem>
              <SelectItem value="rainy">Rainy</SelectItem>
              <SelectItem value="cloudy">Cloudy</SelectItem>
              <SelectItem value="snowy">Snowy</SelectItem>
              <SelectItem value="windy">Windy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50">
            Reminder will trigger when weather matches this condition
          </p>
        </div>
      )}

      {/* Context-aware reminder fields */}
      {reminderType === "context" && (
        <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
          <div className="space-y-2">
            <Label htmlFor="reminder-context-day" className="text-white/80">
              Day of Week *
            </Label>
            <Select value={contextDay} onValueChange={setContextDay}>
              <SelectTrigger id="reminder-context-day" className="bg-black/30">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-context-time" className="text-white/80">
              Time (Optional)
            </Label>
            <Input
              id="reminder-context-time"
              type="time"
              value={contextTime}
              onChange={(e) => setContextTime(e.target.value)}
              className="bg-black/30"
            />
            <p className="text-xs text-white/50">
              Reminder will trigger on this day (and optionally at this time)
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Smart Reminder
        </Button>
      </div>
    </form>
  );
};

