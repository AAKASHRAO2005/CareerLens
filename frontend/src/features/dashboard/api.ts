import { apiClient } from "@/lib/api-client";
import { DashboardSummary } from "@/types/dashboard";

export interface DashboardSummaryApiResponse {
  summary: DashboardSummary;
}

/**
 * Fetch aggregated dashboard metrics and recruitment pipeline distribution
 * for the authenticated candidate.
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummaryApiResponse>(
    "/v1/dashboard/summary"
  );
  return response.summary;
}
