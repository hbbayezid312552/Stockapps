import React from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { AppLanguage, FeatureLocks } from '../../types';
import { db } from '../../db/storage';

interface Props {
  featureKey: keyof FeatureLocks;
  title: string;
  lang: AppLanguage;
  onUnlocked?: () => void;
}

export const LockedFeatureView: React.FC<Props> = ({ featureKey, title, lang, onUnlocked }) => {
  const session = db.getSession();
  const isAdmin = !!session;

  const handleUnlockNow = () => {
    db.toggleFeatureLock(featureKey, false);
    if (onUnlocked) onUnlocked();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
      <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
        <Lock className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-slate-800">
        {title} — {lang === 'bn' ? 'ফিচারটি লক করা আছে' : 'Feature Locked'}
      </h2>

      <p className="mt-2 text-sm text-slate-500 max-w-md">
        {lang === 'bn'
          ? 'This feature is currently locked by Admin. এই সুবিধাটি সাময়িকভাবে অ্যাডমিন কর্তৃক স্থগিত বা লক করা রয়েছে।'
          : 'This feature is currently locked by Admin. Please contact system administrator to access this module.'}
      </p>

      {isAdmin ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'আপনি অ্যাডমিন হিসেবে লগইন আছেন' : 'Logged in as Admin'}</span>
          </div>
          <button
            onClick={handleUnlockNow}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Unlock className="w-4 h-4" />
            <span>{lang === 'bn' ? 'লক খুলে দিন (Unlock Now)' : 'Unlock This Feature Now'}</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 text-xs text-slate-400">
          {lang === 'bn' ? 'লক খুলতে অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।' : 'Please login as Admin to unlock.'}
        </div>
      )}
    </div>
  );
};
