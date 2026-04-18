import {
  type ExecutionReceipt,
  type NeuroOverview,
  type PersistedPortfolioState,
  type PortfolioSnapshot,
  type PlanPreviewResponse,
  type PlanRecommendationInput,
  type SignedActionProof,
  type WalletSession,
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

function buildSessionHeaders(session?: WalletSession | null): Record<string, string> {
  if (!session) {
    return {};
  }

  return {
    "X-Neuro-Session-Token": session.token,
  };
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

export async function savePersistedPortfolioStateAuthenticated(
  state: PersistedPortfolioState,
  auth: SignedActionProof,
  session?: WalletSession | null,
) {
  const response = await fetch(`${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(state.walletAddress)}/state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...buildSessionHeaders(session),
    },
    body: JSON.stringify({
      state,
      proof: auth,
    }),
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

export async function reconcileExecutionReceipt(
  walletAddress: string,
  executionId: string,
  session?: WalletSession | null,
) {
  const response = await fetch(
    `${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(walletAddress)}/executions/${encodeURIComponent(executionId)}/reconcile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildSessionHeaders(session),
      },
    },
  );

  return parseJson<{
    portfolio: PortfolioSnapshot | null;
    executionReceipt: ExecutionReceipt;
    executionStatus: "success" | "confirming" | "failed-safely";
  }>(response);
}

export async function createWalletActionSession(proof: SignedActionProof) {
  const response = await fetch(`${CONTROL_PLANE_URL}/auth/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proof,
    }),
  });

  return parseJson<WalletSession>(response);
}

export async function movePortfolioToSafety(
  walletAddress: string,
  auth: SignedActionProof,
  session?: WalletSession | null,
) {
  const response = await fetch(`${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(walletAddress)}/move-to-safety`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildSessionHeaders(session),
    },
    body: JSON.stringify({
      proof: auth,
    }),
  });

  return parseJson<{
    ok: true;
    portfolio: PortfolioSnapshot;
    executionReceipt: ExecutionReceipt;
  }>(response);
}

export async function withdrawPortfolio(
  walletAddress: string,
  auth: SignedActionProof,
  session?: WalletSession | null,
  amountTon?: number,
) {
  const response = await fetch(`${CONTROL_PLANE_URL}/portfolio/${encodeURIComponent(walletAddress)}/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildSessionHeaders(session),
    },
    body: JSON.stringify({
      proof: auth,
      amountTon,
    }),
  });

  return parseJson<{
    ok: true;
    portfolio: PortfolioSnapshot;
    executionReceipt: ExecutionReceipt;
  }>(response);
}
