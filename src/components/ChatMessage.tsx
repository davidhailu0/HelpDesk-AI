import { Message } from "../types/chat";
import { User, Bot } from "lucide-react";
import CitationChip from "./CitationChip";

interface ChatMessageProps {
  message: Message;
  onCitationClick: (doc: string, section: number) => void;
}

export default function ChatMessage({
  message,
  onCitationClick,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
      )}

      <div
        className={`flex flex-col gap-2 max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 shadow-sm border border-gray-200"
          }`}
        >
          {!isUser && !message.content ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              <span className="text-xs">Thinking...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
              {message.content && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              )}
            </p>
          )}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
      )}
    </div>
  );
}
