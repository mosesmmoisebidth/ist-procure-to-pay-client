import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequestData } from '../context/RequestContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileDropzone } from '../components/FileDropzone';

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
  const [fileSummary, setFileSummary] = useState<{ name: string; size: number } | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const errors = {
    title: touched.title && !form.title ? 'Please provide a request title.' : null,
    description: touched.description && !form.description ? 'Describe the business need.' : null,
    amount:
      touched.amountEstimated && Number(form.amountEstimated) <= 0
        ? 'Estimated amount must be greater than zero.'
        : null,
  };

  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!user || errors.title || errors.description || errors.amount) return;
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          {mode === 'create' ? 'New Request' : 'Edit Request'}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === 'create' ? 'Submit Purchase Request' : existing?.title}
        </h1>
        <p className="text-sm text-slate-500">
          Provide enough context for approvers to make rapid decisions.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Request details</p>
              <p className="text-xs text-slate-500">Describe what you need and why.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Request title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Estimated amount</label>
              <input
                type="number"
                value={form.amountEstimated}
                onChange={e => setForm(prev => ({ ...prev, amountEstimated: Number(e.target.value) }))}
                onBlur={() => setTouched(prev => ({ ...prev, amountEstimated: true }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                min={0}
                required
              />
              {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
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
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-600">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              rows={4}
              required
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
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
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
              2
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Documents & extraction</p>
              <p className="text-xs text-slate-500">Upload your vendor quotation to trigger AI extraction.</p>
            </div>
          </div>
          <div className="mt-4">
            <FileDropzone
              onFileSelect={file => setFileSummary(file ? { name: file.name, size: file.size } : null)}
            />
            {fileSummary && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{fileSummary.name}</p>
                    <p className="text-xs text-slate-500">Processing… extracted totals will appear shortly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-between gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" type="button">
              Save draft
            </Button>
            <Button type="submit">{mode === 'create' ? 'Submit Request' : 'Save Changes'}</Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
