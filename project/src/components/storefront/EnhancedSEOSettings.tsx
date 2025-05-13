import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Tag, 
  Check, 
  AlertCircle, 
  FileText, 
  Image, 
  Search, 
  Facebook, 
  Twitter, 
  Link, 
  Info,
  Eye,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SEOSettings } from '../../services/StorefrontService';

interface EnhancedSEOSettingsProps {
  seoSettings: SEOSettings;
  businessName: string;
  domain: string;
  onUpdate: (updates: Partial<SEOSettings>) => void;
}

interface SeoScore {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    field?: string;
  }>;
}

const EnhancedSEOSettings: React.FC<EnhancedSEOSettingsProps> = ({
  seoSettings,
  businessName,
  domain,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'social' | 'analytics'>('basic');
  const [keywords, setKeywords] = useState<string[]>(seoSettings.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [seoScore, setSeoScore] = useState<SeoScore | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(seoSettings.title || '');
  const [description, setDescription] = useState(seoSettings.description || '');
  const [ogImage, setOgImage] = useState(seoSettings.ogImage || '');
  const [analyticsId, setAnalyticsId] = useState(seoSettings.analytics?.googleAnalyticsId || '');
  const [facebookPixelId, setFacebookPixelId] = useState(seoSettings.analytics?.facebookPixelId || '');
  const [sitemapEnabled, setSitemapEnabled] = useState(seoSettings.sitemapEnabled);
  const [robotsTxt, setRobotsTxt] = useState(seoSettings.robotsTxt || '');
  
  // Calculate SEO score based on current settings
  const calculateSeoScore = (): SeoScore => {
    let score = 0;
    const issues: SeoScore['issues'] = [];
    
    // Check title
    if (title) {
      if (title.length > 10 && title.length < 60) {
        score += 25;
      } else {
        issues.push({
          type: 'warning',
          message: t('storefront.seo.issues.titleLength'),
          field: 'title'
        });
      }
    } else {
      issues.push({
        type: 'error',
        message: t('storefront.seo.issues.noTitle'),
        field: 'title'
      });
    }
    
    // Check description
    if (description) {
      if (description.length > 50 && description.length < 160) {
        score += 25;
      } else {
        issues.push({
          type: 'warning',
          message: t('storefront.seo.issues.descriptionLength'),
          field: 'description'
        });
      }
    } else {
      issues.push({
        type: 'error',
        message: t('storefront.seo.issues.noDescription'),
        field: 'description'
      });
    }
    
    // Check keywords
    if (keywords.length > 0) {
      score += 15;
      
      if (keywords.length < 5) {
        issues.push({
          type: 'info',
          message: t('storefront.seo.issues.fewKeywords'),
          field: 'keywords'
        });
      }
    } else {
      issues.push({
        type: 'warning',
        message: t('storefront.seo.issues.noKeywords'),
        field: 'keywords'
      });
    }
    
    // Check OG image
    if (ogImage) {
      score += 15;
    } else {
      issues.push({
        type: 'info',
        message: t('storefront.seo.issues.noOgImage'),
        field: 'ogImage'
      });
    }
    
    // Check analytics
    if (analyticsId || facebookPixelId) {
      score += 10;
    } else {
      issues.push({
        type: 'info',
        message: t('storefront.seo.issues.noAnalytics'),
        field: 'analytics'
      });
    }
    
    // Check sitemap
    if (sitemapEnabled) {
      score += 10;
    } else {
      issues.push({
        type: 'warning',
        message: t('storefront.seo.issues.noSitemap'),
        field: 'sitemap'
      });
    }
    
    return { score, issues };
  };
  
  // Save changes
  const saveChanges = () => {
    onUpdate({
      title,
      description,
      keywords,
      ogImage,
      sitemapEnabled,
      robotsTxt,
      analytics: {
        googleAnalyticsId: analyticsId,
        facebookPixelId: facebookPixelId
      }
    });
  };
  
  // Add keyword
  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
      setNewKeyword('');
      
      // Update SEO settings with new keywords
      onUpdate({
        ...seoSettings,
        keywords: updatedKeywords
      });
    }
  };
  
  // Remove keyword
  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    
    // Update SEO settings with new keywords
    onUpdate({
      ...seoSettings,
      keywords: updatedKeywords
    });
  };
  
  // Generate meta based on business name
  const generateMetaInfo = () => {
    const generatedTitle = `${businessName} | Online Store`;
    const generatedDesc = `Shop online at ${businessName}. We offer quality products with fast delivery and easy returns.`;
    
    setTitle(generatedTitle);
    setDescription(generatedDesc);
    
    // Calculate new SEO score
    const newScore = calculateSeoScore();
    setSeoScore(newScore);
  };
  
  // Update SEO score when fields change
  React.useEffect(() => {
    const score = calculateSeoScore();
    setSeoScore(score);
  }, [title, description, keywords, ogImage, analyticsId, facebookPixelId, sitemapEnabled, robotsTxt]);
  
  // Render SEO preview
  const renderSeoPreview = () => {
    if (!showPreview) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">{t('storefront.seo.preview.title')}</h3>
            <button 
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Google search result preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t('storefront.seo.preview.googleSearch')}
              </h4>
              <div className="border rounded-md p-4 bg-white">
                <div className="text-blue-600 text-xl font-medium line-clamp-1">
                  {title || businessName}
                </div>
                <div className="text-green-700 text-sm mb-1">
                  {domain}
                </div>
                <div className="text-gray-700 text-sm line-clamp-2">
                  {description || `Shop online at ${businessName}.`}
                </div>
              </div>
            </div>
            
            {/* Facebook share preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t('storefront.seo.preview.facebookShare')}
              </h4>
              <div className="border rounded-md overflow-hidden">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {ogImage ? (
                    <img 
                      src={ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <Image size={24} className="mb-2" />
                      <span className="text-xs">{t('storefront.seo.preview.noImage')}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t">
                  <div className="text-gray-500 text-xs uppercase mb-1">
                    {domain}
                  </div>
                  <div className="font-medium mb-1">
                    {title || businessName}
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {description || `Shop online at ${businessName}.`}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={() => setShowPreview(false)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b">
        <nav className="flex">
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'basic' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            <Search size={16} className="inline-block mr-1" />
            {t('storefront.seo.tabs.basic')}
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'social' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('social')}
          >
            <Facebook size={16} className="inline-block mr-1" />
            {t('storefront.seo.tabs.social')}
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'advanced' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('advanced')}
          >
            <FileText size={16} className="inline-block mr-1" />
            {t('storefront.seo.tabs.advanced')}
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'analytics' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={16} className="inline-block mr-1" />
            {t('storefront.seo.tabs.analytics')}
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {/* SEO Score */}
        {seoScore && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-start">
            <div className="mr-4">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  seoScore.score >= 70 ? 'bg-green-500' : 
                  seoScore.score >= 40 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`}
              >
                {seoScore.score}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">{t('storefront.seo.seoScore')}</h3>
              
              {seoScore.issues.length > 0 ? (
                <div className="space-y-2">
                  {seoScore.issues.map((issue, index) => (
                    <div 
                      key={index}
                      className="flex items-start"
                    >
                      {issue.type === 'error' && <AlertCircle size={16} className="text-red-500 mr-1 mt-0.5 flex-shrink-0" />}
                      {issue.type === 'warning' && <AlertCircle size={16} className="text-amber-500 mr-1 mt-0.5 flex-shrink-0" />}
                      {issue.type === 'info' && <Info size={16} className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" />}
                      <span className="text-sm text-gray-700">{issue.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  <span>{t('storefront.seo.allGood')}</span>
                </div>
              )}
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye size={16} className="mr-1" />
                {t('storefront.seo.preview.view')}
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('storefront.seo.metaTitle')}
                </label>
                <span className="text-xs text-gray-500">
                  {title.length}/60
                </span>
              </div>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('storefront.seo.metaTitlePlaceholder')}
                className={`${title.length > 60 ? 'border-red-300' : ''}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.metaTitleHelper')}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('storefront.seo.metaDescription')}
                </label>
                <span className="text-xs text-gray-500">
                  {description.length}/160
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('storefront.seo.metaDescriptionPlaceholder')}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary ${
                  description.length > 160 ? 'border-red-300' : ''
                }`}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.metaDescriptionHelper')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storefront.seo.keywords')}
              </label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder={t('storefront.seo.keywordsPlaceholder')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={addKeyword}
                  disabled={!newKeyword}
                >
                  {t('common.add')}
                </Button>
              </div>
              
              {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((keyword) => (
                    <div 
                      key={keyword}
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                    >
                      <Tag size={12} className="mr-1 text-gray-500" />
                      <span>{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {t('storefront.seo.noKeywords')}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {t('storefront.seo.keywordsHelper')}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={generateMetaInfo}
                className="mr-2"
              >
                {t('storefront.seo.generateMeta')}
              </Button>
              <Button
                onClick={saveChanges}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storefront.seo.ogImage')}
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <Input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder={t('storefront.seo.ogImagePlaceholder')}
                  className="flex-1"
                />
                <Button variant="outline">
                  {t('storefront.seo.upload')}
                </Button>
              </div>
              
              <div className="border rounded-md p-2 h-40 bg-gray-50 flex items-center justify-center">
                {ogImage ? (
                  <img 
                    src={ogImage}
                    alt="OG Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Image size={24} className="mb-2" />
                    <span className="text-xs">{t('storefront.seo.preview.noImage')}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.ogImageHelper')}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('storefront.seo.ogTitle')}
                </label>
                <span className="text-xs text-gray-500">
                  {t('storefront.seo.usesSameAs')}
                </span>
              </div>
              <Input
                type="text"
                value={title}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.ogTitleHelper')}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('storefront.seo.ogDescription')}
                </label>
                <span className="text-xs text-gray-500">
                  {t('storefront.seo.usesSameAs')}
                </span>
              </div>
              <textarea
                value={description}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.ogDescriptionHelper')}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={saveChanges}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('storefront.seo.sitemap')}
                </label>
                <Switch
                  checked={sitemapEnabled}
                  onCheckedChange={setSitemapEnabled}
                />
              </div>
              <p className="text-sm text-gray-600">
                {t('storefront.seo.sitemapHelper')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storefront.seo.robotsTxt')}
              </label>
              <textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                placeholder={`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://${domain}/sitemap.xml`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.robotsTxtHelper')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storefront.seo.canonicalUrl')}
              </label>
              <Input
                type="text"
                value={`https://${domain}`}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.canonicalUrlHelper')}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={saveChanges}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storefront.seo.googleAnalytics')}
              </label>
              <Input
                type="text"
                value={analyticsId}
                onChange={(e) => setAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.googleAnalyticsHelper')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storefront.seo.facebookPixel')}
              </label>
              <Input
                type="text"
                value={facebookPixelId}
                onChange={(e) => setFacebookPixelId(e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.seo.facebookPixelHelper')}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={saveChanges}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* SEO Preview Modal */}
      {renderSeoPreview()}
    </div>
  );
};

export default EnhancedSEOSettings;