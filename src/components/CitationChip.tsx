import { Citation } from "../types/chat";
import { FileText } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "cn";

interface CitationChipProps {
  citation: Citation;
  onClick: () => void;
}

export default function CitationChip({ citation, onClick }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        badgeVariants({ variant: "secondary" }),
        "cursor-pointer gap-1.5 rounded-full px-2.5 py-0.5 font-medium transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      )}
    >
      <FileText className="size-3" />
      {citation.source} §{citation.section}
    </button>
  );
}
