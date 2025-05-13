import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CircleCheck, Tag, Plus, PercentIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StreamDetectedProduct } from '../../services/LivestreamService';
import { publishStreamProduct } from '../../store/slices/livestreamSlice';
import { AppDispatch } from '../../store';

interface StreamDetectedProductCardProps {
  product: StreamDetectedProduct;
  onPublish?: () => void;
}

const StreamDetectedProductCard: React.FC<StreamDetectedProductCardProps> = ({
  product,
  onPublish
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Format confidence percentage
  const confidencePercent = Math.round(product.confidence * 100);
  
  // Generate random price for demo
  const randomPrice = () => {
    return (Math.floor(Math.random() * 50) + 10) * 100;
  };
  
  // Handle publish to catalog
  const handlePublish = () => {
    if (product.streamId && product.productId) {
      dispatch(publishStreamProduct({
        streamId: product.streamId,
        productId: product.productId
      }));
      
      if (onPublish) onPublish();
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div className="aspect-square bg-gray-100 relative">
        {/* For demo purposes, use a gradient based on the product ID as a placeholder */}
        <div 
          className="absolute inset-0" 
          style={{
            background: `linear-gradient(${parseInt(product.productId.slice(-3)) % 360}deg, #f9f9f9, #e0e0e0)`
          }}
        />
        
        {/* Show confidence badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
          <PercentIcon className="h-3 w-3 mr-0.5" />
          {confidencePercent}%
        </div>
        
        {/* Show detected attributes if available */}
        {product.attributes && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {Object.entries(product.attributes).map(([key, value]) => (
              <span 
                key={key}
                className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded"
              >
                {value}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h4 className="font-medium text-sm mb-1">
          {t('livestream.product.clothing')} #{product.productId.slice(-3)}
        </h4>
        
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-bold">
            ₹{randomPrice()}
          </div>
          <div className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
            {t('livestream.product.inStock')}
          </div>
        </div>
        
        <Button 
          size="sm" 
          className="w-full flex items-center justify-center"
          onClick={handlePublish}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('livestream.product.addToCatalog')}
        </Button>
      </div>
    </div>
  );
};

export default StreamDetectedProductCard;