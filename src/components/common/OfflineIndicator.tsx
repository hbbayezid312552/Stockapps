import React from 'react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';
import { AppLanguage } from '../../types';

interface Props {
  lang: AppLanguage;
}

export const OfflineIndicator: React.FC<Props> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg animate-bounce">
      <WifiOff className="w-4 h-4 text-white" />
      <span>
        {lang === 'bn'
          ? 'অফলাইন মোড সক্রিয় — স্থানীয় ডাটাবেজ ব্যবহার হচ্ছে'
          : 'Offline Mode Active — Using local persistent storage'}
      </span>
    </div>
  );
};
