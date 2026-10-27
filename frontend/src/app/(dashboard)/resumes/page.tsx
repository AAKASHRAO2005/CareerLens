"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { formatFileSize, formatDate } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ResumesPage() {
  const { resumes, addResume, deleteResume } = useMockData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate PDF type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Invalid file type. CareerLens strictly accepts PDF documents only.");
      return;
    }

    // Validate size limit (5 MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File exceeds maximum allowed size of 5 MB (${formatFileSize(file.size)} detected).`
      );
      return;
    }

    // Simulate S3 presigned URL direct upload for Phase 2 UI validation
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);

      addResume({
        name: file.name,
        size: file.size,
        type: file.type || "application/pdf",
      });

      setSuccessMessage(`Successfully uploaded and verified "${file.name}"!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 800);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input value so re-uploading the same file works
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDownload = (fileName: string) => {
    // Generate a downloadable sample PDF blob in browser to demonstrate functional download
    const dummyPdfContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000108 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n180\n%%EOF`;
    const blob = new Blob([dummyPdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Private Resume Vault
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload and manage versions of your resume securely stored in private Amazon S3 buckets.
        </p>
      </div>

      <Alert variant="info" title="S3 Direct Upload Security">
        Resumes are never stored publicly or in the database. They upload directly to encrypted S3 storage via short-lived presigned URLs and can only be downloaded by your authenticated account.
      </Alert>

      {errorMessage && (
        <Alert variant="danger" title="Upload Rejected">
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}

      {/* Upload Dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload New Resume Version</CardTitle>
          <CardDescription>PDF format only &bull; Maximum file size: 5 MB</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20"
          >
            {isUploading ? (
              <div className="space-y-3 py-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  Uploading directly to S3 via presigned URL... ({uploadProgress}%)
                </p>
                <div className="w-48 h-2 rounded-full bg-slate-200 mx-auto overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to select PDF or drag and drop here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Validated for PDF format &bull; Maximum 5 MB limit enforced
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumes List */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Stored Resume Versions</CardTitle>
              <CardDescription>Verified documents available for secure download</CardDescription>
            </div>
            <Badge variant="default" size="sm">
              {resumes.length} Document{resumes.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {resumes.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500">No resumes uploaded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumes.map((resume) => (
                <div
                  key={resume.resumeId}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {resume.fileName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatFileSize(resume.sizeBytes)}</span>
                        <span>&bull;</span>
                        <span>Uploaded {formatDate(resume.createdAt)}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-semibold">
                          S3 Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resume.fileName)}
                      className="text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      Download
                    </Button>
                    <button
                      type="button"
                      onClick={() => deleteResume(resume.resumeId)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
