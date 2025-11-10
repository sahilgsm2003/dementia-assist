import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, User } from "lucide-react";
import { familyAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface FamilyInviteProps {
  onInviteSent: () => void;
}

export const FamilyInvite = ({ onInviteSent }: FamilyInviteProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "caregiver">("viewer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() && !email.trim()) {
      toast({
        title: "Error",
        description: "Please provide either a username or email",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await familyAPI.inviteMember({
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        role,
      });

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${username || email} as ${role}`,
      });

      // Reset form
      setUsername("");
      setEmail("");
      setRole("viewer");
      onInviteSent();
    } catch (error) {
      console.error("Failed to send invitation", error);
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
        <Label htmlFor="invite-username" className="text-white/80">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input
            id="invite-username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-black/30 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-email" className="text-white/80">
          Email (Optional)
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input
            id="invite-email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/30 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role" className="text-white/80">
          Role
        </Label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "viewer" | "caregiver")}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-[#E02478] focus:ring-1 focus:ring-[#E02478]"
        >
          <option value="viewer">Viewer - Can view memories and reminders</option>
          <option value="caregiver">Caregiver - Can add and edit content</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || (!username.trim() && !email.trim())}
        className="w-full bg-[#E02478] hover:bg-[#E02478]/85"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {isSubmitting ? "Sending..." : "Send Invitation"}
      </Button>
    </form>
  );
};
