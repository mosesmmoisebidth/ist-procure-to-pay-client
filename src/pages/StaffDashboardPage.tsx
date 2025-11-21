import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequestData } from '../context/RequestContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import { StatCard } from '../components/StatCard';

const statusFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const { requests } = useRequestData();
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('ALL');

  const myRequests = useMemo(() => {
    const mine = requests.filter(req => req.createdBy.id === user?.id);
    if (status === 'ALL') return mine;
    return mine.filter(req => req.status === status);
  }, [requests, user?.id, status]);

  const stats = useMemo(() => {
    const mine = requests.filter(req => req.createdBy.id === user?.id);
    return {
      total: mine.length,
      pending: mine.filter(req => req.status === 'PENDING').length,
      approved: mine.filter(req => req.status === 'APPROVED').length,
    };
  }, [requests, user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Staff Workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">My Purchase Requests</h1>
        </div>
        <Link
          to="/requests/new"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Create New Request
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Requests" value={String(stats.total)} />
        <StatCard title="Pending" value={String(stats.pending)} />
        <StatCard title="Approved" value={String(stats.approved)} subtitle="With generated PO" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-600">Filter by status</p>
          <div className="flex gap-2">
            {statusFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setStatus(filter)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  status === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
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
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.map(request => (
                <tr key={request.id} className="bg-white hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{request.title}</p>
                    <p className="text-xs text-slate-500">{request.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{request.vendorName || '—'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-900">
                    {formatCurrency(request.amountEstimated, request.currency)}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(request.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/requests/${request.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!myRequests.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No requests found for this filter.
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
