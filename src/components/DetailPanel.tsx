import { WorkOrder } from '../types/workorder';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface DetailPanelProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value}</p>
    </div>
  );
}

export default function DetailPanel({ workOrder, onClose }: DetailPanelProps) {
  if (!workOrder) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{workOrder.woNumber}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 leading-snug">{workOrder.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={workOrder.status} />
              <PriorityBadge priority={workOrder.priority} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="ml-4 p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</p>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">{workOrder.description}</p>
          </div>

          {/* Asset & Location */}
          <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <Field label="Asset" value={workOrder.asset} />
            <Field label="Location" value={workOrder.location} />
            <Field label="Category" value={workOrder.category} />
            <Field label="Assigned To" value={workOrder.assignedTo} />
          </div>

          {/* Dates */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Dates</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-800 font-medium">{workOrder.createdDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Due Date</span>
                <span className={`font-medium ${
                  new Date(workOrder.dueDate) < new Date() && workOrder.status !== 'Completed' && workOrder.status !== 'Cancelled'
                    ? 'text-red-600'
                    : 'text-slate-800'
                }`}>
                  {workOrder.dueDate}
                  {new Date(workOrder.dueDate) < new Date() && workOrder.status !== 'Completed' && workOrder.status !== 'Cancelled' && (
                    <span className="ml-1 text-xs text-red-500">(Overdue)</span>
                  )}
                </span>
              </div>
              {workOrder.completedDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Completed</span>
                  <span className="text-green-600 font-medium">{workOrder.completedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hours */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Hours</p>
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 font-medium">Estimated</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{workOrder.estimatedHours}h</p>
              </div>
              {workOrder.actualHours !== undefined && (
                <div className="flex-1 bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600 font-medium">Actual</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">{workOrder.actualHours}h</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
