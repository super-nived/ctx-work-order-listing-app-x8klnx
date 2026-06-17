interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  open:        'bg-blue-100 text-blue-800',
  'in progress': 'bg-yellow-100 text-yellow-800',
  inprogress:  'bg-yellow-100 text-yellow-800',
  completed:   'bg-green-100 text-green-800',
  closed:      'bg-green-100 text-green-800',
  'on hold':   'bg-orange-100 text-orange-800',
  onhold:      'bg-orange-100 text-orange-800',
  cancelled:   'bg-red-100 text-red-800',
  canceled:    'bg-red-100 text-red-800',
  released:    'bg-purple-100 text-purple-800',
  planned:     'bg-slate-100 text-slate-700',
  default:     'bg-gray-100 text-gray-700',
};

function getStyle(status: string): string {
  const key = (status ?? '').toLowerCase().replace(/[-_]/g, ' ');
  return statusStyles[key] ?? statusStyles['default'];
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const style = getStyle(status);
  const padding = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${style} ${padding}`}>
      {status || '—'}
    </span>
  );
}
