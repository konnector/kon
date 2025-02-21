import { Button } from '@/components/ui/button';

interface CampaignOfferProps {
  brand: string;
  amount: string;
  duration: string;
  type: string;
  onViewDetails: () => void;
}

export function CampaignOfferCard({ brand, amount, duration, type, onViewDetails }: CampaignOfferProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h3 className="font-medium text-gray-900">{brand}</h3>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="font-medium text-gray-900">{amount}</p>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
        
        <Button 
          onClick={onViewDetails}
          variant="default"
          className="bg-black text-white hover:bg-black/90"
        >
          View Details
        </Button>
      </div>
    </div>
  );
} 