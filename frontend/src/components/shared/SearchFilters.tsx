import { Users, Images, Calendar, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

const filterOptions = [
  { value: "person", label: "People", icon: Users },
  { value: "memory", label: "Memories", icon: Images },
  { value: "reminder", label: "Reminders", icon: Calendar },
  { value: "place", label: "Places", icon: MapPin },
  { value: "document", label: "Documents", icon: FileText },
];

export const SearchFilters = ({
  selectedTypes,
  onTypesChange,
}: SearchFiltersProps) => {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
        Filter by Type
      </p>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedTypes.includes(option.value);

          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleType(option.value)}
              className={cn(
                "h-9 gap-2 rounded-full border transition-all",
                isSelected
                  ? "border-[#E02478]/50 bg-[#E02478]/20 text-[#E02478] hover:bg-[#E02478]/30"
                  : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{option.label}</span>
            </Button>
          );
        })}
      </div>
      {selectedTypes.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onTypesChange([])}
          className="h-7 text-xs text-white/50 hover:text-white/70"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};

