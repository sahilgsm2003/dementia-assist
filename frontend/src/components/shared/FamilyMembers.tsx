import { motion } from "framer-motion";
import { Users, Crown, Shield, Eye, Trash2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/dateUtils";
import { familyAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

interface FamilyMember {
  id: number;
  user_id: number;
  role: "owner" | "caregiver" | "viewer";
  status: "pending" | "accepted" | "rejected";
  invited_at: string;
  joined_at?: string;
  user?: {
    id: number;
    username: string;
    created_at: string;
  };
}

interface FamilyMembersProps {
  members: FamilyMember[];
  currentUserId?: number;
  onMemberRemoved: () => void;
  onInviteAccepted: () => void;
}

const roleIcons = {
  owner: Crown,
  caregiver: Shield,
  viewer: Eye,
};

const roleColors = {
  owner: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
  caregiver: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  viewer: "bg-gray-500/20 text-gray-200 border-gray-500/30",
};

export const FamilyMembers = ({
  members,
  currentUserId,
  onMemberRemoved,
  onInviteAccepted,
}: FamilyMembersProps) => {
  const [pendingInvites, setPendingInvites] = useState<FamilyMember[]>(
    members.filter((m) => m.status === "pending" && m.user_id === currentUserId)
  );

  const handleAcceptInvite = async (memberId: number) => {
    try {
      await familyAPI.acceptInvite(memberId);
      toast({
        title: "Invitation accepted",
        description: "You are now a member of this family group",
      });
      setPendingInvites(pendingInvites.filter((m) => m.id !== memberId));
      onInviteAccepted();
    } catch (error) {
      console.error("Failed to accept invitation", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await familyAPI.removeMember(memberId);
      toast({
        title: "Member removed",
        description: "Family member has been removed",
      });
      onMemberRemoved();
    } catch (error) {
      console.error("Failed to remove member", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (members.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 mb-2">No family members yet</p>
          <p className="text-sm text-white/50">
            Invite family members to share memories and reminders
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white/70">Pending Invitations</h3>
          {pendingInvites.map((member) => (
            <Card key={member.id} className="border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {member.user?.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-white/60">
                      Invited {formatShortDate(member.invited_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvite(member.id)}
                      className="bg-green-500/20 text-green-200 hover:bg-green-500/30 border border-green-500/30"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Members */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">Family Members</h3>
        {members
          .filter((m) => m.status === "accepted" || (m.status === "pending" && m.user_id !== currentUserId))
          .map((member, index) => {
            const Icon = roleIcons[member.role];
            const isOwner = member.role === "owner";
            const canRemove = !isOwner && member.user_id !== currentUserId;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/20 text-[#E02478]">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">
                              {member.user?.username || "Unknown User"}
                            </p>
                            {member.user_id === currentUserId && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={roleColors[member.role]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                            {member.joined_at && (
                              <span className="text-xs text-white/50">
                                Joined {formatShortDate(member.joined_at)}
                              </span>
                            )}
                            {member.status === "pending" && (
                              <Badge variant="outline" className="text-xs text-yellow-200 border-yellow-500/30">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

