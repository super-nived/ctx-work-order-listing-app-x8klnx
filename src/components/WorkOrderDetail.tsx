import StatusBadge from './StatusBadge';

interface Props {
  order: Record<string, unknown> | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium break-words">{String(value)}</dd>
    </div>
  );
}

function formatDate(val: unknown): string {
  if (!val) return '';
  try {
    return new Date(String(val)).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return String(val);
  }
}

export default function WorkOrderDetail({ order, onClose }: Props) {
  if (!order) return null;

  const status = String(order.jobStatus ?? order.status ?? '');
  const jobNo = String(order.jobNumber ?? order.jobNo ?? order.workOrderNo ?? order._id ?? '');

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{jobNo || 'Work Order'}</h2>
            <div className="mt-1">
              <StatusBadge status={status} size="md" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Job Info */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Job Info</h3>
          <dl className="mb-4">
            <Field label="Job Number" value={order.jobNumber ?? order.jobNo} />
            <Field label="Job Description" value={order.jobDescription ?? order.description} />
            <Field label="Item Code" value={order.itemCode} />
            <Field label="Item Description" value={order.itemDescription} />
            <Field label="Status" value={order.jobStatus ?? order.status} />
            <Field label="Priority" value={order.priority} />
          </dl>

          {/* Sales Order */}
          {(order.soNumber ?? order.soCreationDate ?? order.customerName) && (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-4">Sales Order</h3>
              <dl className="mb-4">
                <Field label="SO Number" value={order.soNumber} />
                <Field label="SO Line" value={order.soLineNumber} />
                <Field label="Customer" value={order.customerName} />
                <Field label="Customer Number" value={order.customerNumber} />
                <Field label="SO Qty" value={order.soQty} />
                <Field label="Request Date" value={formatDate(order.requestDate)} />
                <Field label="SO Created" value={formatDate(order.soCreationDate)} />
              </dl>
            </>
          )}

          {/* Quantities */}
          {(order.planQty ?? order.completedQty ?? order.rejectedQty) && (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-4">Quantities</h3>
              <dl className="mb-4">
                <Field label="Planned Qty" value={order.planQty ?? order.plannedQty} />
                <Field label="Completed Qty" value={order.completedQty} />
                <Field label="Rejected Qty" value={order.rejectedQty} />
                <Field label="Target Qty" value={order.targetQty} />
              </dl>
            </>
          )}

          {/* Dates */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-4">Dates</h3>
          <dl className="mb-4">
            <Field label="Start Date" value={formatDate(order.startDate ?? order.plannedStartDate)} />
            <Field label="End Date" value={formatDate(order.endDate ?? order.plannedEndDate)} />
            <Field label="Due Date" value={formatDate(order.dueDate)} />
            <Field label="Created" value={formatDate(order.createdAt ?? order.createdDate)} />
          </dl>

          {/* Dimensions / extra */}
          {(order.dimension1 ?? order.dimension2) && (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-4">Dimensions</h3>
              <dl className="mb-4">
                {['dimension1','dimension2','dimension3','dimension4','dimension5'].map(d => (
                  <Field key={d} label={d} value={order[d]} />
                ))}
              </dl>
            </>
          )}

          {/* Machine / resource */}
          {(order.machineCode ?? order.workCenterCode ?? order.operatorName) && (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-4">Resource</h3>
              <dl className="mb-4">
                <Field label="Machine Code" value={order.machineCode} />
                <Field label="Work Center" value={order.workCenterCode} />
                <Field label="Operator" value={order.operatorName} />
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
