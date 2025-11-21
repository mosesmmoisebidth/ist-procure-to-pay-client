import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequestData } from '../context/RequestContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

export const ApproverDashboardPage = () => {
  const { user } = useAuth();
  const { requests } = useRequestData();

  const data = useMemo(() => {
    if (!user) return { pending: [], history: [] };
    const pending = requests.filter(req => {
      if (req.status !== 'PENDING') return false;
      if (user.role === 'approver_lvl1' && req.currentApprovalLevel === 1) return true;
      if (user.role === 'approver_lvl2' && req.currentApprovalLevel === 2) return true;
      if (user.role === 'super_admin') return true;
      return false;
    });
    const history = requests.filter(req =>
      req.approvals.some(apr => apr.approverName === user.name),
    );
    return { pending, history };
  }, [requests, user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">Approver Workspace</p>
        <h1 className="text-2xl font-semibold text-slate-900">Pending Approvals</h1>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Request</th>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Vendor</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.pending.map(req => (
              <tr key={req.id} className="bg-white hover:bg-slate-50">
                <td className="px-5 py-4 text-slate-900">
                  <p className="font-semibold">{req.title}</p>
                  <p className="text-xs text-slate-500">Level {req.currentApprovalLevel}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{req.createdBy.name}</td>
                <td className="px-5 py-4 text-slate-500">{req.vendorName || '—'}</td>
                <td className="px-5 py-4 text-right font-medium text-slate-900">
                  {formatCurrency(req.amountEstimated, req.currency)}
                </td>
                <td className="px-5 py-4 text-slate-500">{formatDate(req.createdAt)}</td>
                <td className="px-5 py-4 text-right">
                  <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-blue-600">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {!data.pending.length && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No requests awaiting your decision.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
          My recent decisions
        </div>
        <div className="divide-y divide-slate-100">
          {data.history.map(entry => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-semibold text-slate-900">{entry.title}</p>
                <p className="text-xs text-slate-500">
                  {entry.approvals
                    .filter(apr => apr.approverName === user?.name)
                    .map(apr => `${apr.decision} on ${formatDate(apr.timestamp)}`)
                    .join(', ')}
                </p>
              </div>
              <StatusBadge status={entry.status} />
            </div>
          ))}
          {!data.history.length && (
            <p className="px-5 py-4 text-center text-sm text-slate-500">No approvals recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
