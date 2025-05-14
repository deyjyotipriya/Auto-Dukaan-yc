import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Globe, 
  Share2, 
  Edit, 
  Settings, 
  BarChart3, 
  Palette, 
  FileText,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  Copy,
  Share,
  QrCode,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';

// Custom WhatsApp icon since it's not available in lucide-react
const WhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.6 6.2c-1.5-1.5-3.4-2.3-5.5-2.3-4.3 0-7.8 3.5-7.8 7.8 0 1.4.4 2.7 1 3.9l-1.1 4 4.1-1.1c1.1.6 2.4 1 3.7 1 4.3 0 7.8-3.5 7.8-7.8.1-2.1-.7-4-2.2-5.5z" />
    <path d="M14.6 14.2c-.2.1-1.4.7-1.6.8-.2 0-.4.1-.5-.1-.1-.1-.5-.6-.6-.7-.1-.1-.2-.1-.4 0-.2.1-.8.4-1.5.8-.6.4-1 .9-1.1 1.1-.1.1 0 .2.1.3l.3.3c.1.1.2.2.3.3.1.1.1.2 0 .3 0 .1-.1.3-.4.7-.2.4-.4.4-.6.4-.1 0-.3 0-.5-.1-.1 0-.3-.1-.5-.2-.2-.1-.4-.3-.6-.5-.9-1.2-1.2-2.4-.7-3.1.1-.2.7-1 .7-1 .2-.3.4-.2.5-.2.1 0 .3 0 .4.1.1 0 .3.1.4.2 0 0 .1 0 0 .1 0 .2-.2.7-.2.7 0 .1.1.2.2.3.1.1.2 0 .3 0 .1 0 .2-.1.3-.2.1-.1 1.1-1.2 1.1-1.2.1-.1.2-.1.3 0 .1 0 .2.3.1.3 0 0-.1.1-.1.1-.7.9-.7.9-.7 1.1 0 .2.2.2.3.2.2 0 1-.4 1.2-.5.2-.1.3-.2.4-.1.1.1.1.3 0 .4z" />
  </svg>
);

import { selectUser } from '../store/slices/userSlice';
import { 
  selectStorefrontConfig, 
  selectIsStorefrontPublished, 
  selectStorefrontLiveUrl,
  setConfig,
  updateTheme,
  updateCustomColors,
  updateBusinessInfo,
  updateContactInfo,
  updateSEO,
  updateLegalPages,
  updateSocialMedia
} from '../store/slices/storefrontSlice';
import { defaultStorefrontConfig } from '../services/StorefrontService';
import { Button } from '@/components/ui/button';
import StorefrontPreview from '@/components/storefront/StorefrontPreview';
import ThemeCustomizer from '@/components/storefront/ThemeCustomizer';
import PageContentEditor from '@/components/storefront/PageContentEditor';
import DomainSettings from '@/components/storefront/DomainSettings';
import SEOSettings from '@/components/storefront/SEOSettings';
import StorefrontAnalytics from '@/components/storefront/StorefrontAnalytics';
import ContactInfoSettings from '@/components/storefront/ContactInfoSettings';
import LegalPagesSettings from '@/components/storefront/LegalPagesSettings';
import SocialMediaSettings from '@/components/storefront/SocialMediaSettings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// QR Code component for sharing
const QRCodeGenerator = ({ url }: { url: string }) => {
  // SVG-based QR code (simplified version for demo)
  // Each cell is 8x8 pixels, creating a 21x21 QR code (standard for short URLs)
  // This is a simplified visual representation; in production, use a proper QR library
  
  // Generate a deterministic pattern based on URL (for demo purposes)
  const generatePattern = (url: string) => {
    // Create a simple hash of the URL
    const hash = Array.from(url).reduce((acc, char) => 
      ((acc << 5) - acc) + char.charCodeAt(0), 0) & 0xFFFFFFFF;
    
    // Generate a 21x21 matrix with a pattern
    const matrix = Array(21).fill(0).map(() => Array(21).fill(0));
    
    // Add finder patterns (the three big squares in corners)
    // Top-left
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 || i === 6 || j === 0 || j === 6) || 
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[i][j] = 1;
        }
      }
    }
    
    // Top-right
    for (let i = 0; i < 7; i++) {
      for (let j = 14; j < 21; j++) {
        if ((i === 0 || i === 6 || j === 14 || j === 20) || 
            (i >= 2 && i <= 4 && j >= 16 && j <= 18)) {
          matrix[i][j] = 1;
        }
      }
    }
    
    // Bottom-left
    for (let i = 14; i < 21; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 14 || i === 20 || j === 0 || j === 6) || 
            (i >= 16 && i <= 18 && j >= 2 && j <= 4)) {
          matrix[i][j] = 1;
        }
      }
    }
    
    // Add some data bits based on URL hash (simplified representation)
    for (let i = 8; i < 13; i++) {
      for (let j = 8; j < 13; j++) {
        matrix[i][j] = ((hash >> (i * j)) & 1);
      }
    }
    
    // Add more patterns for visual interest
    for (let i = 1; i < 20; i += 2) {
      for (let j = 1; j < 20; j += 2) {
        if (!(i < 7 && j < 7) && 
            !(i < 7 && j > 13) && 
            !(i > 13 && j < 7)) {
          matrix[i][j] = ((hash >> (i + j)) & 1);
        }
      }
    }
    
    return matrix;
  };
  
  const pattern = generatePattern(url);
  const cellSize = 8;
  const size = 21 * cellSize;
  
  return (
    <div className="mx-auto qr-code">
      <svg 
        width="168" 
        height="168" 
        viewBox={`0 0 ${size} ${size}`}
        className="border-2 border-gray-200 rounded-lg"
      >
        {pattern.map((row, i) => 
          row.map((cell, j) => 
            cell ? (
              <rect
                key={`${i}-${j}`}
                x={j * cellSize}
                y={i * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
              />
            ) : null
          )
        )}
      </svg>
      <div className="text-center mt-2 text-xs text-gray-500">
        Scan to visit: {url.replace(/(https?:\/\/)/i, '')}
      </div>
    </div>
  );
};

// Share modal component
const ShareStorefrontDialog = ({ storeUrl, storeName }: { storeUrl: string; storeName: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'message' | 'social'>('link');
  
  // Share message templates
  const [selectedTemplate, setSelectedTemplate] = useState<'default' | 'product' | 'discount'>("default");
  
  const messageTemplates = {
    default: `Check out my online store "${storeName}" at ${storeUrl}`,
    product: `Hi! I have some amazing products at my online store "${storeName}". Visit ${storeUrl} to see what's available!`,
    discount: `Special offer! Get 10% off on your first order at my store "${storeName}". Shop now at ${storeUrl}`
  };
  
  const shareMessage = messageTemplates[selectedTemplate];
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center hover:border-primary-500">
                <Share2 className="w-4 h-4 mr-2 text-primary-500" />
                {t('storefront.share.share')}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share your store with customers via WhatsApp, social media, or QR code</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('storefront.share.title')}</DialogTitle>
          <DialogDescription>
            {t('storefront.share.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex border-b mb-4">
            <button
              className={`pb-2 px-4 ${activeTab === 'link' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('link')}
            >
              <LinkIcon className="w-4 h-4 inline mr-1" />
              {t('storefront.share.link')}
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === 'qr' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('qr')}
            >
              <QrCode className="w-4 h-4 inline mr-1" />
              {t('storefront.share.qrCode')}
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === 'message' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('message')}
            >
              <MessageSquare className="w-4 h-4 inline mr-1" />
              {t('storefront.share.message')}
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === 'social' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('social')}
            >
              <Share className="w-4 h-4 inline mr-1" />
              {t('storefront.share.social')}
            </button>
          </div>
          
          {activeTab === 'link' && (
            <div>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link">{t('storefront.share.storeLink')}</Label>
                  <Input
                    id="link"
                    value={storeUrl}
                    readOnly
                    className="flex-1"
                  />
                </div>
                <Button 
                  type="button" 
                  size="sm" 
                  className="px-3"
                  onClick={() => copyToClipboard(storeUrl)}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {t('storefront.share.linkHelp')}
              </p>
              <div className="mt-4">
                <Button 
                  className="w-full flex items-center justify-center"
                  onClick={() => window.open(storeUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('storefront.share.openStore')}
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'qr' && (
            <div className="text-center">
              <p className="mb-4 text-sm text-gray-600">
                {t('storefront.share.qrCodeHelp')}
              </p>
              <QRCodeGenerator url={storeUrl} />
              <div className="mt-4 flex justify-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Convert SVG to a data URL - simplified version
                    // In production, use a proper library for SVG to PNG conversion
                    const svgElement = document.querySelector('.qr-code svg');
                    if (svgElement) {
                      const svgData = new XMLSerializer().serializeToString(svgElement);
                      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
                      const url = URL.createObjectURL(svgBlob);
                      
                      // Create a temporary link and trigger download
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${storeName.replace(/\s+/g, '-').toLowerCase()}-qrcode.svg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  }}
                >
                  {t('storefront.share.download')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Create a printable version of the QR code
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const svgElement = document.querySelector('.qr-code svg');
                      const svgData = svgElement ? new XMLSerializer().serializeToString(svgElement) : '';
                      
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>${storeName} - QR Code</title>
                          <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                            .qr-container { margin: 30px auto; max-width: 300px; }
                            .store-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                            .store-url { margin-bottom: 20px; color: #666; }
                            .powered-by { margin-top: 40px; font-size: 12px; color: #999; }
                          </style>
                        </head>
                        <body>
                          <div class="qr-container">
                            <div class="store-name">${storeName}</div>
                            <div class="store-url">${storeUrl}</div>
                            ${svgData}
                            <div class="powered-by">Powered by Auto-Dukaan</div>
                          </div>
                          <script>
                            setTimeout(() => { window.print(); }, 500);
                          </script>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                >
                  {t('storefront.share.print')}
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'message' && (
            <div>
              <div className="mb-4">
                <Label className="mb-2 block">{t('storefront.share.chooseTemplate')}</Label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-3 py-1.5 text-xs rounded-full ${selectedTemplate === 'default' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setSelectedTemplate('default')}
                  >
                    Basic
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-xs rounded-full ${selectedTemplate === 'product' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setSelectedTemplate('product')}
                  >
                    Products
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-xs rounded-full ${selectedTemplate === 'discount' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setSelectedTemplate('discount')}
                  >
                    Discount
                  </button>
                </div>
              </div>
              
              <Label htmlFor="message">{t('storefront.share.messageTemplate')}</Label>
              <textarea
                id="message"
                value={shareMessage}
                onChange={(e) => {}}
                className="flex h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              />
              
              <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => copyToClipboard(shareMessage)}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('storefront.share.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('storefront.share.copyMessage')}
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')}
                >
                  <WhatsApp className="w-4 h-4 mr-2" />
                  {t('storefront.share.sendWhatsApp')}
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'social' && (
            <div>
              <p className="mb-4 text-sm text-gray-600">
                {t('storefront.share.socialHelp')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`, '_blank')}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent(`Check out ${storeName}'s online store:`)}`, '_blank')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${storeName}'s online store: ${storeUrl}`)}`, '_blank')}
                >
                  <WhatsApp className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(storeUrl)}&title=${encodeURIComponent(storeName)}`, '_blank')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-xs text-gray-500">
            {t('storefront.share.powered')}
          </div>
          <DialogTrigger asChild>
            <Button type="button" variant="secondary">
              {t('common.done')}
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StorefrontUnified: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tab = 'preview' } = useParams<{ tab?: string }>();
  
  const user = useSelector(selectUser);
  const storefrontConfig = useSelector(selectStorefrontConfig);
  const isPublished = useSelector(selectIsStorefrontPublished);
  const liveUrl = useSelector(selectStorefrontLiveUrl);
  
  const [activeTab, setActiveTab] = useState(tab);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize storefront configuration if it doesn't exist
  useEffect(() => {
    // If there's no configuration in Redux store, initialize with default
    if (!storefrontConfig) {
      console.log('Initializing default storefront configuration');
      // Generate a default config with the user's information if available
      const defaultConfig = {
        ...defaultStorefrontConfig,
        id: user?.id || 'demo-store',
        businessName: user?.businessName || 'Your Store',
        domain: user?.businessName ? 
          user.businessName.toLowerCase().replace(/\s+/g, '-') + '.store.autodukaan.com' :
          'your-store.autodukaan.com',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      
      // Update SEO with business name
      if (user?.businessName) {
        defaultConfig.seo = {
          ...defaultConfig.seo,
          title: user.businessName,
          description: `Welcome to ${user.businessName}. Shop our products online.`,
          keywords: [user.businessName.toLowerCase(), 'shop', 'online store'],
        };
      }
      
      // Dispatch action to set the configuration in Redux
      dispatch(setConfig(defaultConfig));
    }
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [dispatch, storefrontConfig, user]);
  
  // Update URL when tab changes without full page reload
  useEffect(() => {
    if (activeTab && activeTab !== 'preview') {
      const url = `/storefront/${activeTab}`;
      window.history.replaceState(null, '', url);
    } else {
      window.history.replaceState(null, '', '/storefront');
    }
  }, [activeTab]);
  
  // Handle publishing storefront
  const handlePublish = () => {
    // In a real app, this would call an API to publish the storefront
    console.log('Publishing storefront...');
    // After publishing, redirect to the live URL or show success message
  };
  
  // Use real store URL if available, or generate a demo one
  const storeUrl = liveUrl || (storefrontConfig?.domain ? `https://${storefrontConfig.domain}` : 'https://your-store.autodukaan.com');
  const storeName = storefrontConfig?.businessName || 'Your Store';
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">{storeName}</h1>
          <div className="flex items-center text-sm text-gray-600">
            <Globe className="h-4 w-4 mr-1 text-gray-400" />
            <span className="truncate">{storeUrl}</span>
            {isPublished && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                {t('storefront.status.published')}
              </span>
            )}
            {!isPublished && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {t('storefront.status.draft')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isPublished ? (
            <>
              <ShareStorefrontDialog storeUrl={storeUrl} storeName={storeName} />
              
              <Button 
                className="flex items-center"
                onClick={() => window.open(storeUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('storefront.viewStore')}
              </Button>
            </>
          ) : (
            <Button 
              className="flex items-center"
              onClick={handlePublish}
            >
              <Globe className="w-4 h-4 mr-2" />
              {t('storefront.publish')}
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 w-full justify-start overflow-x-auto scrollbar-hide">
          <TabsTrigger value="preview" className="flex items-center">
            <Globe className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{t('storefront.tabs.preview')}</span>
            <span className="sm:hidden">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{t('storefront.tabs.appearance')}</span>
            <span className="sm:hidden">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center">
            <FileText className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{t('storefront.tabs.content')}</span>
            <span className="sm:hidden">Content</span>
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center">
            <LinkIcon className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{t('storefront.tabs.domains')}</span>
            <span className="sm:hidden">Domain</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{t('storefront.tabs.analytics')}</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{t('storefront.tabs.settings')}</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="border rounded-lg overflow-hidden">
          <TabsContent value="preview" className="m-0">
            <div className="h-[700px] overflow-hidden">
              {storefrontConfig && <StorefrontPreview config={storefrontConfig} activeTab={activeTab} />}
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="m-0 p-6">
            {storefrontConfig && (
              <ThemeCustomizer 
                currentTheme={storefrontConfig.theme} 
                currentColorScheme={storefrontConfig.colorScheme}
                currentFontFamily={storefrontConfig.fontFamily}
                customColors={storefrontConfig.customColors}
                onThemeChange={(theme, colorScheme) => {
                  dispatch(updateTheme({ theme, colorScheme }));
                }}
                onCustomColorsChange={(colors) => {
                  dispatch(updateCustomColors(colors));
                }}
                onFontChange={(font) => {
                  // Would need to add updateFont action to storefrontSlice
                  console.log('Font change not implemented yet');
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="content" className="m-0 p-6">
            {storefrontConfig && (
              <PageContentEditor 
                pages={storefrontConfig.pages} 
                onUpdate={(updatedPages) => {
                  // Would need to implement an updatePages action
                  console.log('Page content update not implemented yet', updatedPages);
                }} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="domains" className="m-0 p-6">
            {storefrontConfig && (
              <DomainSettings 
                currentDomain={storefrontConfig.domain}
                businessName={storefrontConfig.businessName}
                onUpdate={(updates) => {
                  dispatch(updateBusinessInfo(updates));
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="m-0 p-6">
            <StorefrontAnalytics />
          </TabsContent>
          
          <TabsContent value="settings" className="m-0">
            <Tabs defaultValue="general" className="w-full">
              <div className="border-b">
                <TabsList className="w-full justify-start px-6">
                  <TabsTrigger value="general">
                    {t('storefront.settings.general')}
                  </TabsTrigger>
                  <TabsTrigger value="seo">
                    {t('storefront.settings.seo')}
                  </TabsTrigger>
                  <TabsTrigger value="legal">
                    {t('storefront.settings.legal')}
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    {t('storefront.settings.social')}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="general" className="mt-0">
                  {storefrontConfig && (
                    <ContactInfoSettings 
                      contactInfo={storefrontConfig.contactInfo}
                      onUpdate={(updates) => {
                        dispatch(updateContactInfo(updates));
                      }}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="seo" className="mt-0">
                  {storefrontConfig && (
                    <SEOSettings 
                      seoSettings={storefrontConfig.seo}
                      onUpdate={(updates) => {
                        dispatch(updateSEO(updates));
                      }}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="legal" className="mt-0">
                  {storefrontConfig && (
                    <LegalPagesSettings 
                      legalPages={storefrontConfig.legalPages}
                      onUpdate={(updates) => {
                        dispatch(updateLegalPages(updates));
                      }}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="social" className="mt-0">
                  {storefrontConfig && (
                    <SocialMediaSettings 
                      socialMedia={storefrontConfig.socialMedia}
                      onUpdate={(updates) => {
                        dispatch(updateSocialMedia(updates));
                      }}
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Mobile preview button (only visible on mobile) */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={() => window.open(storeUrl, '_blank')}
              >
                <Globe className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('storefront.preview')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default StorefrontUnified;