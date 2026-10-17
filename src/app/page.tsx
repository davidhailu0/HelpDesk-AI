"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HelpCircle, Settings, Tag, RotateCcw, LifeBuoy } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import CitationModal from "@/components/CitationModal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Citation {
  source: string;
  section: number;
}

/** Pulls [CITATION: file.md §N] markers out of an assistant reply (deduped). */
function extractCitations(text: string): Citation[] {
  const citationRegex = /\[CITATION: ([^\]]+)\]/g;
  const seen = new Set<string>();
  const citations: Citation[] = [];
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    const [, citation] = match;
    const [source, section] = citation.split(" §");
    const parsed: Citation = {
      source: source.trim(),
      section: Number.parseInt(section, 10),
    };
    const key = `${parsed.source}#${parsed.section}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push(parsed);
    }
  }
  return citations;
}

const SUGGESTIONS = [
  { icon: Tag, label: "Pricing plans", q: "What are your pricing plans?" },
  { icon: RotateCcw, label: "Refund policy", q: "How do refunds work?" },
  { icon: LifeBuoy, label: "Contact support", q: "How can I contact support?" },
];

function App() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "submitted" | "streaming">(
    "idle"
  );
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCitationClick = (source: string, section: number) => {
    setSelectedCitation({ source, section });
  };

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (status !== "idle") return;

      const userMessage: UIMessage = {
        id: Date.now().toString() + "-user",
        role: "user",
        content: messageText,
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setStatus("submitted");

      const assistantId = Date.now().toString() + "-assistant";
      const assistantMessage: UIMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              parts: [{ type: "text", text: msg.content }],
            })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to fetch stream.");
        }

        setStatus("streaming");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: fullText } : msg
            )
          );
        }
      } catch (error) {
        console.error("Error during streaming:", error);
        setMessages((prev) => prev.slice(0, prev.length - 1));
      } finally {
        setStatus("idle");
      }
    },
    [messages, status]
  );

  const handleChatInputSend = (text: string) => {
    if (text.trim() !== "") {
      sendMessage(text);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HelpCircle className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">HelpDesk AI</h1>
              <p className="text-xs text-muted-foreground">
                Ask me anything about our services
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <Settings /> Admin
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HelpCircle className="size-7" />
              </div>
              <h2 className="text-xl font-semibold">Welcome to HelpDesk AI</h2>
              <p className="mb-6 mt-1 max-w-sm text-sm text-muted-foreground">
                I&apos;m here to help answer your questions about pricing,
                refunds, and support.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map(({ icon: Icon, label, q }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={status !== "idle"}
                    onClick={() => sendMessage(q)}
                  >
                    <Icon /> {label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    ...message,
                    citations:
                      message.role === "assistant"
                        ? extractCitations(message.content)
                        : undefined,
                    isStreaming:
                      status !== "idle" &&
                      message.role === "assistant" &&
                      index === messages.length - 1,
                  }}
                  onCitationClick={handleCitationClick}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-3xl space-y-2 px-6 py-4">
          <ChatInput
            onSendMessage={handleChatInputSend}
            disabled={status !== "idle"}
          />
          <p className="text-center text-xs text-muted-foreground">
            Answers are grounded in the knowledge base — check the citations
            for sources.
          </p>
        </div>
      </footer>

      {selectedCitation && (
        <CitationModal
          source={selectedCitation.source}
          section={selectedCitation.section}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
}

export default App;
