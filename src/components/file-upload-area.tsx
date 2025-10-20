"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"

interface FileUploadAreaProps {
  onUpload: (files: File[]) => void
}

export function FileUploadArea({ onUpload }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.name.endsWith(".md"))

    if (files.length === 0) {
      alert("Please drop only markdown (.md) files")
      return
    }

    onUpload(files as File[])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" multiple accept=".md" onChange={handleFileSelect} className="hidden" />

      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-foreground font-medium mb-1">Drag and drop markdown files here</p>
      <p className="text-sm text-muted-foreground">or click to browse</p>
      <p className="text-xs text-muted-foreground mt-2">Only .md files are supported</p>
    </div>
  )
}
