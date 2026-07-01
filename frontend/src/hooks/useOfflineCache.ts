import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const CACHE_KEY = 'agriconnect_offline_farmers';
const SYNC_QUEUE_KEY = 'agriconnect_sync_queue';

export interface OfflineFarmer {
  local_id: string;
  full_name: string;
  phone?: string;
  county?: string;
  payam?: string;
  village?: string;
  farm_size?: string;
  crop_types?: string[];
  gps_lat?: string;
  gps_lng?: string;
  synced?: boolean;
  id?: number;
}

export function useOfflineCache() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const getQueue = (): OfflineFarmer[] => {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const saveQueue = (queue: OfflineFarmer[]) => {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    setPendingCount(queue.filter((f) => !f.synced).length);
  };

  const cacheFarmer = useCallback((farmer: OfflineFarmer) => {
    const queue = getQueue();
    const idx = queue.findIndex((f) => f.local_id === farmer.local_id);
    if (idx >= 0) queue[idx] = { ...queue[idx], ...farmer, synced: false };
    else queue.push({ ...farmer, local_id: farmer.local_id || `local-${Date.now()}`, synced: false });
    saveQueue(queue);
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') as OfflineFarmer[];
    localStorage.setItem(CACHE_KEY, JSON.stringify([farmer, ...cached].slice(0, 50)));
  }, []);

  const syncPending = useCallback(async () => {
    if (!navigator.onLine) return { synced: 0 };
    const queue = getQueue().filter((f) => !f.synced);
    if (!queue.length) return { synced: 0 };
    try {
      const res = await api.post<{ results: { id?: number; local_id?: string; status: string }[] }>('/farmers/sync', { farmers: queue });
      const updated = getQueue().map((f) => {
        const match = res.results.find((r) => r.local_id === f.local_id);
        if (match?.status === 'created' || match?.status === 'updated') {
          return { ...f, synced: true, id: match.id };
        }
        return f;
      });
      saveQueue(updated);
      return { synced: res.results.filter((r) => r.status !== 'error').length };
    } catch {
      return { synced: 0 };
    }
  }, []);

  useEffect(() => {
    setPendingCount(getQueue().filter((f) => !f.synced).length);
    const onOnline = () => {
      setOnline(true);
      syncPending();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncPending]);

  return { online, pendingCount, cacheFarmer, syncPending, getQueue };
}
