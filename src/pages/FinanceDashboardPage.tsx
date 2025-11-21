import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequestData } from '../context/RequestContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '../utils/format';
import { StatCard } from '../components/StatCard';

type ValidationFilter = 'ALL' | 'MATCHED' | 'MISMATCHED' | 'UNPROCESSED';

export const FinanceDashboardPage = () => {
  const { requests } = useRequestData();
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>('ALL');

  const filtered = useMemo(() => {
    return requests.filter(req => {
      if (req.status !== 'APPROVED') return false;
      if (validationFilter === 'ALL') return true;
      if (validationFilter === 'UNPROCESSED') return !req.validation;
      if (validationFilter === 'MATCHED') return req.validation?.is_match;
      if (validationFilter === 'MISMATCHED') return req.validation && !req.validation.is_match;
      return true;
    });
  }, [requests, validationFilter]);

  const stats = useMemo(() => {
    const approved = requests.filter(req => req.status === 'APPROVED');
    return {
      approved: approved.length,
      withReceipt: approved.filter(req => !!req.receiptUrl).length,
      mismatched: approved.filter(req => req.validation && !req.validation.is_match).length,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Finance Workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">Approved Requests</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Approved" value={String(stats.approved)} />
        <StatCard title="With receipt" value={String(stats.withReceipt)} />
        <StatCard title="Exceptions" value={String(stats.mismatched)} subtitle="Receipt vs PO mismatches" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-600">Validation filter</p>
          <div className="flex gap-2">
            {(['ALL', 'MATCHED', 'MISMATCHED', 'UNPROCESSED'] as ValidationFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setValidationFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  validationFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'ALL'
                  ? 'All'
                  : filter === 'MATCHED'
                    ? 'Matched'
                    : filter === 'MISMATCHED'
                      ? 'Mismatched'
                      : 'Awaiting validation'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">PO Total</th>
                <th className="px-5 py-3">Receipt</th>
                <th className="px-5 py-3">Validation</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(req => (
                <tr key={req.id} className="bg-white hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{req.title}</p>
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">{req.vendorName || '—'}</td>
                  <td className="px-5 py-4 text-slate-800">
                    {req.purchaseOrder
                      ? formatCurrency(req.purchaseOrder.totalAmount, req.purchaseOrder.currency)
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {req.receiptExtraction?.total_amount
                      ? formatCurrency(req.receiptExtraction.total_amount, req.receiptExtraction.currency || 'USD')
                      : 'Awaiting'}
                  </td>
                  <td className="px-5 py-4">
                    {req.validation ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          req.validation.is_match ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {req.validation.is_match ? 'Matched' : 'Mismatched'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-blue-600">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No requests match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
