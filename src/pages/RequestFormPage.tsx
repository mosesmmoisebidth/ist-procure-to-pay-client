import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequestData } from '../context/RequestContext';

type Mode = 'create' | 'edit';

export const RequestFormPage = () => {
  const { id } = useParams();
  const mode: Mode = id ? 'edit' : 'create';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requests, createRequest, updateRequest } = useRequestData();

  const existing = useMemo(() => requests.find(req => req.id === id), [requests, id]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    amountEstimated: 0,
    currency: 'USD',
    neededBy: '',
    notes: '',
  });

  useEffect(() => {
    if (existing && mode === 'edit') {
      setForm({
        title: existing.title,
        description: existing.description,
        amountEstimated: existing.amountEstimated,
        currency: existing.currency || 'USD',
        neededBy: existing.neededBy || '',
        notes: existing.notes || '',
      });
    }
  }, [existing, mode]);

  if (mode === 'edit' && !existing) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Request not found.
      </div>
    );
  }

  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!user) return;
    if (mode === 'create') {
      const created = createRequest(
        {
          title: form.title,
          description: form.description,
          amountEstimated: Number(form.amountEstimated),
          currency: form.currency,
          notes: form.notes,
          neededBy: form.neededBy,
        },
        user.name,
        user.id,
        user.role,
      );
      navigate(`/requests/${created.id}`);
    } else if (id) {
      updateRequest(id, {
        title: form.title,
        description: form.description,
        amountEstimated: Number(form.amountEstimated),
        currency: form.currency,
        neededBy: form.neededBy,
        notes: form.notes,
      });
      navigate(`/requests/${id}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          {mode === 'create' ? 'New Request' : 'Edit Request'}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === 'create' ? 'Submit Purchase Request' : existing?.title}
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-600">Request title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Estimated amount</label>
            <input
              type="number"
              value={form.amountEstimated}
              onChange={e => setForm(prev => ({ ...prev, amountEstimated: Number(e.target.value) }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              min={0}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Currency</label>
            <select
              value={form.currency}
              onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="RWF">RWF</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Needed by</label>
            <input
              type="date"
              value={form.neededBy}
              onChange={e => setForm(prev => ({ ...prev, neededBy: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
            rows={3}
          />
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Proforma upload integration will appear here. Attachments are managed on the backend.
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {mode === 'create' ? 'Submit Request' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
