import {
  type ExecutionReceipt,
  type NeuroOverview,
  type PersistedPortfolioState,
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

export async function fetchPersistedPortfolioState(walletAddress: string): Promise<PersistedPortfolioState | null> {
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(walletAddress)}/state`);
    if (response.status === 404) {
      return null;
    }

    return await parseJson<PersistedPortfolioState>(response);
  } catch {
    return null;
  }
}

export async function savePersistedPortfolioState(state: PersistedPortfolioState) {
  const response = await fetch(`${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(state.walletAddress)}/state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  return parseJson<{ ok: true; updatedAt: string }>(response);
}

export async function fetchExecutionReceipts(walletAddress: string) {
  try {
    const response = await fetch(`${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(walletAddress)}/executions`);
    const payload = await parseJson<{ items: ExecutionReceipt[] }>(response);
    return payload.items;
  } catch {
    return [];
  }
}
