import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Package,
  ShoppingCart,
  RotateCcw,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  HardDriveDownload,
  Receipt,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { AppLanguage, FeatureLocks } from '../../types';
import { db } from '../../db/storage';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: AppLanguage;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  locks: FeatureLocks;
  lowStockCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  lang,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  locks,
  lowStockCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      bn: 'ড্যাশবোর্ড',
      en: 'Dashboard',
      icon: LayoutDashboard,
      section: 'main',
    },
    {
      id: 'dealer-invoice',
      bn: 'ডিলার চালান',
      en: 'Dealer Invoice',
      icon: FileSpreadsheet,
      locked: locks.dealerInvoice,
      section: 'sales',
    },
    {
      id: 'sr-invoice',
      bn: 'এস.আর চালান',
      en: 'S.R Invoice',
      icon: Receipt,
      locked: locks.srInvoice,
      section: 'sales',
    },
    {
      id: 'invoices',
      bn: 'ইনভয়েস তালিকা ও সার্চ',
      en: 'Invoice History',
      icon: Receipt,
      section: 'sales',
    },
    {
      id: 'stock',
      bn: 'স্টক ও ইনভেন্টরি',
      en: 'Stock & Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      locked: locks.stock,
      section: 'inventory',
    },
    {
      id: 'purchase',
      bn: 'পণ্য ক্রয় এন্ট্রি',
      en: 'Purchase Entry',
      icon: ShoppingCart,
      locked: locks.purchase,
      section: 'inventory',
    },
    {
      id: 'damage-return',
      bn: 'ড্যামেজ ও রিটার্ন',
      en: 'Damage & Return',
      icon: RotateCcw,
      locked: locks.damageReturn,
      section: 'inventory',
    },
    {
      id: 'dealers',
      bn: 'ডিলার ব্যবস্থাপনা',
      en: 'Dealer Management',
      icon: Users,
      section: 'crm',
    },
    {
      id: 'srs',
      bn: 'এস.আর ও টার্গেট',
      en: 'S.R & Targets',
      icon: UserCheck,
      locked: locks.srTarget,
      section: 'crm',
    },
    {
      id: 'reports',
      bn: 'রিপোর্ট ও বিশ্লেষণ',
      en: 'Reports & Analytics',
      icon: TrendingUp,
      locked: locks.reports,
      section: 'reports',
    },
    {
      id: 'settings',
      bn: 'সেটিংস ও ফিচার লক',
      en: 'Settings & Security',
      icon: SlidersHorizontal,
      locked: locks.settings,
      section: 'system',
    },
    {
      id: 'backup',
      bn: 'ব্যাকআপ ও রিস্টোর',
      en: 'Backup & Restore',
      icon: HardDriveDownload,
      locked: locks.backupRestore,
      section: 'system',
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {lang === 'bn' ? 'মেনু নেভিগেশন' : 'Navigation Menu'}
        </span>
        {lowStockCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            <span>{lowStockCount} {lang === 'bn' ? 'স্বল্প স্টক' : 'low stock'}</span>
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span className="truncate">{lang === 'bn' ? item.bn : item.en}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.locked && (
                  <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                )}
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{lang === 'bn' ? 'সংস্করণ' : 'Version'}: v1.0.0</span>
          <span className="text-emerald-700 font-semibold">{lang === 'bn' ? 'অফলাইন রেডি' : 'Offline Ready'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
