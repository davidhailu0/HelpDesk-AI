"use client";

import { FileText, Layers, Clock } from "lucide-react";

interface StatsPanelProps {
  stats: {
    totalFiles: number;
    totalSnippets: number;
    lastReindexTime: string;
  };
}

// Custom Tailwind Card styling
const StatCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`
                p-5 rounded-xl border border-gray-200 bg-white shadow-lg 
                dark:border-gray-800 dark:bg-gray-900 
                hover:shadow-xl transition-shadow duration-300
                ${className}
            `}
      {...props}
    >
      {children}
    </div>
  );
};

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Files Card */}
      <StatCard>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Files
            </span>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalFiles}
            </p>
          </div>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </StatCard>

      {/* Total Snippets Card */}
      <StatCard>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Snippets
            </span>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalSnippets}
            </p>
          </div>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </StatCard>

      {/* Last Re-index Time Card */}
      <StatCard>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Last Re-index
            </span>
            <p className="text-lg font-mono text-gray-700 dark:text-gray-300">
              {stats.lastReindexTime}
            </p>
          </div>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </StatCard>
    </div>
  );
}
