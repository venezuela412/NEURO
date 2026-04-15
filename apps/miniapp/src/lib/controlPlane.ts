import {
  type NeuroOverview,
  type PlanPreviewResponse,
  type PlanRecommendationInput,
} from "@neuro/shared";
import { buildPlanPreviewResponse, getDefaultPlanRecommendationInput, getNeuroOverview } from "@neuro/adapters";

const CONTROL_PLANE_URL =
  import.meta.env.VITE_CONTROL_PLANE_URL?.replace(/\/$/, "") ?? "http://localhost:8787";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Control plane request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchNeuroOverview(): Promise<NeuroOverview> {
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/overview`);
    return await parseJson<NeuroOverview>(response);
  } catch {
    return getNeuroOverview();
  }
}

export async function fetchPlanPreview(
  input: Partial<PlanRecommendationInput>,
): Promise<PlanPreviewResponse> {
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/plan/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    return await parseJson<PlanPreviewResponse>(response);
  } catch {
    return buildPlanPreviewResponse(getDefaultPlanRecommendationInput(input));
  }
}
