// src/components/CriticalInfo.tsx
import { Phone, MapPin, Clock } from 'lucide-react';

export const CriticalInfo = () => {
  const criticalInfo = [
    { icon: <Phone className="w-4 h-4" />, text: "Emergency Numbers: 119, 1990, 011-2691111" },
    { icon: <MapPin className="w-4 h-4" />, text: "Nearest Hospital: Colombo General - 011-2691111" },
    { icon: <MapPin className="w-4 h-4" />, text: "Evacuation Centers: City Hall, Schools, Temples" },
    { icon: <Clock className="w-4 h-4" />, text: "Weather Alert: Heavy rains expected next 24h" },
  ];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
        <span>⚠️</span> Critical Emergency Information
      </h3>
      <ul className="space-y-2 text-sm">
        {criticalInfo.map((info, index) => (
          <li key={index} className="flex items-start gap-2 text-yellow-700">
            <span className="mt-0.5 flex-shrink-0">{info.icon}</span>
            <span>{info.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};