"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

interface FileUploadAreaProps {
  onUpload: (files: File[]) => void;
}

export function FileUploadArea({ onUpload }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.name.endsWith(".md")
    );

    if (files.length === 0) {
      toast.warning("Please drop only markdown (.md) files");
      return;
    }

    onUpload(files as File[]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      aria-label="Upload markdown files"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".md"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Upload className="mx-auto mb-3 size-8 text-primary" />
      <p className="mb-1 font-medium text-foreground">
        Drag and drop markdown files here
      </p>
      <p className="text-sm text-muted-foreground">or click to browse</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Only .md files are supported
      </p>
    </div>
  );
}
