import type { StatsResponse } from '../types';

interface Props {
  stats: StatsResponse | null;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
  Closed: 'bg-gray-100 text-gray-700 border-gray-200',
  'On Hold': 'bg-orange-100 text-orange-800 border-orange-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const DEFAULT_COLOR = 'bg-purple-100 text-purple-800 border-purple-200';

export default function StatsBar({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-7 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statusEntries = Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total card */}
      <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-sm col-span-1">
        <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Total Jobs</p>
        <p className="text-3xl font-bold mt-1">{stats.total}</p>
      </div>

      {/* Per-status cards */}
      {statusEntries.map(([status, count]) => (
        <div
          key={status}
          className={`rounded-xl border p-4 shadow-sm ${STATUS_COLORS[status] ?? DEFAULT_COLOR}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide opacity-70 truncate">{status}</p>
          <p className="text-3xl font-bold mt-1">{count}</p>
        </div>
      ))}
    </div>
  );
}
