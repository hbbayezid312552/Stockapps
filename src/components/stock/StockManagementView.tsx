import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage, Product } from '../../types';
import {
  formatCartonPieceDisplay,
  formatCurrency,
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  Package,
  Plus,
  AlertTriangle,
  Sliders,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onNavigateToPurchase?: () => void;
}

export const StockManagementView: React.FC<Props> = ({ lang, onNavigateToPurchase }) => {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // New/Edit product form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('Oil');
  const [piecesPerCarton, setPiecesPerCarton] = useState(12);
  const [tradePrice, setTradePrice] = useState(200);
  const [defaultMarginPercent, setDefaultMarginPercent] = useState(10);
  const [dealerPrice, setDealerPrice] = useState(180);
  const [mrp, setMrp] = useState(220);
  const [minStockLevel, setMinStockLevel] = useState(50);
  const [openingStock, setOpeningStock] = useState(100);

  // Adjustment form state
  const [adjType, setAdjType] = useState<'add' | 'subtract'>('add');
  const [adjCartons, setAdjCartons] = useState(0);
  const [adjPieces, setAdjPieces] = useState(0);
  const [adjReason, setAdjReason] = useState('');

  const refreshProducts = () => {
    setProducts(db.getProducts());
  };

  const purchases = db.getPurchases();
  const invoices = db.getInvoices();
  const damages = db.getDamageRecords();
  const returns = db.getReturnRecords();
  const adjustments = db.getStockAdjustments();

  // Helper to compute breakdown for each product
  const getProductBreakdown = (prodId: string) => {
    // Total Purchases
    const purchasedPieces = purchases.reduce((sum, pur) => {
      const it = pur.items.find((i) => i.productId === prodId);
      return sum + (it ? it.totalPieces : 0);
    }, 0);

    // Total Sales
    const soldPieces = invoices.reduce((sum, inv) => {
      const it = inv.items.find((i) => i.productId === prodId);
      return sum + (it ? it.totalPieces : 0);
    }, 0);

    // Total Damage
    const damagedPieces = damages
      .filter((d) => d.productId === prodId)
      .reduce((sum, d) => sum + d.totalPieces, 0);

    // Total Return
    const returnedPieces = returns
      .filter((r) => r.productId === prodId)
      .reduce((sum, r) => sum + r.totalPieces, 0);

    // Total Adjustments
    const netAdjustmentPieces = adjustments
      .filter((a) => a.productId === prodId)
      .reduce((sum, a) => sum + (a.type === 'add' ? a.totalPieces : -a.totalPieces), 0);

    return {
      purchasedPieces,
      soldPieces,
      damagedPieces,
      returnedPieces,
      netAdjustmentPieces,
    };
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setCode(`P-${products.length + 101}`);
    setName('');
    setNameBn('');
    setCategory('Oil');
    setPiecesPerCarton(12);
    setTradePrice(200);
    setDefaultMarginPercent(10);
    setDealerPrice(180);
    setMrp(220);
    setMinStockLevel(48);
    setOpeningStock(120);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setNameBn(p.nameBn);
    setCategory(p.category);
    setPiecesPerCarton(p.piecesPerCarton);
    setTradePrice(p.tradePrice);
    setDefaultMarginPercent(p.defaultMarginPercent);
    setDealerPrice(p.dealerPrice);
    setMrp(p.mrp);
    setMinStockLevel(p.minStockLevel);
    setOpeningStock(p.openingStock);
    setShowProductModal(true);
  };

  const handleMarginChange = (margin: number) => {
    setDefaultMarginPercent(margin);
    const dp = tradePrice - (tradePrice * margin) / 100;
    setDealerPrice(Number(dp.toFixed(2)));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !nameBn.trim()) return;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        code,
        name: name || nameBn,
        nameBn: nameBn || name,
        category,
        piecesPerCarton,
        tradePrice,
        defaultMarginPercent,
        dealerPrice,
        mrp,
        minStockLevel,
      };
      db.saveProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        code,
        name: name || nameBn,
        nameBn: nameBn || name,
        category,
        piecesPerCarton,
        tradePrice,
        defaultMarginPercent,
        dealerPrice,
        mrp,
        minStockLevel,
        openingStock,
        currentStock: openingStock,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.saveProduct(newProd);
    }

    setShowProductModal(false);
    refreshProducts();
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত এই পণ্যটি ডিলিট করতে চান?' : 'Delete this product?')) {
      db.deleteProduct(productId);
      refreshProducts();
    }
  };

  const handleOpenAdjustment = (prod: Product) => {
    setAdjustingProduct(prod);
    setAdjType('add');
    setAdjCartons(0);
    setAdjPieces(0);
    setAdjReason(lang === 'bn' ? 'ফিজিক্যাল স্টক অডিট সমন্বয়' : 'Stock audit adjustment');
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const totalDiffPieces = adjCartons * adjustingProduct.piecesPerCarton + adjPieces;
    if (totalDiffPieces <= 0) return;

    const signedDiff = adjType === 'add' ? totalDiffPieces : -totalDiffPieces;
    db.adjustProductStockDirect(adjustingProduct.id, signedDiff, adjReason);

    setShowAdjustmentModal(false);
    refreshProducts();
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.nameBn.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-800 text-teal-200 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {lang === 'bn' ? 'স্টক ও ইনভেন্টরি ম্যানেজমেন্ট' : 'Stock & Inventory Management'}
              </h1>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'ওপেনিং, ক্রয় (+), বিক্রয় (-), ড্যামেজ (-), রিটার্ন (+) এবং সমন্বয়সহ সঠিক বর্তমান মজুদ'
                  : 'Opening + Purchase - Sales - Damage + Return = Live Stock tracking'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToPurchase && (
              <button
                onClick={onNavigateToPurchase}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {lang === 'bn' ? '+ নতুন ক্রয় এন্ট্রি' : '+ Purchase Entry'}
              </button>
            )}
            <button
              onClick={handleOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? '+ নতুন পণ্য যোগ' : '+ Add Product'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 pt-3 border-t border-slate-100 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'পণ্যের নাম বা কোড খুঁজুন...' : 'Search by product name or code...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Stock Master Table (Requirement 11) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2 text-center w-10">ক্র.</th>
                <th className="py-2.5 px-3 min-w-[200px]">Product Name & Code</th>
                <th className="py-2.5 px-2 text-center w-20">১ কার্টুন</th>
                <th className="py-2.5 px-2 text-right w-20">Opening</th>
                <th className="py-2.5 px-2 text-right w-20 text-emerald-700">Purchase (+)</th>
                <th className="py-2.5 px-2 text-right w-20 text-blue-700">Sales (-)</th>
                <th className="py-2.5 px-2 text-right w-20 text-red-600">Damage (-)</th>
                <th className="py-2.5 px-2 text-right w-20 text-amber-700">Return (+)</th>
                <th className="py-2.5 px-2 text-right w-20">Adj (±)</th>
                <th className="py-2.5 px-3 text-right min-w-[130px] bg-slate-50 font-bold">Current Stock</th>
                <th className="py-2.5 px-2 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p, idx) => {
                const isLow = p.currentStock <= p.minStockLevel;
                const stats = getProductBreakdown(p.id);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isLow ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-2 text-center font-mono text-slate-500">
                      {lang === 'bn' ? toBengaliNumber(idx + 1) : idx + 1}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{p.nameBn}</span>
                        {isLow && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 border border-red-200"
                            title="Low Stock Alert"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {lang === 'bn' ? 'স্বল্প স্টক' : 'Low Stock'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {p.code} · T.P: ৳{p.tradePrice} · D.P: ৳{p.dealerPrice}
                      </div>
                    </td>

                    {/* Pieces Per Carton */}
                    <td className="py-3 px-2 text-center font-mono-num text-slate-600">
                      {formatNumber(p.piecesPerCarton, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
                    </td>

                    {/* Opening Stock */}
                    <td className="py-3 px-2 text-right font-mono-num text-slate-600">
                      {formatNumber(p.openingStock, lang)}
                    </td>

                    {/* Purchase (+) */}
                    <td className="py-3 px-2 text-right font-mono-num font-medium text-emerald-700">
                      +{formatNumber(stats.purchasedPieces, lang)}
                    </td>

                    {/* Sales (-) */}
                    <td className="py-3 px-2 text-right font-mono-num font-medium text-blue-700">
                      -{formatNumber(stats.soldPieces, lang)}
                    </td>

                    {/* Damage (-) */}
                    <td className="py-3 px-2 text-right font-mono-num text-red-600">
                      {stats.damagedPieces > 0 ? `-${formatNumber(stats.damagedPieces, lang)}` : '০'}
                    </td>

                    {/* Return (+) */}
                    <td className="py-3 px-2 text-right font-mono-num text-amber-700">
                      {stats.returnedPieces > 0 ? `+${formatNumber(stats.returnedPieces, lang)}` : '০'}
                    </td>

                    {/* Adjustment */}
                    <td className="py-3 px-2 text-right font-mono-num text-slate-500">
                      {stats.netAdjustmentPieces !== 0
                        ? `${stats.netAdjustmentPieces > 0 ? '+' : ''}${formatNumber(stats.netAdjustmentPieces, lang)}`
                        : '০'}
                    </td>

                    {/* Current Stock (Dual Display: Cartons + loose Pieces & Total Pieces) */}
                    <td className="py-3 px-3 text-right bg-slate-50">
                      <div
                        className={`font-mono-num font-bold text-sm ${
                          isLow ? 'text-red-700' : 'text-emerald-900'
                        }`}
                      >
                        {formatNumber(p.currentStock, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {formatCartonPieceDisplay(p.currentStock, p.piecesPerCarton, lang)}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Adjust Stock */}
                        <button
                          onClick={() => handleOpenAdjustment(p)}
                          className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-md transition"
                          title={lang === 'bn' ? 'স্টক সমন্বয়' : 'Stock Adjustment'}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                          title={lang === 'bn' ? 'এডিট' : 'Edit'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                          title={lang === 'bn' ? 'মুছুন' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct
                  ? lang === 'bn'
                    ? 'পণ্য সম্পাদনা (Edit Product)'
                    : 'Edit Product'
                  : lang === 'bn'
                  ? 'নতুন পণ্য যোগ করুন (Add Product)'
                  : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'পণ্য কোড (Product Code)' : 'Product Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  >
                    <option value="Oil">Oil (তেল)</option>
                    <option value="Spices">Spices (মসলা)</option>
                    <option value="Snacks">Snacks (চানাচুর/নুডুলস)</option>
                    <option value="Bakery">Bakery (বিস্কুট/টোস্ট)</option>
                    <option value="General">General (অন্যান্য)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পণ্যের নাম (বাংলা)' : 'Product Name (Bengali)'}
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="সরিষার তেল ১ লিটার..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পণ্যের নাম (ইংরেজি)' : 'Product Name (English)'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mustard Oil 1 Liter..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? '১ কার্টুনে কত পিস?' : 'Pieces Per Carton'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={piecesPerCarton}
                    onChange={(e) => setPiecesPerCarton(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ন্যূনতম অ্যালার্ট স্টক (Min Stock)' : 'Min Stock Alert'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'T.P (ট্রেড মূল্য)' : 'Trade Price (T.P)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={tradePrice}
                    onChange={(e) => {
                      const tp = parseFloat(e.target.value) || 0;
                      setTradePrice(tp);
                      const dp = tp - (tp * defaultMarginPercent) / 100;
                      setDealerPrice(Number(dp.toFixed(2)));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ডিফল্ট ছাড় %' : 'Margin %'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    required
                    value={defaultMarginPercent}
                    onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'D.P (ডিলার মূল্য)' : 'Dealer Price (D.P)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={dealerPrice}
                    onChange={(e) => setDealerPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-md font-mono font-bold text-emerald-900"
                  />
                </div>
              </div>

              {!editingProduct && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'প্রাথমিক ওপেনিং স্টক (Opening Pieces)' : 'Opening Stock (Pieces)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={openingStock}
                    onChange={(e) => setOpeningStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'bn' ? 'স্টক অ্যাডজাস্টমেন্ট / সমন্বয়' : 'Stock Adjustment'}
              </h3>
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 mt-4">
              <p className="font-semibold text-slate-800 text-sm">
                {adjustingProduct.nameBn || adjustingProduct.name}
              </p>
              <p className="text-slate-500">
                বর্তমান মজুদ: <strong>{adjustingProduct.currentStock} পিস</strong> (১ কার্টুন = {adjustingProduct.piecesPerCarton} পিস)
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সমন্বয়ের ধরন' : 'Adjustment Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('add')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      adjType === 'add'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {lang === 'bn' ? '+ বৃদ্ধি করুন (Add)' : '+ Add Stock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('subtract')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      adjType === 'subtract'
                        ? 'bg-red-100 text-red-900 border-red-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {lang === 'bn' ? '- কমান (Subtract)' : '- Subtract Stock'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কার্টুন</label>
                  <input
                    type="number"
                    min="0"
                    value={adjCartons}
                    onChange={(e) => setAdjCartons(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পিস</label>
                  <input
                    type="number"
                    min="0"
                    value={adjPieces}
                    onChange={(e) => setAdjPieces(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সমন্বয়ের কারণ' : 'Reason for Adjustment'}
                </label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder={lang === 'bn' ? 'ফিজিক্যাল অডিটে উদ্বৃত্ত/ঘাটতি...' : 'Audit variance...'}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs"
                >
                  {lang === 'bn' ? 'সমন্বয় প্রয়োগ করুন' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
