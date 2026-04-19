/**
 * APY Service — Fetches live yield data from TON ecosystem protocols.
 * Falls back to reasonable estimates when APIs are unavailable.
 */

interface APYData {
  safe: { min: number; max: number };
  moderate: { min: number; max: number };
  bold: { min: number; max: number };
  updatedAt: number; // timestamp
  isLive: boolean;   // true if data is from live API
}

const CACHE_KEY = 'neuro_apy_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fallback estimates (used when APIs are unreachable)
const FALLBACK: APYData = {
  safe: { min: 4.5, max: 7.2 },
  moderate: { min: 12, max: 28 },
  bold: { min: 25, max: 65 },
  updatedAt: Date.now(),
  isLive: false,
};

/**
 * Fetch the base TON staking APY from Tonstakers / ton.org APIs
 */
async function fetchBaseStakingAPY(): Promise<number | null> {
  const endpoints = [
    // Tonstakers public stats
    'https://tonapi.io/v2/staking/pools',
    // Fallback: ton.org staking info
    'https://api.ton.cat/v2/staking/apy',
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const data = await res.json();

      // tonapi.io format: pools with apy field
      if (data?.implementations) {
        const pools = Object.values(data.implementations) as any[];
        const apys = pools
          .flatMap((impl: any) => impl.pools || [])
          .map((p: any) => p.apy || 0)
          .filter((a: number) => a > 0 && a < 50);

        if (apys.length > 0) {
          const avg = apys.reduce((s: number, a: number) => s + a, 0) / apys.length;
          return avg;
        }
      }

      // Generic format with apy field
      if (typeof data?.apy === 'number') {
        return data.apy;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Fetch DeFi pool yields from STON.fi
 */
async function fetchDeFiYields(): Promise<{ avgFarmAPY: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://api.ston.fi/v1/farms', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const farms = data?.farm_list || data?.farms || [];
    const aprs = farms
      .map((f: any) => parseFloat(f.apy || f.apr || '0'))
      .filter((a: number) => a > 0 && a < 500);

    if (aprs.length > 0) {
      const avg = aprs.reduce((s: number, a: number) => s + a, 0) / aprs.length;
      return { avgFarmAPY: avg };
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Compute tier APYs based on real market data
 */
function computeAPYTiers(baseStakingAPY: number, defiYield: number | null): Omit<APYData, 'updatedAt' | 'isLive'> {
  const base = baseStakingAPY;

  // Safe: pure staking range (base ± small variance)
  const safeMin = Math.max(1, +(base * 0.85).toFixed(1));
  const safeMax = +(base * 1.3).toFixed(1);

  // Moderate: staking + conservative DeFi farming
  const farmBase = defiYield || base * 3;
  const modMin = +(Math.max(base * 1.5, farmBase * 0.5)).toFixed(1);
  const modMax = +(Math.min(farmBase * 1.2, base * 6)).toFixed(1);

  // Bold: leveraged + multi-chain + aggressive farming
  const boldMin = +(Math.max(modMax * 0.8, base * 4)).toFixed(1);
  const boldMax = +(Math.min(farmBase * 3, base * 15)).toFixed(1);

  return {
    safe: { min: safeMin, max: safeMax },
    moderate: { min: Math.min(modMin, modMax), max: Math.max(modMin, modMax) },
    bold: { min: Math.min(boldMin, boldMax), max: Math.max(boldMin, boldMax) },
  };
}

/**
 * Get cached APY data if still fresh
 */
function getCachedAPY(): APYData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: APYData = JSON.parse(cached);
    if (Date.now() - data.updatedAt < CACHE_TTL) return data;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Main entry: fetch current APY data with caching
 */
export async function fetchAPYData(): Promise<APYData> {
  // Check cache first
  const cached = getCachedAPY();
  if (cached) return cached;

  // Fetch in parallel
  const [baseAPY, defiData] = await Promise.all([
    fetchBaseStakingAPY(),
    fetchDeFiYields(),
  ]);

  // If we got at least the base staking APY, compute tiers
  if (baseAPY !== null && baseAPY > 0) {
    const tiers = computeAPYTiers(baseAPY, defiData?.avgFarmAPY ?? null);
    const result: APYData = {
      ...tiers,
      updatedAt: Date.now(),
      isLive: true,
    };

    try { localStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch {}
    return result;
  }

  // Fallback to estimates
  return { ...FALLBACK, updatedAt: Date.now() };
}

/**
 * Format APY range for display
 */
export function formatAPYRange(min: number, max: number): string {
  return `${min}–${max}%`;
}

export type { APYData };
