import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage } from '../../types';
import { Key, X, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { verifyPassword } from '../../utils/crypto';

interface Props {
  lang: AppLanguage;
  onClose: () => void;
}

export const AdminPasswordModal: React.FC<Props> = ({ lang, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(
        lang === 'bn'
          ? 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।'
          : 'New password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        lang === 'bn'
          ? 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি।'
          : 'New passwords do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      const admin = db.getAdmin();
      const isCurrentValid = await verifyPassword(currentPassword, admin.passwordHash);

      if (!isCurrentValid) {
        setError(
          lang === 'bn'
            ? 'বর্তমান পাসওয়ার্ড সঠিক নয়।'
            : 'Current password is incorrect.'
        );
        setLoading(false);
        return;
      }

      await db.updateAdminPassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setError(
        lang === 'bn'
          ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।'
          : 'Failed to update password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-800" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন' : 'Change Admin Password'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password changed successfully!'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="show-pass"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded-sm border-slate-300 text-emerald-800"
            />
            <label htmlFor="show-pass" className="text-slate-600 select-none cursor-pointer">
              {lang === 'bn' ? 'পাসওয়ার্ড প্রদর্শন করুন' : 'Show Password'}
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {loading
                ? lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'
                : lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
