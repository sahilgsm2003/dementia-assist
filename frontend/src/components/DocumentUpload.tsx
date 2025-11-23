import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, CheckCircle, AlertCircle, FileText, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: number;
  filename: string;
  created_at: string;
  chunks_count?: number;
}

interface DocumentUploadProps {
  documents: Document[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (documentId: number) => Promise<void>;
  onInitializeDemo: () => Promise<void>;
  isUploading?: boolean;
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onUpload,
  onDelete,
  onInitializeDemo,
  isUploading = false,
  className = "",
}) => {
  const { t, i18n } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      setUploadStatus("error");
      setUploadMessage(t("documents.pleaseUploadPDF"));
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus("idle");
      await onUpload(file);
      setUploadStatus("success");
      setUploadMessage(`${t("documents.successfullyUploaded")}: ${file.name}`);
      setTimeout(() => setUploadStatus("idle"), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(t("documents.failedToUpload"));
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await onDelete(documentToDelete.id);
      toast({
        title: t("common.success"),
        description: `"${documentToDelete.filename}" ${t("common.deleted").toLowerCase()}`,
      });
    } catch (error) {
      console.error("Failed to delete document", error);
      toast({
        title: t("common.error"),
        description: t("documents.failedToUpload"),
        variant: "destructive",
      });
    } finally {
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(i18n.language || "en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{t("documents.uploadDocument")}</h3>
            <p className="text-sm text-white/60">
              {t("documents.addDocumentDescription")}
            </p>
          </div>
          <button
            onClick={onInitializeDemo}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? t("common.loading") : t("documents.initializeDemo")}
          </button>
        </div>

        {uploadStatus !== "idle" && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              uploadStatus === "success"
                ? "border-green-400/40 bg-green-500/10 text-green-100"
                : "border-red-400/40 bg-red-500/10 text-red-100"
            }`}
          >
            {uploadStatus === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{uploadMessage}</span>
          </div>
        )}

        <div
          className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition duration-200 ease-in-out cursor-pointer ${
            dragOver 
              ? "border-[#E02478] bg-[#E02478]/10 scale-[1.02]" 
              : "border-white/20 bg-black/20 hover:border-white/30 hover:bg-black/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3 text-white/70">
            <div className={`rounded-full p-4 transition-colors ${dragOver ? "bg-[#E02478]/20" : "bg-white/5"}`}>
              <Upload className={`h-10 w-10 transition-colors ${dragOver ? "text-[#E02478]" : "text-white/50"}`} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-white">
                {dragOver ? t("documents.dropToUpload") : t("documents.dragDropPDF")}
              </p>
              <p className="text-sm text-white/50">
                {t("documents.clickToSelect")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
              {t("documents.yourDocuments")}
            </h4>
            <p className="text-sm text-white/60">
              {documents.length} {documents.length === 1 ? t("askMoments.documentsLoaded") : t("askMoments.documentsLoadedPlural")}
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-white/60">
            <FileText className="h-10 w-10 text-white/30" />
            <p className="text-sm">
              {t("documents.noDocuments")}
            </p>
            <p className="text-xs text-white/50">
              {t("documents.uploadFirst")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-start justify-between gap-4 px-6 py-4 transition hover:bg-white/5"
              >
                <div className="flex items-start gap-3 text-left">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E02478]/15 text-[#E02478]">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">{doc.filename}</p>
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {t("documents.uploadedOn")} {formatDate(doc.created_at)}
                    </p>
                    {doc.chunks_count ? (
                      <p className="text-xs text-white/40">{doc.chunks_count} {t("documents.chunks")}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc)}
                  className="rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-red-300"
                  title={t("documents.deleteDocument")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("documents.deleteDocument")}
        description={`${t("documents.deleteConfirm")} "${documentToDelete?.filename}"? ${t("documents.deleteWarning")}`}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default DocumentUpload;
