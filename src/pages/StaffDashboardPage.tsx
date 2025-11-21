import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Receipt, Shield, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequestData } from '../context/RequestContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '../utils/format';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/ui/FilterChip';
import { Button } from '../components/ui/Button';

const statusFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

const ageInDays = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const indicators = [
  { key: 'proformaUrl', icon: FileText, label: 'Proforma uploaded' },
  { key: 'purchaseOrder', icon: CheckCircle2, label: 'Purchase order generated' },
  { key: 'receiptUrl', icon: Receipt, label: 'Receipt uploaded' },
  { key: 'validation', icon: Shield, label: 'Validation available' },
] as const;

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

  const applyFilter = (filter: (typeof statusFilters)[number]) => setStatus(filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Staff Workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">My Purchase Requests</h1>
          <p className="text-sm text-slate-500">Track every request from proforma to payment.</p>
        </div>
        <Link to="/requests/new">
          <Button size="md">Create New Request</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total requests" value={String(stats.total)} onClick={() => applyFilter('ALL')} />
        <StatCard title="Pending approval" value={String(stats.pending)} onClick={() => applyFilter('PENDING')} />
        <StatCard
          title="Approved"
          value={String(stats.approved)}
          subtitle="With generated PO"
          onClick={() => applyFilter('APPROVED')}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Filter by status</p>
            <p className="text-xs text-slate-500">Choose a badge to refine your list</p>
          </div>
          <div className="flex items-center gap-2">
            {statusFilters.map(filter => (
              <FilterChip key={filter} active={status === filter} onClick={() => setStatus(filter)}>
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </FilterChip>
            ))}
            <button
              onClick={() => setStatus('ALL')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              <RefreshCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
        {myRequests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No requests yet"
              description="Create your first purchase request to get started."
              actionLabel="Create Request"
              onAction={() => (window.location.href = '/requests/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Indicators</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map(request => (
                  <tr key={request.id} className="bg-white transition hover:bg-slate-50 hover:shadow-sm">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{request.title}</p>
                      <p className="text-xs text-slate-500">{request.id}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{request.vendorName || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {indicators.map(ind => {
                          const exists = request[ind.key as keyof typeof request];
                          if (!exists) return null;
                          const Icon = ind.icon;
                          return (
                            <span
                              key={ind.key}
                              title={ind.label}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500"
                            >
                              <Icon className="h-3.5 w-3.5" /> {ind.label.split(' ')[0]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatCurrency(request.amountEstimated, request.currency)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{ageInDays(request.createdAt)} days</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === 'PENDING' && request.approvals.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => (window.location.href = `/requests/${request.id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                        {request.status === 'APPROVED' && !request.receiptUrl && (
                          <Button variant="secondary" size="sm">
                            Upload receipt
                          </Button>
                        )}
                        <Link
                          to={`/requests/${request.id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
