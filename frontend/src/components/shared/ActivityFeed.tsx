import { SkeletonList } from "@/components/shared/SkeletonList";

interface ActivityLog {
  id: number;
  user_id: number;
  activity_type: string;
  activity_data?: Record<string, any>;
  created_at: string;
  user?: {
    id: number;
    username: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityLog[];
  isLoading?: boolean;
}

const activityIcons: Record<string, any> = {
  memory_added: Images,
  reminder_created: Calendar,
  place_added: MapPin,
  medication_added: Pill,
  document_uploaded: FileText,
  person_added: Users,
};

const activityLabels: Record<string, string> = {
  memory_added: "added a memory",
  reminder_created: "created a reminder",
  place_added: "added a place",
  medication_added: "added a medication",
  document_uploaded: "uploaded a document",
  person_added: "added a person",
};

export const ActivityFeed = ({ activities, isLoading }: ActivityFeedProps) => {
  if (isLoading) {
    return <SkeletonList count={5} showAvatar />;
  }

  if (activities.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 mb-2">No activity yet</p>
          <p className="text-sm text-white/50">
            Activity from family members will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.activity_type] || Activity;
        const label = activityLabels[activity.activity_type] || activity.activity_type;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/20 text-[#E02478] flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-semibold">{activity.user?.username || "Someone"}</span>{" "}
                      {label}
                      {activity.activity_data?.title && (
                        <span className="text-white/70">: {activity.activity_data.title}</span>
                      )}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {getRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

