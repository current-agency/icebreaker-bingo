import { useEffect, useState } from 'react';
import { isAnalyticsSummary } from './analyticsValidation';
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
        const data: unknown = await res.json();
        if (!isAnalyticsSummary(data)) throw new Error('Game results were in an unexpected format.');
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setSummary(null);
          setError(err instanceof Error ? err.message : 'Could not load game results.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, loading, error };
}
