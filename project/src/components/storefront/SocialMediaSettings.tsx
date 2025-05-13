import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  SocialMediaLinks, 
  SocialPlatform 
} from '../../services/StorefrontService';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  BookImage, // Replace Pinterest with a suitable alternative
  MessageCircle, 
  Trash2, 
  Plus 
} from 'lucide-react';

interface SocialMediaSettingsProps {
  socialMedia: SocialMediaLinks[];
  onUpdate: (updates: SocialMediaLinks[]) => void;
}

const SocialMediaSettings: React.FC<SocialMediaSettingsProps> = ({
  socialMedia,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [links, setLinks] = useState<SocialMediaLinks[]>(socialMedia || []);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform | ''>('');
  const [newUrl, setNewUrl] = useState('');
  const [showHeader, setShowHeader] = useState(false);
  const [showFooter, setShowFooter] = useState(true);

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case SocialPlatform.FACEBOOK:
        return <Facebook className="h-5 w-5" />;
      case SocialPlatform.INSTAGRAM:
        return <Instagram className="h-5 w-5" />;
      case SocialPlatform.TWITTER:
        return <Twitter className="h-5 w-5" />;
      case SocialPlatform.YOUTUBE:
        return <Youtube className="h-5 w-5" />;
      case SocialPlatform.PINTEREST:
        return <BookImage className="h-5 w-5" />;
      case SocialPlatform.WHATSAPP:
        return <MessageCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleAddSocial = () => {
    if (!newPlatform || !newUrl) return;

    const newLink: SocialMediaLinks = {
      platform: newPlatform as SocialPlatform,
      url: newUrl,
      displayOnHeader: showHeader,
      displayOnFooter: showFooter,
    };

    setLinks([...links, newLink]);
    setNewPlatform('');
    setNewUrl('');
  };

  const handleRemoveSocial = (index: number) => {
    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  const handleToggleDisplay = (index: number, location: 'header' | 'footer') => {
    const updatedLinks = [...links];
    if (location === 'header') {
      updatedLinks[index].displayOnHeader = !updatedLinks[index].displayOnHeader;
    } else {
      updatedLinks[index].displayOnFooter = !updatedLinks[index].displayOnFooter;
    }
    setLinks(updatedLinks);
  };

  const handleSave = () => {
    onUpdate(links);
  };

  const getUnusedPlatforms = () => {
    const usedPlatforms = links.map(link => link.platform);
    return Object.values(SocialPlatform).filter(
      platform => !usedPlatforms.includes(platform)
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.social.title')}</h3>
        <p className="text-sm text-gray-600 mb-5">
          {t('storefront.social.description')}
        </p>
        
        <div className="space-y-6">
          {links.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-10 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                <div className="col-span-2">{t('storefront.social.platform')}</div>
                <div className="col-span-4">{t('storefront.social.url')}</div>
                <div className="col-span-1 text-center">{t('storefront.social.header')}</div>
                <div className="col-span-1 text-center">{t('storefront.social.footer')}</div>
                <div className="col-span-2"></div>
              </div>
              
              {links.map((link, index) => (
                <div key={index} className="grid grid-cols-10 gap-4 items-center">
                  <div className="col-span-2 flex items-center space-x-2">
                    <div className="text-gray-600">
                      {getPlatformIcon(link.platform)}
                    </div>
                    <span className="capitalize">{link.platform}</span>
                  </div>
                  <div className="col-span-4 text-sm text-gray-600 truncate">
                    {link.url}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Switch
                      checked={link.displayOnHeader}
                      onCheckedChange={() => handleToggleDisplay(index, 'header')}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Switch
                      checked={link.displayOnFooter}
                      onCheckedChange={() => handleToggleDisplay(index, 'footer')}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveSocial(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500 mb-2">{t('storefront.social.empty')}</p>
              <p className="text-sm text-gray-400">{t('storefront.social.emptyHelp')}</p>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">{t('storefront.social.add')}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('storefront.social.platform')}
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-1 focus:ring-primary focus:border-primary"
                  disabled={getUnusedPlatforms().length === 0}
                >
                  <option value="">{t('storefront.social.selectPlatform')}</option>
                  {getUnusedPlatforms().map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('storefront.social.url')}
                </label>
                <Input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showHeader}
                  onCheckedChange={setShowHeader}
                  id="show-header"
                />
                <label 
                  htmlFor="show-header"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t('storefront.social.showHeader')}
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showFooter}
                  onCheckedChange={setShowFooter}
                  id="show-footer"
                />
                <label 
                  htmlFor="show-footer"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t('storefront.social.showFooter')}
                </label>
              </div>
            </div>
            
            <Button
              onClick={handleAddSocial}
              disabled={!newPlatform || !newUrl}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('storefront.social.addLink')}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>{t('common.save')}</Button>
      </div>
    </div>
  );
};

export default SocialMediaSettings;