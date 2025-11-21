import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import { mockRequests } from '../data/mockData';
import type { ApprovalDecision, PurchaseRequest, RequestItem, Role } from '../types';

interface CreateRequestInput {
  title: string;
  description: string;
  amountEstimated: number;
  currency?: string;
  notes?: string;
  neededBy?: string;
  items?: Omit<RequestItem, 'id' | 'totalPrice'>[];
}

interface RequestContextValue {
  requests: PurchaseRequest[];
  createRequest: (input: CreateRequestInput, authorName: string, authorId: string, role: Role) => PurchaseRequest;
  updateRequest: (id: string, updates: Partial<CreateRequestInput>) => void;
  approveRequest: (id: string, role: Role, approverName: string, comment?: string) => void;
  rejectRequest: (id: string, role: Role, approverName: string, comment?: string) => void;
}

const RequestContext = createContext<RequestContextValue | undefined>(undefined);

export const RequestProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>(mockRequests);

  const createRequest = useCallback(
    (input: CreateRequestInput, authorName: string, authorId: string, role: Role) => {
      const newItems: RequestItem[] = (input.items || []).map(item => ({
        id: crypto.randomUUID(),
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const amountEstimate =
        input.amountEstimated ||
        newItems.reduce((acc, item) => acc + item.totalPrice, 0);

      const newRequest: PurchaseRequest = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        createdBy: { id: authorId, name: authorName, role },
        vendorName: '',
        currency: input.currency || 'USD',
        amountEstimated: amountEstimate,
        amountFromProforma: undefined,
        approvals: [],
        currentApprovalLevel: 1,
        requiredApprovalLevels: 2,
        proformaUrl: undefined,
        items: newItems,
        notes: input.notes,
        neededBy: input.neededBy,
      };

      setRequests(prev => [newRequest, ...prev]);
      toast.success('Request submitted');
      return newRequest;
    },
    [],
  );

  const updateRequest = useCallback((id: string, updates: Partial<CreateRequestInput>) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== id || req.status !== 'PENDING') return req;
        return {
          ...req,
          title: updates.title ?? req.title,
          description: updates.description ?? req.description,
          amountEstimated: updates.amountEstimated ?? req.amountEstimated,
          currency: updates.currency ?? req.currency,
          notes: updates.notes ?? req.notes,
          neededBy: updates.neededBy ?? req.neededBy,
        };
      }),
    );
  }, []);

  const appendApproval = (
    request: PurchaseRequest,
    role: Role,
    approverName: string,
    decision: 'approved' | 'rejected',
    comment?: string,
  ): ApprovalDecision => ({
    id: crypto.randomUUID(),
    level: role === 'approver_lvl1' ? 1 : 2,
    approverName,
    role,
    decision,
    comment,
    timestamp: new Date().toISOString(),
  });

  const approveRequest = useCallback((id: string, role: Role, approverName: string, comment?: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== id) return req;
        if (req.status !== 'PENDING') return req;
        const expectedLevel = role === 'approver_lvl1' ? 1 : 2;
        if (req.currentApprovalLevel !== expectedLevel) {
          return req;
        }
        const approval = appendApproval(req, role, approverName, 'approved', comment);
        const remainingLevels = Math.max(req.requiredApprovalLevels - 1, 0);
        const updated: PurchaseRequest = {
          ...req,
          approvals: [...req.approvals, approval],
          requiredApprovalLevels: remainingLevels,
          currentApprovalLevel:
            remainingLevels === 0 ? req.currentApprovalLevel : req.currentApprovalLevel + 1,
        };
        if (remainingLevels === 0) {
          updated.status = 'APPROVED';
          if (!updated.purchaseOrder) {
            updated.purchaseOrder = {
              poNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999)
                .toString()
                .padStart(4, '0')}`,
              vendorName: updated.vendorName || 'TBD Vendor',
              totalAmount: updated.amountFromProforma || updated.amountEstimated,
              currency: updated.currency || 'USD',
              terms: 'Payment due within 30 days.',
              firebaseUrl: '#',
            };
          }
        }
        toast.success('Approval recorded');
        return updated;
      }),
    );
  }, []);

  const rejectRequest = useCallback((id: string, role: Role, approverName: string, comment?: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== id || req.status !== 'PENDING') return req;
        const approval = appendApproval(req, role, approverName, 'rejected', comment);
        const updated = {
          ...req,
          status: 'REJECTED',
          approvals: [...req.approvals, approval],
          requiredApprovalLevels: 0,
        };
        toast.error('Request rejected');
        return updated;
      }),
    );
  }, []);

  const value = useMemo<RequestContextValue>(
    () => ({
      requests,
      createRequest,
      updateRequest,
      approveRequest,
      rejectRequest,
    }),
    [requests, createRequest, updateRequest, approveRequest, rejectRequest],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
};

export const useRequestData = () => {
  const ctx = useContext(RequestContext);
  if (!ctx) {
    throw new Error('useRequestData must be used within RequestProvider');
  }
  return ctx;
};
