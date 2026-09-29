import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage, Invoice } from '../../types';
import {
  formatCurrency,
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';

interface Props {
  lang: AppLanguage;
  onEditInvoice: (invoice: Invoice) => void;
  onNewInvoice: (type: 'dealer' | 'sr') => void;
}

export const InvoiceList: React.FC<Props> = ({ lang, onEditInvoice, onNewInvoice }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dealer' | 'sr'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshInvoices = () => {
    setInvoices(db.getInvoices());
  };

  const handleDelete = (id: string) => {
    db.deleteInvoice(id);
    setDeleteConfirmId(null);
    refreshInvoices();
  };

  // Search & Filter Filter Logic (Requirement 27)
  const filteredInvoices = invoices.filter((inv) => {
    // Type filter
    if (typeFilter !== 'all' && inv.invoiceType !== typeFilter) return false;

    // Date range filter
    if (startDate && inv.date < startDate) return false;
    if (endDate && inv.date > endDate) return false;

    // Search query matches: Invoice Number, Dealer Name, SR Name, Route, or Product Name in items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchInvNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchDealer = inv.dealerName?.toLowerCase().includes(q);
      const matchSR = inv.srName?.toLowerCase().includes(q);
      const matchRoute = inv.route?.toLowerCase().includes(q);
      const matchProduct = inv.items.some(
        (it) =>
          it.productName.toLowerCase().includes(q) ||
          it.productNameBn?.toLowerCase().includes(q)
      );

      return matchInvNum || matchDealer || matchSR || matchRoute || matchProduct;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'সকল ইনভয়েস ও বিক্রয় অনুসন্ধান' : 'Invoice History & Search'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'তারিখ, চালান নম্বর, ডিলার, এস.আর অথবা পণ্যের নাম দিয়ে যেকোনো চালান খুঁজুন'
                : 'Search invoices by date range, invoice #, dealer, SR or products'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewInvoice('dealer')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs transition"
            >
              {lang === 'bn' ? '+ নতুন ডিলার চালান' : '+ Dealer Invoice'}
            </button>
            <button
              onClick={() => onNewInvoice('sr')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-xs transition"
            >
              {lang === 'bn' ? '+ নতুন এস.আর চালান' : '+ S.R Invoice'}
            </button>
          </div>
        </div>

        {/* Filter Controls (Requirement 27) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'চালান নং, ডিলার, এস.আর বা পণ্য খুঁজুন...' : 'Search invoice, dealer, SR, product...'}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'dealer' | 'sr')}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">{lang === 'bn' ? 'সকল চালান (All Types)' : 'All Invoices'}</option>
              <option value="dealer">{lang === 'bn' ? 'ডিলার চালান (Dealer)' : 'Dealer Invoices'}</option>
              <option value="sr">{lang === 'bn' ? 'এস.আর চালান (S.R)' : 'S.R Invoices'}</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">{lang === 'bn' ? 'হতে:' : 'From:'}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">{lang === 'bn' ? 'পর্যন্ত:' : 'To:'}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {(searchQuery || typeFilter !== 'all' || startDate || endDate) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              {lang === 'bn'
                ? `অনুসন্ধানের ফলাফল: ${toBengaliNumber(filteredInvoices.length)}টি চালান পাওয়া গেছে`
                : `Found ${filteredInvoices.length} matching invoices`}
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-emerald-800 hover:underline font-semibold"
            >
              {lang === 'bn' ? 'ফিল্টার মুছুন (Reset)' : 'Reset Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Invoices List Table */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'চালান নম্বর' : 'Invoice #'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'ধরন' : 'Type'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'গ্রাহক / ডিলার / এস.আর' : 'Dealer / SR'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'কার্টুন' : 'Carton'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট পিস' : 'Total Pcs'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট টাকা' : 'Net Total'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'বকেয়া' : 'Due'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {lang === 'bn' ? toBengaliNumber(inv.date) : inv.date}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        inv.invoiceType === 'dealer'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {inv.invoiceType === 'dealer' ? 'ডিলার' : 'এস.আর'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800">{inv.dealerName || 'খুচরা গ্রাহক'}</p>
                    {inv.srName && (
                      <p className="text-[10px] text-slate-500">SR: {inv.srName}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num text-slate-700">
                    {formatNumber(inv.totalCartons, lang)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num text-slate-700">
                    {formatNumber(inv.totalPieces, lang)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(inv.netAmount, lang)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num font-bold text-red-700">
                    {inv.dueAmount > 0 ? formatCurrency(inv.dueAmount, lang) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* View & Print */}
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition"
                        title={lang === 'bn' ? 'প্রিন্ট ভিউ' : 'View & Print'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit (Requirement 29) */}
                      <button
                        onClick={() => onEditInvoice(inv)}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                        title={lang === 'bn' ? 'এডিট করুন' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete (Requirement 29: automatic stock rollback) */}
                      <button
                        onClick={() => setDeleteConfirmId(inv.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                        title={lang === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো ইনভয়েস রেকর্ড পাওয়া যায়নি' : 'No invoices found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'bn' ? 'চালানটি কি নিশ্চিত মুছে ফেলতে চান?' : 'Confirm Invoice Deletion'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'চালানটি মুছে ফেললে এর বিক্রিত পণ্য স্টক অ্যাকাউন্টে পুনরায় ফেরত (Restore) যোগ করা হবে।'
                : 'Deleting this invoice will automatically restore and restock the inventory items.'}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                {lang === 'bn' ? 'না, রাখুন' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {selectedInvoiceForPrint && (
        <PrintableInvoiceModal
          invoice={selectedInvoiceForPrint}
          lang={lang}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
