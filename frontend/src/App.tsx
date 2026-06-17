import { useState, useEffect, useCallback } from 'react';
import { fetchWorkOrders, fetchStats, WorkOrder, WorkOrdersResponse, StatsResponse } from './api';
import StatsBar from './components/StatsBar';
import WorkOrderTable from './components/WorkOrderTable';
import DetailPanel from './components/DetailPanel';

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export default function App() {
  const defaults = getDefaultDates();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);

  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [listData, setListData] = useState<WorkOrdersResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<WorkOrder | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await fetchStats({ startDate, endDate });
      setStatsData(s);
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const d = await fetchWorkOrders({ startDate, endDate, status, search });
      setListData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load work orders');
    } finally {
      setListLoading(false);
    }
  }, [startDate, endDate, status, search]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadList(); }, [loadList]);

  // Close detail panel on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSelected(null); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              WO
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Work Order Manager</h1>
              <p className="text-xs text-gray-400">Live DataSpace data</p>
            </div>
          </div>
          <button
            onClick={() => { loadStats(); loadList(); }}
            disabled={listLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className={listLoading ? 'animate-spin' : ''}>↻</span>
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <StatsBar stats={statsData} loading={statsLoading} />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job #, SO #, item, customer…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                {statsData && Object.keys(statsData.byStatus).sort().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick date presets */}
            <div className="flex gap-1">
              {[
                { label: '30d', days: 30 },
                { label: '60d', days: 60 },
                { label: '90d', days: 90 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  onClick={() => {
                    const e = new Date();
                    const s = new Date();
                    s.setDate(s.getDate() - days);
                    setStartDate(s.toISOString().slice(0, 10));
                    setEndDate(e.toISOString().slice(0, 10));
                  }}
                  className="px-2.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Record count */}
        {listData && !listLoading && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-800">{listData.total}</span> work orders
            </p>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                Close detail panel
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load work orders</p>
              <p className="text-xs text-red-500 mt-0.5 font-mono">{error}</p>
              <button
                onClick={loadList}
                className="mt-2 text-xs text-red-600 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className={selected ? 'pr-0 md:pr-[420px] transition-all' : 'transition-all'}>
          <WorkOrderTable
            records={listData?.records ?? []}
            loading={listLoading}
            onSelect={setSelected}
            selected={selected}
          />
        </div>
      </main>

      {/* Detail panel */}
      <DetailPanel wo={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
