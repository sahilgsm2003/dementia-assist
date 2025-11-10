import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/dateUtils";
import { Image as ImageIcon } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

interface MemoryCardProps {
  memory: MemoryPhoto;
}

export const MemoryCard = ({ memory }: MemoryCardProps) => {
  return (
    <Card className="group border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all hover:border-white/20 hover:bg-white/10 h-full">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-black/20">
          {memory.image_url ? (
            <OptimizedImage
              src={memory.image_url}
              alt={memory.description || "Memory"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              lazy={true}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-4 space-y-2">
          {memory.description && (
            <p className="text-sm font-medium text-white line-clamp-2">
              {memory.description}
            </p>
          )}
          <p className="text-xs text-white/60">
            {formatShortDate(memory.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

