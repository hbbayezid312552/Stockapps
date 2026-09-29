export interface Product {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  category: string;
  piecesPerCarton: number; // e.g. 12, 24, 48
  tradePrice: number; // T.P per piece
  defaultMarginPercent: number; // e.g. 10%
  dealerPrice: number; // D.P per piece = T.P - (T.P * margin / 100)
  mrp: number; // Maximum Retail Price
  minStockLevel: number; // in pieces
  openingStock: number; // in pieces
  currentStock: number; // in pieces
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Dealer {
  id: string;
  code: string;
  name: string;
  proprietor?: string;
  mobile: string;
  address: string;
  areaRoute: string;
  openingBalance: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ProductTarget {
  productId: string;
  targetPieces: number;
}

export interface SalesRepresentative {
  id: string;
  srCode: string;
  name: string;
  mobile: string;
  areaRoute: string;
  joiningDate: string;
  monthlyTarget: number; // in BDT
  productTargets?: Record<string, number>; // productId -> target pieces
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  productNameBn: string;
  piecesPerCarton: number;
  cartonQty: number;
  pieceQty: number;
  totalPieces: number; // cartonQty * piecesPerCarton + pieceQty
  tp: number; // Trade Price per piece
  tpPerCarton: number; // tp * piecesPerCarton
  discountPercent: number; // %
  dp: number; // Dealer Price per piece
  dpPerCarton: number; // dp * piecesPerCarton
  lineTotal: number; // totalPieces * dp
  // S.R specific damage & return fields
  damageCarton?: number;
  damagePiece?: number;
  damageTotalPieces?: number;
  returnCarton?: number;
  returnPiece?: number;
  returnTotalPieces?: number;
  netSoldPieces?: number; // totalPieces - (damageTotalPieces + returnTotalPieces)
  netLineTotal?: number; // netSoldPieces * dp
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'dealer' | 'sr';
  date: string;
  dealerId?: string;
  dealerName?: string;
  srId?: string;
  srName?: string;
  route?: string;
  items: InvoiceItem[];
  totalCartons: number;
  totalPieces: number;
  totalGrossAmount: number;
  totalDiscount: number;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  totalDamagePieces?: number;
  totalReturnPieces?: number;
  netActualSalesAmount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  productNameBn: string;
  piecesPerCarton: number;
  cartonQty: number;
  pieceQty: number;
  totalPieces: number;
  purchasePricePerPiece: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  date: string;
  supplierName: string;
  items: PurchaseItem[];
  totalCartons: number;
  totalPieces: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface DamageRecord {
  id: string;
  date: string;
  invoiceId?: string;
  srId?: string;
  srName?: string;
  dealerId?: string;
  dealerName?: string;
  productId: string;
  productName: string;
  cartonQty: number;
  pieceQty: number;
  totalPieces: number;
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface ReturnRecord {
  id: string;
  date: string;
  invoiceId?: string;
  srId?: string;
  srName?: string;
  dealerId?: string;
  dealerName?: string;
  productId: string;
  productName: string;
  cartonQty: number;
  pieceQty: number;
  totalPieces: number;
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'add' | 'subtract';
  cartonQty: number;
  pieceQty: number;
  totalPieces: number;
  reason: string;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  companyNameBn: string;
  tagline: string;
  taglineBn: string;
  logoUrl?: string;
  address: string;
  addressBn: string;
  phone: string;
  email: string;
  website: string;
  chairmanName: string;
  chairmanNameBn: string;
  chairmanDesignation: string;
  chairmanDesignationBn: string;
  invoiceFooterNote: string;
  invoiceFooterNoteBn: string;
  invoicePrefix: string;
  defaultDiscountPercent: number;
  currencySymbol: string;
}

export interface FeatureLocks {
  dealerInvoice: boolean;
  srInvoice: boolean;
  stock: boolean;
  purchase: boolean;
  damageReturn: boolean;
  srTarget: boolean;
  reports: boolean;
  backupRestore: boolean;
  settings: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // SHA-256 hashed password
  role: 'superadmin' | 'admin' | 'manager';
  lastLogin?: string;
}

export type AppLanguage = 'bn' | 'en';
