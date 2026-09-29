import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage, CompanySettings, FeatureLocks } from '../../types';
import {
  SlidersHorizontal,
  Building2,
  Lock,
  Unlock,
  Save,
  CheckCircle2,
  Key,
  Shield,
  Percent,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onOpenPasswordModal: () => void;
}

export const SettingsView: React.FC<Props> = ({ lang, onOpenPasswordModal }) => {
  const [settings, setSettings] = useState<CompanySettings>(() => db.getSettings());
  const [locks, setLocks] = useState<FeatureLocks>(() => db.getFeatureLocks());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSettingsChange = (field: keyof CompanySettings, val: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settings);
    setSaveSuccessMsg(
      lang === 'bn'
        ? 'কোম্পানি সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
        : 'Company settings saved successfully!'
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleToggleLock = (key: keyof FeatureLocks) => {
    const newVal = !locks[key];
    db.toggleFeatureLock(key, newVal);
    setLocks(db.getFeatureLocks());
  };

  const lockList: { key: keyof FeatureLocks; bn: string; en: string; descBn: string; descEn: string }[] = [
    {
      key: 'dealerInvoice',
      bn: 'ডিলার চালান তৈরি',
      en: 'Dealer Invoice Maker',
      descBn: 'ডিলার ইনভয়েস এন্ট্রি ও এডিটিং সুবিধা',
      descEn: 'Creation and editing of dealer invoices',
    },
    {
      key: 'srInvoice',
      bn: 'এস.আর চালান তৈরি',
      en: 'S.R Invoice Maker',
      descBn: 'এস.আর সেলস, ড্যামেজ ও রিটার্ন এন্ট্রি',
      descEn: 'Field sales representative invoice creation',
    },
    {
      key: 'stock',
      bn: 'স্টক ও ইনভেন্টরি এডিট',
      en: 'Stock & Inventory Management',
      descBn: 'স্টক পরিবর্তন ও পণ্য তালিকা তৈরি',
      descEn: 'Inventory tracking and stock adjustments',
    },
    {
      key: 'purchase',
      bn: 'পণ্য ক্রয় এন্ট্রি',
      en: 'Purchase Entry',
      descBn: 'ফ্যাক্টরি থেকে নতুন পণ্য ক্রয় রেকর্ড',
      descEn: 'Recording supplier purchase shipments',
    },
    {
      key: 'damageReturn',
      bn: 'ড্যামেজ ও রিটার্ন লগ',
      en: 'Damage & Return Logs',
      descBn: 'পণ্য ক্ষতি ও গ্রাহক ফেরত এন্ট্রি',
      descEn: 'Direct damage logging and sales returns',
    },
    {
      key: 'srTarget',
      bn: 'এস.আর লক্ষ্যমাত্রা ও টার্গেট',
      en: 'S.R Monthly Targets',
      descBn: 'মাসিক সেলস টার্গেট ও কোটা নির্ধারণ',
      descEn: 'Setting monthly targets and product quotas',
    },
    {
      key: 'reports',
      bn: 'উন্নত রিপোর্ট ও বিশ্লেষণ',
      en: 'Reports & Analytics',
      descBn: 'মাসিক, বার্ষিক ও ডিলারভিত্তিক রিপোর্ট দেখা',
      descEn: 'Detailed financial and sales reports',
    },
    {
      key: 'backupRestore',
      bn: 'ডাটা ব্যাকআপ ও রিস্টোর',
      en: 'Data Backup & Restore',
      descBn: 'সম্পূর্ণ ডাটাবেজ এক্সপোর্ট ও ইমপোর্ট',
      descEn: 'Database JSON export and factory reset',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'কোম্পানি সেটিংস ও ফিচার লক নিয়ন্ত্রণ' : 'Company Settings & Feature Locks'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'কোম্পানির বিবরণ, চেয়ারম্যানের নাম, ডিফল্ট কমিশন ও মডিউল লক/আনলক নিয়ন্ত্রণ'
                : 'Configure business details, chairman signatures, and feature locks'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPasswordModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
        >
          <Key className="w-4 h-4 text-slate-500" />
          <span>{lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Feature Lock / Unlock Grid (Requirement 36) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-emerald-800" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'সিস্টেম ফিচার লক / আনলক (Admin Permission)' : 'Feature Lock / Unlock Control'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'লক করা ফিচারসমূহ সাধারণ ব্যবহারকারীদের জন্য সুরক্ষিত থাকবে'
                : 'Locked features will show access-restricted screen'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lockList.map((item) => {
            const isLocked = locks[item.key];
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                  isLocked ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {lang === 'bn' ? item.bn : item.en}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        isLocked
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {isLocked ? (lang === 'bn' ? '🔒 লক' : 'Locked') : (lang === 'bn' ? '🔓 আনলক' : 'Active')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {lang === 'bn' ? item.descBn : item.descEn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleLock(item.key)}
                  className={`p-2 rounded-lg transition font-semibold text-xs flex items-center gap-1.5 ${
                    isLocked
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  title={isLocked ? 'Unlock feature' : 'Lock feature'}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Settings Form (Requirement 32) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-emerald-800" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'কোম্পানি প্রোফাইল ও ইনভয়েস তথ্য' : 'Company Profile & Invoice Details'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'A4 চালান প্রিন্ট ও ব্যানারে এই তথ্যগুলো প্রদর্শিত হয়' : 'These appear on official A4 invoice prints'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কোম্পানির নাম (বাংলা)' : 'Company Name (Bengali)'}
              </label>
              <input
                type="text"
                required
                value={settings.companyNameBn}
                onChange={(e) => handleSettingsChange('companyNameBn', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কোম্পানির নাম (English)' : 'Company Name (English)'}
              </label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => handleSettingsChange('companyName', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কোম্পানি স্লোগান (বাংলা)' : 'Tagline (Bengali)'}
              </label>
              <input
                type="text"
                value={settings.taglineBn}
                onChange={(e) => handleSettingsChange('taglineBn', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কোম্পানি স্লোগান (English)' : 'Tagline (English)'}
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleSettingsChange('tagline', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'চেয়ারম্যানের নাম (বাংলা)' : 'Chairman Name (Bengali)'}
              </label>
              <input
                type="text"
                required
                value={settings.chairmanNameBn}
                onChange={(e) => handleSettingsChange('chairmanNameBn', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'পদবি (Designation)' : 'Designation'}
              </label>
              <input
                type="text"
                value={settings.chairmanDesignationBn}
                onChange={(e) => handleSettingsChange('chairmanDesignationBn', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'হটলাইন / মোবাইল নম্বর' : 'Phone / Hotline'}
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleSettingsChange('phone', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Email'}
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingsChange('email', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'ওয়েবসাইট' : 'Website'}
              </label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => handleSettingsChange('website', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'অফিস ঠিকানা' : 'Office Address'}
            </label>
            <input
              type="text"
              value={settings.addressBn}
              onChange={(e) => handleSettingsChange('addressBn', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'চালান প্রিফিক্স (Invoice Prefix)' : 'Invoice Prefix'}
              </label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => handleSettingsChange('invoicePrefix', e.target.value.toUpperCase())}
                placeholder="PFP"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'ডিফল্ট ডিলার কমিশন / ছাড় %' : 'Default Discount %'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.defaultDiscountPercent}
                  onChange={(e) =>
                    handleSettingsChange('defaultDiscountPercent', parseFloat(e.target.value) || 0)
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'চালান পাদটীকা ও শর্তাবলী (Invoice Footer)' : 'Invoice Footer Note'}
            </label>
            <textarea
              rows={2}
              value={settings.invoiceFooterNoteBn}
              onChange={(e) => handleSettingsChange('invoiceFooterNoteBn', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
