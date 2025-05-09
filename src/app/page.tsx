'use client'

import { ModeToggle } from "@/components/dark-mode-toggle";
import FileDropzone from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X, FileText } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const removeFile = (file: File) => setFiles([]);

  const handleClick = async () => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    const response = await fetch("/api/process", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setLoading(false);
    console.log(data);
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center flex flex-col items-center gap-8">
        <p className="text-2xl font-semibold mb-2">Welcome to file analyzer!</p>

        {files.length > 0 ? (
          <div className="rounded-lg border bg-card p-4 w-full max-w-md">
            <div className="flex items-center justify-between rounded bg-muted p-2">
              <div className="mr-2 flex min-w-0 flex-1 items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                <p className="truncate text-sm">{files[0].name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => removeFile(files[0])}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <FileDropzone
            files={files}
            setFiles={setFiles}
            className="rounded-lg border-2 border-dashed border-muted h-48 p-10 bg-card hover:bg-accent/50 transition-colors duration-150 flex items-center justify-center mb-6 w-full max-w-md"
          >
            <div className="text-center w-full">
              <p className="text-base text-muted-foreground mb-1">
                Drop your document here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>
          </FileDropzone>
        )}

        <Button className="mt-2 px-8 py-2 text-base" onClick={handleClick} disabled={loading}>
          {loading ? "Loading..." : "Call api endpoint"}
        </Button>
        {/* <ModeToggle /> */}
      </div>
    </div>
  )
}
