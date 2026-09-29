import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage, Dealer, Invoice } from '../../types';
import {
  formatCurrency,
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Receipt,
  Phone,
  MapPin,
  Search,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { PrintableInvoiceModal } from '../invoices/PrintableInvoiceModal';

interface Props {
  lang: AppLanguage;
  onCreateInvoiceForDealer?: (dealerId: string) => void;
}

export const DealerManagementView: React.FC<Props> = ({
  lang,
  onCreateInvoiceForDealer,
}) => {
  const [dealers, setDealers] = useState<Dealer[]>(() => db.getDealers());
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [proprietor, setProprietor] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [areaRoute, setAreaRoute] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);

  // Detail / Invoice history view state
  const [selectedDealerHistory, setSelectedDealerHistory] = useState<Dealer | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  const refreshDealers = () => {
    setDealers(db.getDealers());
  };

  const handleOpenAdd = () => {
    setEditingDealer(null);
    setCode(`DLR-${(dealers.length + 1).toString().padStart(3, '0')}`);
    setName('');
    setProprietor('');
    setMobile('');
    setAddress('');
    setAreaRoute('');
    setOpeningBalance(0);
    setShowModal(true);
  };

  const handleOpenEdit = (d: Dealer) => {
    setEditingDealer(d);
    setCode(d.code);
    setName(d.name);
    setProprietor(d.proprietor || '');
    setMobile(d.mobile);
    setAddress(d.address);
    setAreaRoute(d.areaRoute);
    setOpeningBalance(d.openingBalance);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDealer) {
      const updated: Dealer = {
        ...editingDealer,
        code,
        name,
        proprietor,
        mobile,
        address,
        areaRoute,
      };
      db.saveDealer(updated);
    } else {
      const newDlr: Dealer = {
        id: `dlr-${Date.now()}`,
        code,
        name,
        proprietor,
        mobile,
        address,
        areaRoute,
        openingBalance,
        currentBalance: openingBalance,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.saveDealer(newDlr);
    }

    setShowModal(false);
    refreshDealers();
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত এই ডিলারকে মুছে ফেলতে চান?' : 'Delete this dealer?')) {
      db.deleteDealer(id);
      refreshDealers();
      if (selectedDealerHistory?.id === id) {
        setSelectedDealerHistory(null);
      }
    }
  };

  const allInvoices = db.getInvoices();
  const getDealerInvoices = (dealerId: string) => {
    return allInvoices.filter((i) => i.dealerId === dealerId);
  };

  const filteredDealers = dealers.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.mobile.includes(q) ||
      d.areaRoute.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 text-amber-50 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'ডিলার ব্যবস্থাপনা (Dealer Management)' : 'Dealer Management'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'ডিলার নিবন্ধন, রুট ম্যাপিং, লেনদেন হিসাব ও নির্দিষ্ট ডিলারের চালান ইতিহাস'
                : 'Dealer profiles, balance tracking, route allocation and invoice history'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? '+ নতুন ডিলার যোগ' : '+ Add Dealer'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'bn' ? 'ডিলারের নাম, কোড, মোবাইল বা এলাকা দিয়ে খুঁজুন...' : 'Search by name, code, phone, route...'}
          className="w-full text-xs outline-hidden"
        />
      </div>

      {/* Dealers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.map((d) => {
          const invList = getDealerInvoices(d.id);
          const totalSales = invList.reduce((sum, i) => sum + i.netAmount, 0);

          return (
            <div
              key={d.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {d.code}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1.5">{d.name}</h2>
                    {d.proprietor && (
                      <p className="text-xs text-slate-500">প্রোপ্রাইটর: {d.proprietor}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{d.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{d.address}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    রুট: <strong className="text-slate-700">{d.areaRoute}</strong>
                  </div>
                </div>

                {/* Balance Stats */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">মোট ক্রয়</span>
                    <span className="font-mono-num font-bold text-slate-800">
                      {formatCurrency(totalSales, lang)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">বর্তমান বকেয়া</span>
                    <span className="font-mono-num font-bold text-red-700">
                      {formatCurrency(d.currentBalance, lang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDealerHistory(d)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  {lang === 'bn' ? `চালানসমূহ (${toBengaliNumber(invList.length)})` : `Invoices (${invList.length})`}
                </button>

                {onCreateInvoiceForDealer && (
                  <button
                    onClick={() => onCreateInvoiceForDealer(d.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'চালান কাটুন' : 'Invoice'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dealer Invoice History Drawer / Modal (Requirement 17) */}
      {selectedDealerHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDealerHistory.name} — {lang === 'bn' ? 'চালান ইতিহাস' : 'Invoice History'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedDealerHistory.code} · {selectedDealerHistory.areaRoute} · মোবাইল: {selectedDealerHistory.mobile}
                </p>
              </div>
              <button
                onClick={() => setSelectedDealerHistory(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Invoice #</th>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3 text-right">কার্টুন</th>
                    <th className="py-2 px-3 text-right">মোট পিস</th>
                    <th className="py-2 px-3 text-right">মোট টাকা</th>
                    <th className="py-2 px-3 text-right">বকেয়া</th>
                    <th className="py-2 px-3 text-center">ভিউ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getDealerInvoices(selectedDealerHistory.id).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-800">{inv.invoiceNumber}</td>
                      <td className="py-2 px-3 text-slate-600">{toBengaliNumber(inv.date)}</td>
                      <td className="py-2 px-3 text-right font-mono-num">{formatNumber(inv.totalCartons, lang)}</td>
                      <td className="py-2 px-3 text-right font-mono-num">{formatNumber(inv.totalPieces, lang)}</td>
                      <td className="py-2 px-3 text-right font-mono-num font-bold text-slate-900">
                        {formatCurrency(inv.netAmount, lang)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-num font-bold text-red-700">
                        {inv.dueAmount > 0 ? formatCurrency(inv.dueAmount, lang) : '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="p-1 text-slate-500 hover:text-emerald-800"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getDealerInvoices(selectedDealerHistory.id).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        {lang === 'bn' ? 'এই ডিলারের কোনো চালান কাটা হয়নি' : 'No invoices for this dealer'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Dealer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingDealer
                  ? lang === 'bn' ? 'ডিলার তথ্য পরিবর্তন' : 'Edit Dealer'
                  : lang === 'bn' ? 'নতুন ডিলার নিবন্ধন' : 'Add New Dealer'}
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
                    {lang === 'bn' ? 'ডিলার কোড' : 'Dealer Code'}
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
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="01712-XXXXXX"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ডিলারের নাম / প্রতিষ্ঠানের নাম' : 'Dealer / Enterprise Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="মেসার্স ভাই ভাই এন্টারপ্রাইজ..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'প্রোপ্রাইটর / মালিকের নাম' : 'Proprietor Name'}
                </label>
                <input
                  type="text"
                  value={proprietor}
                  onChange={(e) => setProprietor(e.target.value)}
                  placeholder="হাজী মোঃ রফিকুল ইসলাম..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ঠিকানা' : 'Address'}
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="কদমগাছা বাজার, বগুড়া সদর..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'রুট / এলাকা (Route/Area)' : 'Route / Area'}
                </label>
                <input
                  type="text"
                  required
                  value={areaRoute}
                  onChange={(e) => setAreaRoute(e.target.value)}
                  placeholder="Kichok - Shibganj Route..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              {!editingDealer && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'পূর্বের জের / ওপেনিং বকেয়া (Opening Balance)' : 'Opening Balance Due (Tk)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              )}

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
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
