import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Share2, QrCode, Download, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorefrontConfig } from '../../services/StorefrontService';
import PreviewService from '../../services/PreviewService';
import FullScreenPreview from './FullScreenPreview';

interface PreviewControllerProps {
  storefrontConfig: StorefrontConfig;
  customPreviewOptions?: {
    theme?: string;
    colorScheme?: string;
    fontFamily?: string;
    customColors?: Record<string, string>;
    customCSS?: string;
  };
}

const PreviewController: React.FC<PreviewControllerProps> = ({
  storefrontConfig,
  customPreviewOptions
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  
  // Generate a preview URL
  const generatePreview = async () => {
    setIsGenerating(true);
    
    try {
      let url;
      if (customPreviewOptions) {
        url = PreviewService.generateCustomPreviewUrl(storefrontConfig, customPreviewOptions);
      } else {
        url = PreviewService.generatePreviewUrl(storefrontConfig);
      }
      
      // Wait for preview to be ready
      const previewId = url.split('/').pop()?.split('?')[0] || '';
      await PreviewService.checkPreviewStatus(previewId);
      
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate a QR code for preview
  const generateQrCode = async () => {
    if (!previewUrl) {
      await generatePreview();
    }
    
    if (previewUrl) {
      try {
        const qrCode = await PreviewService.generatePreviewQrCode(previewUrl);
        setQrCodeUrl(qrCode);
        setShowQrCode(true);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  };
  
  // Create a shareable preview URL
  const createShareablePreview = async () => {
    try {
      const url = await PreviewService.savePreviewForSharing(storefrontConfig);
      setShareableUrl(url);
      
      // Copy to clipboard
      navigator.clipboard.writeText(url);
      
      // Show success message
      // This would typically be handled by a toast notification
      console.log('Shareable preview URL copied to clipboard');
    } catch (error) {
      console.error('Error creating shareable preview:', error);
    }
  };
  
  // Handle full screen preview
  const handleShowFullScreen = async () => {
    if (!previewUrl) {
      await generatePreview();
    }
    
    setShowFullScreen(true);
  };
  
  // QR code modal content
  const renderQrCodeModal = () => {
    if (!showQrCode || !qrCodeUrl) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium mb-4">{t('storefront.preview.scanQrCode')}</h3>
          <p className="text-sm text-gray-600 mb-4">{t('storefront.preview.scanQrCodeDesc')}</p>
          
          <div className="flex justify-center mb-4">
            <div className="p-2 border rounded-lg">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowQrCode(false)}
            >
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                // Download QR code image
                const link = document.createElement('a');
                link.href = qrCodeUrl;
                link.download = `${storefrontConfig.businessName.replace(/\s+/g, '-')}-preview-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download size={16} className="mr-1" />
              {t('storefront.preview.downloadQrCode')}
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-3">{t('storefront.preview.title')}</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('storefront.preview.description')}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleShowFullScreen}
              className="flex items-center"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {t('storefront.preview.viewPreview')}
            </Button>
            
            <Button
              variant="outline"
              onClick={generateQrCode}
              className="flex items-center"
              disabled={isGenerating}
            >
              <QrCode className="mr-2 h-4 w-4" />
              {t('storefront.preview.viewOnMobile')}
            </Button>
            
            <Button
              variant="outline"
              onClick={createShareablePreview}
              className="flex items-center"
              disabled={isGenerating}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {t('storefront.preview.sharePreview')}
            </Button>
          </div>
          
          {shareableUrl && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <div className="text-sm truncate mr-4">
                  <span className="font-medium text-gray-700">{t('storefront.preview.shareableLink')}:</span>{' '}
                  <span className="text-gray-600">{shareableUrl}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(shareableUrl)}
                >
                  {t('common.copy')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Full screen preview */}
      {showFullScreen && previewUrl && (
        <FullScreenPreview
          previewUrl={previewUrl}
          storefrontConfig={storefrontConfig}
          onClose={() => setShowFullScreen(false)}
        />
      )}
      
      {/* QR code modal */}
      {renderQrCodeModal()}
    </>
  );
};

export default PreviewController;