import React from 'react';
import { Invoice, AppLanguage } from '../../types';
import { db } from '../../db/storage';
import {
  formatCurrency,
  formatNumber,
  numberToBengaliWords,
  toBengaliNumber,
} from '../../utils/formatters';
import { Printer, Download, Share2, X, CheckCircle } from 'lucide-react';

interface Props {
  invoice: Invoice;
  lang: AppLanguage;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<Props> = ({ invoice, lang, onClose }) => {
  const settings = db.getSettings();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber} - ${settings.companyName}`,
          text: `Invoice #${invoice.invoiceNumber} for ${invoice.dealerName || invoice.srName}. Total: ৳ ${invoice.netAmount}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      navigator.clipboard.writeText(
        `Invoice: ${invoice.invoiceNumber} | Total: ৳ ${invoice.netAmount}`
      );
      alert(lang === 'bn' ? 'চালানের সারাংশ কপি করা হয়েছে।' : 'Invoice summary copied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Top Floating Controls (Hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print bg-white/95 p-1.5 rounded-xl shadow-lg border border-slate-200">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === 'bn' ? 'প্রিন্ট / PDF সংরক্ষণ করুন' : 'Print / Save PDF'}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* A4 Printable Invoice Sheet */}
      <div className="printable-invoice-container w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 sm:p-12 my-8 text-slate-900 border border-slate-200">
        {/* Company Header */}
        <div className="border-b-2 border-emerald-900 pb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-xl bg-emerald-900 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                <img src="/icon.svg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 font-sans">
                  {settings.companyNameBn || settings.companyName}
                </h1>
                <p className="text-xs font-bold text-emerald-800 tracking-wider uppercase mt-0.5">
                  {settings.companyName}
                </p>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  "{settings.taglineBn || settings.tagline}"
                </p>
              </div>
            </div>

            <div className="text-xs text-center sm:text-right text-slate-600 space-y-0.5 leading-relaxed">
              <p className="font-semibold text-slate-800">{settings.addressBn || settings.address}</p>
              <p>হটলাইন: {settings.phone}</p>
              <p>ইমেইল: {settings.email}</p>
              <p>ওয়েবসাইট: {settings.website}</p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-300">
              {invoice.invoiceType === 'dealer' ? 'ডিলার চালান (DEALER INVOICE)' : 'এস.আর চালান (S.R SALES INVOICE)'}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              অরিজিনাল কপি / চালানের বিল
            </span>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-slate-50/60 p-4 rounded-lg border border-slate-200">
          <div className="space-y-1.5">
            <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              {invoice.invoiceType === 'dealer' ? 'গ্রাহক / ডিলার বিবরণ:' : 'এস.আর ও মার্কেট বিবরণ:'}
            </p>
            <p className="text-sm font-bold text-slate-900">
              {invoice.dealerName || 'সাধারণ খুচরা বিক্রেতা'}
            </p>
            {invoice.srName && (
              <p className="text-slate-700">
                <span className="text-slate-500">এস.আর নাম:</span> <strong>{invoice.srName}</strong>
              </p>
            )}
            {invoice.route && (
              <p className="text-slate-600">
                <span className="text-slate-500">রুট / এলাকা:</span> {invoice.route}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-right">
            <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              চালান তথ্য:
            </p>
            <p className="text-sm font-mono font-bold text-emerald-900">
              {invoice.invoiceNumber}
            </p>
            <p className="text-slate-700">
              <span className="text-slate-500">তারিখ:</span>{' '}
              <strong className="font-mono-num">{toBengaliNumber(invoice.date)}</strong>
            </p>
            <p className="text-slate-600 text-[11px]">
              বিল প্রস্তুতকারক: {invoice.createdBy}
            </p>
          </div>
        </div>

        {/* Items Table (Requirement 3 & 7) */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-10">ক্র.</th>
                <th className="py-2 px-3 border-r border-slate-300">পণ্যের বিবরণ (Product Description)</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-16">কার্টুন</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-16">পিস</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-20">মোট পিস</th>
                <th className="py-2 px-2 text-right border-r border-slate-300 w-20">T.P (টাকা)</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-14">%</th>
                <th className="py-2 px-2 text-right border-r border-slate-300 w-22">D.P (টাকা)</th>
                {invoice.invoiceType === 'sr' && (
                  <>
                    <th className="py-2 px-1 text-center border-r border-slate-300 w-14">ড্যামেজ</th>
                    <th className="py-2 px-1 text-center border-r border-slate-300 w-14">রিটার্ন</th>
                  </>
                )}
                <th className="py-2 px-3 text-right w-28">মোট টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-mono">
                    {toBengaliNumber(idx + 1)}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <p className="font-semibold text-slate-900">{item.productNameBn || item.productName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ১ কার্টুন = {toBengaliNumber(item.piecesPerCarton)} পিস
                    </p>
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-mono-num font-medium">
                    {toBengaliNumber(item.cartonQty)}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-mono-num font-medium">
                    {toBengaliNumber(item.pieceQty)}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-mono-num font-bold text-slate-800">
                    {toBengaliNumber(item.totalPieces)}
                  </td>
                  <td className="py-2 px-2 text-right border-r border-slate-200 font-mono-num">
                    {formatNumber(item.tp, 'bn')}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-mono-num">
                    {toBengaliNumber(item.discountPercent)}%
                  </td>
                  <td className="py-2 px-2 text-right border-r border-slate-200 font-mono-num font-bold text-emerald-900">
                    {formatNumber(item.dp, 'bn')}
                  </td>
                  {invoice.invoiceType === 'sr' && (
                    <>
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-mono-num text-red-700">
                        {toBengaliNumber(item.damageTotalPieces || 0)}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-mono-num text-amber-700">
                        {toBengaliNumber(item.returnTotalPieces || 0)}
                      </td>
                    </>
                  )}
                  <td className="py-2 px-3 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(invoice.invoiceType === 'sr' ? (item.netLineTotal ?? item.lineTotal) : item.lineTotal, 'bn')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & In-Words Amount (Requirement 6 & 30) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 pt-2">
          <div className="space-y-3">
            {/* In Words */}
            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
              <span className="font-semibold text-emerald-950 block mb-0.5">কথায় (In Words):</span>
              <span className="font-medium text-emerald-900">
                {numberToBengaliWords(invoice.netAmount)}
              </span>
            </div>

            {invoice.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold block mb-0.5">মন্তব্য:</span>
                {invoice.notes}
              </div>
            )}

            <div className="text-[11px] text-slate-500 leading-relaxed border-l-2 border-slate-300 pl-2">
              <p>১. বিক্রিত মাল ফেরতযোগ্য নহে।</p>
              <p>২. পণ্য গ্রহণের সময় কার্টুন সংখ্যা ও গুণগত মান সঠিকভাবে বুঝিয়া লউন।</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">মোট কার্টুন ও পিস:</span>
              <span className="font-mono-num font-bold text-slate-900">
                {toBengaliNumber(invoice.totalCartons)} কার্টুন + {toBengaliNumber(invoice.totalPieces)} পিস
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">টি.পি মূল্যে মোট টাকা (Gross Amount):</span>
              <span className="font-mono-num text-slate-800">{formatCurrency(invoice.totalGrossAmount, 'bn')}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-800">
              <span>মোট কমিশন / ডিলার ছাড় (Total Discount):</span>
              <span className="font-mono-num font-semibold">- {formatCurrency(invoice.totalDiscount, 'bn')}</span>
            </div>

            {invoice.invoiceType === 'sr' && invoice.totalDamagePieces && invoice.totalDamagePieces > 0 ? (
              <div className="flex justify-between py-1 border-b border-slate-200 text-red-600">
                <span>ড্যামেজ বাদ ({toBengaliNumber(invoice.totalDamagePieces)} পিস):</span>
                <span className="font-mono-num">সমন্বয়কৃত</span>
              </div>
            ) : null}

            <div className="flex justify-between py-1.5 border-b-2 border-slate-900 text-sm font-bold text-slate-950">
              <span>সর্বমোট নিট প্রদেয় (Net Amount):</span>
              <span className="font-mono-num text-emerald-900 text-base">
                {formatCurrency(invoice.netAmount, 'bn')}
              </span>
            </div>

            <div className="flex justify-between py-1 text-slate-700">
              <span>পরিশোধিত টাকা (Paid):</span>
              <span className="font-mono-num font-bold">{formatCurrency(invoice.paidAmount, 'bn')}</span>
            </div>

            <div className="flex justify-between py-1 text-red-700 font-bold bg-red-50/60 px-2 rounded-sm">
              <span>চলতি চালানে বকেয়া (Due):</span>
              <span className="font-mono-num">{formatCurrency(invoice.dueAmount, 'bn')}</span>
            </div>
          </div>
        </div>

        {/* Official Two Signature Boxes (Requirement 30) */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12">
          {/* Dealer / Customer Signature */}
          <div className="text-center">
            <div className="border-t border-slate-400 w-44 mx-auto mb-1.5 pt-1">
              <p className="text-xs font-bold text-slate-800">
                গ্রাহক / ডিলার স্বাক্ষর
              </p>
              <p className="text-[10px] text-slate-500">
                Receiving Dealer Signature
              </p>
            </div>
          </div>

          {/* Company Chairman Signature */}
          <div className="text-center">
            <div className="border-t border-slate-400 w-52 mx-auto mb-1.5 pt-1 relative">
              {/* Seal Stamp Motif */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-70 pointer-events-none">
                <span className="text-[10px] font-mono border border-emerald-700 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  SEAL & SIGN
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-950">
                {settings.chairmanNameBn || settings.chairmanName}
              </p>
              <p className="text-[10px] font-semibold text-emerald-800">
                {settings.chairmanDesignationBn || settings.chairmanDesignation}
              </p>
              <p className="text-[9px] text-slate-400">
                {settings.companyNameBn || settings.companyName}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>{settings.invoiceFooterNoteBn || settings.invoiceFooterNote}</span>
          <span className="font-mono">Generated by Probhati ERP System</span>
        </div>
      </div>
    </div>
  );
};
