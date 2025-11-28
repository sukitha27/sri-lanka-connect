// src/components/OfflineIndicator.tsx
import { useOffline } from '@/hooks/useOffline';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const isOnline = useOffline();

  if (isOnline) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">Offline Mode</span>
    </div>
  );
};