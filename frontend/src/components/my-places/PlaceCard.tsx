import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Trash2, Navigation } from "lucide-react";
import { formatShortDate } from "@/lib/dateUtils";
import { locationsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface Place {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface PlaceCardProps {
  place: Place;
  isHome: boolean;
  onView: () => void;
  onDelete: () => void;
}

export const PlaceCard = ({ place, isHome, onView, onDelete }: PlaceCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await locationsAPI.deletePlace(place.id);
      toast({
        title: "Deleted",
        description: "Place removed",
      });
      setShowDeleteDialog(false);
      onDelete();
    } catch (error) {
      console.error("Failed to delete place", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`cursor-pointer border backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 h-full ${
          isHome
            ? "border-[#E02478]/30 bg-[#E02478]/10"
            : "border-white/10 bg-white/5"
        }`}
        onClick={onView}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {isHome ? (
                <div className="p-2 rounded-full bg-[#E02478]/20">
                  <Home className="h-5 w-5 text-[#E02478]" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-white/10">
                  <MapPin className="h-5 w-5 text-white/70" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{place.name}</h3>
                {place.description && (
                  <p className="text-sm text-white/70 mt-1">{place.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-white/60 mb-4">
            <p className="text-xs">
              {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </p>
            <p className="text-xs">
              Added {formatShortDate(place.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="flex-1 text-xs"
            >
              View Details
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Place</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{place.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

