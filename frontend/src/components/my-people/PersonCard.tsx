import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { formatShortDate } from "@/lib/dateUtils";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

interface Person {
  id: string;
  name: string;
  relationship?: string;
  photos: MemoryPhoto[];
  latestPhoto?: MemoryPhoto;
}

interface PersonCardProps {
  person: Person;
}

export const PersonCard = ({ person }: PersonCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to person detail page
    // For now, we'll use a query param or state
    navigate(`/my-people/${encodeURIComponent(person.name)}`, {
      state: { person },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 h-full"
        onClick={handleClick}
      >
        <CardContent className="p-0">
          {person.latestPhoto ? (
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              <OptimizedImage
                src={person.latestPhoto.image_url}
                alt={person.name}
                className="h-full w-full object-cover"
                lazy={true}
              />
              {person.photos.length > 1 && (
                <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                  {person.photos.length} photos
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#E02478]/20 to-purple-600/20 rounded-t-lg">
              <Users className="h-12 w-12 text-white/40" />
            </div>
          )}
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold text-white">{person.name}</h3>
            {person.relationship && (
              <p className="text-sm text-white/70">
                {person.relationship}
              </p>
            )}
            {person.latestPhoto && (
              <p className="text-xs text-white/50">
                {formatShortDate(person.latestPhoto.created_at)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

