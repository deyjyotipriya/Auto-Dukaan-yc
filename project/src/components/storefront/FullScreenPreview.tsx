import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Refresh, 
  Share2, 
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorefrontConfig } from '../../services/StorefrontService';

interface FullScreenPreviewProps {
  previewUrl: string;
  storefrontConfig: StorefrontConfig;
  onClose: () => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  previewUrl,
  storefrontConfig,
  onClose
}) => {
  const { t } = useTranslation();
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  // Refresh the iframe
  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };
  
  // Copy preview URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get iframe width based on active device
  const getIframeWidth = () => {
    switch (activeDevice) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };
  
  // Get iframe container class based on active device
  const getIframeContainerClass = () => {
    switch (activeDevice) {
      case 'mobile':
        return 'max-w-[375px] mx-auto h-[667px] rounded-3xl border-8 border-gray-800 overflow-hidden';
      case 'tablet':
        return 'max-w-[768px] mx-auto h-[1024px] rounded-3xl border-8 border-gray-800 overflow-hidden';
      case 'desktop':
      default:
        return 'w-full h-full';
    }
  };
  
  // Determine if we should show device bezels
  const shouldShowBezels = activeDevice !== 'desktop';
  
  // Add mobile toolbar for mobile/tablet views
  const renderMobileToolbar = () => {
    if (activeDevice === 'desktop') return null;
    
    return (
      <div className="bg-gray-800 w-full h-6 flex items-center justify-center">
        <div className="w-20 h-1 bg-gray-600 rounded-full"></div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex flex-col">
      {/* Preview Header */}
      <div className="bg-white border-b flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <h2 className="font-medium text-lg">{t('storefront.preview.title')}</h2>
          <div className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center">
            <span className="text-gray-600 mr-1">{storefrontConfig.domain}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopyLink}
              title={t('storefront.preview.copyLink')}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="border rounded-lg flex">
            <Button
              variant={activeDevice === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setActiveDevice('mobile')}
              title={t('storefront.preview.mobileView')}
            >
              <Smartphone size={16} />
            </Button>
            <Button
              variant={activeDevice === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setActiveDevice('tablet')}
              title={t('storefront.preview.tabletView')}
            >
              <Tablet size={16} />
            </Button>
            <Button
              variant={activeDevice === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setActiveDevice('desktop')}
              title={t('storefront.preview.desktopView')}
            >
              <Monitor size={16} />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            title={t('storefront.preview.refresh')}
            className="h-8"
          >
            <Refresh size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            title={t('storefront.preview.close')}
            className="h-8"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className={getIframeContainerClass()}>
          {shouldShowBezels && renderMobileToolbar()}
          <div className="relative w-full h-full bg-white">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full"></div>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-0"
              style={{ width: getIframeWidth() }}
              title={t('storefront.preview.title')}
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </div>
      
      {/* Preview Footer */}
      <div className="bg-white border-t px-4 py-3 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {t('storefront.preview.disclaimer')}
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={handleCopyLink}
          >
            <Copy size={16} className="mr-1" />
            {t('storefront.preview.copyLink')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Open in new tab
              window.open(previewUrl, '_blank');
            }}
          >
            <Share2 size={16} className="mr-1" />
            {t('storefront.preview.openInNewTab')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPreview;