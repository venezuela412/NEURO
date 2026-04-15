import { useQuery } from "@tanstack/react-query";
import { fetchTonstakersPoolSnapshot } from "@neuro/adapters";
import { useTonConnectUI } from "@tonconnect/ui-react";

interface UseTonstakersOptions {
  enabled?: boolean;
}

export function useTonstakers(options: UseTonstakersOptions = {}) {
  const [tonConnectUI] = useTonConnectUI();

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
    safeIncomeQuery,
  };
}
