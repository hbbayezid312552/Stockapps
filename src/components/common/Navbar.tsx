import React, { useState } from 'react';
import { AppLanguage } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { db } from '../../db/storage';
import { LogOut, User, Key, Globe, Menu, X, ShieldCheck } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  onOpenPasswordModal: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenPasswordModal,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const session = db.getSession();
  const settings = db.getSettings();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    db.logoutAdmin();
  };

  const navLinks = [
    { id: 'dashboard', bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
    { id: 'dealer-invoice', bn: 'ডিলার চালান', en: 'Dealer Invoice' },
    { id: 'sr-invoice', bn: 'এস.আর চালান', en: 'SR Invoice' },
    { id: 'stock', bn: 'স্টক ও পণ্য', en: 'Stock' },
    { id: 'reports', bn: 'রিপোর্টস', en: 'Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Title (Single text element wordmark with logo) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300 font-extrabold text-base shadow-xs overflow-hidden shrink-0">
                <img
                  src="/icon.svg"
                  alt="Probhati"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text logo if SVG fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="leading-tight">
                <span className="text-base font-bold tracking-tight text-slate-900 block font-sans">
                  {lang === 'bn' ? settings.companyNameBn : settings.companyName}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 block">
                  {lang === 'bn' ? 'সেলস, ইনভয়েস ও স্টক ইআরপি' : 'Sales, Invoice & Stock ERP'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 Navigation Links (Clean text with subtle underline) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap py-1 border-b-2 ${
                    isActive
                      ? 'border-emerald-700 text-emerald-800 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {lang === 'bn' ? link.bn : link.en}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (PWA install, Language Toggle, Admin Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton lang={lang} />

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Admin Profile Dropdown */}
            {session && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{session.name}</span>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-100 py-1.5 z-50 text-xs"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{session.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{session.email}</p>
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{session.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <span>{lang === 'bn' ? 'কোম্পানি সেটিংস' : 'Company Settings'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenPasswordModal();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
