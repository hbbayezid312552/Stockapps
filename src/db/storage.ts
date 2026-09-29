import {
  Product,
  Dealer,
  SalesRepresentative,
  Invoice,
  Purchase,
  DamageRecord,
  ReturnRecord,
  StockAdjustment,
  CompanySettings,
  FeatureLocks,
  AdminUser,
} from '../types';
import { hashPassword, verifyPassword } from '../utils/crypto';

// Storage Keys
const KEYS = {
  PRODUCTS: 'probhati_products_v1',
  DEALERS: 'probhati_dealers_v1',
  SRS: 'probhati_srs_v1',
  INVOICES: 'probhati_invoices_v1',
  PURCHASES: 'probhati_purchases_v1',
  DAMAGE: 'probhati_damage_v1',
  RETURNS: 'probhati_returns_v1',
  ADJUSTMENTS: 'probhati_adjustments_v1',
  SETTINGS: 'probhati_settings_v1',
  LOCKS: 'probhati_locks_v1',
  ADMIN_USER: 'probhati_admin_v1',
  SESSION: 'probhati_session_v1',
};

// Initial Company Settings
export const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'Probhati Food Products',
  companyNameBn: 'প্রভাতী ফুড প্রোডাক্টস',
  tagline: 'Uncompromising Quality - Trusted Food Products',
  taglineBn: 'গুণগত মানে আপোষহীন — খাদ্যপণ্যে বিশ্বস্ততা',
  logoUrl: '/apple-touch-icon.png',
  address: 'Kichok Road, Bogura, Bangladesh',
  addressBn: 'কিচক রোড, বগুড়া, বাংলাদেশ',
  phone: '+880 1712-345678, +880 1912-987654',
  email: 'probhatifoodproducts@gmail.com',
  website: 'www.probhatifood.com',
  chairmanName: 'Alhaj Md. Nazrul Islam',
  chairmanNameBn: 'আলহাজ্ব মোঃ নজরুল ইসলাম',
  chairmanDesignation: 'Chairman & Managing Director',
  chairmanDesignationBn: 'চেয়ারম্যান ও ব্যবস্থাপনা পরিচালক',
  invoiceFooterNote: 'Goods sold are not returnable without valid warranty claim. Thank you for doing business with Probhati Food Products.',
  invoiceFooterNoteBn: 'বিক্রিত মাল বিশেষ কারণ ব্যতীত ফেরতযোগ্য নহে। প্রভাতী ফুড প্রোডাক্টস-এর সাথে ব্যবসা করার জন্য আপনাকে ধন্যবাদ।',
  invoicePrefix: 'PFP',
  defaultDiscountPercent: 10,
  currencySymbol: '৳',
};

// Default Feature Locks
export const DEFAULT_LOCKS: FeatureLocks = {
  dealerInvoice: false,
  srInvoice: false,
  stock: false,
  purchase: false,
  damageReturn: false,
  srTarget: false,
  reports: false,
  backupRestore: false,
  settings: false,
};

// Seed Products
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'P-101',
    name: 'Mustard Oil 1 Liter (Pure Ghani)',
    nameBn: 'সরিষার তেল ১ লিটার (খাঁটি ঘানি ভাঙ্গা)',
    category: 'Oil',
    piecesPerCarton: 12,
    tradePrice: 280,
    defaultMarginPercent: 10,
    dealerPrice: 252,
    mrp: 310,
    minStockLevel: 60,
    openingStock: 480,
    currentStock: 420,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-2',
    code: 'P-102',
    name: 'Mustard Oil 500ml',
    nameBn: 'সরিষার তেল ৫০০ মি.লি.',
    category: 'Oil',
    piecesPerCarton: 24,
    tradePrice: 145,
    defaultMarginPercent: 10,
    dealerPrice: 130.5,
    mrp: 165,
    minStockLevel: 72,
    openingStock: 720,
    currentStock: 648,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-3',
    code: 'P-103',
    name: 'Fortified Soybean Oil 1 Liter',
    nameBn: 'পুষ্টিগুণ সমৃদ্ধ সয়াবিন তেল ১ লিটার',
    category: 'Oil',
    piecesPerCarton: 12,
    tradePrice: 185,
    defaultMarginPercent: 8,
    dealerPrice: 170.2,
    mrp: 200,
    minStockLevel: 48,
    openingStock: 360,
    currentStock: 312,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-4',
    code: 'P-104',
    name: 'Spicy Premium Chanachur 150g',
    nameBn: 'প্রিমিয়াম ঝাল চানাচুর ১৫০ গ্রাম',
    category: 'Snacks',
    piecesPerCarton: 48,
    tradePrice: 35,
    defaultMarginPercent: 12,
    dealerPrice: 30.8,
    mrp: 40,
    minStockLevel: 96,
    openingStock: 960,
    currentStock: 816,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-5',
    code: 'P-105',
    name: 'Special Ghee Toast Biscuit 300g',
    nameBn: 'স্পেশাল ঘি টোস্ট বিস্কুট ৩০০ গ্রাম',
    category: 'Bakery',
    piecesPerCarton: 24,
    tradePrice: 60,
    defaultMarginPercent: 10,
    dealerPrice: 54,
    mrp: 70,
    minStockLevel: 48,
    openingStock: 480,
    currentStock: 408,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-6',
    code: 'P-106',
    name: 'Pure Turmeric Powder 200g',
    nameBn: 'খাঁটি হলুদ গুঁড়া ২০০ গ্রাম',
    category: 'Spices',
    piecesPerCarton: 50,
    tradePrice: 85,
    defaultMarginPercent: 10,
    dealerPrice: 76.5,
    mrp: 95,
    minStockLevel: 50,
    openingStock: 400,
    currentStock: 350,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-7',
    code: 'P-107',
    name: 'Pure Red Chili Powder 200g',
    nameBn: 'খাঁটি মরিচ গুঁড়া ২০০ গ্রাম',
    category: 'Spices',
    piecesPerCarton: 50,
    tradePrice: 110,
    defaultMarginPercent: 10,
    dealerPrice: 99,
    mrp: 125,
    minStockLevel: 50,
    openingStock: 350,
    currentStock: 300,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'prod-8',
    code: 'P-108',
    name: 'Instant Masala Noodles 8 Pack',
    nameBn: 'ইনস্ট্যান্ট মসলা নুডুলস ৮ প্যাক ফ্যামিলি',
    category: 'Snacks',
    piecesPerCarton: 16,
    tradePrice: 160,
    defaultMarginPercent: 10,
    dealerPrice: 144,
    mrp: 180,
    minStockLevel: 32,
    openingStock: 160,
    currentStock: 18, // Intentionally low stock for alert testing!
    status: 'active',
    createdAt: '2026-01-01',
  },
];

// Seed Dealers
const SEED_DEALERS: Dealer[] = [
  {
    id: 'dlr-1',
    code: 'DLR-001',
    name: 'মেসার্স ভাই ভাই এন্টারপ্রাইজ',
    proprietor: 'হাজী মোঃ রফিকুল ইসলাম',
    mobile: '01712-345678',
    address: 'কদমগাছা বাজার, বগুড়া সদর',
    areaRoute: 'Kichok - Shibganj Route',
    openingBalance: 25000,
    currentBalance: 34200,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'dlr-2',
    code: 'DLR-002',
    name: 'জননী ট্রেডার্স',
    proprietor: 'মোঃ বাবুল হোসেন',
    mobile: '01819-876543',
    address: 'মহাস্থান রোড, শিবগঞ্জ, বগুড়া',
    areaRoute: 'Mahasthangarh Route',
    openingBalance: 12000,
    currentBalance: 18500,
    status: 'active',
    createdAt: '2026-01-05',
  },
  {
    id: 'dlr-3',
    code: 'DLR-003',
    name: 'সততা স্টোর',
    proprietor: 'মোঃ জাহিদুল ইসলাম',
    mobile: '01911-223344',
    address: 'কিচক বাজার, শিবগঞ্জ',
    areaRoute: 'Kichok Route',
    openingBalance: 8000,
    currentBalance: 9600,
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: 'dlr-4',
    code: 'DLR-004',
    name: 'বিসমিল্লাহ ভ্যারাইটিজ',
    proprietor: 'আব্দুল করিম',
    mobile: '01720-998877',
    address: 'শেরপুর রোড, বগুড়া',
    areaRoute: 'Sherpur Town Route',
    openingBalance: 5000,
    currentBalance: 14000,
    status: 'active',
    createdAt: '2026-01-15',
  },
];

// Seed S.R
const SEED_SRS: SalesRepresentative[] = [
  {
    id: 'sr-1',
    srCode: 'SR-101',
    name: 'মোঃ আমানুল্লাহ আমান',
    mobile: '01710-112233',
    areaRoute: 'Kichok - Shibganj',
    joiningDate: '2025-03-01',
    monthlyTarget: 500000,
    productTargets: {
      'prod-1': 500, // Mustard Oil 1L pieces
      'prod-4': 1000, // Chanachur pieces
      'prod-5': 600, // Biscuit pieces
    },
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'sr-2',
    srCode: 'SR-102',
    name: 'মোঃ তারেক হাসান',
    mobile: '01812-445566',
    areaRoute: 'Sherpur - Bogura Sadar',
    joiningDate: '2025-06-15',
    monthlyTarget: 450000,
    productTargets: {
      'prod-1': 450,
      'prod-3': 400,
      'prod-4': 800,
    },
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'sr-3',
    srCode: 'SR-103',
    name: 'আব্দুর রহিম',
    mobile: '01913-778899',
    areaRoute: 'Gabtoli - Sariakandi',
    joiningDate: '2025-09-01',
    monthlyTarget: 400000,
    productTargets: {
      'prod-1': 350,
      'prod-6': 300,
      'prod-7': 250,
    },
    status: 'active',
    createdAt: '2026-01-01',
  },
];

// Helper to get today's date formatted YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic seed invoices
function createSeedInvoices(): Invoice[] {
  const today = getTodayDateString();
  return [
    {
      id: 'inv-seed-1',
      invoiceNumber: 'PFP-2026-0001',
      invoiceType: 'dealer',
      date: today,
      dealerId: 'dlr-1',
      dealerName: 'মেসার্স ভাই ভাই এন্টারপ্রাইজ',
      route: 'Kichok - Shibganj Route',
      items: [
        {
          productId: 'prod-1',
          productName: 'Mustard Oil 1 Liter (Pure Ghani)',
          productNameBn: 'সরিষার তেল ১ লিটার (খাঁটি ঘানি ভাঙ্গা)',
          piecesPerCarton: 12,
          cartonQty: 3,
          pieceQty: 0,
          totalPieces: 36,
          tp: 280,
          tpPerCarton: 3360,
          discountPercent: 10,
          dp: 252,
          dpPerCarton: 3024,
          lineTotal: 9072,
        },
        {
          productId: 'prod-4',
          productName: 'Spicy Premium Chanachur 150g',
          productNameBn: 'প্রিমিয়াম ঝাল চানাচুর ১৫০ গ্রাম',
          piecesPerCarton: 48,
          cartonQty: 2,
          pieceQty: 0,
          totalPieces: 96,
          tp: 35,
          tpPerCarton: 1680,
          discountPercent: 12,
          dp: 30.8,
          dpPerCarton: 1478.4,
          lineTotal: 2956.8,
        },
      ],
      totalCartons: 5,
      totalPieces: 132,
      totalGrossAmount: 13440,
      totalDiscount: 1411.2,
      netAmount: 12028.8,
      paidAmount: 10000,
      dueAmount: 2028.8,
      notes: 'রেগুলার ডেলিভারি চালান',
      createdBy: 'Admin',
      createdAt: `${today}T09:30:00Z`,
    },
    {
      id: 'inv-seed-2',
      invoiceNumber: 'PFP-SR-2026-0002',
      invoiceType: 'sr',
      date: today,
      srId: 'sr-1',
      srName: 'মোঃ আমানুল্লাহ আমান',
      dealerName: 'সততা স্টোর (কিচক বাজার)',
      route: 'Kichok - Shibganj',
      items: [
        {
          productId: 'prod-1',
          productName: 'Mustard Oil 1 Liter (Pure Ghani)',
          productNameBn: 'সরিষার তেল ১ লিটার (খাঁটি ঘানি ভাঙ্গা)',
          piecesPerCarton: 12,
          cartonQty: 2,
          pieceQty: 0,
          totalPieces: 24,
          tp: 280,
          tpPerCarton: 3360,
          discountPercent: 10,
          dp: 252,
          dpPerCarton: 3024,
          lineTotal: 6048,
          damageCarton: 0,
          damagePiece: 1,
          damageTotalPieces: 1,
          returnCarton: 0,
          returnPiece: 2,
          returnTotalPieces: 2,
          netSoldPieces: 21,
          netLineTotal: 5292,
        },
        {
          productId: 'prod-5',
          productName: 'Special Ghee Toast Biscuit 300g',
          productNameBn: 'স্পেশাল ঘি টোস্ট বিস্কুট ৩০০ গ্রাম',
          piecesPerCarton: 24,
          cartonQty: 3,
          pieceQty: 0,
          totalPieces: 72,
          tp: 60,
          tpPerCarton: 1440,
          discountPercent: 10,
          dp: 54,
          dpPerCarton: 1296,
          lineTotal: 3888,
          damageCarton: 0,
          damagePiece: 0,
          damageTotalPieces: 0,
          returnCarton: 0,
          returnPiece: 0,
          returnTotalPieces: 0,
          netSoldPieces: 72,
          netLineTotal: 3888,
        },
      ],
      totalCartons: 5,
      totalPieces: 96,
      totalGrossAmount: 11040,
      totalDiscount: 1104,
      netAmount: 9936,
      paidAmount: 9000,
      dueAmount: 936,
      totalDamagePieces: 1,
      totalReturnPieces: 2,
      netActualSalesAmount: 9180,
      notes: 'এস.আর সেলস চালান - কিচক রুট',
      createdBy: 'Admin',
      createdAt: `${today}T11:15:00Z`,
    },
  ];
}

class StorageEngine {
  private memoryCache: Map<string, unknown> = new Map();

  constructor() {
    this.initDatabase();
  }

  public async initDatabase(): Promise<void> {
    try {
      // 1. Admin initialization
      const adminRaw = localStorage.getItem(KEYS.ADMIN_USER);
      if (!adminRaw) {
        // Default admin password is 'admin123'
        const initialHash = await hashPassword('admin123');
        const defaultAdmin: AdminUser = {
          id: 'admin-probhati-1',
          email: 'probhatifoodproducts@gmail.com',
          name: 'Probhati Administrator',
          passwordHash: initialHash,
          role: 'superadmin',
        };
        localStorage.setItem(KEYS.ADMIN_USER, JSON.stringify(defaultAdmin));
      }

      // 2. Settings initialization
      if (!localStorage.getItem(KEYS.SETTINGS)) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }

      // 3. Locks initialization
      if (!localStorage.getItem(KEYS.LOCKS)) {
        localStorage.setItem(KEYS.LOCKS, JSON.stringify(DEFAULT_LOCKS));
      }

      // 4. Products initialization
      if (!localStorage.getItem(KEYS.PRODUCTS)) {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
      }

      // 5. Dealers initialization
      if (!localStorage.getItem(KEYS.DEALERS)) {
        localStorage.setItem(KEYS.DEALERS, JSON.stringify(SEED_DEALERS));
      }

      // 6. SRs initialization
      if (!localStorage.getItem(KEYS.SRS)) {
        localStorage.setItem(KEYS.SRS, JSON.stringify(SEED_SRS));
      }

      // 7. Invoices initialization
      if (!localStorage.getItem(KEYS.INVOICES)) {
        localStorage.setItem(KEYS.INVOICES, JSON.stringify(createSeedInvoices()));
      }

      // 8. Purchases, Damage, Returns, Adjustments
      if (!localStorage.getItem(KEYS.PURCHASES)) {
        localStorage.setItem(KEYS.PURCHASES, JSON.stringify([]));
      }
      if (!localStorage.getItem(KEYS.DAMAGE)) {
        // Initial sample damage
        const sampleDamage: DamageRecord[] = [
          {
            id: 'dmg-1',
            date: getTodayDateString(),
            srName: 'মোঃ আমানুল্লাহ আমান',
            productId: 'prod-1',
            productName: 'Mustard Oil 1 Liter (Pure Ghani)',
            cartonQty: 0,
            pieceQty: 1,
            totalPieces: 1,
            reason: 'পরিবহনকালে বোতল ফেটে যাওয়া',
            createdAt: `${getTodayDateString()}T11:15:00Z`,
          },
        ];
        localStorage.setItem(KEYS.DAMAGE, JSON.stringify(sampleDamage));
      }
      if (!localStorage.getItem(KEYS.RETURNS)) {
        const sampleReturn: ReturnRecord[] = [
          {
            id: 'ret-1',
            date: getTodayDateString(),
            srName: 'মোঃ আমানুল্লাহ আমান',
            dealerName: 'সততা স্টোর',
            productId: 'prod-1',
            productName: 'Mustard Oil 1 Liter (Pure Ghani)',
            cartonQty: 0,
            pieceQty: 2,
            totalPieces: 2,
            reason: 'অতিরিক্ত অর্ডার ফেরত',
            createdAt: `${getTodayDateString()}T11:15:00Z`,
          },
        ];
        localStorage.setItem(KEYS.RETURNS, JSON.stringify(sampleReturn));
      }
      if (!localStorage.getItem(KEYS.ADJUSTMENTS)) {
        localStorage.setItem(KEYS.ADJUSTMENTS, JSON.stringify([]));
      }
    } catch (e) {
      console.error('Storage initialization error:', e);
    }
  }

  // --- Generic Helpers ---
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyListeners(key);
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(key: string): void {
    this.listeners.forEach(fn => fn());
  }

  // --- Admin & Auth ---
  public getAdmin(): AdminUser {
    return this.get<AdminUser>(KEYS.ADMIN_USER, {
      id: 'admin-1',
      email: 'probhatifoodproducts@gmail.com',
      name: 'Probhati Administrator',
      passwordHash: '',
      role: 'superadmin',
    });
  }

  public async loginAdmin(email: string, pass: string): Promise<boolean> {
    const admin = this.getAdmin();
    // Allow either probhatifoodproducts@gmail.com or admin@probhati.com or username
    const normalizedEmail = email.trim().toLowerCase();
    const adminEmail = admin.email.toLowerCase();
    
    const isEmailMatch =
      normalizedEmail === adminEmail ||
      normalizedEmail === 'admin@probhati.com' ||
      normalizedEmail === 'admin' ||
      normalizedEmail === 'probhati';

    if (!isEmailMatch) return false;

    const isValid = await verifyPassword(pass, admin.passwordHash);
    if (isValid) {
      const session = {
        userId: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
      this.notifyListeners(KEYS.SESSION);
      return true;
    }
    return false;
  }

  public getSession(): { userId: string; email: string; name: string; role: string; loggedInAt: string } | null {
    return this.get(KEYS.SESSION, null);
  }

  public logoutAdmin(): void {
    localStorage.removeItem(KEYS.SESSION);
    this.notifyListeners(KEYS.SESSION);
  }

  public async updateAdminPassword(newPass: string): Promise<void> {
    const admin = this.getAdmin();
    admin.passwordHash = await hashPassword(newPass);
    this.set(KEYS.ADMIN_USER, admin);
  }

  public async updateAdminProfile(name: string, email: string): Promise<void> {
    const admin = this.getAdmin();
    admin.name = name;
    admin.email = email;
    this.set(KEYS.ADMIN_USER, admin);
  }

  // --- Settings ---
  public getSettings(): CompanySettings {
    return this.get<CompanySettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: CompanySettings): void {
    this.set(KEYS.SETTINGS, settings);
  }

  // --- Feature Locks ---
  public getFeatureLocks(): FeatureLocks {
    return this.get<FeatureLocks>(KEYS.LOCKS, DEFAULT_LOCKS);
  }

  public toggleFeatureLock(featureKey: keyof FeatureLocks, locked: boolean): void {
    const locks = this.getFeatureLocks();
    locks[featureKey] = locked;
    this.set(KEYS.LOCKS, locks);
  }

  public isFeatureLocked(featureKey: keyof FeatureLocks): boolean {
    const locks = this.getFeatureLocks();
    return !!locks[featureKey];
  }

  // --- Products & Stock Management ---
  public getProducts(): Product[] {
    return this.get<Product[]>(KEYS.PRODUCTS, SEED_PRODUCTS);
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    this.set(KEYS.PRODUCTS, products);
  }

  public deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.set(KEYS.PRODUCTS, products);
  }

  public adjustProductStockDirect(productId: string, diffPieces: number, reason: string): void {
    const products = this.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    prod.currentStock += diffPieces;
    this.set(KEYS.PRODUCTS, products);

    // Record adjustment log
    const adjustments = this.get<StockAdjustment[]>(KEYS.ADJUSTMENTS, []);
    adjustments.unshift({
      id: `adj-${Date.now()}`,
      date: getTodayDateString(),
      productId: prod.id,
      productName: prod.nameBn || prod.name,
      type: diffPieces >= 0 ? 'add' : 'subtract',
      cartonQty: Math.floor(Math.abs(diffPieces) / prod.piecesPerCarton),
      pieceQty: Math.abs(diffPieces) % prod.piecesPerCarton,
      totalPieces: Math.abs(diffPieces),
      reason,
      createdAt: new Date().toISOString(),
    });
    this.set(KEYS.ADJUSTMENTS, adjustments);
  }

  // --- Dealers ---
  public getDealers(): Dealer[] {
    return this.get<Dealer[]>(KEYS.DEALERS, SEED_DEALERS);
  }

  public saveDealer(dealer: Dealer): void {
    const dealers = this.getDealers();
    const index = dealers.findIndex(d => d.id === dealer.id);
    if (index >= 0) {
      dealers[index] = dealer;
    } else {
      dealers.push(dealer);
    }
    this.set(KEYS.DEALERS, dealers);
  }

  public deleteDealer(dealerId: string): void {
    const dealers = this.getDealers().filter(d => d.id !== dealerId);
    this.set(KEYS.DEALERS, dealers);
  }

  public updateDealerBalance(dealerId: string, diffAmount: number): void {
    const dealers = this.getDealers();
    const dealer = dealers.find(d => d.id === dealerId);
    if (dealer) {
      dealer.currentBalance += diffAmount;
      this.set(KEYS.DEALERS, dealers);
    }
  }

  // --- S.R (Sales Representatives) ---
  public getSRs(): SalesRepresentative[] {
    return this.get<SalesRepresentative[]>(KEYS.SRS, SEED_SRS);
  }

  public saveSR(sr: SalesRepresentative): void {
    const srs = this.getSRs();
    const index = srs.findIndex(s => s.id === sr.id);
    if (index >= 0) {
      srs[index] = sr;
    } else {
      srs.push(sr);
    }
    this.set(KEYS.SRS, srs);
  }

  public deleteSR(srId: string): void {
    const srs = this.getSRs().filter(s => s.id !== srId);
    this.set(KEYS.SRS, srs);
  }

  // --- Central Transaction Engine: Invoices & Stock Recalculation ---
  public getInvoices(): Invoice[] {
    return this.get<Invoice[]>(KEYS.INVOICES, []);
  }

  /**
   * Saves or updates an invoice.
   * Requirement 29 & 42:
   * "যেকোনো Sales, Purchase, Return, Damage, Invoice Edit, Invoice Delete এর কারণে Stock এবং Reports Automatically Update/Recalculate হবে।"
   */
  public saveInvoice(invoice: Invoice, previousInvoice?: Invoice | null): void {
    const products = this.getProducts();
    const damageList = this.get<DamageRecord[]>(KEYS.DAMAGE, []);
    const returnList = this.get<ReturnRecord[]>(KEYS.RETURNS, []);

    // 1. If editing existing invoice, cleanly rollback previous stock deductions/returns
    if (previousInvoice) {
      for (const oldItem of previousInvoice.items) {
        const prod = products.find(p => p.id === oldItem.productId);
        if (prod) {
          // Re-add the previously sold pieces
          prod.currentStock += oldItem.totalPieces;
          // Reverse damage deduction if SR invoice
          if (oldItem.damageTotalPieces) {
            prod.currentStock += oldItem.damageTotalPieces;
          }
          // Reverse return credit if SR invoice
          if (oldItem.returnTotalPieces) {
            prod.currentStock -= oldItem.returnTotalPieces;
          }
        }
      }

      // Rollback previous dealer balance due
      if (previousInvoice.dealerId && previousInvoice.dueAmount) {
        this.updateDealerBalance(previousInvoice.dealerId, -previousInvoice.dueAmount);
      }

      // Remove previous damage/return records attached to this invoice
      const filteredDamage = damageList.filter(d => d.invoiceId !== previousInvoice.id);
      const filteredReturns = returnList.filter(r => r.invoiceId !== previousInvoice.id);
      this.set(KEYS.DAMAGE, filteredDamage);
      this.set(KEYS.RETURNS, filteredReturns);
    }

    // 2. Apply new invoice stock impacts
    for (const newItem of invoice.items) {
      const prod = products.find(p => p.id === newItem.productId);
      if (prod) {
        // Deduct sold pieces from stock
        prod.currentStock -= newItem.totalPieces;

        // If SR invoice has damage, deduct damage and create damage record
        if (newItem.damageTotalPieces && newItem.damageTotalPieces > 0) {
          prod.currentStock -= newItem.damageTotalPieces;
          damageList.unshift({
            id: `dmg-${invoice.id}-${newItem.productId}`,
            invoiceId: invoice.id,
            date: invoice.date,
            srId: invoice.srId,
            srName: invoice.srName,
            dealerName: invoice.dealerName,
            productId: newItem.productId,
            productName: newItem.productNameBn || newItem.productName,
            cartonQty: newItem.damageCarton || 0,
            pieceQty: newItem.damagePiece || 0,
            totalPieces: newItem.damageTotalPieces,
            reason: 'ইনভয়েস এন্ট্রিকৃত সেলস ড্যামেজ',
            createdAt: new Date().toISOString(),
          });
        }

        // If SR invoice has return, add returned items back to stock and create return record
        if (newItem.returnTotalPieces && newItem.returnTotalPieces > 0) {
          prod.currentStock += newItem.returnTotalPieces;
          returnList.unshift({
            id: `ret-${invoice.id}-${newItem.productId}`,
            invoiceId: invoice.id,
            date: invoice.date,
            srId: invoice.srId,
            srName: invoice.srName,
            dealerName: invoice.dealerName,
            productId: newItem.productId,
            productName: newItem.productNameBn || newItem.productName,
            cartonQty: newItem.returnCarton || 0,
            pieceQty: newItem.returnPiece || 0,
            totalPieces: newItem.returnTotalPieces,
            reason: 'ইনভয়েস এন্ট্রিকৃত সেলস রিটার্ন',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // 3. Update dealer due balance if applicable
    if (invoice.dealerId && invoice.dueAmount) {
      this.updateDealerBalance(invoice.dealerId, invoice.dueAmount);
    }

    // Save updated products, damage, returns
    this.set(KEYS.PRODUCTS, products);
    this.set(KEYS.DAMAGE, damageList);
    this.set(KEYS.RETURNS, returnList);

    // Save invoice to collection
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
    } else {
      invoices.unshift(invoice);
    }
    this.set(KEYS.INVOICES, invoices);
  }

  /**
   * Deletes an invoice and cleanly restores deducted stock and adjusts balances!
   */
  public deleteInvoice(invoiceId: string): void {
    const invoices = this.getInvoices();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const products = this.getProducts();

    // Rollback stock
    for (const item of invoice.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.totalPieces;
        if (item.damageTotalPieces) {
          prod.currentStock += item.damageTotalPieces;
        }
        if (item.returnTotalPieces) {
          prod.currentStock -= item.returnTotalPieces;
        }
      }
    }

    // Rollback dealer due balance
    if (invoice.dealerId && invoice.dueAmount) {
      this.updateDealerBalance(invoice.dealerId, -invoice.dueAmount);
    }

    // Clean up attached damage & return records
    const damageList = this.get<DamageRecord[]>(KEYS.DAMAGE, []).filter(d => d.invoiceId !== invoiceId);
    const returnList = this.get<ReturnRecord[]>(KEYS.RETURNS, []).filter(r => r.invoiceId !== invoiceId);

    this.set(KEYS.PRODUCTS, products);
    this.set(KEYS.DAMAGE, damageList);
    this.set(KEYS.RETURNS, returnList);
    this.set(KEYS.INVOICES, invoices.filter(i => i.id !== invoiceId));
  }

  // --- Purchases Management ---
  public getPurchases(): Purchase[] {
    return this.get<Purchase[]>(KEYS.PURCHASES, []);
  }

  public savePurchase(purchase: Purchase): void {
    const products = this.getProducts();

    // Increment stock for each purchased item
    for (const item of purchase.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.totalPieces;
      }
    }

    this.set(KEYS.PRODUCTS, products);

    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.set(KEYS.PURCHASES, purchases);
  }

  public deletePurchase(purchaseId: string): void {
    const purchases = this.getPurchases();
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const products = this.getProducts();
    for (const item of purchase.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock -= item.totalPieces;
      }
    }

    this.set(KEYS.PRODUCTS, products);
    this.set(KEYS.PURCHASES, purchases.filter(p => p.id !== purchaseId));
  }

  // --- Damage Records ---
  public getDamageRecords(): DamageRecord[] {
    return this.get<DamageRecord[]>(KEYS.DAMAGE, []);
  }

  public logDirectDamage(damage: DamageRecord): void {
    const products = this.getProducts();
    const prod = products.find(p => p.id === damage.productId);
    if (prod) {
      prod.currentStock -= damage.totalPieces;
      this.set(KEYS.PRODUCTS, products);
    }

    const list = this.getDamageRecords();
    list.unshift(damage);
    this.set(KEYS.DAMAGE, list);
  }

  public deleteDamageRecord(id: string): void {
    const list = this.getDamageRecords();
    const record = list.find(r => r.id === id);
    if (!record) return;

    const products = this.getProducts();
    const prod = products.find(p => p.id === record.productId);
    if (prod) {
      prod.currentStock += record.totalPieces;
      this.set(KEYS.PRODUCTS, products);
    }

    this.set(KEYS.DAMAGE, list.filter(r => r.id !== id));
  }

  // --- Return Records ---
  public getReturnRecords(): ReturnRecord[] {
    return this.get<ReturnRecord[]>(KEYS.RETURNS, []);
  }

  public logDirectReturn(returnRec: ReturnRecord): void {
    const products = this.getProducts();
    const prod = products.find(p => p.id === returnRec.productId);
    if (prod) {
      prod.currentStock += returnRec.totalPieces;
      this.set(KEYS.PRODUCTS, products);
    }

    const list = this.getReturnRecords();
    list.unshift(returnRec);
    this.set(KEYS.RETURNS, list);
  }

  public deleteReturnRecord(id: string): void {
    const list = this.getReturnRecords();
    const record = list.find(r => r.id === id);
    if (!record) return;

    const products = this.getProducts();
    const prod = products.find(p => p.id === record.productId);
    if (prod) {
      prod.currentStock -= record.totalPieces;
      this.set(KEYS.PRODUCTS, products);
    }

    this.set(KEYS.RETURNS, list.filter(r => r.id !== id));
  }

  // --- Stock Adjustments History ---
  public getStockAdjustments(): StockAdjustment[] {
    return this.get<StockAdjustment[]>(KEYS.ADJUSTMENTS, []);
  }

  // --- Next Sequential Invoice Number Generator ---
  public generateNextInvoiceNumber(type: 'dealer' | 'sr'): string {
    const settings = this.getSettings();
    const invoices = this.getInvoices();
    const prefix = settings.invoicePrefix || 'PFP';
    const year = new Date().getFullYear();
    const typeTag = type === 'sr' ? 'SR' : 'DLR';

    const count = invoices.filter(i => i.invoiceType === type).length + 1;
    const padded = count.toString().padStart(4, '0');
    return `${prefix}-${typeTag}-${year}-${padded}`;
  }

  public generateNextPurchaseNumber(): string {
    const purchases = this.getPurchases();
    const year = new Date().getFullYear();
    const count = purchases.length + 1;
    return `PUR-${year}-${count.toString().padStart(4, '0')}`;
  }

  // --- Full Backup & Restore ---
  public exportFullBackup(): string {
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      company: this.getSettings(),
      locks: this.getFeatureLocks(),
      products: this.getProducts(),
      dealers: this.getDealers(),
      srs: this.getSRs(),
      invoices: this.getInvoices(),
      purchases: this.getPurchases(),
      damage: this.getDamageRecords(),
      returns: this.getReturnRecords(),
      adjustments: this.getStockAdjustments(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  public restoreFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !Array.isArray(data.products)) {
        return { success: false, message: 'Invalid backup file format: missing products table.' };
      }

      if (data.company) this.set(KEYS.SETTINGS, data.company);
      if (data.locks) this.set(KEYS.LOCKS, data.locks);
      if (data.products) this.set(KEYS.PRODUCTS, data.products);
      if (data.dealers) this.set(KEYS.DEALERS, data.dealers);
      if (data.srs) this.set(KEYS.SRS, data.srs);
      if (data.invoices) this.set(KEYS.INVOICES, data.invoices);
      if (data.purchases) this.set(KEYS.PURCHASES, data.purchases);
      if (data.damage) this.set(KEYS.DAMAGE, data.damage);
      if (data.returns) this.set(KEYS.RETURNS, data.returns);
      if (data.adjustments) this.set(KEYS.ADJUSTMENTS, data.adjustments);

      return { success: true, message: 'Backup restored successfully.' };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown parsing error';
      return { success: false, message: `Restore failed: ${errMsg}` };
    }
  }

  public resetToFactoryDefaults(): void {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.DEALERS);
    localStorage.removeItem(KEYS.SRS);
    localStorage.removeItem(KEYS.INVOICES);
    localStorage.removeItem(KEYS.PURCHASES);
    localStorage.removeItem(KEYS.DAMAGE);
    localStorage.removeItem(KEYS.RETURNS);
    localStorage.removeItem(KEYS.ADJUSTMENTS);
    localStorage.removeItem(KEYS.LOCKS);
    this.initDatabase();
    this.notifyListeners(KEYS.PRODUCTS);
  }
}

export const db = new StorageEngine();
