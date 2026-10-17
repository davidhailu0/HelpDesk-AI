import { useState, FormEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <Input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Ask a question about pricing, refunds, support…"
        aria-label="Message"
        className="h-11 flex-1 rounded-full px-5 text-base shadow-xs"
      />
      <Button
        type="submit"
        size="lg"
        disabled={disabled || !input.trim()}
        aria-label="Send message"
        className="h-11 rounded-full px-5"
      >
        Send
        <Send data-icon="inline-end" />
      </Button>
    </form>
  );
}
