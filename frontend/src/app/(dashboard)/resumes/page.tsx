"use client";

import React, { useState, useRef } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
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

    // Direct upload simulation with progress
    setIsUploading(true);
    setUploadProgress(25);

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

      setSuccessMessage(`Successfully uploaded and encrypted "${file.name}" in AWS S3 vault.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 800);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
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
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Resume Vault
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Upload and manage encrypted resume versions directly connected to AWS S3.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container text-primary font-semibold border border-primary-fixed-dim">
            AES-256 S3 Encryption
          </span>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-space-md rounded-xl bg-error-container/60 border border-error text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
          <MaterialIcon name="error" className="text-[20px] text-error flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-space-md rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed-dim text-on-tertiary-fixed-variant font-body-sm text-body-sm flex items-center gap-2">
          <MaterialIcon name="check_circle" className="text-[20px] text-tertiary flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Direct S3 Upload Card */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="p-space-2xl rounded-xl bg-surface-container-lowest border-2 border-dashed border-[#cbd5e1] hover:border-primary transition-all text-center flex flex-col items-center justify-center gap-space-md shadow-sm"
      >
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
          <MaterialIcon name="cloud_upload" className="text-[32px]" />
        </div>

        <div className="max-w-md space-y-1">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {isUploading ? "Uploading to Private S3 Vault..." : "Upload New Resume PDF"}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Drag and drop your single-page PDF document here, or browse local files.
          </p>
        </div>

        {isUploading ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold">
              {uploadProgress}% Uploaded
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-space-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <MaterialIcon name="file_open" className="text-[18px]" />
              <span>Choose PDF File</span>
            </button>
            <span className="font-caption text-caption text-outline">
              Maximum file size: 5 MB (Standardized PDF format)
            </span>
          </div>
        )}
      </div>

      {/* 3. Stored Resumes List */}
      <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Stored Versions
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Verified Candidate Resumes ({resumes.length})
            </h2>
          </div>
          <span className="font-caption text-caption text-outline">
            S3 Object Lock Enabled
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="py-12 text-center text-outline font-body-sm">
            No resume documents stored. Upload a PDF above to attach to campus job applications.
          </div>
        ) : (
          <div className="divide-y divide-[#e2e8f0]">
            {resumes.map((res) => (
              <div
                key={res.resumeId}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low/40 px-space-md rounded-lg transition-colors"
              >
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">
                    <MaterialIcon name="picture_as_pdf" className="text-[24px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {res.fileName}
                      </span>
                      <span className="font-label-sm text-label-sm px-2 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-semibold">
                        Verified EECS
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-caption font-caption text-outline mt-0.5">
                      <span>{formatFileSize(res.sizeBytes)}</span>
                      <span>&bull;</span>
                      <span>Uploaded {formatDate(res.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => handleDownload(res.fileName)}
                    className="h-8 px-3 rounded-lg border border-[#cbd5e1] hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MaterialIcon name="download" className="text-[16px]" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${res.fileName} from resume vault?`)) {
                        deleteResume(res.resumeId);
                      }
                    }}
                    className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                    title="Delete resume"
                  >
                    <MaterialIcon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. S3 Security Notice */}
      <div className="p-space-lg rounded-xl bg-surface-container-low border border-[#e2e8f0] flex items-start gap-space-md">
        <MaterialIcon name="lock" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-label-md text-label-md text-on-surface font-semibold">
            Amazon S3 Private Bucket Architecture
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            CareerLens never publishes documents to public endpoints. Resumes are uploaded directly via
            cryptographically signed, short-lived presigned URLs and access is restricted strictly to
            your verified institutional identity.
          </p>
        </div>
      </div>
    </div>
  );
}
