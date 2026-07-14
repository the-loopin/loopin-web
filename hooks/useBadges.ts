import { useQuery } from "@tanstack/react-query";
import { getBadges } from "../lib/api";

export function useBadges() {
  return useQuery({
    queryKey: ["myBadges"],
    queryFn: getBadges,
  });
}
