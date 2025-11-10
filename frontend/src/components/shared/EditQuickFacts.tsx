import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickFacts } from "./QuickFactsCard";
import { quickFactsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface EditQuickFactsProps {
  facts: QuickFacts | null;
  onSave: () => void;
  onCancel: () => void;
}

export const EditQuickFacts = ({ facts, onSave, onCancel }: EditQuickFactsProps) => {
  const [formData, setFormData] = useState<QuickFacts>({
    name: facts?.name || "",
    address: facts?.address || "",
    birthday: facts?.birthday || "",
    phone: facts?.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (facts) {
      setFormData({
        name: facts.name || "",
        address: facts.address || "",
        birthday: facts.birthday || "",
        phone: facts.phone || "",
      });
    }
  }, [facts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      
      // Only send fields that have values (empty strings will clear the field)
      const payload: QuickFacts = {};
      if (formData.name !== undefined) payload.name = formData.name.trim() || undefined;
      if (formData.address !== undefined) payload.address = formData.address.trim() || undefined;
      if (formData.birthday !== undefined) payload.birthday = formData.birthday.trim() || undefined;
      if (formData.phone !== undefined) payload.phone = formData.phone.trim() || undefined;

      await quickFactsAPI.updateQuickFacts(payload);

      toast({
        title: "Success",
        description: "Quick facts updated successfully",
      });

      onSave();
    } catch (error) {
      console.error("Failed to update quick facts", error);
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
        <Label htmlFor="quick-facts-name" className="text-white/80">
          My name is...
        </Label>
        <Input
          id="quick-facts-name"
          placeholder="e.g., Sarah Johnson"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-black/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quick-facts-address" className="text-white/80">
          I live at...
        </Label>
        <Input
          id="quick-facts-address"
          placeholder="e.g., 123 Main Street, London, UK"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="bg-black/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quick-facts-birthday" className="text-white/80">
          My birthday is...
        </Label>
        <Input
          id="quick-facts-birthday"
          type="date"
          value={formData.birthday}
          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
          className="bg-black/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quick-facts-phone" className="text-white/80">
          My phone number is...
        </Label>
        <Input
          id="quick-facts-phone"
          type="tel"
          placeholder="e.g., +44 20 1234 5678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="bg-black/30"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Quick Facts"}
        </Button>
      </div>
    </form>
  );
};

