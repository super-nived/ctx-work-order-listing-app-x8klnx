import type { WorkOrdersResponse, StatsResponse } from './types';

// In dev, Vite proxies /api → http://localhost:8000
// In prod, set VITE_API_URL to your deployed backend URL
const BASE = import.meta.env.VITE_API_URL ?? '';

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchWorkOrders(params: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<WorkOrdersResponse> {
  return apiFetch<WorkOrdersResponse>('/api/workorders/', params as Record<string, string>);
}

export async function fetchStats(params: {
  startDate?: string;
  endDate?: string;
}): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/api/workorders/stats', params as Record<string, string>);
}
