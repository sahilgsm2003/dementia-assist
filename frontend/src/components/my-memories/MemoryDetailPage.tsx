import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

export const MemoryDetailPage = () => {
  const navigate = useNavigate();
  const { memoryId } = useParams<{ memoryId: string }>();
  const [memory, setMemory] = useState<MemoryPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadMemory = async () => {
      if (!memoryId) return;

      try {
        setIsLoading(true);
        const memories = await memoriesAPI.listPhotos();
        const foundMemory = memories.find((m: MemoryPhoto) => m.id === parseInt(memoryId));
        setMemory(foundMemory || null);
      } catch (error) {
        console.error("Failed to load memory", error);
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMemory();
  }, [memoryId]);

  const handleShare = async () => {
    if (!memory) return;

    const shareData = {
      title: memory.description || "Memory",
      text: memory.description || "Check out this memory",
      url: memory.image_url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(memory.image_url);
        toast({
          title: "Copied",
          description: "Memory link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Failed to share", error);
    }
  };

  const handleDelete = async () => {
    if (!memory) return;

    try {
      setIsDeleting(true);
      // TODO: Implement delete API endpoint
      toast({
        title: "Error",
        description: "Delete functionality not yet implemented",
        variant: "destructive",
      });
      // After deletion, navigate back
      // navigate("/my-memories");
    } catch (error) {
      console.error("Failed to delete memory", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/70">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-memories")}
          className="mb-6 text-white/70 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Memories
        </Button>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <p className="text-white/70 mb-2">Memory not found</p>
            <p className="text-sm text-white/50">
              The memory you're looking for doesn't exist
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/my-memories")}
        className="text-white/70 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Memories
      </Button>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                {memory.image_url ? (
                  <img
                    src={memory.image_url}
                    alt={memory.description || "Memory"}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-white/50">No image available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Description */}
          {memory.description && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">About this memory</h2>
                <p className="text-white/90 leading-relaxed">{memory.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Date</p>
                  <p className="text-lg font-semibold text-white">
                    {formatShortDate(memory.created_at)}
                  </p>
                  <p className="text-xs text-white/50">
                    {getRelativeTime(memory.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              disabled={isDeleting}
              className="border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Memory"
        description="Are you sure you want to delete this memory? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

