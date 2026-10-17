import { Message } from "../types/chat";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "cn";
import CitationChip from "./CitationChip";

interface ChatMessageProps {
  message: Message;
  onCitationClick: (doc: string, section: number) => void;
}

/**
 * Removes [CITATION: ...] markers from the displayed text — completed ones
 * (and a half-typed one while streaming) — leaving the clickable chips below
 * as the only representation of a citation.
 */
function stripCitationMarkers(text: string): string {
  return text
    .replace(/\[CITATION:[^\]]*\]/g, "")
    .replace(/\s*\[CITATION:[^\]\n]*$/, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");
}

export default function ChatMessage({
  message,
  onCitationClick,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const displayContent = stripCitationMarkers(message.content);
  const isThinking = !isUser && !displayContent;

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="size-8 shrink-0 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-2",
          isUser ? "items-end" : "items-start",
          "max-w-[85%]"
        )}
      >
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
              : "rounded-2xl rounded-bl-md border bg-card text-card-foreground shadow-xs"
          )}
        >
          {isThinking ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <span
                  className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              <span className="text-xs">Thinking…</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {displayContent}
              {message.isStreaming && (
                <span className="inline-block h-4 w-0.5 ml-1 translate-y-0.5 bg-current animate-pulse rounded-full" />
              )}
            </p>
          )}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((citation, idx) => (
              <CitationChip
                key={idx}
                citation={citation}
                onClick={() =>
                  onCitationClick(citation.source, citation.section)
                }
              />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
