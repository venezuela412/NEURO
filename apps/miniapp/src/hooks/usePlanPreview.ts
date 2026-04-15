import { useMutation } from "@tanstack/react-query";
import { fetchPlanPreview } from "../lib/controlPlane";

export function usePlanPreview() {
  return useMutation({
    mutationFn: fetchPlanPreview,
  });
}
