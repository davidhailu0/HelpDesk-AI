"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { FileUploadArea } from "./file-upload-area";
import { FileList } from "./file-list";
import { TestRetrieval } from "./test-retrieval";
import { StatsPanel } from "./stats-panel";
import { ThemeToggle } from "./theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

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

export function AdminPanel() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    totalSnippets: 0,
    lastReindexTime: "Never",
  });
  const [isReindexing, setIsReindexing] = useState(false);
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
    } catch {
      toast.error("Failed to load files");
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

      toast.success(
        `${uploadedFiles.length} file(s) uploaded — re-indexing…`
      );
      await handleReindex(true);
    } catch {
      toast.error("Failed to upload files");
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const response = await fetch(`/api/admin/files/${filename}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast.success(`${filename} deleted — re-indexing…`);
      await handleReindex(true);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  /** Rebuilds the vector index. With `silent`, success toasts are suppressed
   *  (used when it runs as a follow-up to an upload/delete). */
  const handleReindex = async (silent = false) => {
    setIsReindexing(true);
    try {
      const response = await fetch("/api/admin/reindex", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Reindex failed");

      const data = await response.json();
      setStats(data.stats);
      if (!silent) toast.success("Knowledge base re-indexed successfully");
      await loadFiles();
    } catch {
      toast.error("Failed to re-index knowledge base");
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Settings className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">HelpDesk Admin</h1>
              <p className="text-xs text-muted-foreground">
                Manage knowledge base files and vector index settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <ArrowLeft /> Chat
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        <StatsPanel stats={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>Upload new files</CardTitle>
                <CardDescription>
                  Add documents to enrich your helpdesk&apos;s knowledge base.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadArea onUpload={handleUpload} />
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>Indexed files</CardTitle>
                <CardDescription>
                  Markdown documents currently served by retrieval.
                </CardDescription>
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReindex()}
                    disabled={isReindexing || isLoading}
                  >
                    {isReindexing ? (
                      <>
                        <Loader2 className="animate-spin" /> Re-indexing…
                      </>
                    ) : (
                      <>
                        <RefreshCw /> Re-index
                      </>
                    )}
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <FileList
                  files={files}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-xs lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Test retrieval</CardTitle>
                <CardDescription>
                  Query your knowledge base to ensure accurate answers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestRetrieval />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
