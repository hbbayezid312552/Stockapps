import React, { useState } from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage, Dealer, Invoice, InvoiceItem, Product } from '../../types';
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
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Calendar,
  Hash,
} from 'lucide-react';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';

interface Props {
  lang: AppLanguage;
  onInvoiceSaved?: (invoiceId: string) => void;
  editingInvoice?: Invoice | null;
  onCancelEdit?: () => void;
}

export const DealerInvoiceMaker: React.FC<Props> = ({
  lang,
  onInvoiceSaved,
  editingInvoice,
  onCancelEdit,
}) => {
  const products = db.getProducts();
  const dealers = db.getDealers();
  const settings = db.getSettings();

  const [date, setDate] = useState(editingInvoice?.date || getTodayDateString());
  const [invoiceNumber] = useState(
    editingInvoice?.invoiceNumber || db.generateNextInvoiceNumber('dealer')
  );
  const [selectedDealerId, setSelectedDealerId] = useState<string>(
    editingInvoice?.dealerId || (dealers.length > 0 ? dealers[0].id : '')
  );
  const [notes, setNotes] = useState(editingInvoice?.notes || '');
  const [paidAmount, setPaidAmount] = useState<number>(editingInvoice?.paidAmount || 0);

  // Initialize items
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (editingInvoice && editingInvoice.items.length > 0) {
      return editingInvoice.items;
    }
    // Default 1 blank row with first product
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
        },
      ];
    }
    return [];
  });

  const [printModalInvoice, setPrintModalInvoice] = useState<Invoice | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const selectedDealer: Dealer | undefined = dealers.find((d) => d.id === selectedDealerId);

  // Handlers for Row edits
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

      const dp = prod.tradePrice - (prod.tradePrice * item.discountPercent) / 100;
      item.dp = Number(dp.toFixed(2));
      item.dpPerCarton = Number((dp * prod.piecesPerCarton).toFixed(2));

      item.totalPieces = item.cartonQty * item.piecesPerCarton + item.pieceQty;
      item.lineTotal = Number((item.totalPieces * item.dp).toFixed(2));

      copy[index] = item;
      return copy;
    });
  };

  const handleCartonQtyChange = (index: number, val: number) => {
    const cartonQty = Math.max(0, val || 0);
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.cartonQty = cartonQty;
      item.totalPieces = cartonQty * item.piecesPerCarton + item.pieceQty;
      item.lineTotal = Number((item.totalPieces * item.dp).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handlePieceQtyChange = (index: number, val: number) => {
    const pieceQty = Math.max(0, val || 0);
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.pieceQty = pieceQty;
      item.totalPieces = item.cartonQty * item.piecesPerCarton + pieceQty;
      item.lineTotal = Number((item.totalPieces * item.dp).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handleDiscountChange = (index: number, percent: number) => {
    const discount = Math.max(0, Math.min(100, percent || 0));
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.discountPercent = discount;
      const dp = item.tp - (item.tp * discount) / 100;
      item.dp = Number(dp.toFixed(2));
      item.dpPerCarton = Number((dp * item.piecesPerCarton).toFixed(2));
      item.lineTotal = Number((item.totalPieces * item.dp).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handleDPChange = (index: number, manualDP: number) => {
    const dp = Math.max(0, manualDP || 0);
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.dp = Number(dp.toFixed(2));
      item.dpPerCarton = Number((dp * item.piecesPerCarton).toFixed(2));
      // Back calculate discount percent
      if (item.tp > 0) {
        const disc = ((item.tp - dp) / item.tp) * 100;
        item.discountPercent = Number(disc.toFixed(2));
      }
      item.lineTotal = Number((item.totalPieces * item.dp).toFixed(2));
      copy[index] = item;
      return copy;
    });
  };

  const handleAddRow = () => {
    if (products.length === 0) return;
    const p = products[0];
    const defaultDiscount = p.defaultMarginPercent || 10;
    const dp = p.tradePrice - (p.tradePrice * defaultDiscount) / 100;

    setItems((prev) => [
      ...prev,
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
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const totalCartons = items.reduce((sum, item) => sum + item.cartonQty, 0);
  const totalPieces = items.reduce((sum, item) => sum + item.totalPieces, 0);
  const totalGrossAmount = Number(
    items.reduce((sum, item) => sum + item.totalPieces * item.tp, 0).toFixed(2)
  );
  const netAmount = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const totalDiscount = Number((totalGrossAmount - netAmount).toFixed(2));
  const dueAmount = Number(Math.max(0, netAmount - paidAmount).toFixed(2));

  // Build Invoice Object
  const buildInvoice = (): Invoice => {
    return {
      id: editingInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber,
      invoiceType: 'dealer',
      date,
      dealerId: selectedDealer?.id,
      dealerName: selectedDealer?.name,
      route: selectedDealer?.areaRoute,
      items,
      totalCartons,
      totalPieces,
      totalGrossAmount,
      totalDiscount,
      netAmount,
      paidAmount,
      dueAmount,
      notes,
      createdBy: 'Admin',
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Save handler
  const handleSave = (andPrint: boolean = false) => {
    if (items.length === 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একটি পণ্য যোগ করুন।' : 'Please add at least one product.');
      return;
    }

    // Check stock warnings
    let warning = '';
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && item.totalPieces > prod.currentStock) {
        warning += `${prod.nameBn || prod.name}: বর্তমান মজুদ আছে ${prod.currentStock} পিস, চালানে দেয়া হয়েছে ${item.totalPieces} পিস। `;
      }
    }
    if (warning) {
      setStockWarning(warning);
    } else {
      setStockWarning(null);
    }

    const invoice = buildInvoice();
    db.saveInvoice(invoice, editingInvoice);

    setSaveSuccessMsg(
      lang === 'bn'
        ? `চালান ${invoice.invoiceNumber} সফলভাবে সংরক্ষিত হয়েছে এবং স্টক স্বয়ংক্রিয়ভাবে আপডেট হয়েছে!`
        : `Invoice ${invoice.invoiceNumber} saved successfully and inventory updated!`
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
      {/* Header & Controls */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {editingInvoice
                  ? lang === 'bn'
                    ? 'ডিলার চালান সংশোধন (Edit Invoice)'
                    : 'Edit Dealer Invoice'
                  : lang === 'bn'
                  ? 'নতুন ডিলার চালান তৈরি (New Dealer Invoice)'
                  : 'Create Dealer Invoice'}
              </h1>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'কার্টুন, পিস, টি.পি এবং পারসেন্টেজ ভিত্তিক স্বয়ংক্রিয় হিসাব ও স্টক অ্যাডজাস্টমেন্ট'
                  : 'Automated Carton, Piece, T.P, Discount % and Inventory adjustment'}
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
              <span>{lang === 'bn' ? 'চালান সংরক্ষণ করুন' : 'Save Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সংরক্ষণ ও প্রিন্ট (A4)' : 'Save & Print A4'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Stock Warning Alert */}
        {stockWarning && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{lang === 'bn' ? 'স্টক সতর্কবার্তা:' : 'Stock Warning:'}</strong> {stockWarning}
            </span>
          </div>
        )}

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-2">
          {/* Invoice Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'চালান নম্বর (Auto)' : 'Invoice Number'}</span>
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

          {/* Dealer Select */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'bn' ? 'ডিলার নির্বাচন করুন' : 'Select Dealer'}</span>
            </label>
            <select
              value={selectedDealerId}
              onChange={(e) => setSelectedDealerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-emerald-600"
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code}) — {d.areaRoute} [বকেয়া: {formatCurrency(d.currentBalance, lang)}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Dealer Detail Banner */}
        {selectedDealer && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">{selectedDealer.name}</span>
              <span className="mx-2">·</span>
              <span>{selectedDealer.address}</span>
              <span className="mx-2">·</span>
              <span>মোবাইল: {selectedDealer.mobile}</span>
            </div>
            <div className="text-slate-700">
              <span>{lang === 'bn' ? 'পূর্বের বকেয়া ব্যালেন্স:' : 'Current Balance Due:'}</span>{' '}
              <strong className="text-red-700 font-mono-num font-bold">
                {formatCurrency(selectedDealer.currentBalance, lang)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Excel Sheet Like Product Table (Requirement 3, 4, 5, 6) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            {lang === 'bn' ? 'পণ্যের তালিকা ও হিসাব ছক (Excel Grid)' : 'Product Items & Calculation Grid'}
          </h2>
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
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2 text-center w-10">ক্রমিক</th>
                <th className="py-2.5 px-3 min-w-[220px]">Product Name (পণ্যের নাম)</th>
                <th className="py-2.5 px-2 text-center w-24">Carton</th>
                <th className="py-2.5 px-2 text-center w-24">Piece</th>
                <th className="py-2.5 px-2 text-center w-24 bg-slate-50">মোট পিস</th>
                <th className="py-2.5 px-2 text-right w-24">T.P (টাকা)</th>
                <th className="py-2.5 px-2 text-center w-20">%</th>
                <th className="py-2.5 px-2 text-right w-28 bg-emerald-50/50">D.P (টাকা)</th>
                <th className="py-2.5 px-3 text-right w-32 bg-slate-50">মোট টাকা</th>
                <th className="py-2.5 px-2 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const currentStock = prod?.currentStock ?? 0;
                const isStockLow = item.totalPieces > currentStock;

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
                            {p.nameBn || p.name} (১ কার্টুন = {p.piecesPerCarton} পিস | স্টক: {p.currentStock})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-0.5">
                        <span>১ কার্টুন = {item.piecesPerCarton} পিস</span>
                        <span className={isStockLow ? 'text-red-600 font-bold' : 'text-slate-500'}>
                          মজুদ: {formatNumber(currentStock, lang)} পিস {isStockLow && '⚠ ঘাটতি!'}
                        </span>
                      </div>
                    </td>

                    {/* Carton Qty */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.cartonQty}
                        onChange={(e) => handleCartonQtyChange(idx, parseInt(e.target.value, 10))}
                        className="w-full text-center py-1.5 px-1 font-mono-num font-semibold bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* Loose Piece Qty */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.pieceQty}
                        onChange={(e) => handlePieceQtyChange(idx, parseInt(e.target.value, 10))}
                        className="w-full text-center py-1.5 px-1 font-mono-num font-semibold bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* Total Pieces (Calculated) */}
                    <td className="py-2 px-2 text-center bg-slate-50 font-mono-num font-bold text-slate-800">
                      {formatNumber(item.totalPieces, lang)}
                    </td>

                    {/* Trade Price (T.P) */}
                    <td className="py-2 px-2 text-right font-mono-num text-slate-700">
                      {formatNumber(item.tp, lang)}
                    </td>

                    {/* Margin/Discount % */}
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.discountPercent}
                        onChange={(e) => handleDiscountChange(idx, parseFloat(e.target.value))}
                        className="w-full text-center py-1.5 px-1 font-mono-num font-medium bg-white border border-slate-300 rounded-md text-emerald-800 focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* Dealer Price (D.P) */}
                    <td className="py-2 px-2 text-right bg-emerald-50/40">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.dp}
                        onChange={(e) => handleDPChange(idx, parseFloat(e.target.value))}
                        className="w-full text-right py-1.5 px-2 font-mono-num font-bold text-emerald-900 bg-white border border-emerald-300 rounded-md focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>

                    {/* Row Line Total */}
                    <td className="py-2 px-3 text-right bg-slate-50 font-mono-num font-bold text-slate-900 text-sm">
                      {formatCurrency(item.lineTotal, lang)}
                    </td>

                    {/* Delete Row Button */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-md"
                        title="Remove row"
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

        {/* Invoice Bottom Calculations (Requirement 6) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Notes & Terms */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'bn' ? 'চালান নোট / বিশেষ নির্দেশনা' : 'Invoice Notes'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'bn' ? 'ডেলিভারি বা পেমেন্ট শর্তাবলী লিখুন...' : 'Delivery or payment terms...'}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Real-time Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{lang === 'bn' ? 'মোট কার্টুন (Total Carton):' : 'Total Cartons:'}</span>
              <span className="font-mono-num font-bold text-slate-800">{formatNumber(totalCartons, lang)}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>{lang === 'bn' ? 'মোট পিস (Total Pieces):' : 'Total Pieces:'}</span>
              <span className="font-mono-num font-bold text-slate-800">{formatNumber(totalPieces, lang)}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>{lang === 'bn' ? 'টি.পি মূল্যে মোট (Gross T.P Amount):' : 'Gross Amount (T.P):'}</span>
              <span className="font-mono-num text-slate-800">{formatCurrency(totalGrossAmount, lang)}</span>
            </div>

            <div className="flex justify-between text-xs text-emerald-700">
              <span>{lang === 'bn' ? 'মোট কমিশন/ছাড় (Total Discount):' : 'Total Discount:'}</span>
              <span className="font-mono-num font-semibold">- {formatCurrency(totalDiscount, lang)}</span>
            </div>

            <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>{lang === 'bn' ? 'সর্বমোট প্রদেয় (Net Payable):' : 'Net Amount:'}</span>
              <span className="font-mono-num text-emerald-800 text-base">{formatCurrency(netAmount, lang)}</span>
            </div>

            {/* Paid & Due Inputs */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {lang === 'bn' ? 'পরিশোধিত টাকা (Paid)' : 'Paid Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full py-1.5 px-2 text-xs font-mono-num font-bold bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {lang === 'bn' ? 'বকেয়া টাকা (Due)' : 'Due Balance'}
                </label>
                <div className="py-1.5 px-2 text-xs font-mono-num font-bold bg-red-50 border border-red-200 text-red-800 rounded-md">
                  {formatCurrency(dueAmount, lang)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Modal */}
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
