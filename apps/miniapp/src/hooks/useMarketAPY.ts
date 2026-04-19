import { useState, useEffect, useCallback } from 'react';
import { fetchAPYData, type APYData } from '../lib/apyService';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useMarketAPY() {
  const [data, setData] = useState<APYData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchAPYData();
      setData(result);
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, refresh };
}
