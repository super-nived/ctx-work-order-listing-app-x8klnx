import type { WorkOrder } from '../types';

interface Props {
  wo: WorkOrder | null;
  onClose: () => void;
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 break-words">{String(value)}</span>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Closed: 'bg-gray-100 text-gray-600 border-gray-200',
  'On Hold': 'bg-orange-100 text-orange-700 border-orange-200',
  Cancelled: 'bg-red-100 text-red-600 border-red-200',
};

export default function DetailPanel({ wo, onClose }: Props) {
  if (!wo) return null;

  const statusColor = STATUS_COLORS[wo.jobStatus ?? ''] ?? 'bg-purple-100 text-purple-700 border-purple-200';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Work Order</p>
            <h2 className="text-xl font-bold text-gray-900">{wo.jobNumber ?? '—'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}>
              {wo.jobStatus ?? 'Unknown'}
            </span>
            <button
              onClick={onClose}
              aria-label="Close detail panel"
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {(wo.jobCompletion ?? 0) > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Completion</span>
              <span className="font-semibold">{wo.jobCompletion}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(wo.jobCompletion ?? 0, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-4 space-y-1 flex-1">
          {/* Job Info */}
          <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Job Details</h3>
          <Row label="Job Number" value={wo.jobNumber} />
          <Row label="Item Code" value={wo.itemCode} />
          <Row label="Description" value={wo.description} />
          <Row label="Product Type" value={wo.productType} />
          <Row label="Job Quantity" value={wo.jobQty} />
          <Row label="Scrap Quantity" value={wo.jobScrapQuantity} />
          <Row label="Unit of Measure" value={wo.umo} />
          <Row label="Created Date" value={formatDate(wo.jobCreationDate)} />
          <Row label="Completion Date" value={formatDate(wo.jobCompletionDate)} />
          <Row label="Last Updated" value={formatDate(wo.lastUpdateDate)} />

          {/* Sales Order */}
          <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-4 mb-1 pt-3 border-t border-gray-100">
            Sales Order
          </h3>
          <Row label="SO Number" value={wo.soNumber} />
          <Row label="SO Line" value={wo.soLineNumber} />
          <Row label="SO Quantity" value={wo.soQty} />
          <Row label="SO Created" value={formatDate(wo.soCreationDate)} />
          <Row label="Request Date" value={formatDate(wo.requestDate)} />

          {/* Customer */}
          <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-4 mb-1 pt-3 border-t border-gray-100">
            Customer
          </h3>
          <Row label="Customer Name" value={wo.customerName} />
          <Row label="Customer Number" value={wo.customerNumber} />
          <Row label="Customer Approved" value={wo.customerApproved} />

          {/* Dimensions */}
          <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-4 mb-1 pt-3 border-t border-gray-100">
            Dimensions
          </h3>
          <Row label="Diameter" value={wo.dia} />
          <Row label="Pitch" value={wo.pitch} />
          <Row label="Length" value={wo.length} />
          <Row label="Row" value={wo.row} />
          <Row label="Height" value={wo.height} />
          <Row label="Quantity" value={wo.qnty} />
          <Row label="L1" value={wo.L1} />
          <Row label="L2" value={wo.L2} />
          <Row label="L3" value={wo.L3} />
          <Row label="L4" value={wo.L4} />
          <Row label="Straight Bend" value={wo.strightBend} />
          <Row label="FPI" value={wo.fPI} />
        </div>
      </div>
    </div>
  );
}
