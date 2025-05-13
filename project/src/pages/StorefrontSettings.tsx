import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@radix-ui/react-tabs';
import { 
  PaintBucket, 
  Layout, 
  Tag, 
  Globe, 
  Share2, 
  ShoppingBag, 
  FileText, 
  Info, 
  Phone
} from 'lucide-react';
import { 
  selectStorefrontConfig, 
  createStorefront, 
  updateTheme, 
  updateBusinessInfo, 
  updateSEO, 
  updateSocialMedia, 
  updateContactInfo, 
  updateLegalPages,
  publishStorefront,
  generatePreview,
  selectStorefrontPreviewUrl,
  selectStorefrontLiveUrl,
  selectIsStorefrontDirty,
  selectIsStorefrontPublished
} from '../store/slices/storefrontSlice';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { 
  StorefrontTheme, 
  ColorScheme, 
  FontFamily,
  PageType,
  SectionType,
  SocialPlatform
} from '../services/StorefrontService';
import { Button } from '@/components/ui/button';
import ThemeCustomizer from '../components/storefront/ThemeCustomizer';
import StorefrontTemplateSelector from '../components/storefront/StorefrontTemplateSelector';
import DomainSettings from '../components/storefront/DomainSettings';
import SEOSettings from '../components/storefront/SEOSettings';
import SocialMediaSettings from '../components/storefront/SocialMediaSettings';
import ContactInfoSettings from '../components/storefront/ContactInfoSettings';
import LegalPagesSettings from '../components/storefront/LegalPagesSettings';
import PageContentEditor from '../components/storefront/PageContentEditor';
import StorefrontPreview from '../components/storefront/StorefrontPreview';
import { selectUser } from '../store/slices/userSlice';

const StorefrontSettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const storefrontConfig = useSelector(selectStorefrontConfig);
  const previewUrl = useSelector(selectStorefrontPreviewUrl);
  const liveUrl = useSelector(selectStorefrontLiveUrl);
  const isDirty = useSelector(selectIsStorefrontDirty);
  const isPublished = useSelector(selectIsStorefrontPublished);
  
  const [activeTab, setActiveTab] = useState("appearance");
  const [showPreview, setShowPreview] = useState(false);

  // Initialize storefront if not already done
  useEffect(() => {
    if (!storefrontConfig && user) {
      dispatch(createStorefront({ 
        businessName: user.businessName || "My Store", 
        businessId: user.id 
      }));
    }
  }, [storefrontConfig, user, dispatch]);

  const handlePublish = () => {
    dispatch(publishStorefront());
  };

  const handlePreview = () => {
    dispatch(generatePreview());
    setShowPreview(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!storefrontConfig) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('storefront.settings.title')}</h1>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!isDirty && previewUrl !== null}
            >
              {t('storefront.preview')}
            </Button>
            <Button 
              variant={isDirty ? "default" : "outline"} 
              onClick={handlePublish}
              disabled={!isDirty && isPublished}
            >
              {isPublished ? t('storefront.republish') : t('storefront.publish')}
            </Button>
          </div>
        </div>

        {isPublished && liveUrl && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-green-800">
                  {t('storefront.published')}
                </p>
                <p className="text-sm text-green-700">
                  {t('storefront.publishedAt')}: {new Date().toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-700">{liveUrl}</span>
                <Button variant="outline" size="sm" onClick={() => window.open(liveUrl, '_blank')}>
                  <Share2 className="h-4 w-4 mr-1" />
                  {t('storefront.visit')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            <Tabs 
              defaultValue="appearance" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="flex overflow-x-auto mb-6 border-b">
                <TabsTrigger value="appearance" className="flex items-center px-4 py-2">
                  <PaintBucket className="h-4 w-4 mr-2" />
                  {t('storefront.appearance')}
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center px-4 py-2">
                  <Layout className="h-4 w-4 mr-2" />
                  {t('storefront.pages')}
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center px-4 py-2">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('storefront.products')}
                </TabsTrigger>
                <TabsTrigger value="domain" className="flex items-center px-4 py-2">
                  <Globe className="h-4 w-4 mr-2" />
                  {t('storefront.domain')}
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center px-4 py-2">
                  <Tag className="h-4 w-4 mr-2" />
                  {t('storefront.seo')}
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center px-4 py-2">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('storefront.social')}
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center px-4 py-2">
                  <Phone className="h-4 w-4 mr-2" />
                  {t('storefront.contact')}
                </TabsTrigger>
                <TabsTrigger value="legal" className="flex items-center px-4 py-2">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('storefront.legal')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="mt-2">
                <div className="space-y-8">
                  <ThemeCustomizer 
                    currentTheme={storefrontConfig.theme}
                    currentColorScheme={storefrontConfig.colorScheme}
                    currentFontFamily={storefrontConfig.fontFamily}
                    customColors={storefrontConfig.customColors}
                    onThemeChange={(theme, colorScheme) => 
                      dispatch(updateTheme({ theme, colorScheme }))
                    }
                  />
                  <StorefrontTemplateSelector 
                    selectedTheme={storefrontConfig.theme}
                    onSelect={(theme) => 
                      dispatch(updateTheme({ theme, colorScheme: storefrontConfig.colorScheme }))
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="pages" className="mt-2">
                <PageContentEditor 
                  pages={storefrontConfig.pages}
                />
              </TabsContent>

              <TabsContent value="products" className="mt-2">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">{t('storefront.productDisplay')}</h3>
                    {/* Product display settings */}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="domain" className="mt-2">
                <DomainSettings 
                  currentDomain={storefrontConfig.domain}
                  businessName={storefrontConfig.businessName}
                  onUpdate={(updates) => dispatch(updateBusinessInfo(updates))}
                />
              </TabsContent>

              <TabsContent value="seo" className="mt-2">
                <SEOSettings 
                  seoSettings={storefrontConfig.seo}
                  onUpdate={(updates) => dispatch(updateSEO(updates))}
                />
              </TabsContent>

              <TabsContent value="social" className="mt-2">
                <SocialMediaSettings 
                  socialMedia={storefrontConfig.socialMedia}
                  onUpdate={(updates) => dispatch(updateSocialMedia(updates))}
                />
              </TabsContent>

              <TabsContent value="contact" className="mt-2">
                <ContactInfoSettings 
                  contactInfo={storefrontConfig.contactInfo}
                  onUpdate={(updates) => dispatch(updateContactInfo(updates))}
                />
              </TabsContent>

              <TabsContent value="legal" className="mt-2">
                <LegalPagesSettings 
                  legalPages={storefrontConfig.legalPages}
                  onUpdate={(updates) => dispatch(updateLegalPages(updates))}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-24">
              <h3 className="text-lg font-medium mb-3">{t('storefront.preview')}</h3>
              <div className="aspect-[9/16] mb-4 border rounded-md overflow-hidden">
                <StorefrontPreview 
                  config={storefrontConfig} 
                  activeTab={activeTab}
                />
              </div>
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePreview}
                >
                  {t('storefront.fullPreview')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">{t('storefront.previewTitle')}</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe 
                src={previewUrl} 
                className="w-full h-full"
                title={t('storefront.previewTitle')}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StorefrontSettings;