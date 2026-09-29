import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage, SalesRepresentative, Product, Invoice } from '../../types';
import {
  formatCurrency,
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Target,
  Phone,
  MapPin,
  Calendar,
  X,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onNavigateToInvoice?: (srId: string) => void;
}

export const SRManagementView: React.FC<Props> = ({ lang, onNavigateToInvoice }) => {
  const products = db.getProducts();
  const [srs, setSRs] = useState<SalesRepresentative[]>(() => db.getSRs());
  const [showModal, setShowModal] = useState(false);
  const [editingSR, setEditingSR] = useState<SalesRepresentative | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [srCode, setSrCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [areaRoute, setAreaRoute] = useState('');
  const [joiningDate, setJoiningDate] = useState('2026-01-01');
  const [monthlyTarget, setMonthlyTarget] = useState(500000);
  const [productTargets, setProductTargets] = useState<Record<string, number>>({});

  // Detail Modal for Product Specific Targets
  const [selectedSRForTargetModal, setSelectedSRForTargetModal] = useState<SalesRepresentative | null>(null);

  const refreshSRs = () => {
    setSRs(db.getSRs());
  };

  const invoices = db.getInvoices();
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonth}`;

  // Helper to compute an SR's sales this month
  const getSRPerformance = (srId: string) => {
    const srInvoices = invoices.filter(
      (i) => i.srId === srId && i.date.startsWith(monthPrefix)
    );
    const totalSalesAmount = srInvoices.reduce((sum, i) => sum + (i.netAmount || 0), 0);
    const totalDamagePieces = srInvoices.reduce(
      (sum, i) => sum + (i.totalDamagePieces || 0),
      0
    );
    const totalReturnPieces = srInvoices.reduce(
      (sum, i) => sum + (i.totalReturnPieces || 0),
      0
    );

    // Product-wise sales breakdown for this SR
    const productSoldMap: Record<string, number> = {};
    srInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const netPieces = item.netSoldPieces ?? item.totalPieces;
        productSoldMap[item.productId] =
          (productSoldMap[item.productId] || 0) + netPieces;
      });
    });

    return {
      totalSalesAmount,
      totalDamagePieces,
      totalReturnPieces,
      productSoldMap,
      invoiceCount: srInvoices.length,
    };
  };

  const handleOpenAdd = () => {
    setEditingSR(null);
    setSrCode(`SR-${srs.length + 101}`);
    setName('');
    setMobile('');
    setAreaRoute('');
    setJoiningDate('2026-01-01');
    setMonthlyTarget(500000);
    setProductTargets({});
    setShowModal(true);
  };

  const handleOpenEdit = (s: SalesRepresentative) => {
    setEditingSR(s);
    setSrCode(s.srCode);
    setName(s.name);
    setMobile(s.mobile);
    setAreaRoute(s.areaRoute);
    setJoiningDate(s.joiningDate);
    setMonthlyTarget(s.monthlyTarget);
    setProductTargets(s.productTargets || {});
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSR) {
      const updated: SalesRepresentative = {
        ...editingSR,
        srCode,
        name,
        mobile,
        areaRoute,
        joiningDate,
        monthlyTarget,
        productTargets,
      };
      db.saveSR(updated);
    } else {
      const newSR: SalesRepresentative = {
        id: `sr-${Date.now()}`,
        srCode,
        name,
        mobile,
        areaRoute,
        joiningDate,
        monthlyTarget,
        productTargets,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.saveSR(newSR);
    }

    setShowModal(false);
    refreshSRs();
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত এই এস.আরকে মুছে ফেলতে চান?' : 'Delete this SR?')) {
      db.deleteSR(id);
      refreshSRs();
    }
  };

  const handleSaveProductTargets = (sr: SalesRepresentative, updatedTargets: Record<string, number>) => {
    const updated = { ...sr, productTargets: updatedTargets };
    db.saveSR(updated);
    refreshSRs();
    setSelectedSRForTargetModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'এস.আর ব্যবস্থাপনা ও বিক্রয় লক্ষ্যমাত্রা' : 'S.R & Monthly Target Management'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'এস.আর প্রোফাইল, মাসিক মোট টার্গেট, পণ্যভিত্তিক টার্গেট ও অর্জন % স্বয়ংক্রিয় হিসাব'
                : 'SR profiles, monthly targets, product-specific quotas and real-time achievement'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? '+ নতুন এস.আর যোগ' : '+ Add S.R'}</span>
        </button>
      </div>

      {/* S.R Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {srs.map((sr) => {
          const perf = getSRPerformance(sr.id);
          const achievementPct =
            sr.monthlyTarget > 0
              ? Math.min(100, Math.round((perf.totalSalesAmount / sr.monthlyTarget) * 100))
              : 0;

          return (
            <div
              key={sr.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {sr.srCode}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1">{sr.name}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{sr.areaRoute}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sr)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sr.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact & Meta */}
                <div className="my-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sr.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>যোগদান: {toBengaliNumber(sr.joiningDate)}</span>
                  </div>
                </div>

                {/* Monthly Target & Achievement Box (Requirement 19) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 my-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{lang === 'bn' ? 'চলতি মাসের টার্গেট:' : 'Monthly Target:'}</span>
                    </span>
                    <span className="font-mono-num font-bold text-emerald-800 text-sm">
                      {formatNumber(achievementPct, lang)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1.5">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        achievementPct >= 80 ? 'bg-emerald-600' : achievementPct >= 50 ? 'bg-amber-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${achievementPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>
                      {lang === 'bn' ? 'বিক্রয়:' : 'Sales:'}{' '}
                      <strong className="text-slate-800 font-mono-num">
                        {formatCurrency(perf.totalSalesAmount, lang)}
                      </strong>
                    </span>
                    <span>
                      {lang === 'bn' ? 'টার্গেট:' : 'Target:'}{' '}
                      <strong className="text-slate-800 font-mono-num">
                        {formatCurrency(sr.monthlyTarget, lang)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Product-Specific Targets Summary (Requirement 20) */}
                <div className="mt-3 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700">
                      {lang === 'bn' ? 'পণ্যভিত্তিক টার্গেট (Product Quota)' : 'Product Quotas'}
                    </span>
                    <button
                      onClick={() => setSelectedSRForTargetModal(sr)}
                      className="text-[11px] font-semibold text-emerald-800 hover:underline"
                    >
                      {lang === 'bn' ? 'টার্গেট সেট করুন' : 'Configure'}
                    </button>
                  </div>

                  {sr.productTargets && Object.keys(sr.productTargets).length > 0 ? (
                    <div className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
                      {Object.entries(sr.productTargets).map(([prodId, targetPieces]) => {
                        const prod = products.find((p) => p.id === prodId);
                        if (!prod) return null;
                        const actualSold = perf.productSoldMap[prodId] || 0;
                        const prodAchieve =
                          targetPieces > 0
                            ? Math.min(100, Math.round((actualSold / targetPieces) * 100))
                            : 0;

                        return (
                          <div key={prodId} className="text-[11px]">
                            <div className="flex justify-between text-slate-700">
                              <span className="font-medium truncate max-w-[140px]">
                                {prod.nameBn || prod.name}
                              </span>
                              <span className="font-mono-num">
                                {formatNumber(actualSold, lang)} / {formatNumber(targetPieces, lang)} পিস ({formatNumber(prodAchieve, lang)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1 mt-0.5">
                              <div
                                className="bg-emerald-600 h-1 rounded-full"
                                style={{ width: `${prodAchieve}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      {lang === 'bn' ? 'কোনো নির্দিষ্ট পণ্যের টার্গেট এখনও সেট করা হয়নি।' : 'No product quotas set.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  চালান সংখ্যা: <strong>{formatNumber(perf.invoiceCount, lang)}</strong>টি
                </span>
                {onNavigateToInvoice && (
                  <button
                    onClick={() => onNavigateToInvoice(sr.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200"
                  >
                    {lang === 'bn' ? 'এস.আর চালান তৈরি' : 'Create Invoice'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Target Config Modal (Requirement 20) */}
      {selectedSRForTargetModal && (
        <ProductTargetConfigModal
          sr={selectedSRForTargetModal}
          products={products}
          lang={lang}
          onClose={() => setSelectedSRForTargetModal(null)}
          onSave={(targets) => handleSaveProductTargets(selectedSRForTargetModal, targets)}
        />
      )}

      {/* Add / Edit S.R Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingSR
                  ? lang === 'bn' ? 'এস.আর তথ্য পরিবর্তন' : 'Edit S.R'
                  : lang === 'bn' ? 'নতুন এস.আর যোগ করুন' : 'Add New S.R'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'এস.আর আইডি / কোড' : 'S.R Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={srCode}
                    onChange={(e) => setSrCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="01710-XXXXXX"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'এস.আর-এর নাম' : 'S.R Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="মোঃ আমানুল্লাহ আমান..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'নির্ধারিত রুট / মার্কেট এলাকা' : 'Assigned Route / Market Area'}
                </label>
                <input
                  type="text"
                  required
                  value={areaRoute}
                  onChange={(e) => setAreaRoute(e.target.value)}
                  placeholder="Kichok - Shibganj..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'মাসিক টার্গেট (টাকা)' : 'Monthly Target (BDT)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save S.R'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for product-specific targets (Requirement 20)
const ProductTargetConfigModal: React.FC<{
  sr: SalesRepresentative;
  products: Product[];
  lang: AppLanguage;
  onClose: () => void;
  onSave: (targets: Record<string, number>) => void;
}> = ({ sr, products, lang, onClose, onSave }) => {
  const [targets, setTargets] = useState<Record<string, number>>(() => ({
    ...(sr.productTargets || {}),
  }));

  const handleQtyChange = (productId: string, val: number) => {
    setTargets((prev) => ({
      ...prev,
      [productId]: Math.max(0, val || 0),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(targets);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {sr.name} — {lang === 'bn' ? 'পণ্যভিত্তিক বিক্রয় লক্ষ্যমাত্রা' : 'Product Quota Targets'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'bn'
                ? 'নির্দিষ্ট পণ্যের মাসিক লক্ষ্যমাত্রা (পিস হিসাবে) নির্ধারণ করুন'
                : 'Set target pieces for specific products this month'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div>
                <p className="font-semibold text-slate-800">{p.nameBn || p.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {p.code} · ১ctn={p.piecesPerCarton}pcs
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={targets[p.id] || 0}
                  onChange={(e) => handleQtyChange(p.id, parseInt(e.target.value, 10) || 0)}
                  className="w-24 text-center py-1.5 px-2 bg-white border border-slate-300 rounded-md font-mono font-bold"
                />
                <span className="text-slate-500 font-medium">পিস</span>
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs"
            >
              {lang === 'bn' ? 'টার্গেট সংরক্ষণ করুন' : 'Save Quotas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
