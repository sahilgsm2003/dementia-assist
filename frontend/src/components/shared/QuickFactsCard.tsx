import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Home, Cake, Phone } from "lucide-react";
import { EditQuickFacts } from "./EditQuickFacts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { quickFactsAPI } from "@/services/api";
import { cn } from "@/lib/utils";

export interface QuickFacts {
  name?: string;
  address?: string;
  birthday?: string; // YYYY-MM-DD format
  phone?: string;
}

interface QuickFactsCardProps {
  className?: string;
  compact?: boolean;
}

export const QuickFactsCard = ({ className = "", compact = false }: QuickFactsCardProps) => {
  const [facts, setFacts] = useState<QuickFacts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    loadQuickFacts();
  }, []);

  const loadQuickFacts = async () => {
    try {
      setIsLoading(true);
      const data = await quickFactsAPI.getQuickFacts();
      // Handle empty response or null values
      if (data && (data.name || data.address || data.birthday || data.phone)) {
        setFacts(data);
      } else {
        setFacts(null);
      }
    } catch (error) {
      console.error("Failed to load quick facts", error);
      setFacts(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setIsEditOpen(false);
    loadQuickFacts();
  };

  if (isLoading) {
    return <SkeletonCard className={className} />;
  }

  if (compact) {
    return (
      <Card className={`border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white/70">
              Quick Facts
            </CardTitle>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4 text-white/70 hover:text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Quick Facts</DialogTitle>
                  <DialogDescription>
                    Update your key information
                  </DialogDescription>
                </DialogHeader>
                <EditQuickFacts
                  facts={facts}
                  onSave={handleSave}
                  onCancel={() => setIsEditOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {facts?.name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-[#E02478]" />
              <span className="text-white/90">My name is {facts.name}</span>
            </div>
          )}
          {facts?.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="text-white/90">I live at {facts.address}</span>
            </div>
          )}
          {facts?.birthday && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span className="text-white/90">
                My birthday is {new Date(facts.birthday).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {facts?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-green-400" />
              <span className="text-white/90">My phone number is {facts.phone}</span>
            </div>
          )}
          {!facts || (!facts.name && !facts.address && !facts.birthday && !facts.phone) && (
            <p className="text-sm text-white/60">
              No quick facts set up yet. Click edit to add your information.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Quick Facts</CardTitle>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Quick Facts</DialogTitle>
                <DialogDescription>
                  Update your key information. This helps the chatbot answer questions about you.
                </DialogDescription>
              </DialogHeader>
              <EditQuickFacts
                facts={facts}
                onSave={handleSave}
                onCancel={() => setIsEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {facts?.name && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-[#E02478]/20">
              <User className="h-5 w-5 text-[#E02478]" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Name</p>
              <p className="text-lg font-semibold text-white">{facts.name}</p>
            </div>
          </div>
        )}

        {facts?.address && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Address</p>
              <p className="text-lg font-semibold text-white">{facts.address}</p>
            </div>
          </div>
        )}

        {facts?.birthday && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-purple-500/20">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Birthday</p>
              <p className="text-lg font-semibold text-white">
                {new Date(facts.birthday).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}

        {facts?.phone && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <Phone className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Phone Number</p>
              <p className="text-lg font-semibold text-white">{facts.phone}</p>
            </div>
          </div>
        )}

        {!facts || (!facts.name && !facts.address && !facts.birthday && !facts.phone) && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-2">No quick facts set up</p>
            <p className="text-sm text-white/50">
              Add your key information to help the chatbot answer questions about you
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

