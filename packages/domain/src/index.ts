import {
  DEFAULT_ROUTE_QUALITY,
  GAS_COSTS,
  GAS_RESERVE_MIN_TON,
  PROTOCOL_FEES,
  type ActivityEvent,
  type FeePreview,
  type Goal,
  type PlanDefinition,
  type PlanId,
  type PlanRecommendation,
  type PlanRecommendationInput,
  type PortfolioSnapshot,
} from "@neuro/shared";

const PLAN_LIBRARY: Record<PlanId, PlanDefinition> = {
  "safe-income": {
    id: "safe-income",
    title: "Safe Income",
    subtitle: "A calmer way to earn from your TON",
    framing: "Built for people who want steady income and strong protection first.",
    risk: "Low",
    flexibility: "High flexibility. Easy to move back to available TON when needed.",
    estimatedAnnualRange: { low: 4, high: 7 },
    explanation:
      "NEURO keeps this plan anchored to the safest supported income path and leaves room for simple exits.",
    internalBehavior:
      "Bias toward Tonstakers-style safe yield, preserve gas, and avoid higher-movement routes when quality is uncertain.",
    fallbackBehavior:
      "If route quality weakens, funds stay in the safest supported mode and risky transitions are skipped.",
  },
  "balanced-income": {
    id: "balanced-income",
    title: "Balanced Income",
    subtitle: "A balanced plan between safety and growth",
    framing: "Built for users who want stronger income without fully chasing upside.",
    risk: "Medium",
    flexibility: "Moderate flexibility. Designed to keep some room for exits and safer adjustments.",
    estimatedAnnualRange: { low: 6, high: 11 },
    explanation:
      "NEURO blends a safer base with a higher-yield supported path when execution quality is good enough.",
    internalBehavior:
      "Keep a safe baseline, add a monitored yield sleeve, and downgrade quickly if quote quality or safety rules weaken.",
    fallbackBehavior:
      "If conditions deteriorate, NEURO guides the plan back toward Safe Income.",
  },
  "growth-income": {
    id: "growth-income",
    title: "Growth Income",
    subtitle: "A stronger growth plan for users willing to accept more movement",
    framing: "Built for users who want more upside and accept bigger swings along the way.",
    risk: "High",
    flexibility: "Lower flexibility. Best for users comfortable with more movement before exiting.",
    estimatedAnnualRange: { low: 9, high: 16 },
    explanation:
      "NEURO chooses this only when the amount, risk appetite, and supported route quality are all strong.",
    internalBehavior:
      "Favor higher-upside supported paths, monitor them more closely, and preserve a clean escape route.",
    fallbackBehavior:
      "If safety thresholds break, NEURO recommends or triggers a move back to a calmer plan.",
  },
  "exit-to-safety": {
    id: "exit-to-safety",
    title: "Exit to Safety",
    subtitle: "Move your plan into a safer mode",
    framing: "Used when a user wants calmer footing or market conditions no longer justify extra movement.",
    risk: "Low",
    flexibility: "High flexibility once the move completes.",
    estimatedAnnualRange: { low: 3, high: 6 },
    explanation:
      "NEURO unwinds higher-movement exposure and parks the plan in the safest supported mode.",
    internalBehavior:
      "Reduce risk, simplify exposure, and prioritize clean exits over chasing extra return.",
    fallbackBehavior:
      "If a full transition cannot be completed right away, NEURO holds the safest available intermediate path.",
  },
};

const FEE_RATES: Record<PlanId, number> = {
  "safe-income": 0,
  "balanced-income": 0.1,
  "growth-income": 0.15,
  "exit-to-safety": 0,
};

const GOAL_PLAN_MAP: Record<Goal, PlanId> = {
  protect: "safe-income",
  earn: "balanced-income",
  grow: "growth-income",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function annualPercentToMonthlyTon(amountTon: number, annualPercent: number) {
  return (amountTon * annualPercent) / 100 / 12;
}

function getBasePlanId(input: PlanRecommendationInput): PlanId {
  if (!input.safePathAvailable || input.routeQualityScore < 0.55) {
    return "safe-income";
  }

  if (input.goal === "protect") {
    return "safe-income";
  }

  if (input.goal === "grow" && input.riskPreference === "high" && input.amountTon >= 25) {
    return "growth-income";
  }

  if (input.goal === "earn") {
    return input.riskPreference === "low" ? "safe-income" : "balanced-income";
  }

  if (input.amountTon < 10 || input.riskPreference === "low") {
    return "safe-income";
  }

  return GOAL_PLAN_MAP[input.goal];
}

function buildReasons(input: PlanRecommendationInput, plan: PlanDefinition): string[] {
  const reasons: string[] = [];

  if (!input.hasWallet) {
    reasons.push("Connect a TON wallet first so NEURO can prepare a real plan activation.");
  }

  if (input.amountTon < 5) {
    reasons.push("A calmer path is recommended for smaller balances so fees and movement stay manageable.");
  }

  if (input.gasReserveTon < GAS_RESERVE_MIN_TON) {
    reasons.push("NEURO will keep some TON untouched for network fees before activation.");
  }

  if (input.goal === "protect") {
    reasons.push("You asked for protection first, so the plan prioritizes steady income over extra movement.");
  }

  if (input.goal === "earn" && plan.id === "balanced-income") {
    reasons.push("This keeps a safer base while still using a stronger supported income route.");
  }

  if (input.goal === "grow" && plan.id === "growth-income") {
    reasons.push("You asked for stronger upside and current route quality supports a more active income plan.");
  }

  if (input.routeQualityScore < DEFAULT_ROUTE_QUALITY) {
    reasons.push("Route quality is good but not perfect, so NEURO keeps a safety fallback ready.");
  } else {
    reasons.push("Current route quality is strong enough to support this recommendation.");
  }

  if (input.wantsFlexibility) {
    reasons.push("Your flexibility preference keeps exit speed and simpler fallback routes in the recommendation.");
  }

  return reasons;
}

export function getPlanDefinition(planId: PlanId) {
  return PLAN_LIBRARY[planId];
}

export function listPlanDefinitions() {
  return Object.values(PLAN_LIBRARY);
}

export function getFeeRate(planId: PlanId) {
  return FEE_RATES[planId];
}

export function recommendPlan(input: PlanRecommendationInput): PlanRecommendation {
  const planId = getBasePlanId(input);
  const plan = PLAN_LIBRARY[planId];
  const reasons = buildReasons(input, plan);
  const multiplier = input.routeQualityScore >= 0.85 ? 1.1 : input.routeQualityScore < 0.65 ? 0.92 : 1;
  const estimatedAnnualRange = {
    low: Number((plan.estimatedAnnualRange.low * multiplier).toFixed(1)),
    high: Number((plan.estimatedAnnualRange.high * multiplier).toFixed(1)),
  };

  return {
    plan,
    reasons,
    riskLabel: plan.risk,
    estimatedAnnualRange,
    estimatedMonthlyIncomeTon: {
      low: Number(annualPercentToMonthlyTon(input.amountTon, estimatedAnnualRange.low).toFixed(2)),
      high: Number(annualPercentToMonthlyTon(input.amountTon, estimatedAnnualRange.high).toFixed(2)),
    },
    fallbackLabel:
      plan.id === "safe-income"
        ? "Stay in the safest supported income mode"
        : "Move back toward Safe Income if conditions weaken",
    executionPreview:
      plan.id === "safe-income"
        ? "Allocate to the safest supported TON income path and keep room for gas and easy exits."
        : plan.id === "balanced-income"
          ? "Split between a safe base and a higher-yield supported path, with safety downgrade rules."
          : plan.id === "growth-income"
            ? "Use a higher-upside supported route with tighter monitoring and a ready safety fallback."
            : "Unwind higher-movement exposure and settle into the safest supported mode.",
  };
}

export function calculateFeePreview(
  planId: PlanId,
  principalTon: number,
  estimatedValueTon: number,
): FeePreview {
  const estimatedProfitTon = Math.max(0, Number((estimatedValueTon - principalTon).toFixed(2)));
  const platformFeeTon = Number((estimatedProfitTon * FEE_RATES[planId]).toFixed(4));

  // Include real gas costs based on strategy type
  const provider = planId === "safe-income" || planId === "exit-to-safety" ? "tonstakers" : "stonfi";
  const gasCost = planId === "safe-income" ? GAS_COSTS.staking_deposit : GAS_COSTS.swap;
  const protocolFees = PROTOCOL_FEES[provider] ?? { protocol: 0, pool: 0 };
  const protocolFeeTon = Number((principalTon * (protocolFees.protocol + protocolFees.pool)).toFixed(4));

  const totalFeeTon = Number((platformFeeTon + gasCost + protocolFeeTon).toFixed(4));

  return {
    principalTon: Number(principalTon.toFixed(2)),
    estimatedValueTon: Number(estimatedValueTon.toFixed(2)),
    estimatedProfitTon,
    estimatedFeeTon: Number(totalFeeTon.toFixed(2)),
    estimatedNetValueTon: Number((estimatedValueTon - totalFeeTon).toFixed(2)),
  };
}

export function buildActivityFeed(planId: PlanId, amountTon: number): ActivityEvent[] {
  return [
    {
      id: "event-activation",
      title: "Plan prepared",
      description: `${PLAN_LIBRARY[planId].title} is ready for activation with ${amountTon.toFixed(2)} TON.`,
      tone: "positive",
      timestampLabel: "Now",
    },
    {
      id: "event-safety",
      title: "Safety guardrails applied",
      description: "NEURO reserved gas, checked route quality, and prepared a safe fallback path.",
      tone: "calm",
      timestampLabel: "A moment ago",
    },
    {
      id: "event-monitoring",
      title: "Monitoring active",
      description: "NEURO will keep checking whether this plan still matches your goal and current conditions.",
      tone: "calm",
      timestampLabel: "Ready after activation",
    },
  ];
}

export function buildPortfolioSnapshot(
  recommendation: PlanRecommendation,
  amountTon: number,
  liveApyPercent?: number,
): PortfolioSnapshot {
  // Use live APY when available, otherwise derive from plan's estimated range
  const annualPct = liveApyPercent
    ?? (recommendation.estimatedAnnualRange.low + recommendation.estimatedAnnualRange.high) / 2;

  // Project 30-day appreciation from annual APY
  const monthlyRate = annualPct / 100 / 12;
  const appreciationMultiplier = 1 + monthlyRate;
  const estimatedValueTon = Number((amountTon * appreciationMultiplier).toFixed(2));
  const feePreview = calculateFeePreview(recommendation.plan.id, amountTon, estimatedValueTon);

  return {
    activePlanId: recommendation.plan.id,
    principalTon: amountTon,
    estimatedValueTon,
    estimatedProfitTon: feePreview.estimatedProfitTon,
    estimatedFeeTon: feePreview.estimatedFeeTon,
    netEstimatedValueTon: feePreview.estimatedNetValueTon,
    availableToWithdrawTon: Number((estimatedValueTon - clamp(GAS_RESERVE_MIN_TON, 0, estimatedValueTon)).toFixed(2)),
    currentModeLabel:
      recommendation.plan.id === "safe-income"
        ? "Calm income mode"
        : recommendation.plan.id === "balanced-income"
          ? "Balanced income mode"
          : "Growth income mode",
    lastOptimizationLabel:
      recommendation.plan.id === "safe-income"
        ? "Holding the safest supported route"
        : "Route quality confirmed and safety fallback armed",
    activity: buildActivityFeed(recommendation.plan.id, amountTon),
  };
}

function buildTimestampLabel() {
  return "Just now";
}

export function appendPortfolioActivity(
  portfolio: PortfolioSnapshot,
  event: Omit<ActivityEvent, "id" | "timestampLabel">,
): PortfolioSnapshot {
  return {
    ...portfolio,
    activity: [
      {
        ...event,
        id: `event-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        timestampLabel: buildTimestampLabel(),
      },
      ...portfolio.activity,
    ],
  };
}

export function movePortfolioToSafety(portfolio: PortfolioSnapshot): PortfolioSnapshot {
  const saferValue = Number((portfolio.estimatedValueTon * 0.998).toFixed(2));
  const estimatedFeeTon = portfolio.estimatedFeeTon;
  const netEstimatedValueTon = Number((saferValue - estimatedFeeTon).toFixed(2));
  const availableToWithdrawTon = Number((saferValue - GAS_RESERVE_MIN_TON).toFixed(2));

  return appendPortfolioActivity(
    {
      ...portfolio,
      activePlanId: "exit-to-safety",
      estimatedValueTon: saferValue,
      netEstimatedValueTon,
      availableToWithdrawTon,
      currentModeLabel: "Safety mode",
      lastOptimizationLabel: "Moved into a calmer supported mode",
    },
    {
      title: "Moved to safety",
      description:
        "NEURO shifted the active plan into a calmer mode to reduce movement and keep funds easier to manage.",
      tone: "calm",
    },
  );
}

export function withdrawFromPortfolio(
  portfolio: PortfolioSnapshot,
  amountTon?: number,
): PortfolioSnapshot {
  const requestedAmount = amountTon ?? portfolio.availableToWithdrawTon;
  const clampedAmount = Math.max(0, Math.min(requestedAmount, portfolio.availableToWithdrawTon));
  const nextEstimatedValue = Number((portfolio.estimatedValueTon - clampedAmount).toFixed(2));
  const nextPrincipal = Math.max(0, Number((portfolio.principalTon - clampedAmount).toFixed(2)));
  const nextProfit = Math.max(0, Number((nextEstimatedValue - nextPrincipal).toFixed(2)));
  const nextNetEstimatedValue = Math.max(
    0,
    Number((portfolio.netEstimatedValueTon - clampedAmount).toFixed(2)),
  );
  const nextAvailableToWithdraw = Math.max(
    0,
    Number((Math.max(0, nextEstimatedValue - GAS_RESERVE_MIN_TON)).toFixed(2)),
  );

  return appendPortfolioActivity(
    {
      ...portfolio,
      principalTon: nextPrincipal,
      estimatedValueTon: nextEstimatedValue,
      estimatedProfitTon: nextProfit,
      netEstimatedValueTon: nextNetEstimatedValue,
      availableToWithdrawTon: nextAvailableToWithdraw,
      lastOptimizationLabel: "Withdrawal processed against available balance",
    },
    {
      title: "Withdrawal prepared",
      description: `NEURO marked ${clampedAmount.toFixed(2)} TON as withdrawn from the active plan state.`,
      tone: "positive",
    },
  );
}
