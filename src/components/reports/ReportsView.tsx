import React, { useState } from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage, Invoice, Product, SalesRepresentative, Dealer } from '../../types';
import {
  formatCurrency,
  formatNumber,
  formatCartonPieceDisplay,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  UserCheck,
  Package,
  Users,
  Printer,
  ChevronDown,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
}

type ReportSubTab = 'sr-summary' | 'sr-product' | 'company' | 'monthly' | 'product-wise' | 'yearly';
type DateRangePreset = 'today' | '7days' | 'thisMonth' | 'prevMonth' | 'thisYear' | 'custom';

export const ReportsView: React.FC<Props> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<ReportSubTab>('sr-summary');
  const [preset, setPreset] = useState<DateRangePreset>('thisMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedSRId, setSelectedSRId] = useState<string>('all');

  const products = db.getProducts();
  const srs = db.getSRs();
  const dealers = db.getDealers();
  const invoices = db.getInvoices();
  const purchases = db.getPurchases();
  const damages = db.getDamageRecords();
  const returns = db.getReturnRecords();

  const todayStr = getTodayDateString();
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;

  // Compute date range based on preset
  const getDateRange = (): { start: string; end: string } => {
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');

    if (preset === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const startStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      return { start: startStr, end: todayStr };
    }
    if (preset === 'thisMonth') {
      return { start: `${y}-${m}-01`, end: todayStr };
    }
    if (preset === 'prevMonth') {
      const prevM = now.getMonth() === 0 ? 12 : now.getMonth();
      const prevY = now.getMonth() === 0 ? y - 1 : y;
      const pmStr = prevM.toString().padStart(2, '0');
      return { start: `${prevY}-${pmStr}-01`, end: `${prevY}-${pmStr}-31` };
    }
    if (preset === 'thisYear') {
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }
    return {
      start: customStart || '2000-01-01',
      end: customEnd || '2099-12-31',
    };
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  // Filtered invoices
  const filteredInvoices = invoices.filter(
    (inv) => inv.date >= dateStart && inv.date <= dateEnd
  );

  // Helper to export current view to CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'InvoiceNumber,Date,Type,Customer,Carton,Piece,GrossAmount,Discount,NetAmount,Paid,Due\n' +
      filteredInvoices
        .map(
          (i) =>
            `"${i.invoiceNumber}","${i.date}","${i.invoiceType}","${i.dealerName || i.srName}",${i.totalCartons},${i.totalPieces},${i.totalGrossAmount},${i.totalDiscount},${i.netAmount},${i.paidAmount},${i.dueAmount}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Probhati_Report_${activeTab}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'রিপোর্ট ও ব্যবসায়িক বিশ্লেষণ' : 'Reports & Sales Analytics'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'এস.আর সেলস, ডিলার সেলস, পণ্যভিত্তিক রিপোর্ট, মাসিক ও বার্ষিক পূর্ণাঙ্গ হিসাব'
                : 'Comprehensive sales reports, target performance and monthly analytics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Requirement 21 & 23) */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'today', bn: 'আজকে (Today)', en: 'Today' },
            { id: '7days', bn: '৭ দিন (7 Days)', en: '7 Days' },
            { id: 'thisMonth', bn: 'চলতি মাস (Month)', en: 'This Month' },
            { id: 'prevMonth', bn: 'গত মাস (Prev Month)', en: 'Prev Month' },
            { id: 'thisYear', bn: 'চলতি বছর (This Year)', en: 'This Year' },
            { id: 'custom', bn: 'কাস্টম রেঞ্জ (Custom)', en: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPreset(item.id as DateRangePreset)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                preset === item.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'bn' ? item.bn : item.en}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs */}
        {preset === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-md"
            />
            <span className="text-slate-400">হতে</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-md"
            />
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'sr-summary', bn: '১. এস.আর সেলস ও টার্গেট রিপোর্ট', en: '1. S.R Performance' },
          { id: 'sr-product', bn: '২. এস.আর পণ্যভিত্তিক বিক্রয়', en: '2. S.R Product-wise' },
          { id: 'company', bn: '৩. কোম্পানির মোট সেলস রিপোর্ট', en: '3. Company Sales' },
          { id: 'monthly', bn: '৪. মাসিক সেলস সারাংশ (Jan-Dec)', en: '4. Monthly Sales' },
          { id: 'product-wise', bn: '৫. পণ্যভিত্তিক সেলস ও স্টক রিপোর্ট', en: '5. Product-wise' },
          { id: 'yearly', bn: '৬. বার্ষিক অডিট ও সামগ্রিক হিসাব', en: '6. Annual Summary' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportSubTab)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap border ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'bn' ? tab.bn : tab.en}
          </button>
        ))}
      </div>

      {/* TAB 1: S.R Sales & Target Report (Requirement 21) */}
      {activeTab === 'sr-summary' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'এস.আর সেলস ও টার্গেট অর্জন বিবরণী' : 'S.R Sales & Target Achievement'}
              </h2>
              <p className="text-xs text-slate-500">
                ফিল্টার রেঞ্জ: {toBengaliNumber(dateStart)} হতে {toBengaliNumber(dateEnd)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">S.R Name & Code</th>
                  <th className="py-2.5 px-3">রুট / এলাকা</th>
                  <th className="py-2.5 px-3 text-right">মোট কার্টুন</th>
                  <th className="py-2.5 px-3 text-right">মোট পিস</th>
                  <th className="py-2.5 px-3 text-right">মোট বিক্রয় (Gross)</th>
                  <th className="py-2.5 px-3 text-right text-red-600">Damage (Pcs)</th>
                  <th className="py-2.5 px-3 text-right text-amber-700">Return (Pcs)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-50">Net Sales</th>
                  <th className="py-2.5 px-3 text-right">Target</th>
                  <th className="py-2.5 px-3 text-center">Achievement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {srs.map((sr) => {
                  const srInvs = filteredInvoices.filter((i) => i.srId === sr.id);
                  const totalCartons = srInvs.reduce((s, i) => s + i.totalCartons, 0);
                  const totalPieces = srInvs.reduce((s, i) => s + i.totalPieces, 0);
                  const grossAmt = srInvs.reduce((s, i) => s + i.totalGrossAmount, 0);
                  const damagePcs = srInvs.reduce((s, i) => s + (i.totalDamagePieces || 0), 0);
                  const returnPcs = srInvs.reduce((s, i) => s + (i.totalReturnPieces || 0), 0);
                  const netSales = srInvs.reduce((s, i) => s + i.netAmount, 0);
                  const achieve =
                    sr.monthlyTarget > 0
                      ? Math.min(100, Math.round((netSales / sr.monthlyTarget) * 100))
                      : 0;

                  return (
                    <tr key={sr.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {sr.name} ({sr.srCode})
                      </td>
                      <td className="py-3 px-3 text-slate-600">{sr.areaRoute}</td>
                      <td className="py-3 px-3 text-right font-mono-num">{formatNumber(totalCartons, lang)}</td>
                      <td className="py-3 px-3 text-right font-mono-num">{formatNumber(totalPieces, lang)}</td>
                      <td className="py-3 px-3 text-right font-mono-num">{formatCurrency(grossAmt, lang)}</td>
                      <td className="py-3 px-3 text-right font-mono-num text-red-600">{formatNumber(damagePcs, lang)}</td>
                      <td className="py-3 px-3 text-right font-mono-num text-amber-700">{formatNumber(returnPcs, lang)}</td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-slate-950 bg-slate-50">
                        {formatCurrency(netSales, lang)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-slate-700">
                        {formatCurrency(sr.monthlyTarget, lang)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono-num font-bold px-2 py-0.5 rounded-sm text-xs ${
                            achieve >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : achieve >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatNumber(achieve, lang)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: S.R Product-wise Sales Report (Requirement 22) */}
      {activeTab === 'sr-product' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'এস.আর পণ্যভিত্তিক বিক্রয় বিবরণী' : 'S.R Product-wise Sales Breakdown'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'কোন এস.আর কোন পণ্য কত কার্টুন ও পিস বিক্রি করেছেন' : 'Specific product cartons and pieces sold by each SR'}
              </p>
            </div>

            {/* SR Select Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">এস.আর নির্বাচন:</span>
              <select
                value={selectedSRId}
                onChange={(e) => setSelectedSRId(e.target.value)}
                className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option value="all">সকল এস.আর (All SRs)</option>
                {srs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.srCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">S.R Name</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">১ কার্টুন</th>
                  <th className="py-2.5 px-3 text-right">বিক্রীত কার্টুন</th>
                  <th className="py-2.5 px-3 text-right">বিক্রীত খুচরা পিস</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">মোট বিক্রিত পিস</th>
                  <th className="py-2.5 px-3 text-right">মোট বিক্রয় মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {srs
                  .filter((s) => (selectedSRId === 'all' ? true : s.id === selectedSRId))
                  .map((sr) => {
                    const srInvs = filteredInvoices.filter((i) => i.srId === sr.id);

                    return products.map((prod) => {
                      let ctn = 0;
                      let pcs = 0;
                      let totalPcs = 0;
                      let totalVal = 0;

                      srInvs.forEach((inv) => {
                        inv.items.forEach((item) => {
                          if (item.productId === prod.id) {
                            ctn += item.cartonQty;
                            pcs += item.pieceQty;
                            totalPcs += item.netSoldPieces ?? item.totalPieces;
                            totalVal += item.netLineTotal ?? item.lineTotal;
                          }
                        });
                      });

                      if (totalPcs === 0) return null;

                      return (
                        <tr key={`${sr.id}-${prod.id}`} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{sr.name}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{prod.nameBn || prod.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono-num text-slate-500">
                            {formatNumber(prod.piecesPerCarton, lang)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(ctn, lang)}</td>
                          <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(pcs, lang)}</td>
                          <td className="py-2.5 px-3 text-right font-mono-num font-bold text-emerald-900 bg-slate-50">
                            {formatNumber(totalPcs, lang)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-num font-bold text-slate-900">
                            {formatCurrency(totalVal, lang)}
                          </td>
                        </tr>
                      );
                    });
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Company Total Sales (Requirement 23) */}
      {activeTab === 'company' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'কোম্পানির সামগ্রিক সেলস সারাংশ' : 'Company Total Sales Summary'}
            </h2>
            <p className="text-xs text-slate-500">
              তারিখ পরিসীমা: {toBengaliNumber(dateStart)} হতে {toBengaliNumber(dateEnd)}
            </p>
          </div>

          {/* Aggregates Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">মোট চালান সংখ্যা</span>
              <span className="text-xl font-bold font-mono-num text-slate-900">
                {formatNumber(filteredInvoices.length, lang)}টি
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">মোট বিক্রয় (কার্টুন ও পিস)</span>
              <span className="text-sm font-bold font-mono-num text-slate-900">
                {formatNumber(filteredInvoices.reduce((s, i) => s + i.totalCartons, 0), lang)} Ctn +{' '}
                {formatNumber(filteredInvoices.reduce((s, i) => s + i.totalPieces, 0), lang)} Pcs
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">টি.পি মূল্যে মোট বিক্রয়</span>
              <span className="text-xl font-bold font-mono-num text-slate-800">
                {formatCurrency(filteredInvoices.reduce((s, i) => s + i.totalGrossAmount, 0), lang)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">প্রকৃত নিট সেলস (Net Sales)</span>
              <span className="text-xl font-bold font-mono-num text-emerald-950">
                {formatCurrency(filteredInvoices.reduce((s, i) => s + i.netAmount, 0), lang)}
              </span>
            </div>
          </div>

          {/* Breakdown By Dealer Invoices vs SR Invoices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dealer Sales */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                ডিলার ভিত্তিক বিক্রয় (Dealer Sales)
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>চালান সংখ্যা:</span>
                  <span className="font-mono-num font-bold">
                    {formatNumber(filteredInvoices.filter((i) => i.invoiceType === 'dealer').length, lang)}টি
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>মোট বিক্রিত কার্টুন:</span>
                  <span className="font-mono-num font-bold">
                    {formatNumber(
                      filteredInvoices
                        .filter((i) => i.invoiceType === 'dealer')
                        .reduce((s, i) => s + i.totalCartons, 0),
                      lang
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200 font-bold text-blue-950">
                  <span>মোট ডিলার সেলস:</span>
                  <span className="font-mono-num">
                    {formatCurrency(
                      filteredInvoices
                        .filter((i) => i.invoiceType === 'dealer')
                        .reduce((s, i) => s + i.netAmount, 0),
                      lang
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* S.R Sales */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                এস.আর ভিত্তিক বিক্রয় (S.R Sales)
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>চালান সংখ্যা:</span>
                  <span className="font-mono-num font-bold">
                    {formatNumber(filteredInvoices.filter((i) => i.invoiceType === 'sr').length, lang)}টি
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>মোট বিক্রিত কার্টুন:</span>
                  <span className="font-mono-num font-bold">
                    {formatNumber(
                      filteredInvoices
                        .filter((i) => i.invoiceType === 'sr')
                        .reduce((s, i) => s + i.totalCartons, 0),
                      lang
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold text-emerald-950">
                  <span>মোট এস.আর সেলস:</span>
                  <span className="font-mono-num">
                    {formatCurrency(
                      filteredInvoices
                        .filter((i) => i.invoiceType === 'sr')
                        .reduce((s, i) => s + i.netAmount, 0),
                      lang
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Monthly Sales Report (Requirement 24) */}
      {activeTab === 'monthly' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? `${toBengaliNumber(currentYear)} সালের মাসওয়ারি বিক্রয় প্রতিবেদন` : `${currentYear} Monthly Sales Report`}
            </h2>
            <p className="text-xs text-slate-500">
              জানুয়ারি হতে ডিসেম্বর পর্যন্ত মাসিক চালান ও বিক্রয় বিবরণী
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">মাস (Month)</th>
                  <th className="py-2.5 px-3 text-right">চালান সংখ্যা</th>
                  <th className="py-2.5 px-3 text-right">মোট কার্টুন</th>
                  <th className="py-2.5 px-3 text-right">মোট পিস</th>
                  <th className="py-2.5 px-3 text-right">টি.পি মূল্য</th>
                  <th className="py-2.5 px-3 text-right">কমিশন/ছাড়</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-900 bg-slate-50">নিট সেলস (Net Sales)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map((monthName, idx) => {
                  const mStr = (idx + 1).toString().padStart(2, '0');
                  const monthPrefixStr = `${currentYear}-${mStr}`;
                  const monthInvs = invoices.filter((i) => i.date.startsWith(monthPrefixStr));

                  const totalInv = monthInvs.length;
                  const totalCtn = monthInvs.reduce((s, i) => s + i.totalCartons, 0);
                  const totalPcs = monthInvs.reduce((s, i) => s + i.totalPieces, 0);
                  const gross = monthInvs.reduce((s, i) => s + i.totalGrossAmount, 0);
                  const disc = monthInvs.reduce((s, i) => s + i.totalDiscount, 0);
                  const net = monthInvs.reduce((s, i) => s + i.netAmount, 0);

                  const isCurrentMonth = idx + 1 === currentMonthNum;

                  return (
                    <tr
                      key={monthName}
                      className={`hover:bg-slate-50 ${isCurrentMonth ? 'bg-emerald-50/50 font-semibold' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {monthName} {isCurrentMonth && '(চলতি মাস)'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(totalInv, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(totalCtn, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(totalPcs, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatCurrency(gross, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num text-emerald-700">
                        {formatCurrency(disc, lang)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-emerald-950 bg-slate-50">
                        {formatCurrency(net, lang)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Product-wise Sales Report (Requirement 26) */}
      {activeTab === 'product-wise' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'পণ্যভিত্তিক মোট বিক্রয় ও মজুদ প্রতিবেদন' : 'Product-wise Sales & Stock Report'}
              </h2>
              <p className="text-xs text-slate-500">
                কোন পণ্যের কত কার্টুন/পিস বিক্রি হয়েছে, ড্যামেজ, রিটার্ন এবং বর্তমান মজুদ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">পণ্য ফিল্টার:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option value="all">সকল পণ্য (All Products)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameBn || p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-2 text-center">১ কার্টুন</th>
                  <th className="py-2.5 px-3 text-right">বিক্রীত কার্টুন</th>
                  <th className="py-2.5 px-3 text-right">বিক্রীত পিস</th>
                  <th className="py-2.5 px-3 text-right">মোট বিক্রয় টাকা</th>
                  <th className="py-2.5 px-3 text-right text-red-600">ড্যামেজ (Pcs)</th>
                  <th className="py-2.5 px-3 text-right text-amber-700">রিটার্ন (Pcs)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-900 bg-slate-50">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) => (selectedProductId === 'all' ? true : p.id === selectedProductId))
                  .map((prod) => {
                    let totalCarton = 0;
                    let totalLoosePcs = 0;
                    let totalPcs = 0;
                    let totalAmount = 0;

                    filteredInvoices.forEach((inv) => {
                      inv.items.forEach((item) => {
                        if (item.productId === prod.id) {
                          totalCarton += item.cartonQty;
                          totalLoosePcs += item.pieceQty;
                          totalPcs += item.netSoldPieces ?? item.totalPieces;
                          totalAmount += item.netLineTotal ?? item.lineTotal;
                        }
                      });
                    });

                    const dmgCount = damages
                      .filter((d) => d.productId === prod.id && d.date >= dateStart && d.date <= dateEnd)
                      .reduce((s, d) => s + d.totalPieces, 0);

                    const retCount = returns
                      .filter((r) => r.productId === prod.id && r.date >= dateStart && r.date <= dateEnd)
                      .reduce((s, r) => s + r.totalPieces, 0);

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {prod.nameBn || prod.name}
                          <span className="text-[10px] text-slate-400 font-mono ml-1.5">{prod.code}</span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono-num text-slate-500">
                          {formatNumber(prod.piecesPerCarton, lang)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num">{formatNumber(totalCarton, lang)}</td>
                        <td className="py-3 px-3 text-right font-mono-num">{formatNumber(totalPcs, lang)}</td>
                        <td className="py-3 px-3 text-right font-mono-num font-bold text-slate-900">
                          {formatCurrency(totalAmount, lang)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num text-red-600">
                          {formatNumber(dmgCount, lang)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num text-amber-700">
                          {formatNumber(retCount, lang)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num font-bold text-emerald-950 bg-slate-50">
                          {formatCartonPieceDisplay(prod.currentStock, prod.piecesPerCarton, lang)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Yearly Comprehensive Audit (Requirement 25) */}
      {activeTab === 'yearly' && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? `${toBengaliNumber(currentYear)} সালের পূর্ণাঙ্গ বার্ষিক হিসাব বিবরণী` : `${currentYear} Annual Ledger Summary`}
            </h2>
            <p className="text-xs text-slate-500">
              সেলস, পারচেজ, ড্যামেজ, রিটার্ন এবং সামগ্রিক মজুদ ব্যালেন্স
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-1">বিক্রয় ও রাজস্ব (Sales & Revenue)</h3>
              <div className="flex justify-between">
                <span>মোট চালান:</span>
                <span className="font-mono-num font-bold">{formatNumber(invoices.length, lang)}টি</span>
              </div>
              <div className="flex justify-between">
                <span>মোট বিক্রয় মূল্য:</span>
                <span className="font-mono-num font-bold text-emerald-900">
                  {formatCurrency(invoices.reduce((s, i) => s + i.netAmount, 0), lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>সংগৃহীত ক্যাশ:</span>
                <span className="font-mono-num font-bold text-slate-800">
                  {formatCurrency(invoices.reduce((s, i) => s + i.paidAmount, 0), lang)}
                </span>
              </div>
              <div className="flex justify-between text-red-700 font-bold">
                <span>মোট মার্কেট বকেয়া:</span>
                <span className="font-mono-num">
                  {formatCurrency(invoices.reduce((s, i) => s + i.dueAmount, 0), lang)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-1">পণ্য ক্রয় ও সরবরাহ (Purchases)</h3>
              <div className="flex justify-between">
                <span>ক্রয় চালান:</span>
                <span className="font-mono-num font-bold">{formatNumber(purchases.length, lang)}টি</span>
              </div>
              <div className="flex justify-between">
                <span>মোট ক্রয়কৃত কার্টুন:</span>
                <span className="font-mono-num font-bold">
                  {formatNumber(purchases.reduce((s, p) => s + p.totalCartons, 0), lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>সর্বমোট ক্রয় খরচ:</span>
                <span className="font-mono-num font-bold text-slate-900">
                  {formatCurrency(purchases.reduce((s, p) => s + p.totalAmount, 0), lang)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-1">ঘাটতি ও ফেরত (Damage & Return)</h3>
              <div className="flex justify-between">
                <span>মোট ড্যামেজ পণ্য:</span>
                <span className="font-mono-num font-bold text-red-700">
                  {formatNumber(damages.reduce((s, d) => s + d.totalPieces, 0), lang)} পিস
                </span>
              </div>
              <div className="flex justify-between">
                <span>মোট সেলস রিটার্ন:</span>
                <span className="font-mono-num font-bold text-amber-800">
                  {formatNumber(returns.reduce((s, r) => s + r.totalPieces, 0), lang)} পিস
                </span>
              </div>
              <div className="flex justify-between">
                <span>বর্তমান ওয়্যারহাউস মজুদ:</span>
                <span className="font-mono-num font-bold text-emerald-900">
                  {formatNumber(products.reduce((s, p) => s + p.currentStock, 0), lang)} পিস
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
