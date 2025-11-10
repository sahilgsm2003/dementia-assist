import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ExportDialog } from "@/components/shared/ExportDialog";
import { formatLocalDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  notification_sound?: string | null;
  status?: string;
  created_at: string;
}

export const MyDayPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate] = useState(new Date()); // Focus on today
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reminderFormType, setReminderFormType] = useState<"regular" | "smart">("regular");

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const todayIso = formatLocalDate(selectedDate);
      const data = await remindersAPI.listReminders(todayIso);
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load reminders", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const reminder = reminders.find((r) => r.id === id);
      const newStatus = reminder?.status === "completed" ? "pending" : "completed";
      
      // Optimistic update
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );

      if (newStatus === "completed") {
        await remindersAPI.completeReminder(id);
        toast({
          title: "Completed",
          description: "Reminder marked as complete",
        });
      } else {
        // To uncomplete, we'd need an API endpoint - for now just reload
        loadReminders();
      }
    } catch (error) {
      // Revert on error
      loadReminders();
      console.error("Failed to complete reminder", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remindersAPI.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Deleted",
        description: "Reminder removed",
      });
    } catch (error) {
      console.error("Failed to delete reminder", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Calendar className="h-4 w-4 text-[#E02478]" />
          My Day
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Your day, organized and clear.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          See your schedule at a glance, check off completed items, and stay on track throughout the day.
        </p>
      </div>

      {/* Add Reminder Button */}
      <div className="flex justify-end gap-3">
        {reminders.length > 0 && (
          <ExportDialog
            type="daily-routine"
            elementId="daily-routine-print"
            title="Daily Routine"
          />
        )}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#E02478] px-6 py-6 text-base font-semibold text-white hover:bg-[#E02478]/85">
              <Plus className="mr-2 h-5 w-5" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Reminder</DialogTitle>
              <DialogDescription>
                Create a new reminder - choose between regular time-based or smart context-aware reminders
              </DialogDescription>
            </DialogHeader>
            <Tabs value={reminderFormType} onValueChange={(v) => setReminderFormType(v as "regular" | "smart")} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="regular">Regular</TabsTrigger>
                <TabsTrigger value="smart">Smart</TabsTrigger>
              </TabsList>
              <TabsContent value="regular" className="mt-4">
                <ReminderForm
                  selectedDate={selectedDate}
                  onSuccess={() => {
                    setIsFormOpen(false);
                    loadReminders();
                  }}
                />
              </TabsContent>
              <TabsContent value="smart" className="mt-4">
                <SmartReminderForm
                  selectedDate={selectedDate}
                  onSave={() => {
                    setIsFormOpen(false);
                    loadReminders();
                  }}
                  onCancel={() => setIsFormOpen(false)}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline View */}
      <div id="daily-routine-print" className="print-view hidden print:block">
        <h2 className="text-2xl font-bold mb-4">Daily Routine</h2>
        <p className="text-sm text-gray-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
        <TimelineView
          reminders={reminders}
          onComplete={handleComplete}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
      <div className="print:hidden">
        <TimelineView
          reminders={reminders}
          onComplete={handleComplete}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

