import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText, Printer, CreditCard, Pill, Images, Calendar } from "lucide-react";
import { exportToPDF, printElement, exportEmergencyCard, exportMedicationSchedule } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";

interface ExportDialogProps {
  type: "emergency-card" | "medication-schedule" | "memory-book" | "daily-routine";
  data?: any;
  elementId?: string;
  title?: string;
}

export const ExportDialog = ({ type, data, elementId, title }: ExportDialogProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);

      if (type === "emergency-card" && data) {
        await exportEmergencyCard(data);
      } else if (type === "medication-schedule" && data) {
        await exportMedicationSchedule(data);
      } else if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          await exportToPDF(element, `${type.replace("-", "_")}.pdf`, {
            title: title || type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          });
        } else {
          throw new Error("Element not found");
        }
      } else {
        throw new Error("No data or element provided");
      }

      toast({
        title: "Export successful",
        description: "PDF has been downloaded",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (elementId) {
      printElement(elementId);
      toast({
        title: "Print",
        description: "Print dialog opened",
      });
    } else {
      toast({
        title: "Error",
        description: "Print view not available",
        variant: "destructive",
      });
    }
  };

  const getIcon = () => {
    switch (type) {
      case "emergency-card":
        return <CreditCard className="h-4 w-4" />;
      case "medication-schedule":
        return <Pill className="h-4 w-4" />;
      case "memory-book":
        return <Images className="h-4 w-4" />;
      case "daily-routine":
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case "emergency-card":
        return "Emergency Card";
      case "medication-schedule":
        return "Medication Schedule";
      case "memory-book":
        return "Memory Book";
      case "daily-routine":
        return "Daily Routine";
      default:
        return "Export";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
          {getIcon()}
          <span className="ml-2 hidden sm:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getLabel()}</DialogTitle>
          <DialogDescription className="text-white/70">
            Choose how you want to export this information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full bg-[#E02478] hover:bg-[#E02478]/85"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export as PDF"}
          </Button>
          {elementId && (
            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

