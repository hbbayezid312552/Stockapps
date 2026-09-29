import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { AppLanguage, FeatureLocks, Invoice } from './types';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { LockedFeatureView } from './components/common/LockedFeatureView';
import { LoginView } from './components/auth/LoginView';
import { AdminPasswordModal } from './components/auth/AdminPasswordModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { DealerInvoiceMaker } from './components/invoices/DealerInvoiceMaker';
import { SRInvoiceMaker } from './components/invoices/SRInvoiceMaker';
import { InvoiceList } from './components/invoices/InvoiceList';
import { StockManagementView } from './components/stock/StockManagementView';
import { PurchaseEntryView } from './components/stock/PurchaseEntryView';
import { DamageReturnView } from './components/stock/DamageReturnView';
import { DealerManagementView } from './components/crm/DealerManagementView';
import { SRManagementView } from './components/crm/SRManagementView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { BackupRestoreView } from './components/settings/BackupRestoreView';

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('bn');
  const [session, setSession] = useState(() => db.getSession());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [locks, setLocks] = useState<FeatureLocks>(() => db.getFeatureLocks());
  const [lowStockCount, setLowStockCount] = useState(0);

  // Editing state for invoices
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const updateStats = () => {
      setSession(db.getSession());
      setLocks(db.getFeatureLocks());
      const products = db.getProducts();
      const count = products.filter((p) => p.currentStock <= p.minStockLevel).length;
      setLowStockCount(count);
    };

    updateStats();
    const unsubscribe = db.subscribe(updateStats);
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    if (inv.invoiceType === 'dealer') {
      setActiveTab('dealer-invoice');
    } else {
      setActiveTab('sr-invoice');
    }
  };

  const handleCancelEdit = () => {
    setEditingInvoice(null);
    setActiveTab('invoices');
  };

  const handleInvoiceSaved = () => {
    setEditingInvoice(null);
  };

  // If not logged in, show secure login
  if (!session) {
    return <LoginView onSuccess={() => setSession(db.getSession())} lang={lang} setLang={setLang} />;
  }

  // Render content according to active tab and feature locks
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView lang={lang} onNavigate={setActiveTab} />;

      case 'dealer-invoice':
        if (locks.dealerInvoice) {
          return (
            <LockedFeatureView
              featureKey="dealerInvoice"
              title={lang === 'bn' ? 'ডিলার চালান' : 'Dealer Invoice'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <DealerInvoiceMaker
            lang={lang}
            editingInvoice={editingInvoice?.invoiceType === 'dealer' ? editingInvoice : null}
            onCancelEdit={handleCancelEdit}
            onInvoiceSaved={handleInvoiceSaved}
          />
        );

      case 'sr-invoice':
        if (locks.srInvoice) {
          return (
            <LockedFeatureView
              featureKey="srInvoice"
              title={lang === 'bn' ? 'এস.আর চালান' : 'S.R Invoice'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <SRInvoiceMaker
            lang={lang}
            editingInvoice={editingInvoice?.invoiceType === 'sr' ? editingInvoice : null}
            onCancelEdit={handleCancelEdit}
            onInvoiceSaved={handleInvoiceSaved}
          />
        );

      case 'invoices':
        return (
          <InvoiceList
            lang={lang}
            onEditInvoice={handleEditInvoice}
            onNewInvoice={(type) => {
              setEditingInvoice(null);
              setActiveTab(type === 'dealer' ? 'dealer-invoice' : 'sr-invoice');
            }}
          />
        );

      case 'stock':
        if (locks.stock) {
          return (
            <LockedFeatureView
              featureKey="stock"
              title={lang === 'bn' ? 'স্টক ব্যবস্থাপনা' : 'Stock Management'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <StockManagementView
            lang={lang}
            onNavigateToPurchase={() => setActiveTab('purchase')}
          />
        );

      case 'purchase':
        if (locks.purchase) {
          return (
            <LockedFeatureView
              featureKey="purchase"
              title={lang === 'bn' ? 'পণ্য ক্রয়' : 'Purchase Entry'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <PurchaseEntryView
            lang={lang}
            onPurchaseSaved={() => setActiveTab('stock')}
          />
        );

      case 'damage-return':
        if (locks.damageReturn) {
          return (
            <LockedFeatureView
              featureKey="damageReturn"
              title={lang === 'bn' ? 'ড্যামেজ ও রিটার্ন' : 'Damage & Return'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return <DamageReturnView lang={lang} />;

      case 'dealers':
        return (
          <DealerManagementView
            lang={lang}
            onCreateInvoiceForDealer={(dealerId) => {
              setEditingInvoice(null);
              setActiveTab('dealer-invoice');
            }}
          />
        );

      case 'srs':
        if (locks.srTarget) {
          return (
            <LockedFeatureView
              featureKey="srTarget"
              title={lang === 'bn' ? 'এস.আর ও টার্গেট' : 'S.R & Targets'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <SRManagementView
            lang={lang}
            onNavigateToInvoice={(srId) => {
              setEditingInvoice(null);
              setActiveTab('sr-invoice');
            }}
          />
        );

      case 'reports':
        if (locks.reports) {
          return (
            <LockedFeatureView
              featureKey="reports"
              title={lang === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return <ReportsView lang={lang} />;

      case 'settings':
        if (locks.settings) {
          return (
            <LockedFeatureView
              featureKey="settings"
              title={lang === 'bn' ? 'কোম্পানি সেটিংস' : 'Company Settings'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <SettingsView
            lang={lang}
            onOpenPasswordModal={() => setShowPasswordModal(true)}
          />
        );

      case 'backup':
        if (locks.backupRestore) {
          return (
            <LockedFeatureView
              featureKey="backupRestore"
              title={lang === 'bn' ? 'ব্যাকআপ ও রিস্টোর' : 'Backup & Restore'}
              lang={lang}
              onUnlocked={() => setLocks(db.getFeatureLocks())}
            />
          );
        }
        return (
          <BackupRestoreView
            lang={lang}
            onDataReset={() => {
              setLocks(db.getFeatureLocks());
              setActiveTab('dashboard');
            }}
          />
        );

      default:
        return <DashboardView lang={lang} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setEditingInvoice(null);
            setActiveTab(tab);
          }}
          lang={lang}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          locks={locks}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderContent()}
        </main>
      </div>

      <OfflineIndicator lang={lang} />

      {showPasswordModal && (
        <AdminPasswordModal
          lang={lang}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
