import React, { useState } from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage, DamageRecord, ReturnRecord, Product } from '../../types';
import {
  formatNumber,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  RotateCcw,
  AlertOctagon,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
}

export const DamageReturnView: React.FC<Props> = ({ lang }) => {
  const products = db.getProducts();
  const srs = db.getSRs();
  const dealers = db.getDealers();

  const [activeSubTab, setActiveSubTab] = useState<'damage' | 'return'>('damage');
  const [damages, setDamages] = useState<DamageRecord[]>(() => db.getDamageRecords());
  const [returns, setReturns] = useState<ReturnRecord[]>(() => db.getReturnRecords());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(getTodayDateString());
  const [selectedProductId, setSelectedProductId] = useState(
    products.length > 0 ? products[0].id : ''
  );
  const [cartonQty, setCartonQty] = useState(0);
  const [pieceQty, setPieceQty] = useState(1);
  const [sourceName, setSourceName] = useState(srs.length > 0 ? srs[0].name : '');
  const [reason, setReason] = useState('পণ্য প্যাকেজিং ক্ষতিগ্রস্ত বা লিকেজ');

  const refreshData = () => {
    setDamages(db.getDamageRecords());
    setReturns(db.getReturnRecords());
  };

  const handleOpenModal = () => {
    setDate(getTodayDateString());
    setSelectedProductId(products.length > 0 ? products[0].id : '');
    setCartonQty(0);
    setPieceQty(1);
    setReason(
      activeSubTab === 'damage'
        ? 'পরিবহনকালে বোতল লিকেজ/ক্ষতিগ্রস্ত'
        : 'অতিরিক্ত অর্ডার বা মেয়াদ পূর্বে ফেরত'
    );
    setShowModal(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const totalPieces = cartonQty * prod.piecesPerCarton + pieceQty;
    if (totalPieces <= 0) return;

    if (activeSubTab === 'damage') {
      const dmg: DamageRecord = {
        id: `dmg-manual-${Date.now()}`,
        date,
        srName: sourceName,
        productId: prod.id,
        productName: prod.nameBn || prod.name,
        cartonQty,
        pieceQty,
        totalPieces,
        reason,
        createdAt: new Date().toISOString(),
      };
      db.logDirectDamage(dmg);
    } else {
      const ret: ReturnRecord = {
        id: `ret-manual-${Date.now()}`,
        date,
        dealerName: sourceName,
        productId: prod.id,
        productName: prod.nameBn || prod.name,
        cartonQty,
        pieceQty,
        totalPieces,
        reason,
        createdAt: new Date().toISOString(),
      };
      db.logDirectReturn(ret);
    }

    setShowModal(false);
    refreshData();
  };

  const handleDeleteDamage = (id: string) => {
    if (confirm(lang === 'bn' ? 'ড্যামেজ রেকর্ড মুছলে স্টক পুনঃসংযোজিত হবে। নিশ্চিত?' : 'Delete damage record?')) {
      db.deleteDamageRecord(id);
      refreshData();
    }
  };

  const handleDeleteReturn = (id: string) => {
    if (confirm(lang === 'bn' ? 'রিটার্ন রেকর্ড মুছলে স্টক পুনঃসামঞ্জস্য হবে। নিশ্চিত?' : 'Delete return record?')) {
      db.deleteReturnRecord(id);
      refreshData();
    }
  };

  const totalDamagePieces = damages.reduce((sum, d) => sum + d.totalPieces, 0);
  const totalReturnPieces = returns.reduce((sum, r) => sum + r.totalPieces, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-800 text-rose-200 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'ড্যামেজ ও প্রোডাক্ট রিটার্ন ব্যবস্থাপনা' : 'Damage & Return Management'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'ড্যামেজ পণ্য স্টক থেকে বাদ যায় এবং রিটার্ন পণ্য স্বয়ংক্রিয়ভাবে স্টকে যোগ হয়'
                : 'Damaged items auto-deduct from stock, and returned products restock inventory'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeSubTab === 'damage'
              ? lang === 'bn' ? '+ নতুন ড্যামেজ এন্ট্রি' : '+ Log Damage'
              : lang === 'bn' ? '+ নতুন রিটার্ন এন্ট্রি' : '+ Log Return'}
          </span>
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('damage')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeSubTab === 'damage'
              ? 'bg-white text-red-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-red-600" />
          <span>
            {lang === 'bn' ? 'ড্যামেজ লগ (ক্ষতিগ্রস্ত পণ্য)' : 'Damage Logs'} ({formatNumber(damages.length, lang)})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('return')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeSubTab === 'return'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <span>
            {lang === 'bn' ? 'রিটার্ন লগ (ফেরত পণ্য)' : 'Return Logs'} ({formatNumber(returns.length, lang)})
          </span>
        </button>
      </div>

      {/* Table Content */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        {activeSubTab === 'damage' ? (
          <div>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                {lang === 'bn' ? 'সকল ড্যামেজ পণ্যের তালিকা' : 'Damage Records'}
              </h2>
              <span className="text-xs font-mono font-bold text-red-700">
                মোট ড্যামেজ: {formatNumber(totalDamagePieces, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">পণ্যের নাম</th>
                    <th className="py-2.5 px-3 text-right">কার্টুন</th>
                    <th className="py-2.5 px-3 text-right">পিস</th>
                    <th className="py-2.5 px-3 text-right font-bold text-red-700">মোট পিস</th>
                    <th className="py-2.5 px-3">এস.আর / ডিলার</th>
                    <th className="py-2.5 px-3">কারণ (Reason)</th>
                    <th className="py-2.5 px-3 text-center">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {damages.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{toBengaliNumber(d.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{d.productName}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(d.cartonQty, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(d.pieceQty, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-red-700">
                        {formatNumber(d.totalPieces, lang)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{d.srName || d.dealerName || 'ফিল্ড রিপোর্ট'}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{d.reason}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteDamage(d.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {damages.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        {lang === 'bn' ? 'কোনো ড্যামেজ রেকর্ড নেই' : 'No damage records found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                {lang === 'bn' ? 'সকল রিটার্ন পণ্যের তালিকা' : 'Return Records'}
              </h2>
              <span className="text-xs font-mono font-bold text-amber-800">
                মোট রিটার্ন: {formatNumber(totalReturnPieces, lang)} {lang === 'bn' ? 'পিস' : 'pcs'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">পণ্যের নাম</th>
                    <th className="py-2.5 px-3 text-right">কার্টুন</th>
                    <th className="py-2.5 px-3 text-right">পিস</th>
                    <th className="py-2.5 px-3 text-right font-bold text-amber-800">মোট পিস</th>
                    <th className="py-2.5 px-3">ডিলার / এস.আর</th>
                    <th className="py-2.5 px-3">কারণ (Reason)</th>
                    <th className="py-2.5 px-3 text-center">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{toBengaliNumber(r.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.productName}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(r.cartonQty, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num">{formatNumber(r.pieceQty, lang)}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-amber-800">
                        {formatNumber(r.totalPieces, lang)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{r.dealerName || r.srName || 'মার্কেট'}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{r.reason}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteReturn(r.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {returns.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        {lang === 'bn' ? 'কোনো রিটার্ন রেকর্ড নেই' : 'No return records found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {activeSubTab === 'damage'
                  ? lang === 'bn' ? 'নতুন ড্যামেজ এন্ট্রি' : 'Log New Damage'
                  : lang === 'bn' ? 'নতুন রিটার্ন এন্ট্রি' : 'Log New Return'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 mt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'তারিখ' : 'Date'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পণ্য নির্বাচন করুন' : 'Select Product'}
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn || p.name} (১ctn={p.piecesPerCarton}pcs | মজুদ: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কার্টুন</label>
                  <input
                    type="number"
                    min="0"
                    value={cartonQty}
                    onChange={(e) => setCartonQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পিস</label>
                  <input
                    type="number"
                    min="0"
                    value={pieceQty}
                    onChange={(e) => setPieceQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {activeSubTab === 'damage'
                    ? lang === 'bn' ? 'এস.আর / ডিলারের নাম' : 'S.R / Dealer Name'
                    : lang === 'bn' ? 'ডিলারের নাম' : 'Dealer Name'}
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="নাম লিখুন..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'কারণ (Reason)' : 'Reason'}
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
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
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
