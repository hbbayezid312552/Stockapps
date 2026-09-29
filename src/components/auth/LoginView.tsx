import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AppLanguage } from '../../types';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
}

export const LoginView: React.FC<Props> = ({ onSuccess, lang, setLang }) => {
  const settings = db.getSettings();
  const [email, setEmail] = useState('probhatifoodproducts@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await db.loginAdmin(email, password);
      if (success) {
        onSuccess();
      } else {
        setError(
          lang === 'bn'
            ? 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। দয়া করে পুনরায় চেষ্টা করুন।'
            : 'Invalid email or password. Please verify and try again.'
        );
      }
    } catch {
      setError(
        lang === 'bn'
          ? 'লগইন করতে সমস্যা হয়েছে।'
          : 'An error occurred during authentication.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-800 shadow-md flex items-center justify-center p-2 mb-4 overflow-hidden">
            <img src="/icon.svg" alt="Probhati" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {lang === 'bn' ? settings.companyNameBn : settings.companyName}
          </h1>
          <p className="text-xs text-emerald-800 font-semibold mt-1">
            {lang === 'bn' ? 'অ্যাডমিন কন্ট্রোল প্যানেল' : 'Admin Control Center'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' ? settings.taglineBn : settings.tagline}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {lang === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="probhatifoodproducts@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-hidden transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs tracking-wide shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
            ) : (
              <span>{lang === 'bn' ? 'লগইন করুন (Secure Login)' : 'Secure Admin Login'}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Hint */}
        <div className="mt-6 pt-5 border-t border-slate-100 bg-emerald-50/60 -mx-8 -mb-8 p-6 rounded-b-2xl">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">
                {lang === 'bn' ? 'ডিফল্ট লগইন তথ্য:' : 'Default Credentials:'}
              </p>
              <p className="font-mono text-[11px] text-slate-600 mt-0.5">
                Email: <span className="font-semibold text-emerald-800">probhatifoodproducts@gmail.com</span>
              </p>
              <p className="font-mono text-[11px] text-slate-600">
                Password: <span className="font-semibold text-emerald-800">admin123</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {lang === 'bn'
                  ? 'লগইন করার পর সেটিংস থেকে আপনি যেকোনো সময় পাসওয়ার্ড পরিবর্তন করতে পারবেন।'
                  : 'You can change this password anytime from Company Settings.'}
              </p>
            </div>
          </div>
        </div>

        {/* Language switch button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="text-xs text-slate-500 hover:text-emerald-800 underline transition"
          >
            {lang === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় ব্যবহার করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
