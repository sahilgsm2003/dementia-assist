import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

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
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setUploadMessage("Please upload a PDF file");
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
      setUploadMessage(`Successfully uploaded: ${file.name}`);
      setTimeout(() => setUploadStatus("idle"), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage("Failed to upload file. Please try again.");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (window.confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
      try {
        await onDelete(doc.id);
      } catch (error) {
        setUploadStatus("error");
        setUploadMessage("Failed to delete document. Please try again.");
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Upload a document</h3>
            <p className="text-sm text-white/60">
              Add diaries, notes, or care plans so the assistant can respond with personal context.
            </p>
          </div>
          <button
            onClick={onInitializeDemo}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            Load demo library
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
          className={`mt-6 rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center transition ${
            dragOver ? "border-[#E02478] bg-[#E02478]/10" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3 text-white/70">
            <Upload className="h-10 w-10 text-[#E02478]" />
            <div>
              <p className="text-sm font-medium text-white">
                Drop a PDF here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="underline decoration-[#E02478] decoration-2 underline-offset-4 transition hover:text-white disabled:cursor-not-allowed"
                >
                  browse your files
                </button>
              </p>
              <p className="text-xs text-white/50">
                Supports PDF files up to 10MB. Each upload replaces existing context.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Library
            </h4>
            <p className="text-sm text-white/60">
              {documents.length} document{documents.length === 1 ? "" : "s"} available
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-white/60">
            <FileText className="h-10 w-10 text-white/30" />
            <p className="text-sm">
              No documents yet. Upload a PDF to give the assistant personal context to work with.
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
                      Uploaded {formatDate(doc.created_at)}
                    </p>
                    {doc.chunks_count ? (
                      <p className="text-xs text-white/40">{doc.chunks_count} extracted sections</p>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc)}
                  className="rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-red-300"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
