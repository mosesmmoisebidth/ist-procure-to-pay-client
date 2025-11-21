export type Role = 'super_admin' | 'staff' | 'approver_lvl1' | 'approver_lvl2' | 'finance';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RequestItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApprovalDecision {
  id: string;
  level: 1 | 2;
  approverName: string;
  role: Role;
  decision: 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface PurchaseOrderInfo {
  poNumber: string;
  vendorName: string;
  totalAmount: number;
  currency: string;
  terms?: string;
  firebaseUrl: string;
  structuredData?: Record<string, unknown>;
}

export interface ExtractionSummary {
  vendor_name?: string;
  currency?: string;
  document_date?: string;
  total_amount?: number;
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  terms?: string;
  confidence?: number;
}

export interface ValidationDetails {
  is_match: boolean;
  score: number;
  details?: Record<string, unknown>;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  vendorName?: string;
  currency?: string;
  amountEstimated: number;
  amountFromProforma?: number;
  proformaUrl?: string;
  proformaExtraction?: ExtractionSummary;
  purchaseOrder?: PurchaseOrderInfo;
  receiptUrl?: string;
  receiptExtraction?: ExtractionSummary;
  validation?: ValidationDetails;
  approvals: ApprovalDecision[];
  currentApprovalLevel: number;
  requiredApprovalLevels: number;
  items: RequestItem[];
  notes?: string;
  neededBy?: string;
}
