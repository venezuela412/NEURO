import { useQuery } from "@tanstack/react-query";
import { fetchNeuroOverview } from "../lib/controlPlane";

export function useNeuroOverview() {
  return useQuery({
    queryKey: ["neuro-overview"],
    queryFn: fetchNeuroOverview,
    staleTime: 60_000,
  });
}
