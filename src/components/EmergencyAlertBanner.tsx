import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

// src/components/EmergencyAlertBanner.tsx
interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'critical';
}

export const EmergencyAlertBanner = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  return (
    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-center">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
        <div>
          <p className="font-semibold">Emergency Alert: Flood Warning</p>
          <p className="text-sm">Colombo area - Seek higher ground immediately</p>
        </div>
      </div>
    </div>
  );
};
