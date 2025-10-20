"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface RetrievedSnippet {
  source: string;
  section: number;
  content: string;
}

export function TestRetrieval() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RetrievedSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/test-retrieval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Test failed");

      const data = await response.json();
      setResults(data.snippets || []);
    } catch (error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Test Retrieval</h2>
      <p className="text-sm text-muted-foreground">
        Enter a query to see which snippets would be retrieved from your
        knowledge base
      </p>

      <div className="flex gap-2">
        <input
          placeholder="Enter a test query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTest()}
          className="flex-1"
        />
        <button
          onClick={handleTest}
          disabled={isLoading || !query.trim()}
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          {isLoading ? "Testing..." : "Test"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3 mt-4">
          <p className="text-sm font-medium text-foreground">
            Retrieved Snippets:
          </p>
          {results.map((snippet, idx) => (
            <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-mono text-primary">
                {snippet.source} §{snippet.section}
              </p>
              <p className="text-sm text-foreground">{snippet.content}</p>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && query && (
        <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground text-sm">
          No snippets found for this query
        </div>
      )}
    </div>
  );
}
