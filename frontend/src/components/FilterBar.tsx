import type { FilterState } from '../types';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onRefresh: () => void;
  loading: boolean;
  total: number;
  filtered: number;
}

export default function FilterBar({ filters, onChange, onRefresh, loading, total, filtered }: Props) {
  const set = (key: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search job #, item, customer, SO…"
            value={filters.search}
            onChange={set('search')}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={set('status')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
          <option value="On Hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Date range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={set('startDate')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={set('endDate')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            '↻'
          )}
          Refresh
        </button>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400 mt-2">
        Showing <span className="font-semibold text-gray-600">{filtered}</span> of{' '}
        <span className="font-semibold text-gray-600">{total}</span> work orders
      </p>
    </div>
  );
}
