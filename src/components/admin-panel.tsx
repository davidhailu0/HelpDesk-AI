"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { FileUploadArea } from "./file-upload-area";
import { FileList } from "./file-list";
import { TestRetrieval } from "./test-retrieval";
import { StatsPanel } from "./stats-panel";

interface FileInfo {
  name: string;
  size: number;
  lastUpdated: string;
}

interface Stats {
  totalFiles: number;
  totalSnippets: number;
  lastReindexTime: string;
}

// Custom Button Component (Tailwind only)
const TailwindButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "default";
  }
> = ({
  children,
  className,
  variant = "primary",
  size = "default",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const sizeClasses = {
    sm: "h-8 px-3",
    default: "h-10 py-2 px-4",
  }[size];

  const variantClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-md",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const TailwindCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export function AdminPanel() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    totalSnippets: 0,
    lastReindexTime: "Never",
  });
  const [isReindexing, setIsReindexing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/files");
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setFiles(data.files || []);
      setStats(data.stats || stats);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load files" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (uploadedFiles: File[]) => {
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setMessage({
        type: "success",
        text: `${uploadedFiles.length} file(s) uploaded successfully`,
      });
      await handleReindex();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload files" });
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const response = await fetch(`/api/admin/files/${filename}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setMessage({ type: "success", text: `${filename} deleted successfully` });
      await handleReindex();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete file" });
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      const response = await fetch("/api/admin/reindex", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Reindex failed");

      const data = await response.json();
      setStats(data.stats);
      setMessage({
        type: "success",
        text: "Knowledge base re-indexed successfully",
      });
      await loadFiles();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to re-index knowledge base" });
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    // Base layout: Centered, dark background with a subtle padding
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            HelpDesk Admin <span className="text-indigo-500">Panel</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Manage your knowledge base files and vector index settings.
          </p>
        </header>

        {/* Alert Message */}
        {message && (
          <div
            className={`p-4 rounded-xl shadow-lg flex items-start gap-3 transition-opacity duration-300 ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400"
                : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400"
            }`}
          >
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TailwindCard className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Knowledge Base Statistics
              </h2>
              <StatsPanel stats={stats} />
            </TailwindCard>

            {/* Upload Section */}
            <TailwindCard className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Upload New Files
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Add documents to enrich your helpdesk's knowledge base.
              </p>
              <FileUploadArea onUpload={handleUpload} />
            </TailwindCard>

            {/* Files List */}
            <TailwindCard className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Indexed Files
                </h2>
                <TailwindButton
                  onClick={handleReindex}
                  disabled={isReindexing || isLoading}
                  variant="primary" // Changed to primary for better visibility
                  size="sm"
                  className="gap-2"
                >
                  {isReindexing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Re-indexing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Re-index Now
                    </>
                  )}
                </TailwindButton>
              </div>
              <FileList
                files={files}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </TailwindCard>
          </div>

          <div className="lg:col-span-1">
            <TailwindCard className="p-6 space-y-4 sticky top-10">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Test Retrieval
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Query your knowledge base to ensure accurate answers.
              </p>
              <TestRetrieval />
            </TailwindCard>
          </div>
        </div>
      </div>
    </div>
  );
}
