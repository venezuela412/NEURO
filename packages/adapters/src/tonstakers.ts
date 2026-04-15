import { fromNano, toNano } from "@ton/core";
import type { TonConnectUI } from "@tonconnect/ui";

export interface TonstakersPoolSnapshot {
  currentApy: number | null;
  projectedTsTonRate: number | null;
  instantLiquidityTon: number | null;
  availableToStakeTon: number | null;
  stakedBalanceTon: number | null;
  tvlTon: number | null;
  stakersCount: number | null;
}

export interface SafeIncomeExecutionPreview {
  amountTon: number;
  amountNano: bigint;
  reservedGasTon: number;
  expectedNetStakeTon: number;
  approvalMode: "wallet-transaction";
}

type TonstakersSdkConstructor = new (options: {
  connector: TonConnectUI;
  partnerCode?: number;
  tonApiKey?: string;
}) => {
  getCurrentApy(): Promise<number>;
  getRates(): Promise<{
    tsTONTONProjected?: number;
  }>;
  getInstantLiquidity(): Promise<number>;
  getAvailableBalance(): Promise<number>;
  getStakedBalance(): Promise<number>;
  getTvl(): Promise<number>;
  getStakersCount(): Promise<number>;
  stake(amount: bigint): Promise<{
    boc: string;
  }>;
};

function clampPositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function fromNanoNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Number(fromNano(BigInt(Math.round(value))).toString());
}

async function getTonstakersConstructor(): Promise<TonstakersSdkConstructor> {
  const sdkModule = (await import("tonstakers-sdk")) as {
    Tonstakers?: TonstakersSdkConstructor;
    default?: TonstakersSdkConstructor | { Tonstakers?: TonstakersSdkConstructor };
  };

  const constructor =
    sdkModule.Tonstakers ??
    (typeof sdkModule.default === "function" ? sdkModule.default : sdkModule.default?.Tonstakers);

  if (!constructor) {
    throw new Error("Tonstakers SDK constructor is unavailable in this environment.");
  }

  return constructor;
}

export async function createTonstakersAdapter(
  connector: TonConnectUI,
  options?: {
    partnerCode?: number;
    tonApiKey?: string;
  }
) {
  const Tonstakers = await getTonstakersConstructor();

  return new Tonstakers({
    connector,
    partnerCode: options?.partnerCode,
    tonApiKey: options?.tonApiKey,
  });
}

export async function fetchTonstakersPoolSnapshot(
  connector: TonConnectUI,
  options?: {
    partnerCode?: number;
    tonApiKey?: string;
  }
): Promise<TonstakersPoolSnapshot> {
  const client = await createTonstakersAdapter(connector, options);

  const [
    currentApy,
    rates,
    instantLiquidity,
    availableBalance,
    stakedBalance,
    tvl,
    stakersCount,
  ] = await Promise.allSettled([
    client.getCurrentApy(),
    client.getRates(),
    client.getInstantLiquidity(),
    client.getAvailableBalance(),
    client.getStakedBalance(),
    client.getTvl(),
    client.getStakersCount(),
  ]);

  return {
    currentApy: currentApy.status === "fulfilled" ? currentApy.value : null,
    projectedTsTonRate:
      rates.status === "fulfilled" && typeof rates.value?.tsTONTONProjected === "number"
        ? rates.value.tsTONTONProjected
        : null,
    instantLiquidityTon:
      instantLiquidity.status === "fulfilled"
        ? fromNanoNumber(instantLiquidity.value)
        : null,
    availableToStakeTon:
      availableBalance.status === "fulfilled"
        ? fromNanoNumber(availableBalance.value)
        : null,
    stakedBalanceTon:
      stakedBalance.status === "fulfilled"
        ? fromNanoNumber(stakedBalance.value)
        : null,
    tvlTon: tvl.status === "fulfilled" ? fromNanoNumber(tvl.value) : null,
    stakersCount: stakersCount.status === "fulfilled" ? stakersCount.value : null,
  };
}

export function buildSafeIncomeExecutionPreview(amountTon: number): SafeIncomeExecutionPreview {
  const safeAmountTon = clampPositive(amountTon);
  const reservedGasTon = 1;
  const expectedNetStakeTon = Math.max(0, safeAmountTon - reservedGasTon);

  return {
    amountTon: safeAmountTon,
    amountNano: toNano(safeAmountTon.toFixed(3)),
    reservedGasTon,
    expectedNetStakeTon,
    approvalMode: "wallet-transaction",
  };
}
