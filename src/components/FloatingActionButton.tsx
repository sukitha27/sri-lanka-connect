// src/components/FloatingActionButton.tsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onRequestHelp: () => void;
  onOfferHelp: () => void;
}

export const FloatingActionButton = ({ onRequestHelp, onOfferHelp }: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
        size="icon"
        onClick={onRequestHelp}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};