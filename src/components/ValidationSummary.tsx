import type { ValidationDetails } from '../types';

interface Props {
  validation?: ValidationDetails;
}

export const ValidationSummary = ({ validation }: Props) => {
  if (!validation) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
        No validation has been recorded yet.
      </div>
    );
  }

  const statusColor = validation.is_match ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Receipt vs PO validation</p>
          <p className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
            {validation.is_match ? 'Perfect Match' : 'Mismatches Detected'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Confidence</p>
          <p className="text-2xl font-semibold text-slate-800">{Math.round(validation.score * 100)}%</p>
        </div>
      </div>
      {validation.details && (
        <pre className="mt-4 rounded-lg bg-slate-900/90 p-3 text-xs text-slate-50 overflow-auto max-h-64">
          {JSON.stringify(validation.details, null, 2)}
        </pre>
      )}
    </div>
  );
};
