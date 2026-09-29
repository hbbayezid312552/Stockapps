import React, { useState, useRef } from 'react';
import { db, getTodayDateString } from '../../db/storage';
import { AppLanguage } from '../../types';
import {
  HardDriveDownload,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onDataReset?: () => void;
}

export const BackupRestoreView: React.FC<Props> = ({ lang, onDataReset }) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const json = db.exportFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Probhati_Backup_${getTodayDateString()}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message:
          lang === 'bn'
            ? 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!'
            : 'Complete JSON backup exported successfully!',
      });
    } catch {
      setFeedback({
        type: 'error',
        message:
          lang === 'bn' ? 'ব্যাকআপ ডাউনলোড ব্যর্থ হয়েছে।' : 'Failed to export database backup.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = db.restoreFullBackup(content);
      if (result.success) {
        setFeedback({
          type: 'success',
          message:
            lang === 'bn'
              ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে! সকল ডাটা পুনঃস্থাপন করা হয়েছে।'
              : 'Backup restored successfully! All tables updated.',
        });
        if (onDataReset) onDataReset();
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        lang === 'bn'
          ? 'সতর্কতা: এটি আপনার বর্তমান সকল ডাটা মুছে প্রাথমিক ফ্যাক্টরি ডিফল্ট ডাটায় ফিরিয়ে দেবে। আপনি কি নিশ্চিত?'
          : 'Warning: This will wipe custom data and restore default factory database. Proceed?'
      )
    ) {
      db.resetToFactoryDefaults();
      setFeedback({
        type: 'success',
        message:
          lang === 'bn'
            ? 'ডাটাবেজ প্রাথমিক অবস্থায় সফলভাবে রিসেট করা হয়েছে!'
            : 'Database successfully restored to factory defaults!',
      });
      if (onDataReset) onDataReset();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-800 text-teal-200 flex items-center justify-center">
          <HardDriveDownload className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {lang === 'bn' ? 'ডাটা ব্যাকআপ ও রিস্টোর (Backup & Restore)' : 'Data Backup & Restore'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'bn'
              ? 'আপনার প্রতিষ্ঠানের সকল পণ্য, ডিলার, এস.আর, ইনভয়েস ও স্টক ডাটা অফলাইনে ডাউনলোড ও পুনরুদ্ধার করুন'
              : 'Export full offline JSON database or restore from previously saved files'}
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid of 3 Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Export Full Backup */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <FileJson className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'ডাটা ব্যাকআপ ডাউনলোড (Export)' : 'Export Full Backup'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'পণ্য, ডিলার, এস.আর, চালান, স্টক এবং সেটিংসসহ সমস্ত রেকর্ড একটি নিরাপদ JSON ফাইলে সংরক্ষণ করুন।'
                : 'Download all database records (products, invoices, dealers, SRs, stock) into a portable JSON file.'}
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="mt-6 w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ব্যাকআপ ডাউনলোড করুন' : 'Export JSON Backup'}</span>
          </button>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'ব্যাকআপ পুনরুদ্ধার (Restore)' : 'Restore from Backup'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'পূর্বে ডাউনলোডকৃত কোনো ব্যাকআপ JSON ফাইল সিলেক্ট করে ডাটাবেজ পুনঃস্থাপন করুন।'
                : 'Select an existing backup JSON file to restore and load your past system data.'}
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ব্যাকআপ ফাইল সিলেক্ট করুন' : 'Select Backup File'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Factory Reset */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'ফ্যাক্টরি রিসেট (Reset Defaults)' : 'Reset Factory Defaults'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'সিস্টেমের সকল ডাটা মুছে প্রভাতী ফুড প্রোডাক্টস-এর প্রারম্ভিক ডেমো ডাটায় ফিরিয়ে আনুন।'
                : 'Reset data structures to initial sample catalog for testing or fresh installation.'}
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-300 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-amber-700" />
            <span>{lang === 'bn' ? 'ডিফল্ট অবস্থায় রিসেট করুন' : 'Reset to Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Offline Assurance Note */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold">
            {lang === 'bn' ? '১০০% ফ্রি ও অফলাইন টেকনোলজি (Offline Free System)' : '100% Free & Offline Solution'}
          </h2>
          <p className="text-emerald-800 mt-0.5 leading-relaxed">
            {lang === 'bn'
              ? 'এই অ্যাপটিতে কোনো পেইড সার্ভার, পেইড ডাটাবেজ বা পেইড সাবস্ক্রিপশনের প্রয়োজন নেই। আপনার ফোনের ইন্টারনাল ব্রাউজার স্টোরেজেই সমস্ত ডাটা সুরক্ষিত থাকে এবং যেকোনো সময় ব্যাকআপ ফাইল ডাউনলোড করে ব্যাকআপ রাখতে পারবেন।'
              : 'Zero paid dependencies or hosting fees required. All transactional data is safely preserved offline on device.'}
          </p>
        </div>
      </div>
    </div>
  );
};
