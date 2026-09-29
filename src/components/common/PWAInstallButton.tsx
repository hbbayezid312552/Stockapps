import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { AppLanguage } from '../../types';

interface Props {
  lang: AppLanguage;
}

export const PWAInstallButton: React.FC<Props> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone app, do not show button
  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
        title="Install Android App"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{lang === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'iOS ইনস্টল' : 'Install iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900">
                  {lang === 'bn' ? 'আইফোনে অ্যাপ ইনস্টল করুন' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {lang === 'bn' ? (
                  <>
                    ১. Safari ব্রাউজারের নিচের <strong>Share</strong> (শেয়ার) আইকনে চাপ দিন。<br />
                    ২. তালিকা থেকে নিচে স্ক্রোল করে <strong>Add to Home Screen</strong> চাপুন।
                  </>
                ) : (
                  <>
                    1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </>
                )}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-md bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
              >
                {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
