import React from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage } from '../../types';
import {
  formatCurrency,
  formatNumber,
  formatCartonPieceDisplay,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  TrendingUp,
  Receipt,
  AlertTriangle,
  RotateCcw,
  Package,
  Users,
  UserCheck,
  Calendar,
  CheckCircle,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({ lang, onNavigate }) => {
  const products = db.getProducts();
  const dealers = db.getDealers();
  const srs = db.getSRs();
  const invoices = db.getInvoices();
  const damageRecords = db.getDamageRecords();
  const returnRecords = db.getReturnRecords();

  const todayStr = getTodayDateString();
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonth}`;

  // 1. Calculations
  const todayInvoices = invoices.filter((i) => i.date === todayStr);
  const todaySales = todayInvoices.reduce((sum, i) => sum + (i.netAmount || 0), 0);

  const todayDamage = damageRecords
    .filter((d) => d.date === todayStr)
    .reduce((sum, d) => sum + d.totalPieces, 0);

  const todayReturn = returnRecords
    .filter((r) => r.date === todayStr)
    .reduce((sum, r) => sum + r.totalPieces, 0);

  // Month Sales
  const monthInvoices = invoices.filter((i) => i.date.startsWith(monthPrefix));
  const monthSales = monthInvoices.reduce((sum, i) => sum + (i.netAmount || 0), 0);

  // Year Sales
  const yearInvoices = invoices.filter((i) => i.date.startsWith(currentYear.toString()));
  const yearSales = yearInvoices.reduce((sum, i) => sum + (i.netAmount || 0), 0);

  // Total Stock calculation
  const totalStockPieces = products.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockLevel);

  // S.R Target Calculation
  const totalSRMonthlyTarget = srs.reduce((sum, s) => sum + (s.monthlyTarget || 0), 0);
  // Calculate SR sales this month
  const srMonthSalesMap: Record<string, number> = {};
  monthInvoices.forEach((inv) => {
    if (inv.srId) {
      srMonthSalesMap[inv.srId] = (srMonthSalesMap[inv.srId] || 0) + (inv.netAmount || 0);
    }
  });

  const targetAchievementPercent =
    totalSRMonthlyTarget > 0
      ? Math.min(100, Math.round((monthSales / totalSRMonthlyTarget) * 100))
      : 0;

  // Last 7 days data for SVG Bar Chart
  const last7Days: { dateStr: string; label: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dStr = `${y}-${m}-${day}`;
    const dayLabel = `${day}/${m}`;
    const dayTotal = invoices
      .filter((inv) => inv.date === dStr)
      .reduce((sum, inv) => sum + (inv.netAmount || 0), 0);
    last7Days.push({ dateStr: dStr, label: dayLabel, amount: dayTotal });
  }

  const maxDailyAmount = Math.max(...last7Days.map((d) => d.amount), 1000);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-700/60 text-emerald-200">
              {lang === 'bn' ? 'মেইন ড্যাশবোর্ড' : 'Main Dashboard'}
            </span>
            <span className="text-xs text-emerald-300">
              {lang === 'bn' ? `তারিখ: ${toBengaliNumber(todayStr)}` : `Date: ${todayStr}`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            {lang === 'bn' ? 'প্রভাতী ফুড প্রোডাক্টস ইআরপি' : 'Probhati Food Products ERP'}
          </h1>
          <p className="text-xs text-emerald-200/90 mt-0.5">
            {lang === 'bn'
              ? 'ডিলার, এস.আর, ইনভয়েস, স্টক এবং রিটার্ন-ড্যামেজ কেন্দ্রীয় নিয়ন্ত্রণ'
              : 'Centralized control for Dealers, SRs, Invoices, Stock, Damage & Return'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('dealer-invoice')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '+ ডিলার চালান' : '+ Dealer Invoice'}</span>
          </button>
          <button
            onClick={() => onNavigate('sr-invoice')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 shadow-xs transition"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '+ এস.আর চালান' : '+ S.R Invoice'}</span>
          </button>
          <button
            onClick={() => onNavigate('purchase')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-700/80 text-white hover:bg-emerald-600 transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '+ ক্রয় এন্ট্রি' : '+ Purchase'}</span>
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {lang === 'bn' ? 'সতর্কতা: স্বল্প স্টক পণ্য (Low Stock Alert)' : 'Warning: Low Stock Alert'}
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                {lang === 'bn'
                  ? `${toBengaliNumber(lowStockProducts.length)}টি পণ্যের মজুদ ন্যূনতম সীমার নিচে নেমে গেছে। শীঘ্রই নতুন ক্রয় বা উৎপাদন প্রয়োজন।`
                  : `${lowStockProducts.length} product(s) are below minimum threshold. Please order replenishment soon.`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-white px-2 py-0.5 rounded-sm border border-amber-300 text-amber-900"
                  >
                    <span>{lang === 'bn' ? p.nameBn : p.name}:</span>
                    <strong className="text-red-700">
                      {formatNumber(p.currentStock, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="self-start sm:self-center shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition"
          >
            {lang === 'bn' ? 'স্টক দেখুন' : 'View Stock'}
          </button>
        </div>
      )}

      {/* Primary KPI Grid (Requirement 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {lang === 'bn' ? 'আজকের মোট সেলস' : "Today's Sales"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-num">
            {formatCurrency(todaySales, lang)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{lang === 'bn' ? 'চালান সংখ্যা:' : 'Invoices:'}</span>
            <span className="font-semibold text-slate-700">{formatNumber(todayInvoices.length, lang)}</span>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {lang === 'bn' ? 'চলতি মাসের সেলস' : 'Monthly Sales'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-num">
            {formatCurrency(monthSales, lang)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{lang === 'bn' ? 'টার্গেট পূরণ:' : 'Target Achieved:'}</span>
            <span className="font-semibold text-emerald-700">{formatNumber(targetAchievementPercent, lang)}%</span>
          </div>
        </div>

        {/* Today's Damage & Return */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {lang === 'bn' ? 'আজকের ড্যামেজ ও রিটার্ন' : 'Today Damage & Return'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-xs text-red-600 block">{lang === 'bn' ? 'ড্যামেজ' : 'Damage'}</span>
              <span className="text-lg font-bold text-slate-900 font-mono-num">
                {formatNumber(todayDamage, lang)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">{lang === 'bn' ? 'পিস' : 'pcs'}</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-xs text-amber-600 block">{lang === 'bn' ? 'রিটার্ন' : 'Return'}</span>
              <span className="text-lg font-bold text-slate-900 font-mono-num">
                {formatNumber(todayReturn, lang)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">{lang === 'bn' ? 'পিস' : 'pcs'}</span>
            </div>
          </div>
        </div>

        {/* Total Stock */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {lang === 'bn' ? 'মোট মজুদ পণ্য (Stock)' : 'Total Inventory'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-num">
            {formatNumber(totalStockPieces, lang)}
            <span className="text-xs font-normal text-slate-500 ml-1.5">{lang === 'bn' ? 'পিস' : 'Pieces'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{lang === 'bn' ? 'আইটেম সংখ্যা:' : 'Total Items:'}</span>
            <span className="font-semibold text-slate-700">{formatNumber(products.length, lang)}টি</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Yearly Sales, Total Dealers, Total SRs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Yearly Sales */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              {lang === 'bn' ? `${toBengaliNumber(currentYear)} সালের বার্ষিক সেলস` : `${currentYear} Annual Sales`}
            </span>
            <div className="text-lg font-bold text-slate-900 font-mono-num mt-0.5">
              {formatCurrency(yearSales, lang)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Dealers */}
        <div
          onClick={() => onNavigate('dealers')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">
              {lang === 'bn' ? 'নিবন্ধিত ডিলার' : 'Active Dealers'}
            </span>
            <div className="text-lg font-bold text-slate-900 font-mono-num mt-0.5">
              {formatNumber(dealers.length, lang)} {lang === 'bn' ? 'জন' : 'dealers'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total S.R */}
        <div
          onClick={() => onNavigate('srs')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">
              {lang === 'bn' ? 'সেলস রিপ্রেজেন্টেটিভ (S.R)' : 'Sales Representatives'}
            </span>
            <div className="text-lg font-bold text-slate-900 font-mono-num mt-0.5">
              {formatNumber(srs.length, lang)} {lang === 'bn' ? 'জন' : 'SRs'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics & Charts (Requirement 37) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Sales Trend (Pure SVG Bar Chart) */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'গত ৭ দিনের সেলস পরিসংখ্যান' : 'Last 7 Days Sales Trend'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'দৈনিক বিক্রি পরিমাণ ও তারতম্য' : 'Daily sales volume trend'}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              {formatCurrency(last7Days.reduce((a, b) => a + b.amount, 0), lang)}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-52 w-full flex items-end gap-2 sm:gap-4 pt-6 px-2">
            {last7Days.map((d, idx) => {
              const heightPct = Math.max(12, Math.round((d.amount / maxDailyAmount) * 100));
              const isToday = d.dateStr === todayStr;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <span className="text-[10px] font-mono font-medium text-slate-600 mb-1 opacity-80 group-hover:opacity-100 transition whitespace-nowrap">
                    {d.amount > 0 ? (lang === 'bn' ? toBengaliNumber(Math.round(d.amount)) : Math.round(d.amount)) : '০'}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isToday
                        ? 'bg-emerald-700 group-hover:bg-emerald-800'
                        : 'bg-emerald-200 group-hover:bg-emerald-300'
                    }`}
                  />
                  <span className="text-[11px] text-slate-500 font-mono mt-2 truncate">
                    {lang === 'bn' ? toBengaliNumber(d.label) : d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: S.R Target Progress & Performance (Requirement 19) */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {lang === 'bn' ? 'এস.আর টার্গেট অগ্রগতি' : 'S.R Target Progress'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'চলতি মাসের বিক্রয় লক্ষ্যমাত্রা' : 'Monthly Sales Target'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('srs')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
              </button>
            </div>

            {/* Total Target Progress */}
            <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">
                  {lang === 'bn' ? 'সামগ্রিক অর্জন:' : 'Total Achievement:'}
                </span>
                <span className="font-bold text-emerald-800 font-mono-num">
                  {formatNumber(targetAchievementPercent, lang)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-700 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${targetAchievementPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                <span>{lang === 'bn' ? 'বিক্রয়:' : 'Sales:'} {formatCurrency(monthSales, lang)}</span>
                <span>{lang === 'bn' ? 'টার্গেট:' : 'Target:'} {formatCurrency(totalSRMonthlyTarget, lang)}</span>
              </div>
            </div>

            {/* Individual SR Progress list */}
            <div className="space-y-3">
              {srs.map((sr) => {
                const srSales = srMonthSalesMap[sr.id] || 0;
                const srTarget = sr.monthlyTarget || 1;
                const pct = Math.min(100, Math.round((srSales / srTarget) * 100));

                return (
                  <div key={sr.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800 truncate">{sr.name}</span>
                      <span className="font-mono text-slate-600">{formatNumber(pct, lang)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          pct >= 80 ? 'bg-emerald-600' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{sr.areaRoute}</span>
                      <span>{formatCurrency(srSales, lang)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{lang === 'bn' ? 'এস.আর সক্রিয়:' : 'Active SRs:'} {formatNumber(srs.length, lang)}</span>
            <span className="text-emerald-700 font-semibold">{lang === 'bn' ? 'নিয়মিত আপডেট' : 'Real-time sync'}</span>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table (Requirement 2 & 28) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'সাম্প্রতিক চালান ও সেলস রেকর্ড' : 'Recent Invoices'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'সর্বশেষ এন্ট্রিকৃত চালানসমূহ' : 'Latest sales entries'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
          >
            <span>{lang === 'bn' ? 'সব ইনভয়েস দেখুন' : 'View All Invoices'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">{lang === 'bn' ? 'চালান নং' : 'Invoice #'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'ধরন' : 'Type'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'গ্রাহক / ডিলার / এস.আর' : 'Dealer / SR'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'কার্টুন' : 'Carton'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'পিস' : 'Piece'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট টাকা' : 'Net Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-emerald-800">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {lang === 'bn' ? toBengaliNumber(inv.date) : inv.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        inv.invoiceType === 'dealer'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {inv.invoiceType === 'dealer'
                        ? lang === 'bn' ? 'ডিলার' : 'Dealer'
                        : lang === 'bn' ? 'এস.আর' : 'S.R'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {inv.dealerName || inv.srName || 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-slate-700">
                    {formatNumber(inv.totalCartons, lang)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-slate-700">
                    {formatNumber(inv.totalPieces, lang)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(inv.netAmount, lang)}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো চালান পাওয়া যায়নি' : 'No invoices recorded yet'}
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
