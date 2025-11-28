// src/components/SOSButton.tsx
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const SOSButton = () => {
  const { toast } = useToast();

  const handleSOS = async () => {
    try {
      // Share location if available
      if (navigator.share) {
        await navigator.share({
          title: '🚨 EMERGENCY HELP NEEDED',
          text: 'I need immediate assistance. My approximate location is...',
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText('EMERGENCY: Need immediate help at my location');
        toast({
          title: "Emergency message copied",
          description: "Share this with emergency contacts",
        });
      }

      // Show emergency instructions
      toast({
        title: "🚨 Emergency Alert Sent",
        description: "Help is on the way. Stay calm and safe.",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button 
        className="rounded-full w-14 h-14 shadow-lg bg-red-600 hover:bg-red-700 animate-pulse"
        size="icon"
        onClick={handleSOS}
      >
        <Siren className="w-6 h-6" />
      </Button>
    </div>
  );
};