import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Activity } from "lucide-react";
import { FamilyInvite } from "./FamilyInvite";
import { FamilyMembers } from "./FamilyMembers";
import { ActivityFeed } from "./ActivityFeed";
import { familyAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

export const FamilySharingPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [membersData, activitiesData] = await Promise.allSettled([
        familyAPI.listMembers(),
        familyAPI.getActivity(),
      ]);

      if (membersData.status === "fulfilled") {
        setMembers(membersData.value || []);
      } else {
        console.error("Failed to load members:", membersData.reason);
      }

      if (activitiesData.status === "fulfilled") {
        setActivities(activitiesData.value || []);
      } else {
        console.error("Failed to load activities:", activitiesData.reason);
      }
    } catch (error) {
      console.error("Failed to load family data", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Family Sharing
        </h1>
        <p className="mt-1 text-base text-white/70">
          Share memories, reminders, and stay connected with your family
        </p>
      </motion.div>

      <Tabs defaultValue="members" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="invite">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="members">
          <FamilyMembers
            members={members}
            currentUserId={user?.id}
            onMemberRemoved={loadData}
            onInviteAccepted={loadData}
          />
        </TabsContent>

        <TabsContent value="invite">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Invite Family Member</CardTitle>
              <CardDescription className="text-white/70">
                Invite family members to share memories and reminders. They can be viewers or caregivers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FamilyInvite onInviteSent={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Activity Feed</CardTitle>
              <CardDescription className="text-white/70">
                Recent activity from your family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

