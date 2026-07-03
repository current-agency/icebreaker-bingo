import { useEffect, useState } from 'react';
import { serverFetch } from './supabase';
import type { AnalyticsSummary } from './types';

export function usePublishedResults() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await serverFetch('/results');
        if (!res.ok) throw new Error('Could not load game results.');
        if (!cancelled) setSummary(await res.json());
      } catch (err) {
        if (!cancelled) {
          setSummary(null);
          setError(err instanceof Error ? err.message : 'Could not load game results.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => { void load(); }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return { summary, loading, error };
}
