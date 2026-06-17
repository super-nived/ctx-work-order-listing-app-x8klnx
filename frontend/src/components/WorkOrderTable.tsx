import type { WorkOrder } from '../types';

interface Props {
  orders: WorkOrder[];
  selected: WorkOrder | null;
  onSelect: (wo: WorkOrder) => void;
  loading: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-600',
  'On Hold': 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-red-100 text-red-600',
};

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? 'Unknown';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[s] ?? 'bg-purple-100 text-purple-700'}`}>
      {s}
    </span>
  );
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
}

export default function WorkOrderTable({ orders, selected, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading work orders…</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-16 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No work orders found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or date range</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Job #</th>
              <th className="px-4 py-3">Item Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">SO Number</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-center">Completion</th>
              <th className="px-4 py-3">Request Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((wo, idx) => {
              const isSelected = selected?.jobNumber === wo.jobNumber && selected?.soNumber === wo.soNumber;
              return (
                <tr
                  key={`${wo.jobNumber}-${idx}`}
                  onClick={() => onSelect(wo)}
                  className={`cursor-pointer hover:bg-indigo-50 transition-colors ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-indigo-700">{wo.jobNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{wo.itemCode ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={wo.description ?? ''}>
                    {wo.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{wo.customerName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{wo.soNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{wo.jobQty ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(wo.jobCompletion ?? 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{wo.jobCompletion ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(wo.requestDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={wo.jobStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((wo, idx) => (
          <div
            key={`${wo.jobNumber}-${idx}`}
            onClick={() => onSelect(wo)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-indigo-700">{wo.jobNumber ?? '—'}</span>
              <StatusBadge status={wo.jobStatus} />
            </div>
            <p className="text-sm text-gray-700 font-medium truncate">{wo.itemCode ?? '—'}</p>
            <p className="text-xs text-gray-500 truncate">{wo.customerName ?? '—'}</p>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>SO: {wo.soNumber ?? '—'}</span>
              <span>Qty: {wo.jobQty ?? '—'}</span>
              <span>{formatDate(wo.requestDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
