// src/components/layout/Header.tsx
import { Heart, MapPin } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sri Lanka Connect</h1>
              <p className="text-sm text-gray-600">Emergency Help Network</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Colombo, Sri Lanka</span>
          </div>
        </div>
      </div>
    </header>
  );
};