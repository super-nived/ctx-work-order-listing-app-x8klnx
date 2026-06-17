import { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';

interface WorkOrder extends Record<string, unknown> {
  jobNumber?: string;
  jobNo?: string;
  jobDescription?: string;
  itemCode?: string;
  jobStatus?: string;
  status?: string;
  customerName?: string;
  soNumber?: string;
  planQty?: number | string;
  completedQty?: number | string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  priority?: string;
}

interface Props {
  orders: WorkOrder[];
  onSelect: (order: WorkOrder) => void;
  selected: WorkOrder | null;
}

type SortKey = 'jobNumber' | 'status' | 'customerName' | 'startDate' | 'dueDate';

function formatDate(val: unknown): string {
  if (!val) return '—';
  try {
    return new Date(String(val)).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return String(val);
  }
}

function isOverdue(order: WorkOrder): boolean {
  const dueRaw = order.dueDate ?? order.endDate;
  if (!dueRaw) return false;
  const s = String(order.jobStatus ?? order.status ?? '').toLowerCase();
  if (['completed', 'closed', 'done'].includes(s)) return false;
  try {
    return new Date(String(dueRaw)) < new Date();
  } catch {
    return false;
  }
}

export default function WorkOrderTable({ orders, onSelect, selected }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const statuses = useMemo(() => {
    const s = new Set(orders.map(o => String(o.jobStatus ?? o.status ?? '')).filter(Boolean));
    return Array.from(s).sort();
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      if (q && !['jobNumber','jobNo','jobDescription','itemCode','customerName','soNumber'].some(k =>
        String(o[k] ?? '').toLowerCase().includes(q))) return false;

      if (statusFilter) {
        const s = String(o.jobStatus ?? o.status ?? '');
        if (s !== statusFilter) return false;
      }

      const dateRaw = o.startDate ?? o.createdAt;
      if (startDate && dateRaw) {
        try { if (new Date(String(dateRaw)) < new Date(startDate)) return false; } catch { /* */ }
      }
      if (endDate && dateRaw) {
        try { if (new Date(String(dateRaw)) > new Date(endDate)) return false; } catch { /* */ }
      }

      return true;
    });
  }, [orders, search, statusFilter, startDate, endDate]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string, bv: string;
      if (sortKey === 'jobNumber') {
        av = String(a.jobNumber ?? a.jobNo ?? '');
        bv = String(b.jobNumber ?? b.jobNo ?? '');
      } else if (sortKey === 'status') {
        av = String(a.jobStatus ?? a.status ?? '');
        bv = String(b.jobStatus ?? b.status ?? '');
      } else if (sortKey === 'customerName') {
        av = String(a.customerName ?? '');
        bv = String(b.customerName ?? '');
      } else if (sortKey === 'startDate') {
        av = String(a.startDate ?? a.createdAt ?? '');
        bv = String(b.startDate ?? b.createdAt ?? '');
      } else {
        av = String(a.dueDate ?? a.endDate ?? '');
        bv = String(b.dueDate ?? b.endDate ?? '');
      }
      const cmp = av.localeCompare(bv);
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortAsc ? '↑' : '↓'}</span>;
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setStartDate(''); setEndDate(''); setPage(1);
  };

  const hasFilters = search || statusFilter || startDate || endDate;

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search job #, description, customer, SO…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="From date"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="To date"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Showing <strong>{filtered.length}</strong> of <strong>{orders.length}</strong> work orders
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No work orders match your filters</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort('jobNumber')}>
                  Job # <SortIcon k="jobNumber" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 max-w-xs">Description / Item</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort('customerName')}>
                  Customer <SortIcon k="customerName" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort('status')}>
                  Status <SortIcon k="status" />
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Qty</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort('startDate')}>
                  Start <SortIcon k="startDate" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort('dueDate')}>
                  Due <SortIcon k="dueDate" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => {
                const jobNo = String(o.jobNumber ?? o.jobNo ?? o._id ?? `#${i + 1}`);
                const overdue = isOverdue(o);
                const isActive = selected && (selected.jobNumber === o.jobNumber && selected.jobNo === o.jobNo);
                return (
                  <tr
                    key={jobNo + i}
                    onClick={() => onSelect(o)}
                    className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">
                      {jobNo}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-gray-900 truncate">{String(o.jobDescription ?? o.description ?? '—')}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{String(o.itemCode ?? '')}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{String(o.customerName ?? o.soNumber ?? '—')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={String(o.jobStatus ?? o.status ?? '')} />
                        {overdue && (
                          <span className="text-xs text-red-500 font-medium">⚠ Overdue</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      <span className="font-medium">{o.completedQty ?? '—'}</span>
                      <span className="text-gray-400"> / {o.planQty ?? o.targetQty ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(o.startDate ?? o.createdAt)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {formatDate(o.dueDate ?? o.endDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {paginated.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
            <p className="text-sm">No work orders found</p>
          </div>
        ) : paginated.map((o, i) => {
          const jobNo = String(o.jobNumber ?? o.jobNo ?? o._id ?? `#${i + 1}`);
          const overdue = isOverdue(o);
          return (
            <div
              key={jobNo + i}
              onClick={() => onSelect(o)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono font-bold text-blue-700 text-sm">{jobNo}</span>
                <StatusBadge status={String(o.jobStatus ?? o.status ?? '')} />
              </div>
              <p className="text-sm text-gray-800 font-medium line-clamp-1 mb-1">{String(o.jobDescription ?? '—')}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{String(o.customerName ?? o.soNumber ?? '—')}</span>
                {overdue && <span className="text-red-500 font-medium">⚠ Overdue</span>}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Start: {formatDate(o.startDate ?? o.createdAt)}</span>
                <span>Due: {formatDate(o.dueDate ?? o.endDate)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
