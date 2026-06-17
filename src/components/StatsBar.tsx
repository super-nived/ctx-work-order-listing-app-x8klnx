interface WorkOrder {
  jobStatus?: string;
  status?: string;
  [key: string]: unknown;
}

interface Props {
  orders: WorkOrder[];
}

function normalize(s: unknown): string {
  return String(s ?? '').toLowerCase().replace(/[-_ ]/g, '');
}

export default function StatsBar({ orders }: Props) {
  const total = orders.length;

  const counts = orders.reduce((acc, o) => {
    const s = normalize(o.jobStatus ?? o.status ?? '');
    if (['open', 'released', 'planned'].includes(s)) acc.open++;
    else if (['inprogress', 'active'].includes(s)) acc.inProgress++;
    else if (['completed', 'closed', 'done'].includes(s)) acc.completed++;
    else acc.other++;
    return acc;
  }, { open: 0, inProgress: 0, completed: 0, other: 0 });

  const cards = [
    { label: 'Total', value: total, color: 'bg-slate-700', text: 'text-white' },
    { label: 'Open / Released', value: counts.open, color: 'bg-blue-600', text: 'text-white' },
    { label: 'In Progress', value: counts.inProgress, color: 'bg-yellow-500', text: 'text-white' },
    { label: 'Completed', value: counts.completed, color: 'bg-green-600', text: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(c => (
        <div key={c.label} className={`${c.color} rounded-xl p-4 flex flex-col`}>
          <span className={`text-3xl font-bold ${c.text}`}>{c.value}</span>
          <span className={`text-sm mt-1 ${c.text} opacity-80`}>{c.label}</span>
          {total > 0 && c.label !== 'Total' && (
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full"
                style={{ width: `${Math.round((c.value / total) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
