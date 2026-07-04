import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../lib/api/admin";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboardStats"], queryFn: getDashboardStats });
}