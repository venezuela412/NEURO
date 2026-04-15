import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createTonstakersAdapter, fetchTonstakersPoolSnapshot } from "@neuro/adapters";
import { useTonConnectUI } from "@tonconnect/ui-react";

interface UseTonstakersOptions {
  enabled?: boolean;
}

export function useTonstakers(options: UseTonstakersOptions = {}) {
  const [tonConnectUI] = useTonConnectUI();

  const client = useMemo(
    () =>
      createTonstakersAdapter(tonConnectUI, {
        partnerCode: import.meta.env.VITE_TONSTAKERS_PARTNER_CODE
          ? Number(import.meta.env.VITE_TONSTAKERS_PARTNER_CODE)
          : undefined,
        tonApiKey: import.meta.env.VITE_TON_API_KEY,
      }),
    [tonConnectUI],
  );

  const safeIncomeQuery = useQuery({
    queryKey: ["tonstakers", "safe-income"],
    queryFn: async () =>
      fetchTonstakersPoolSnapshot(tonConnectUI, {
        partnerCode: import.meta.env.VITE_TONSTAKERS_PARTNER_CODE
          ? Number(import.meta.env.VITE_TONSTAKERS_PARTNER_CODE)
          : undefined,
        tonApiKey: import.meta.env.VITE_TONAPI_KEY,
      }),
    enabled: options.enabled ?? true,
    retry: 1,
    staleTime: 60_000,
  });

  return {
    client,
    safeIncomeQuery,
  };
}
