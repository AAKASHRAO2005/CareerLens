/**
 * Utility formatters for dates, statuses, skills, and file sizes.
 */

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ONLINE_ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export interface StatusConfig {
  label: string;
  variant: "default" | "info" | "warning" | "purple" | "success" | "danger" | "neutral";
  colorClass: string;
}

export const STATUS_MAP: Record<ApplicationStatus, StatusConfig> = {
  SAVED: {
    label: "Saved",
    variant: "neutral",
    colorClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  APPLIED: {
    label: "Applied",
    variant: "info",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ONLINE_ASSESSMENT: {
    label: "Assessment",
    variant: "warning",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  INTERVIEW: {
    label: "Interview",
    variant: "purple",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  OFFER: {
    label: "Offer Received",
    variant: "success",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    variant: "danger",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    variant: "neutral",
    colorClass: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Deterministic skill normalization rule as defined in Document 3.
 */
export function normalizeSkill(skill: string): string {
  const ALIAS_MAP: Record<string, string> = {
    postgres: "postgresql",
    js: "javascript",
    ts: "typescript",
    reactjs: "react",
    nextjs: "next.js",
    py: "python",
    aws: "amazon web services",
  };

  const cleaned = skill.trim().toLowerCase();
  return ALIAS_MAP[cleaned] || cleaned;
}
