"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RetrievedSnippet {
  source: string;
  section: number;
  content: string;
}

export function TestRetrieval() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RetrievedSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTest = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch("/api/admin/test-retrieval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Test failed");

      const data = await response.json();
      setResults(data.snippets || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleTest();
        }}
      >
        <Input
          placeholder="Enter a test query…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Test query"
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="shrink-0"
        >
          <Search /> {isLoading ? "Testing…" : "Test"}
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-2" aria-label="Running retrieval test">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Retrieved snippets
          </p>
          {results.map((snippet, idx) => (
            <div key={idx} className="space-y-1.5 rounded-lg border bg-card p-3">
              <Badge variant="secondary" className="font-mono">
                {snippet.source} §{snippet.section}
              </Badge>
              <p className="text-sm leading-relaxed text-foreground">
                {snippet.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No snippets found for this query
        </div>
      )}
    </div>
  );
}
