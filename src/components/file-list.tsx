"use client";

import { Trash2 } from "lucide-react";

interface FileInfo {
  name: string;
  size: number;
  lastUpdated: string;
}

interface FileListProps {
  files: FileInfo[];
  onDelete: (filename: string) => void;
  isLoading: boolean;
}

// Custom Tailwind Button Component for the delete action
const DeleteButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...props
}) => {
  // Pure Tailwind classes for a small, ghost-style button with a destructive color scheme
  const baseClasses =
    "inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-gray-900";
  const variantClasses =
    "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export function FileList({ files, onDelete, isLoading }: FileListProps) {
  const loadingClasses =
    "text-center py-8 text-gray-500 dark:text-gray-400 font-semibold italic border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg";
  const emptyClasses =
    "text-center py-8 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner";

  if (isLoading) {
    return (
      <div className={loadingClasses}>
        <p>Loading indexed files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={emptyClasses}>
        <p>No files uploaded yet. Start by uploading a document above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.name}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
        >
          <div className="flex-1 min-w-0 pr-4">
            <p
              className="font-semibold text-gray-900 dark:text-white truncate"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-2">
                {(file.size / 1024).toFixed(2)} KB
              </span>
              • Updated <span className="font-medium">{file.lastUpdated}</span>
            </p>
          </div>

          <DeleteButton
            onClick={() => onDelete(file.name)}
            aria-label={`Delete ${file.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </DeleteButton>
        </div>
      ))}
    </div>
  );
}
