import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SEOSettings as SEOSettingsType } from '../../services/StorefrontService';

interface SEOSettingsProps {
  seoSettings: SEOSettingsType;
  onUpdate: (updates: Partial<SEOSettingsType>) => void;
}

const SEOSettings: React.FC<SEOSettingsProps> = ({
  seoSettings,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(seoSettings.title || '');
  const [description, setDescription] = useState(seoSettings.description || '');
  const [keywords, setKeywords] = useState(seoSettings.keywords?.join(', ') || '');
  const [ogImage, setOgImage] = useState(seoSettings.ogImage || '');
  const [sitemapEnabled, setSitemapEnabled] = useState(seoSettings.sitemapEnabled);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(
    seoSettings.analytics?.googleAnalyticsId || ''
  );
  const [facebookPixelId, setFacebookPixelId] = useState(
    seoSettings.analytics?.facebookPixelId || ''
  );

  const handleSave = () => {
    const formattedKeywords = keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);

    const updates: Partial<SEOSettingsType> = {
      title,
      description,
      keywords: formattedKeywords,
      ogImage: ogImage || undefined,
      sitemapEnabled,
      analytics: {
        googleAnalyticsId: googleAnalyticsId || undefined,
        facebookPixelId: facebookPixelId || undefined
      }
    };

    onUpdate(updates);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.seo.title')}</h3>
        <p className="text-sm text-gray-600 mb-5">
          {t('storefront.seo.description')}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storefront.seo.pageTitle')}
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('storefront.seo.pageTitlePlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.seo.pageTitleHelp')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storefront.seo.metaDescription')}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('storefront.seo.metaDescriptionPlaceholder')}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.seo.metaDescriptionHelp')}
            </p>
            <div className="mt-1 text-xs text-gray-500 flex justify-between">
              <span>{description.length} / 160</span>
              {description.length > 160 && (
                <span className="text-amber-600">{t('storefront.seo.tooLong')}</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storefront.seo.keywords')}
            </label>
            <Input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={t('storefront.seo.keywordsPlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.seo.keywordsHelp')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storefront.seo.ogImage')}
            </label>
            <Input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder={t('storefront.seo.ogImagePlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.seo.ogImageHelp')}
            </p>
            {ogImage && (
              <div className="mt-2">
                <p className="text-xs text-gray-700 mb-1">{t('storefront.seo.preview')}:</p>
                <div className="w-32 h-20 border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={ogImage} 
                    alt="OG Preview" 
                    className="max-w-full max-h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/600x315/f3f4f6/a1a1aa?text=Preview';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.seo.advanced')}</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                {t('storefront.seo.sitemap')}
              </label>
              <Switch
                checked={sitemapEnabled}
                onCheckedChange={setSitemapEnabled}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('storefront.seo.sitemapHelp')}
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-3">{t('storefront.seo.analytics')}</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('storefront.seo.googleAnalytics')}
                </label>
                <Input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('storefront.seo.googleAnalyticsHelp')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('storefront.seo.facebookPixel')}
                </label>
                <Input
                  type="text"
                  value={facebookPixelId}
                  onChange={(e) => setFacebookPixelId(e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('storefront.seo.facebookPixelHelp')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>{t('common.save')}</Button>
      </div>
    </div>
  );
};

export default SEOSettings;