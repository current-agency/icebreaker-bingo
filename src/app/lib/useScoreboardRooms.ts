import { useState, useEffect } from 'react';
import { supabase, serverFetch } from './supabase';
import type { RoomSummary } from './types';

const KV_TABLE = 'kv_store_dff036a6';
const POLL_INTERVAL_MS = 5000;

export function useScoreboardRooms(): RoomSummary[] {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      const res = await serverFetch('/rooms');
      if (res.ok && !cancelled) setRooms(await res.json());
    };

    const initialTimeoutId = window.setTimeout(() => { void loadRooms(); }, 0);
    const intervalId = window.setInterval(() => { void loadRooms(); }, POLL_INTERVAL_MS);
    const channel = supabase
      .channel('rooms-scoreboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: KV_TABLE,
      }, () => { void loadRooms(); })
      .subscribe();

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  return rooms;
}
