import { Citation } from "../types/chat";
import { FileText } from "lucide-react";

interface CitationChipProps {
  citation: Citation;
  onClick: () => void;
}

export default function CitationChip({ citation, onClick }: CitationChipProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
    >
      <FileText size={12} />
      <span>
        {citation.source} §{citation.section}
      </span>
    </button>
  );
}
