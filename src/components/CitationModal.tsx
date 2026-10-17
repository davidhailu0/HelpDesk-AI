"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface CitationModalProps {
  source: string;
  section: number;
  onClose: () => void;
}

export default function CitationModal({
  source,
  section,
  onClose,
}: CitationModalProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setContent("");

    (async () => {
      try {
        const res = await fetch(
          `/api/admin/files/${encodeURIComponent(source)}`
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        // Section exactly like the retriever does: blank-line separated blocks.
        const sections = String(data.content ?? "")
          .split(/\n{2,}/)
          .map((s: string) => s.trim())
          .filter(Boolean);

        if (!cancelled) setContent(sections[section - 1] ?? "");
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, section]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {source} <span className="text-muted-foreground">·</span> Section{" "}
            {section}
          </DialogTitle>
          <DialogDescription>
            The knowledge base excerpt used to answer your question.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-2.5" aria-label="Loading section">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[97%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          ) : failed || !content ? (
            <p className="text-sm text-muted-foreground">
              This section could not be loaded. It may have been removed from
              the knowledge base.
            </p>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {content}
            </p>
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
