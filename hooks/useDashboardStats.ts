import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "../lib/api/admin";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboardStats"], queryFn: getAdminStats });
}
