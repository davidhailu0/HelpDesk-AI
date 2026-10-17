"use client";

import { FileText, Layers, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

interface StatsPanelProps {
  stats: {
    totalFiles: number;
    totalSnippets: number;
    lastReindexTime: string;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const items = [
    { label: "Total Files", value: String(stats.totalFiles), icon: FileText },
    {
      label: "Total Snippets",
      value: String(stats.totalSnippets),
      icon: Layers,
    },
    {
      label: "Last Re-index",
      value: stats.lastReindexTime,
      icon: Clock,
      mono: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value, icon: Icon, mono }) => (
        <Card
          key={label}
          size="sm"
          className="shadow-xs transition-shadow hover:shadow-md"
        >
          <CardContent className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  mono && "font-mono text-base font-medium"
                )}
              >
                {value}
              </p>
            </div>
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="size-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
