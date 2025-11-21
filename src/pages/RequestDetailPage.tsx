import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useRequestData } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import { ItemsTable } from '../components/ItemsTable';
import { DocumentLink } from '../components/DocumentLink';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import { ValidationSummary } from '../components/ValidationSummary';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, approveRequest, rejectRequest } = useRequestData();
  const { user } = useAuth();

  const request = useMemo(() => requests.find(req => req.id === id), [requests, id]);

  if (!request) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="text-sm text-rose-700">Request not found.</p>
        <Link to="/" className="text-blue-600">Go back</Link>
      </div>
    );
  }

  const isOwner = user?.id === request.createdBy.id;
  const canApprove =
    user &&
    request.status === 'PENDING' &&
    ((user.role === 'approver_lvl1' && request.currentApprovalLevel === 1) ||
      (user.role === 'approver_lvl2' && request.currentApprovalLevel === 2));

  const handleDecision = (type: 'approve' | 'reject') => {
    if (!user) return;
    const comment = window.prompt(`Comment for ${type}? (optional)`) || undefined;
    if (type === 'approve') {
      approveRequest(request.id, user.role, user.name, comment);
    } else {
      rejectRequest(request.id, user.role, user.name, comment);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{request.id}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{request.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Created by {request.createdBy.name}</span>
            <span>•</span>
            <span>{formatDate(request.createdAt)}</span>
            <StatusBadge status={request.status} />
          </div>
        </div>
        <div className="flex gap-3">
          {isOwner && request.status === 'PENDING' && (
            <button
              onClick={() => navigate(`/requests/${request.id}/edit`)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Edit
            </button>
          )}
          {isOwner && request.status === 'APPROVED' && !request.receiptUrl && (
            <button
              onClick={() => window.alert('Receipt upload integration coming soon.')}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Upload Receipt
            </button>
          )}
          {canApprove && (
            <>
              <button
                onClick={() => handleDecision('reject')}
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
              >
                Reject
              </button>
              <button
                onClick={() => handleDecision('approve')}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
            <p className="mt-2 text-sm text-slate-600">{request.description}</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Estimated amount</dt>
                <dd className="text-xl font-semibold text-slate-900">
                  {formatCurrency(request.amountEstimated, request.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Proforma amount</dt>
                <dd className="text-xl font-semibold text-slate-900">
                  {request.amountFromProforma
                    ? formatCurrency(request.amountFromProforma, request.currency)
                    : '—'}
                </dd>
              </div>
            </dl>
            {request.notes && <p className="mt-4 text-sm text-slate-500">Notes: {request.notes}</p>}
          </section>

          <ItemsTable items={request.items} currency={request.currency} caption="Request Items" />

          <ApprovalTimeline approvals={request.approvals} currentLevel={request.currentApprovalLevel} />
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="text-base font-semibold text-slate-900">Documents</h4>
            <div className="mt-4 space-y-3">
              <DocumentLink label="View Proforma" url={request.proformaUrl} />
              <DocumentLink label="View Purchase Order" url={request.purchaseOrder?.firebaseUrl} />
              <DocumentLink label="View Receipt" url={request.receiptUrl} />
            </div>
          </section>
          <ValidationSummary validation={request.validation} />
        </div>
      </div>
    </div>
  );
};
