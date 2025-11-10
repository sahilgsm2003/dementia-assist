import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  Brain,
  ChevronRight,
  FileText,
  MapPin,
  MessageCircle,
  Upload,
} from "lucide-react";
import { chatAPI, locationsAPI, memoriesAPI, remindersAPI } from "@/services/api";

interface DocumentSummary {
  id: number;
  filename: string;
  created_at: string;
}

interface ReminderSummary {
  id: number;
  title: string;
  time: string;
  description?: string;
}

interface ReminderApiResponse {
  id: number;
  title: string;
  time: string;
  description?: string;
}

interface LiveLocationSummary {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  updated_at: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [memoryCount, setMemoryCount] = useState<number>(0);
  const [todayReminders, setTodayReminders] = useState<ReminderSummary[]>([]);
  const [liveLocation, setLiveLocation] = useState<LiveLocationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recentDocuments = useMemo(() => documents.slice(0, 4), [documents]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        // Format today's date in local timezone to avoid UTC conversion issues
        const today = new Date();
        const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const [documentsResponse, memoriesResponse, remindersResponse, liveLocationResponse] =
          await Promise.allSettled([
            chatAPI.getDocuments(),
            memoriesAPI.listPhotos(),
            remindersAPI.listReminders(todayIso),
            locationsAPI.getLiveLocation(),
          ]);

        if (documentsResponse.status === "fulfilled") {
          setDocuments(documentsResponse.value.data ?? []);
        }
        if (memoriesResponse.status === "fulfilled") {
          const data = memoriesResponse.value ?? [];
          setMemoryCount(Array.isArray(data) ? data.length : 0);
        }
        if (remindersResponse.status === "fulfilled") {
          const data = remindersResponse.value ?? [];
          const summaries = (Array.isArray(data) ? (data as ReminderApiResponse[]) : []).map(
            (reminder) => ({
              id: reminder.id,
              title: reminder.title,
              time: reminder.time,
              description: reminder.description,
            })
          );
          setTodayReminders(summaries);
        }
        if (liveLocationResponse.status === "fulfilled") {
          setLiveLocation(liveLocationResponse.value ?? null);
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard", err);
        setError("We couldn’t load the latest updates. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="container mx-auto px-6">
      <div className="space-y-14">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#E02478]/15 via-purple-600/10 to-transparent p-10 shadow-xl backdrop-blur"
        >
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white/70 ring-1 ring-white/20">
                <Brain className="h-3.5 w-3.5 text-[#E02478]" />
                Assistant dashboard
              </span>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Welcome back. Let’s pick up where you left off.
                </h1>
                <p className="max-w-2xl text-base text-white/70 md:text-lg">
                  Manage your memory bank, revisit recent uploads, and dive into
                  a new conversation with your Life Assistant.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="rounded-full px-6"
                  onClick={() => navigate("/chatbot")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Open Life Assistant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/20"
                  onClick={() =>
                    navigate("/chatbot", { state: { tab: "documents" } })
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add documents
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 bg-white/10 px-5 text-white hover:bg-white/20"
                  onClick={() => navigate("/memory-vault")}
                >
                  Memory vault
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 bg-white/10 px-5 text-white hover:bg-white/20"
                  onClick={() => navigate("/reminders")}
                >
                  Reminders
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 bg-white/10 px-5 text-white hover:bg-white/20"
                  onClick={() => navigate("/locations")}
                >
                  Locations
                </Button>
              </div>
            </div>

            <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-6 text-left backdrop-blur">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/60">Knowledge base</p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {documents.length} document{documents.length === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-white/60">
                    {documents.length === 0
                      ? "Upload your first PDF to give the assistant something to remember."
                      : "Ready to support personalised answers."}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                  <p className="text-xs text-white/60">Memories saved</p>
                  <p className="text-xl font-semibold text-white">{memoryCount}</p>
                  <p className="text-xs text-white/50">
                    Keep adding faces and notes to make recognition effortless.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-4 md:grid-cols-3"
        >
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              onClick={() => navigate("/memory-vault")}
            >
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">Memory Vault</span>
                <Brain className="h-4 w-4 text-[#E02478]" />
              </div>
              <p className="text-3xl font-semibold text-white">{memoryCount}</p>
              <p className="text-xs text-white/60">
                Memories saved with faces and stories for quick recall.
              </p>
            </CardContent>
          </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
          <Card
            className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            onClick={() => navigate("/reminders")}
          >
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">Today</span>
                <AlarmClock className="h-4 w-4 text-[#E02478]" />
              </div>
              <p className="text-3xl font-semibold text-white">{todayReminders.length}</p>
              <p className="text-xs text-white/60">
                {todayReminders.length
                  ? `Next: ${todayReminders[0].title} at ${todayReminders[0].time.slice(0, 5)}`
                  : "No reminders scheduled for today."}
              </p>
            </CardContent>
          </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
          <Card
            className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            onClick={() => navigate("/locations")}
          >
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">Live location</span>
                <MapPin className="h-4 w-4 text-[#E02478]" />
              </div>
              <p className="text-3xl font-semibold text-white">
                {liveLocation ? "Active" : "Waiting"}
              </p>
              <p className="text-xs text-white/60">
                {liveLocation
                  ? `Updated ${new Date(liveLocation.updated_at).toLocaleTimeString()}`
                  : "Enable location sharing to see updates here."}
              </p>
            </CardContent>
          </Card>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-6 lg:grid-cols-[2fr,1fr]"
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-white">
                  Recently added documents
                </CardTitle>
                <p className="text-sm text-white/60">
                  {documents.length === 0
                    ? "Upload a PDF to begin building your memory bank."
                    : "The most recent files in your knowledge base."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1 text-white hover:text-white"
                onClick={() =>
                  navigate("/chatbot", { state: { tab: "documents" } })
                }
              >
                Manage documents
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 py-12 text-white/60">
                  Loading your documents…
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
                  {error}
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-10 text-center text-sm text-white/60">
                  <p>No documents yet.</p>
                  <p className="mt-2 text-white/50">
                    Upload diaries, care notes, or schedules so the assistant
                    has real context.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4 transition-all duration-300 hover:bg-black/40 hover:border-white/15"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">
                            {doc.filename}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Added {new Date(doc.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                Quick next steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/70">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">
                  1. Upload a PDF document
                </p>
                <p className="mt-1 text-white/60">
                  Diaries, care notes, and medical summaries give the assistant
                  rich, personal context.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">
                  2. Start a conversation
                </p>
                <p className="mt-1 text-white/60">
                  Ask about upcoming events, relationships, or routines—just
                  like you would.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">
                  3. Revisit insights anytime
                </p>
                <p className="mt-1 text-white/60">
                  Your history stays accessible, so you can continue the
                  conversation tomorrow.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};
