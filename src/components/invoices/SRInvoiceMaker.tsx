import React, { useState } from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage, Invoice, InvoiceItem, SalesRepresentative } from '../../types';
import {
  formatCurrency,
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Receipt,
  CheckCircle2,
  Calendar,
  Hash,
  UserCheck,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';

interface Props {
  lang: AppLanguage;
  onInvoiceSaved?: (invoiceId: string) => void;
  editingInvoice?: Invoice | null;
  onCancelEdit?: () => void;
}

export const SRInvoiceMaker: React.FC<Props> = ({
  lang,
  onInvoiceSaved,
  editingInvoice,
  onCancelEdit,
}) => {
  const products = db.getProducts();
  const srs = db.getSRs();
  const settings = db.getSettings();

  const [date, setDate] = useState(editingInvoice?.date || getTodayDateString());
  const [invoiceNumber] = useState(
    editingInvoice?.invoiceNumber || db.generateNextInvoiceNumber('sr')
  );
  const [selectedSRId, setSelectedSRId] = useState<string>(
    editingInvoice?.srId || (srs.length > 0 ? srs[0].id : '')
  );
  const [customerOrShopName, setCustomerOrShopName] = useState(
    editingInvoice?.dealerName || ''
  );
  const [route, setRoute] = useState(
    editingInvoice?.route || (srs.length > 0 ? srs[0].areaRoute : '')
  );
  const [notes, setNotes] = useState(editingInvoice?.notes || '');
  const [paidAmount, setPaidAmount] = useState<number>(editingInvoice?.paidAmount || 0);

  const selectedSR: SalesRepresentative | undefined = srs.find((s) => s.id === selectedSRId);

  // Sync route if SR changes
  const handleSRSelect = (srId: string) => {
    setSelectedSRId(srId);
    const sr = srs.find((s) => s.id === srId);
    if (sr) {
      setRoute(sr.areaRoute);
    }
  };

  // Initial items
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (editingInvoice && editingInvoice.items.length > 0) {
      return editingInvoice.items;
    }
    if (products.length > 0) {
      const p = products[0];
      const defaultDiscount = p.defaultMarginPercent || settings.defaultDiscountPercent || 10;
      const dp = p.tradePrice - (p.tradePrice * defaultDiscount) / 100;
      return [
        {
          productId: p.id,
          productName: p.name,
          productNameBn: p.nameBn,
          piecesPerCarton: p.piecesPerCarton,
          cartonQty: 1,
          pieceQty: 0,
          totalPieces: p.piecesPerCarton,
          tp: p.tradePrice,
          tpPerCarton: p.tradePrice * p.piecesPerCarton,
          discountPercent: defaultDiscount,
          dp: Number(dp.toFixed(2)),
          dpPerCarton: Number((dp * p.piecesPerCarton).toFixed(2)),
          lineTotal: Number((p.piecesPerCarton * dp).toFixed(2)),
          damageCarton: 0,
          damagePiece: 0,
          damageTotalPieces: 0,
          returnCarton: 0,
          returnPiece: 0,
          returnTotalPieces: 0,
          netSoldPieces: p.piecesPerCarton,
          netLineTotal: Number((p.piecesPerCarton * dp).toFixed(2)),
        },
      ];
    }
    return [];
  });

  const [printModalInvoice, setPrintModalInvoice] = useState<Invoice | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Calculation recalculator for a row
  const recalcRow = (item: InvoiceItem): InvoiceItem => {
    const totalPieces = item.cartonQty * item.piecesPerCarton + item.pieceQty;
    const dp = item.tp - (item.tp * item.discountPercent) / 100;
    const lineTotal = totalPieces * dp;

    const damageTotalPieces =
      (item.damageCarton || 0) * item.piecesPerCarton + (item.damagePiece || 0);
    const returnTotalPieces =
      (item.returnCarton || 0) * item.piecesPerCarton + (item.returnPiece || 0);

    const netSoldPieces = Math.max(0, totalPieces - (damageTotalPieces + returnTotalPieces));
    const netLineTotal = netSoldPieces * dp;

    return {
      ...item,
      totalPieces,
      dp: Number(dp.toFixed(2)),
      dpPerCarton: Number((dp * item.piecesPerCarton).toFixed(2)),
      lineTotal: Number(lineTotal.toFixed(2)),
      damageTotalPieces,
      returnTotalPieces,
      netSoldPieces,
      netLineTotal: Number(netLineTotal.toFixed(2)),
    };
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
      item.tp = prod.tradePrice;
      item.tpPerCarton = prod.tradePrice * prod.piecesPerCarton;
      item.discountPercent = prod.defaultMarginPercent || 10;
      copy[index] = recalcRow(item);
      return copy;
    });
  };

  const handleQtyChange = (
    index: number,
    field: 'cartonQty' | 'pieceQty' | 'damagePiece' | 'returnPiece',
    val: number
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: Math.max(0, val || 0) };
      copy[index] = recalcRow(item);
      return copy;
    });
  };

  const handleDiscountChange = (index: number, discountPercent: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], discountPercent: Math.max(0, Math.min(100, discountPercent || 0)) };
      copy[index] = recalcRow(item);
      return copy;
    });
  };

  const handleDPChange = (index: number, dp: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.dp = Math.max(0, dp || 0);
      if (item.tp > 0) {
        item.discountPercent = Number((((item.tp - item.dp) / item.tp) * 100).toFixed(2));
      }
      copy[index] = recalcRow(item);
      return copy;
    });
  };

  const handleAddRow = () => {
    if (products.length === 0) return;
    const p = products[0];
    const defaultDiscount = p.defaultMarginPercent || 10;
    const dp = p.tradePrice - (p.tradePrice * defaultDiscount) / 100;

    const newItem: InvoiceItem = recalcRow({
      productId: p.id,
      productName: p.name,
      productNameBn: p.nameBn,
      piecesPerCarton: p.piecesPerCarton,
      cartonQty: 1,
      pieceQty: 0,
      totalPieces: p.piecesPerCarton,
      tp: p.tradePrice,
      tpPerCarton: p.tradePrice * p.piecesPerCarton,
      discountPercent: defaultDiscount,
      dp: Number(dp.toFixed(2)),
      dpPerCarton: Number((dp * p.piecesPerCarton).toFixed(2)),
      lineTotal: Number((p.piecesPerCarton * dp).toFixed(2)),
      damageCarton: 0,
      damagePiece: 0,
      damageTotalPieces: 0,
      returnCarton: 0,
      returnPiece: 0,
      returnTotalPieces: 0,
      netSoldPieces: p.piecesPerCarton,
      netLineTotal: Number((p.piecesPerCarton * dp).toFixed(2)),
    });

    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals
  const totalCartons = items.reduce((sum, item) => sum + item.cartonQty, 0);
  const totalPieces = items.reduce((sum, item) => sum + item.totalPieces, 0);
  const totalGrossAmount = Number(
    items.reduce((sum, item) => sum + item.totalPieces * item.tp, 0).toFixed(2)
  );
  const totalDiscount = Number(
    items
      .reduce((sum, item) => sum + (item.totalPieces * item.tp - item.lineTotal), 0)
      .toFixed(2)
  );
  const totalSalesAmount = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const totalDamagePieces = items.reduce(
    (sum, item) => sum + (item.damageTotalPieces || 0),
    0
  );
  const totalReturnPieces = items.reduce(
    (sum, item) => sum + (item.returnTotalPieces || 0),
    0
  );
  const netActualSalesAmount = Number(
    items.reduce((sum, item) => sum + (item.netLineTotal || 0), 0).toFixed(2)
  );
  const dueAmount = Number(Math.max(0, netActualSalesAmount - paidAmount).toFixed(2));

  // Build Invoice
  const buildInvoice = (): Invoice => {
    return {
      id: editingInvoice?.id || `inv-sr-${Date.now()}`,
      invoiceNumber,
      invoiceType: 'sr',
      date,
      srId: selectedSR?.id,
      srName: selectedSR?.name,
      dealerName: customerOrShopName || 'সাধারণ খুচরা বিক্রেতা / বাজার',
      route,
      items,
      totalCartons,
      totalPieces,
      totalGrossAmount,
      totalDiscount,
      netAmount: netActualSalesAmount,
      paidAmount,
      dueAmount,
      totalDamagePieces,
      totalReturnPieces,
      netActualSalesAmount,
      notes,
      createdBy: 'Admin',
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = (andPrint: boolean = false) => {
    if (items.length === 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একটি পণ্য যোগ করুন।' : 'Please add at least one product.');
      return;
    }

    const invoice = buildInvoice();
    db.saveInvoice(invoice, editingInvoice);

    setSaveSuccessMsg(
      lang === 'bn'
        ? `এস.আর চালান ${invoice.invoiceNumber} সফলভাবে সংরক্ষিত হয়েছে। ড্যামেজ ও রিটার্ন হিসাব স্বয়ংক্রিয়ভাবে সামঞ্জস্য করা হয়েছে!`
        : `S.R Invoice ${invoice.invoiceNumber} saved! Damage, return and stock auto-adjusted.`
    );

    if (andPrint) {
      setPrintModalInvoice(invoice);
    }

    if (onInvoiceSaved) {
      onInvoiceSaved(invoice.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {editingInvoice
                  ? lang === 'bn'
                    ? 'এস.আর চালান সংশোধন (Edit S.R Invoice)'
                    : 'Edit S.R Invoice'
                  : lang === 'bn'
                  ? 'নতুন এস.আর বিক্রয় চালান (New S.R Invoice)'
                  : 'New S.R Sales Invoice'}
              </h1>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'এস.আর সেলস, ড্যামেজ ও রিটার্নসহ সমন্বিত বিক্রয় হিসাব এবং স্টক অটো-আপডেট'
                  : 'S.R field sales invoice with per-row damage and return ledger tracking'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editingInvoice && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'bn' ? 'চালান সংরক্ষণ করুন' : 'Save S.R Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সংরক্ষণ ও প্রিন্ট' : 'Save & Print A4'}</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* SR Metadata Grid (Requirement 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-2">
          {/* Invoice Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'চালান নং (Auto)' : 'Invoice #'}</span>
            </label>
            <input
              type="text"
              readOnly
              value={invoiceNumber}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'তারিখ' : 'Date'}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* S.R Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'এস.আর নির্বাচন' : 'S.R Name'}</span>
            </label>
            <select
              value={selectedSRId}
              onChange={(e) => handleSRSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-emerald-600"
            >
              {srs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.srCode})
                </option>
              ))}
            </select>
          </div>

          {/* Route / Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'রুট / এলাকা' : 'Route / Area'}</span>
            </label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="e.g. Kichok - Shibganj"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Dealer or Retail Shop Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'bn' ? 'ডিলার / দোকানের নাম' : 'Dealer / Store Name'}
            </label>
            <input
              type="text"
              value={customerOrShopName}
              onChange={(e) => setCustomerOrShopName(e.target.value)}
              placeholder={lang === 'bn' ? 'দোকান / ডিলারের নাম' : 'Store name...'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {selectedSR && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900">
            <div>
              <span>
                <strong>{selectedSR.name}</strong> ({selectedSR.srCode}) · মোবাইল: {selectedSR.mobile} · রুট: {selectedSR.areaRoute}
              </span>
            </div>
            <div>
              <span>{lang === 'bn' ? 'মাসিক টার্গেট:' : 'Monthly Target:'}</span>{' '}
              <strong className="font-mono-num font-bold text-emerald-800">
                {formatCurrency(selectedSR.monthlyTarget, lang)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* S.R Product Table (Requirement 7: SL, Product Name, Carton, Piece, T.P, %, SR Price, Sales Amount, Damage, Return, Net Sales) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              {lang === 'bn' ? 'এস.আর পণ্য ছক (বিক্রয়, ড্যামেজ ও রিটার্ন)' : 'S.R Product Table (Sales, Damage & Return)'}
            </h2>
            <span className="text-[11px] text-slate-500">
              {lang === 'bn' ? 'প্রতিটি আইটেমে ড্যামেজ ও রিটার্ন ইনপুট করুন' : 'Record damage & return per item'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '+ নতুন রো যোগ করুন' : '+ Add Row'}</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left border-collapse min-w-[850px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2 text-center w-10">ক্রমিক</th>
                <th className="py-2.5 px-3 min-w-[180px]">Product Name</th>
                <th className="py-2.5 px-2 text-center w-20">Carton</th>
                <th className="py-2.5 px-2 text-center w-20">Piece</th>
                <th className="py-2.5 px-2 text-right w-20">T.P</th>
                <th className="py-2.5 px-2 text-center w-16">%</th>
                <th className="py-2.5 px-2 text-right w-22 bg-emerald-50/40">S.R Price</th>
                <th className="py-2.5 px-2 text-right w-24">Sales Amt</th>
                <th className="py-2.5 px-2 text-center w-20 bg-rose-50/60 text-red-800">Damage (Pcs)</th>
                <th className="py-2.5 px-2 text-center w-20 bg-amber-50/60 text-amber-900">Return (Pcs)</th>
                <th className="py-2.5 px-3 text-right w-28 bg-slate-50 font-bold">Net Sales</th>
                <th className="py-2.5 px-2 text-center w-10">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const currentStock = prod?.currentStock ?? 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    {/* SL */}
                    <td className="py-2 px-2 text-center font-mono text-slate-500">
                      {lang === 'bn' ? toBengaliNumber(idx + 1) : idx + 1}
                    </td>

                    {/* Product Name */}
                    <td className="py-2 px-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-1 focus:ring-emerald-600"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameBn || p.name} (১ctn={p.piecesPerCarton}pcs | মজুদ: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Carton */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.cartonQty}
                        onChange={(e) => handleQtyChange(idx, 'cartonQty', parseInt(e.target.value, 10))}
                        className="w-full text-center py-1.5 px-1 font-mono-num font-semibold bg-white border border-slate-300 rounded-md"
                      />
                    </td>

                    {/* Piece */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.pieceQty}
                        onChange={(e) => handleQtyChange(idx, 'pieceQty', parseInt(e.target.value, 10))}
                        className="w-full text-center py-1.5 px-1 font-mono-num font-semibold bg-white border border-slate-300 rounded-md"
                      />
                    </td>

                    {/* T.P */}
                    <td className="py-2 px-2 text-right font-mono-num text-slate-700">
                      {formatNumber(item.tp, lang)}
                    </td>

                    {/* Discount % */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.discountPercent}
                        onChange={(e) => handleDiscountChange(idx, parseFloat(e.target.value))}
                        className="w-full text-center py-1.5 px-1 font-mono-num bg-white border border-slate-300 rounded-md text-emerald-800"
                      />
                    </td>

                    {/* SR Price / D.P */}
                    <td className="py-2 px-2 text-right bg-emerald-50/30">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.dp}
                        onChange={(e) => handleDPChange(idx, parseFloat(e.target.value))}
                        className="w-full text-right py-1.5 px-1.5 font-mono-num font-bold text-emerald-900 bg-white border border-emerald-300 rounded-md"
                      />
                    </td>

                    {/* Gross Sales Amount */}
                    <td className="py-2 px-2 text-right font-mono-num text-slate-700">
                      {formatCurrency(item.lineTotal, lang)}
                    </td>

                    {/* Damage Piece */}
                    <td className="py-2 px-2 text-center bg-rose-50/30">
                      <input
                        type="number"
                        min="0"
                        value={item.damagePiece || 0}
                        onChange={(e) => handleQtyChange(idx, 'damagePiece', parseInt(e.target.value, 10))}
                        className="w-full text-center py-1.5 px-1 font-mono-num text-red-700 font-bold bg-white border border-rose-300 rounded-md"
                      />
                    </td>

                    {/* Return Piece */}
                    <td className="py-2 px-2 text-center bg-amber-50/30">
                      <input
                        type="number"
                        min="0"
                        value={item.returnPiece || 0}
                        onChange={(e) => handleQtyChange(idx, 'returnPiece', parseInt(e.target.value, 10))}
                        className="w-full text-center py-1.5 px-1 font-mono-num text-amber-800 font-bold bg-white border border-amber-300 rounded-md"
                      />
                    </td>

                    {/* Net Sales */}
                    <td className="py-2 px-3 text-right bg-slate-50 font-mono-num font-bold text-slate-900">
                      {formatCurrency(item.netLineTotal || 0, lang)}
                    </td>

                    {/* Action */}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SR Invoice Footer Summary (Requirement 7) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'bn' ? 'চালান মন্তব্য / এস.আর ডায়েরি নোট' : 'S.R Notes'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'bn' ? 'মার্কেট রুট পরিস্থিতি বা মন্তব্য...' : 'Market observations...'}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{lang === 'bn' ? 'মোট কার্টুন ও পিস:' : 'Carton & Pieces:'}</span>
              <span className="font-mono-num font-bold text-slate-800">
                {formatNumber(totalCartons, lang)} {lang === 'bn' ? 'কার্টুন' : 'Ctn'} + {formatNumber(totalPieces, lang)} {lang === 'bn' ? 'পিস' : 'Pcs'}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>{lang === 'bn' ? 'মোট বিক্রয় মূল্য (Sales Amount):' : 'Sales Amount:'}</span>
              <span className="font-mono-num text-slate-800">{formatCurrency(totalSalesAmount, lang)}</span>
            </div>

            <div className="flex justify-between text-xs text-red-600">
              <span>{lang === 'bn' ? 'মোট ড্যামেজ পণ্য (Damage):' : 'Damage:'}</span>
              <span className="font-mono-num font-semibold">
                {formatNumber(totalDamagePieces, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
              </span>
            </div>

            <div className="flex justify-between text-xs text-amber-700">
              <span>{lang === 'bn' ? 'মোট রিটার্ন পণ্য (Return):' : 'Return:'}</span>
              <span className="font-mono-num font-semibold">
                {formatNumber(totalReturnPieces, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
              </span>
            </div>

            <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>{lang === 'bn' ? 'প্রকৃত নিট বিক্রয় (Net Sales):' : 'Net Actual Sales:'}</span>
              <span className="font-mono-num text-emerald-800 text-base">{formatCurrency(netActualSalesAmount, lang)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {lang === 'bn' ? 'সংগৃহীত টাকা (Collected)' : 'Collected / Paid'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full py-1.5 px-2 text-xs font-mono-num font-bold bg-white border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {lang === 'bn' ? 'মার্কেট বাকি (Market Due)' : 'Market Due'}
                </label>
                <div className="py-1.5 px-2 text-xs font-mono-num font-bold bg-red-50 border border-red-200 text-red-800 rounded-md">
                  {formatCurrency(dueAmount, lang)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {printModalInvoice && (
        <PrintableInvoiceModal
          invoice={printModalInvoice}
          lang={lang}
          onClose={() => setPrintModalInvoice(null)}
        />
      )}
    </div>
  );
};
