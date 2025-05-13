import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Check } from 'lucide-react';

interface DomainSettingsProps {
  currentDomain: string;
  businessName: string;
  onUpdate: (updates: { businessName?: string; domain?: string }) => void;
}

const DomainSettings: React.FC<DomainSettingsProps> = ({
  currentDomain,
  businessName,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [domain, setDomain] = useState(currentDomain);
  const [customDomain, setCustomDomain] = useState('');
  const [isDomainValid, setIsDomainValid] = useState(true);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [businessNameInput, setBusinessNameInput] = useState(businessName);

  const baseStorefrontDomain = 'autodukaan.com';

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setDomain(`${value}.${baseStorefrontDomain}`);
  };

  const getSubdomain = () => {
    return domain.split('.')[0];
  };

  const validateCustomDomain = () => {
    setIsCheckingDomain(true);
    
    // Simulating domain validation check
    setTimeout(() => {
      setIsDomainValid(true);
      setIsCheckingDomain(false);
    }, 1500);
  };

  const handleApplyCustomDomain = () => {
    if (customDomain && isDomainValid) {
      onUpdate({ domain: customDomain });
    }
  };

  const handleUpdateBusinessName = () => {
    onUpdate({ businessName: businessNameInput });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.domain.businessInfo')}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storefront.domain.businessName')}
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={businessNameInput}
                onChange={(e) => setBusinessNameInput(e.target.value)}
                placeholder={t('storefront.domain.businessNamePlaceholder')}
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateBusinessName}
                disabled={!businessNameInput || businessNameInput === businessName}
              >
                {t('common.update')}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.domain.businessNameHelp')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.domain.title')}</h3>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {t('storefront.domain.description')}
            </p>
            
            <div className="p-4 bg-gray-50 rounded-md mb-5">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-800">{domain}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('storefront.domain.subdomain')}
              </label>
              <div className="flex">
                <Input
                  type="text"
                  value={getSubdomain()}
                  onChange={handleSubdomainChange}
                  className="rounded-r-none"
                  placeholder={t('storefront.domain.subdomainPlaceholder')}
                />
                <div className="flex items-center border border-l-0 rounded-r-md px-3 bg-gray-50 text-gray-500">
                  .{baseStorefrontDomain}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('storefront.domain.subdomainHelp')}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">{t('storefront.domain.customDomain')}</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCustomDomain(!showCustomDomain)}
              >
                {showCustomDomain ? t('common.hide') : t('common.setup')}
              </Button>
            </div>
            
            {showCustomDomain && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {t('storefront.domain.customDomainDescription')}
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('storefront.domain.customDomainName')}
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="example.com"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline"
                      onClick={validateCustomDomain}
                      disabled={isCheckingDomain || !customDomain}
                    >
                      {isCheckingDomain ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                          {t('storefront.domain.checking')}
                        </>
                      ) : (
                        t('storefront.domain.verify')
                      )}
                    </Button>
                  </div>
                  
                  {customDomain && isDomainValid && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      {t('storefront.domain.valid')}
                    </div>
                  )}
                  
                  {customDomain && !isDomainValid && (
                    <div className="mt-2 text-sm text-red-600">
                      {t('storefront.domain.invalid')}
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={handleApplyCustomDomain}
                    disabled={!customDomain || !isDomainValid}
                  >
                    {t('storefront.domain.apply')}
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                  <h5 className="font-medium mb-2">{t('storefront.domain.instructions')}</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{t('storefront.domain.step1')}</li>
                    <li>{t('storefront.domain.step2')}</li>
                    <li>{t('storefront.domain.step3')}</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainSettings;