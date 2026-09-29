import React, { useState } from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage, Purchase, PurchaseItem, Product } from '../../types';
import {
  formatCurrency,
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Calendar,
  Truck,
  Hash,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onPurchaseSaved?: () => void;
}

export const PurchaseEntryView: React.FC<Props> = ({ lang, onPurchaseSaved }) => {
  const products = db.getProducts();
  const [purchases, setPurchases] = useState<Purchase[]>(() => db.getPurchases());

  const [date, setDate] = useState(getTodayDateString());
  const [purchaseNumber] = useState(db.generateNextPurchaseNumber());
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [successMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Purchase items
  const [items, setItems] = useState<PurchaseItem[]>(() => {
    if (products.length > 0) {
      const p = products[0];
      return [
        {
          productId: p.id,
          productName: p.name,
          productNameBn: p.nameBn,
          piecesPerCarton: p.piecesPerCarton,
          cartonQty: 5,
          pieceQty: 0,
          totalPieces: 5 * p.piecesPerCarton,
          purchasePricePerPiece: Math.round(p.tradePrice * 0.85),
          lineTotal: Math.round(5 * p.piecesPerCarton * p.tradePrice * 0.85),
        },
      ];
    }
    return [];
  });

  const refreshPurchases = () => {
    setPurchases(db.getPurchases());
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;

    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.productId = prod.id;
      item.productName = prod.name;
      item.productNameBn = prod.nameBn;
      item.piecesPerCarton = prod.piecesPerCarton;
      item.totalPieces = item.cartonQty * prod.piecesPerCarton + item.pieceQty;
      item.purchasePricePerPiece = Math.round(prod.tradePrice * 0.85);
      item.lineTotal = Number((item.totalPieces * item.purchasePricePerPiece).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handleQtyChange = (index: number, field: 'cartonQty' | 'pieceQty', val: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: Math.max(0, val || 0) };
      item.totalPieces = item.cartonQty * item.piecesPerCarton + item.pieceQty;
      item.lineTotal = Number((item.totalPieces * item.purchasePricePerPiece).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handlePriceChange = (index: number, price: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], purchasePricePerPiece: Math.max(0, price || 0) };
      item.lineTotal = Number((item.totalPieces * item.purchasePricePerPiece).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handleAddRow = () => {
    if (products.length === 0) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        productName: p.name,
        productNameBn: p.nameBn,
        piecesPerCarton: p.piecesPerCarton,
        cartonQty: 2,
        pieceQty: 0,
        totalPieces: 2 * p.piecesPerCarton,
        purchasePricePerPiece: Math.round(p.tradePrice * 0.85),
        lineTotal: Math.round(2 * p.piecesPerCarton * p.tradePrice * 0.85),
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCartons = items.reduce((sum, item) => sum + item.cartonQty, 0);
  const totalPieces = items.reduce((sum, item) => sum + item.totalPieces, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert(lang === 'bn' ? 'সাপ্লায়ার বা প্রস্তুতকারকের নাম লিখুন।' : 'Please enter supplier name.');
      return;
    }
    if (items.length === 0) return;

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber,
      date,
      supplierName,
      items,
      totalCartons,
      totalPieces,
      totalAmount,
      notes,
      createdAt: new Date().toISOString(),
    };

    // db.savePurchase automatically increases stock for all products!
    db.savePurchase(newPurchase);

    setSaveSuccessMsg(
      lang === 'bn'
        ? `ক্রয় রশিদ ${purchaseNumber} সংরক্ষিত হয়েছে এবং প্রতিটি পণ্যের স্টক বৃদ্ধি পেয়েছে!`
        : `Purchase ${purchaseNumber} recorded! Stock successfully increased.`
    );

    refreshPurchases();
    if (onPurchaseSaved) onPurchaseSaved();
  };

  const handleDeletePurchase = (id: string) => {
    if (
      confirm(
        lang === 'bn'
          ? 'এই ক্রয় রশিদটি মুছে ফেললে বৃদ্ধিপ্রাপ্ত স্টক পুনরায় বাদ দেওয়া হবে। আপনি কি নিশ্চিত?'
          : 'Deleting this purchase will reverse the added stock. Are you sure?'
      )
    ) {
      db.deletePurchase(id);
      refreshPurchases();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-teal-800 text-teal-200 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'নতুন পণ্য ক্রয় এন্ট্রি (Purchase Entry)' : 'Product Purchase Entry'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'সাপ্লায়ার বা কারখানা থেকে পণ্য ক্রয় সংরক্ষণ করুন; স্টক স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে'
                : 'Record factory purchases; inventory stocks will be credited instantly'}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePurchase} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'bn' ? 'ক্রয় নম্বর (Purchase No)' : 'Purchase #'}</span>
              </label>
              <input
                type="text"
                readOnly
                value={purchaseNumber}
                className="w-full p-2 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'bn' ? 'ক্রয় তারিখ' : 'Purchase Date'}</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'bn' ? 'সাপ্লায়ার / মিলের নাম' : 'Supplier / Factory Name'}</span>
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder={lang === 'bn' ? 'e.g. প্রাণ অ্যাগ্রো, সিটি মিলস...' : 'Supplier name...'}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-2 text-center w-10">ক্র.</th>
                  <th className="py-2 px-3 min-w-[200px]">Product Name</th>
                  <th className="py-2 px-2 text-center w-24">Carton</th>
                  <th className="py-2 px-2 text-center w-24">Piece</th>
                  <th className="py-2 px-2 text-center w-24 bg-slate-50">মোট পিস</th>
                  <th className="py-2 px-2 text-right w-28">Purchase Price/Pc</th>
                  <th className="py-2 px-3 text-right w-32 bg-slate-50">Line Total</th>
                  <th className="py-2 px-2 text-center w-10">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 text-center font-mono text-slate-500">
                      {lang === 'bn' ? toBengaliNumber(idx + 1) : idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-md font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameBn || p.name} (১ctn={p.piecesPerCarton}pcs | বর্তমান স্টক: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.cartonQty}
                        onChange={(e) => handleQtyChange(idx, 'cartonQty', parseInt(e.target.value, 10))}
                        className="w-full text-center p-1.5 font-mono-num font-semibold bg-white border border-slate-300 rounded-md"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.pieceQty}
                        onChange={(e) => handleQtyChange(idx, 'pieceQty', parseInt(e.target.value, 10))}
                        className="w-full text-center p-1.5 font-mono-num font-semibold bg-white border border-slate-300 rounded-md"
                      />
                    </td>
                    <td className="py-2 px-2 text-center font-mono-num font-bold text-slate-800 bg-slate-50">
                      {formatNumber(item.totalPieces, lang)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.purchasePricePerPiece}
                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value))}
                        className="w-full text-right p-1.5 font-mono-num font-bold bg-white border border-slate-300 rounded-md text-slate-800"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num font-bold text-slate-900 bg-slate-50">
                      {formatCurrency(item.lineTotal, lang)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '+ নতুন রো যোগ করুন' : '+ Add Row'}</span>
            </button>

            <div className="text-right text-xs">
              <span className="text-slate-500 mr-2">
                মোট {formatNumber(totalCartons, lang)} কার্টুন + {formatNumber(totalPieces, lang)} পিস |
              </span>
              <span className="font-semibold text-slate-700">সর্বমোট ক্রয়মূল্য: </span>
              <span className="text-base font-bold text-emerald-900 font-mono-num">
                {formatCurrency(totalAmount, lang)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ক্রয় সংরক্ষণ করুন ও স্টক বৃদ্ধি করুন' : 'Save Purchase & Increase Stock'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Past Purchases List */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3">
          {lang === 'bn' ? 'পূর্ববর্তী ক্রয় রশিদের ইতিহাস' : 'Previous Purchases History'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Purchase #</th>
                <th className="py-2 px-3">তারিখ</th>
                <th className="py-2 px-3">সাপ্লায়ার</th>
                <th className="py-2 px-3 text-right">মোট কার্টুন</th>
                <th className="py-2 px-3 text-right">মোট পিস</th>
                <th className="py-2 px-3 text-right">মোট টাকা</th>
                <th className="py-2 px-3 text-center">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{p.purchaseNumber}</td>
                  <td className="py-2.5 px-3 text-slate-600">{toBengaliNumber(p.date)}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{p.supplierName}</td>
                  <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(p.totalCartons, lang)}</td>
                  <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(p.totalPieces, lang)}</td>
                  <td className="py-2.5 px-3 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(p.totalAmount, lang)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDeletePurchase(p.id)}
                      className="p-1 text-slate-400 hover:text-red-700 rounded-md"
                      title="Delete purchase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো ক্রয়ের তথ্য নেই' : 'No purchase records'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
