interface Props {
  title: string;
  value: string;
  subtitle?: string;
}

export const StatCard = ({ title, value, subtitle }: Props) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
  </div>
);
