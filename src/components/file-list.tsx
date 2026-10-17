"use client";

import { Trash2, FileText, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FileInfo {
  name: string;
  size: number;
  lastUpdated: string;
}

interface FileListProps {
  files: FileInfo[];
  onDelete: (filename: string) => void;
  isLoading: boolean;
}

export function FileList({ files, onDelete, isLoading }: FileListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-label="Loading indexed files">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border bg-card p-3"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <Inbox className="size-8 text-muted-foreground/60" />
        <p className="text-sm font-medium">No files indexed yet</p>
        <p className="text-xs text-muted-foreground">
          Upload a markdown document above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.name}
          className="group flex items-center gap-3 rounded-lg border bg-card p-3 shadow-xs transition-colors hover:border-primary/30"
        >
          <span className="rounded-lg bg-muted p-2 text-muted-foreground">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated {file.lastUpdated}
            </p>
          </div>
          <Badge variant="secondary" className="font-mono tabular-nums">
            {(file.size / 1024).toFixed(1)} KB
          </Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${file.name}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(file.name)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  );
}
