import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

export const TimePicker = ({ value, onChange, id, className }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      setHours(h % 12 || 12);
      setMinutes(m);
      setIsAM(h < 12);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleTimeChange = (newHours: number, newMinutes: number, newIsAM: boolean) => {
    setHours(newHours);
    setMinutes(newMinutes);
    setIsAM(newIsAM);
    
    // Convert to 24-hour format
    let hour24 = newHours;
    if (!newIsAM && newHours !== 12) {
      hour24 = newHours + 12;
    } else if (newIsAM && newHours === 12) {
      hour24 = 0;
    }
    
    const timeString = `${String(hour24).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
    onChange(timeString);
  };

  const displayTime = formatTime(value || "09:00");

  return (
    <div ref={containerRef} className={cn("relative flex w-full flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-white/80">
        Time *
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          readOnly
          value={displayTime}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black/30 cursor-pointer pr-10 w-full"
          placeholder="Select time"
        />
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl p-4">
          {/* Current Selection Display */}
          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-white/5 p-3">
            <div className="text-2xl font-bold text-white">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")} {isAM ? "AM" : "PM"}
            </div>
          </div>

          {/* Time Selectors */}
          <div className="grid grid-cols-3 gap-2">
            {/* Hours */}
            <div className="space-y-2">
              <div className="text-center text-xs font-medium text-white/70">Hour</div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <button
                    key={h}
                    onClick={() => handleTimeChange(h, minutes, isAM)}
                    className={`w-full px-3 py-2 text-sm transition-colors ${
                      hours === h
                        ? "bg-[#E02478] text-white font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {String(h).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="space-y-2">
              <div className="text-center text-xs font-medium text-white/70">Minute</div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleTimeChange(hours, m, isAM)}
                    className={`w-full px-3 py-2 text-sm transition-colors ${
                      minutes === m
                        ? "bg-[#E02478] text-white font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div className="space-y-2">
              <div className="text-center text-xs font-medium text-white/70">Period</div>
              <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => handleTimeChange(hours, minutes, true)}
                  className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isAM
                      ? "bg-[#E02478] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => handleTimeChange(hours, minutes, false)}
                  className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    !isAM
                      ? "bg-[#E02478] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Time Buttons */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            {["09:00", "12:00", "18:00"].map((quickTime) => {
              const [h, m] = quickTime.split(":").map(Number);
              const isQuickAM = h < 12;
              const quickHour = h % 12 || 12;
              return (
                <Button
                  key={quickTime}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(quickHour, m, isQuickAM)}
                  className="text-xs"
                >
                  {formatTime(quickTime)}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

