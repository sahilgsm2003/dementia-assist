import { SkeletonGrid } from "@/components/shared/SkeletonGrid";

interface Medication {
  id?: number;
  name: string;
  dosage: string;
  frequency: "once" | "twice" | "thrice" | "four-times";
  time: string; // HH:MM format
  times?: string[]; // For multiple times per day
  purpose?: string;
  doctorName?: string;
  pharmacy?: string;
  refillDate?: string;
  takenToday?: boolean;
}

export const MedicationList = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      const data = await medicationsAPI.listMedications();
      // Convert API response to component format
      const formatted = data.map((med: any) => {
        // Parse time from backend (could be "HH:MM:SS" or "HH:MM")
        let timeStr = med.time;
        if (typeof timeStr === "string" && timeStr.includes(":")) {
          const parts = timeStr.split(":");
          timeStr = `${parts[0]}:${parts[1]}`; // Convert to HH:MM
        }
        
        return {
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          time: timeStr,
          times: med.times,
          purpose: med.purpose,
          doctorName: med.doctor_name,
          pharmacy: med.pharmacy,
          refillDate: med.refill_date,
          takenToday: false, // TODO: Track from API
        };
      });
      setMedications(formatted);
    } catch (error) {
      console.error("Failed to load medications", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (medication: Medication) => {
    try {
      if (editingMedication && editingMedication.id) {
        // Update existing - only send fields that have changed
        const updatePayload: Record<string, unknown> = {};
        
        // Compare with original medication to only send changed fields
        if (medication.name && medication.name !== editingMedication.name) {
          updatePayload.name = medication.name;
        }
        if (medication.dosage && medication.dosage !== editingMedication.dosage) {
          updatePayload.dosage = medication.dosage;
        }
        if (medication.frequency && medication.frequency !== editingMedication.frequency) {
          updatePayload.frequency = medication.frequency;
        }
        // Only send time if it changed
        if (medication.time && medication.time !== editingMedication.time) {
          updatePayload.time = medication.time; // API will convert to HH:MM:SS
        }
        if (medication.times && medication.times.length > 0) {
          updatePayload.times = medication.times;
        }
        if (medication.purpose !== editingMedication.purpose) {
          if (medication.purpose) {
            updatePayload.purpose = medication.purpose;
          }
        }
        if (medication.doctorName !== editingMedication.doctorName) {
          if (medication.doctorName) {
            updatePayload.doctor_name = medication.doctorName;
          }
        }
        if (medication.pharmacy !== editingMedication.pharmacy) {
          if (medication.pharmacy) {
            updatePayload.pharmacy = medication.pharmacy;
          }
        }
        if (medication.refillDate !== editingMedication.refillDate) {
          if (medication.refillDate) {
            updatePayload.refill_date = medication.refillDate;
          }
        }
        
        // If no fields changed, show message
        if (Object.keys(updatePayload).length === 0) {
          toast({
            title: "No changes",
            description: "No changes were made to the medication",
          });
          setIsDialogOpen(false);
          setEditingMedication(null);
          return;
        }
        
        await medicationsAPI.updateMedication(editingMedication.id, updatePayload);
        toast({
          title: "Success",
          description: "Medication updated",
        });
      } else {
        // Add new
        await medicationsAPI.createMedication({
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          time: medication.time,
          times: medication.times,
          purpose: medication.purpose,
          doctor_name: medication.doctorName,
          pharmacy: medication.pharmacy,
          refill_date: medication.refillDate,
        });
        toast({
          title: "Success",
          description: "Medication added",
        });
      }
      setIsDialogOpen(false);
      setEditingMedication(null);
      loadMedications(); // Reload from API
    } catch (error: any) {
      console.error("Failed to save medication", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await medicationsAPI.deleteMedication(id);
      toast({
        title: "Success",
        description: "Medication deleted",
      });
      loadMedications(); // Reload from API
    } catch (error: any) {
      console.error("Failed to delete medication", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleTrack = async (id: number) => {
    try {
      const medication = medications.find((m) => m.id === id);
      if (!medication) return;
      
      // Optimistic update - update UI immediately
      const updated = medications.map((m) =>
        m.id === id ? { ...m, takenToday: !m.takenToday } : m
      );
      setMedications(updated);
      
      // Then sync with API
      await medicationsAPI.trackMedication(id, !medication.takenToday);
      
      toast({
        title: "Success",
        description: medication.takenToday 
          ? "Marked as not taken" 
          : "Marked as taken",
      });
    } catch (error: any) {
      // Revert on error
      loadMedications();
      console.error("Failed to track medication", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const todayMedications = medications.filter((m) => {
    // For now, show all medications for today
    // Later, filter by schedule
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 bg-white/10 mb-2" />
          <Skeleton className="h-4 w-64 bg-white/10" />
        </div>
        <SkeletonGrid count={4} columns={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">My Medications</h2>
          <p className="text-sm text-white/70 mt-1">
            Track medications and never miss a dose
          </p>
        </div>
        <div className="flex items-center gap-3">
          {medications.length > 0 && (
            <ExportDialog
              type="medication-schedule"
              data={medications.map((med) => ({
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                time: med.time,
                purpose: med.purpose,
              }))}
            />
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMedication(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMedication ? "Edit Medication" : "Add Medication"}
              </DialogTitle>
              <DialogDescription>
                {editingMedication 
                  ? "Update medication information" 
                  : "Add a new medication to track"}
              </DialogDescription>
            </DialogHeader>
            <MedicationForm
              medication={editingMedication}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingMedication(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {todayMedications.length === 0 ? (
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Pill className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-2">No medications added yet</p>
            <p className="text-sm text-white/50">
              Add your first medication to start tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {todayMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onEdit={() => {
                setEditingMedication(medication);
                setIsDialogOpen(true);
              }}
              onDelete={() => medication.id && handleDelete(medication.id)}
              onTrack={() => medication.id && handleTrack(medication.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MedicationCard = ({
  medication,
  onEdit,
  onDelete,
  onTrack,
}: {
  medication: Medication;
  onEdit: () => void;
  onDelete: () => void;
  onTrack: () => void;
}) => {
  const isTaken = medication.takenToday || false;
  
  return (
    <Card className={`border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all ${
      isTaken 
        ? "bg-green-500/10 border-green-500/30" 
        : "bg-white/5"
    }`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-semibold ${
                isTaken ? "text-green-200 line-through" : "text-white"
              }`}>
                {medication.name}
              </h3>
              {isTaken && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/30 text-green-200">
                  Taken
                </span>
              )}
            </div>
            <p className={`text-sm ${isTaken ? "text-white/50" : "text-white/70"}`}>
              {medication.dosage}
            </p>
          </div>
          <button
            onClick={onTrack}
            className={`flex-shrink-0 p-3 rounded-full transition-all ${
              isTaken
                ? "bg-green-500/30 text-green-300 border-2 border-green-400/50 shadow-lg shadow-green-500/20"
                : "bg-white/10 text-white/60 hover:bg-white/20 border-2 border-white/20"
            }`}
            title={isTaken ? "Mark as not taken" : "Mark as taken"}
            aria-label={isTaken ? "Mark as not taken" : "Mark as taken"}
          >
            {isTaken ? (
              <CheckCircle2 className="h-6 w-6 fill-green-400 text-green-400" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className={`space-y-2 text-sm ${isTaken ? "opacity-60" : ""}`}>
          {medication.time && (
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="h-4 w-4" />
              <span>{formatTime(medication.time)}</span>
            </div>
          )}
          {medication.purpose && (
            <p className="text-white/60">
              <span className="text-white/40">For: </span>
              {medication.purpose}
            </p>
          )}
          {medication.frequency && (
            <p className="text-white/60">
              <span className="text-white/40">Frequency: </span>
              {medication.frequency === "once"
                ? "Once daily"
                : medication.frequency === "twice"
                ? "Twice daily"
                : medication.frequency === "thrice"
                ? "Three times daily"
                : "Four times daily"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-xs"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MedicationForm = ({
  medication,
  onSave,
  onCancel,
}: {
  medication: Medication | null;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Medication>({
    name: medication?.name || "",
    dosage: medication?.dosage || "",
    frequency: medication?.frequency || "once",
    time: medication?.time || "08:00",
    purpose: medication?.purpose || "",
    doctorName: medication?.doctorName || "",
    pharmacy: medication?.pharmacy || "",
    refillDate: medication?.refillDate || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Medication Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Metformin"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) =>
              setFormData({ ...formData, dosage: e.target.value })
            }
            placeholder="e.g., 500mg tablet"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency *</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value: any) =>
              setFormData({ ...formData, frequency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Once daily</SelectItem>
              <SelectItem value="twice">Twice daily</SelectItem>
              <SelectItem value="thrice">Three times daily</SelectItem>
              <SelectItem value="four-times">Four times daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time *</Label>
        <Input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">What it's for</Label>
        <Input
          id="purpose"
          value={formData.purpose}
          onChange={(e) =>
            setFormData({ ...formData, purpose: e.target.value })
          }
          placeholder="e.g., For blood pressure"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="doctorName">Prescribed by</Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) =>
              setFormData({ ...formData, doctorName: e.target.value })
            }
            placeholder="Doctor's name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pharmacy">Pharmacy</Label>
          <Input
            id="pharmacy"
            value={formData.pharmacy}
            onChange={(e) =>
              setFormData({ ...formData, pharmacy: e.target.value })
            }
            placeholder="Pharmacy name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="refillDate">Refill Date</Label>
        <Input
          id="refillDate"
          type="date"
          value={formData.refillDate}
          onChange={(e) =>
            setFormData({ ...formData, refillDate: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Medication</Button>
      </div>
    </form>
  );
};

