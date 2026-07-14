import apiClient from "./client";
import type { CreateReportRequest, ReportResponse } from "./contracts";

export async function createReport(payload: CreateReportRequest): Promise<ReportResponse> {
  const response = await apiClient.post<ReportResponse>("/reports", payload);
  return response.data;
}
