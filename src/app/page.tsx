"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
import { HelpCircle } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import CitationModal from "@/components/CitationModal";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Citation {
  source: string;
  section: number;
}

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
      console.log(status);
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
          console.log(value);
          if (done) {
            console.log("Streaming done");
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          console.log(fullText);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <HelpCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                HelpDesk AI
              </h1>
              <p className="text-sm text-gray-500">
                Ask me anything about our services
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HelpCircle size={32} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to HelpDesk AI
                </h2>
                <p className="text-gray-600 mb-6">
                  I'm here to help answer your questions about pricing, refunds,
                  and support.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => sendMessage("What are your pricing plans?")}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Pricing plans
                  </button>
                  <button
                    onClick={() => sendMessage("How do refunds work?")}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Refund policy
                  </button>
                  <button
                    onClick={() => sendMessage("How can I contact support?")}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={{ ...message, content: message.content }}
                  onCitationClick={handleCitationClick}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          {/* Note: ChatInput needs to be modified to return the text to the parent component */}
          <ChatInput
            onSendMessage={handleChatInputSend}
            disabled={status !== "idle"} // Only allow sending when idle
          />
        </footer>
      </div>

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
