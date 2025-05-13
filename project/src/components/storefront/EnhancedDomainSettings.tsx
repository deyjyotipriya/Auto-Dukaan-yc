import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Check, 
  X, 
  Clock, 
  Shield, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface EnhancedDomainSettingsProps {
  currentDomain: string;
  businessName: string;
  onUpdate: (updates: { businessName?: string; domain?: string }) => void;
}

interface DomainStatus {
  status: 'checking' | 'valid' | 'invalid' | 'pending' | 'active';
  message: string;
  lastChecked?: Date;
}

interface DomainOption {
  domain: string;
  type: 'free' | 'premium';
  available: boolean;
  price?: string;
}

const EnhancedDomainSettings: React.FC<EnhancedDomainSettingsProps> = ({
  currentDomain,
  businessName,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [domain, setDomain] = useState(currentDomain);
  const [customDomain, setCustomDomain] = useState('');
  const [businessNameInput, setBusinessNameInput] = useState(businessName);
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [useHttps, setUseHttps] = useState(true);
  const [domainStatus, setDomainStatus] = useState<DomainStatus>({
    status: 'active',
    message: t('storefront.domain.status.active')
  });
  const [suggestedDomains, setSuggestedDomains] = useState<DomainOption[]>([]);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [hasDomainError, setHasDomainError] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<{ type: string; name: string; value: string; }[]>([]);
  
  const baseStorefrontDomain = 'autodukaan.com';
  
  // Generate domain suggestions based on business name
  useEffect(() => {
    if (businessNameInput) {
      const sanitizedName = businessNameInput.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Generate some domain suggestions
      const suggestions: DomainOption[] = [
        {
          domain: `${sanitizedName}.${baseStorefrontDomain}`,
          type: 'free',
          available: true
        },
        {
          domain: `${sanitizedName}.store`,
          type: 'premium',
          available: true,
          price: '₹999/year'
        },
        {
          domain: `${sanitizedName}.in`,
          type: 'premium',
          available: true,
          price: '₹699/year'
        },
        {
          domain: `${sanitizedName}.com`,
          type: 'premium',
          available: false
        },
        {
          domain: `${sanitizedName}-shop.com`,
          type: 'premium',
          available: true,
          price: '₹1,299/year'
        },
        {
          domain: `shop-${sanitizedName}.com`,
          type: 'premium',
          available: true,
          price: '₹1,299/year'
        }
      ];
      
      setSuggestedDomains(suggestions);
    }
  }, [businessNameInput, baseStorefrontDomain]);
  
  // Handle subdomain change (for free domain)
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setDomain(`${value}.${baseStorefrontDomain}`);
  };
  
  // Extract subdomain from full domain
  const getSubdomain = () => {
    return domain.split('.')[0];
  };
  
  // Validate custom domain format
  const isValidDomainFormat = (domain: string) => {
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };
  
  // Check custom domain availability and validity
  const validateCustomDomain = () => {
    if (!isValidDomainFormat(customDomain)) {
      setHasDomainError(true);
      return;
    }
    
    setIsCheckingDomain(true);
    setHasDomainError(false);
    
    // Simulate domain check (would be an API call in a real app)
    setTimeout(() => {
      setIsCheckingDomain(false);
      setDomainStatus({
        status: 'valid',
        message: t('storefront.domain.status.valid'),
        lastChecked: new Date()
      });
      
      // Set DNS records for custom domain
      setDnsRecords([
        { type: 'A', name: '@', value: '192.0.2.1' },
        { type: 'CNAME', name: 'www', value: `${customDomain}.cdn.autodukaan.com` }
      ]);
    }, 1500);
  };
  
  // Apply custom domain
  const handleApplyCustomDomain = () => {
    if (customDomain && domainStatus.status === 'valid') {
      onUpdate({ domain: customDomain });
      setDomain(customDomain);
    }
  };
  
  // Apply suggested domain
  const handleApplySuggestedDomain = (domain: string) => {
    if (domain.endsWith(baseStorefrontDomain)) {
      // Free domain
      setDomain(domain);
      onUpdate({ domain });
    } else {
      // Premium domain - would open purchase flow in a real app
      setCustomDomain(domain);
      setShowCustomDomain(true);
      validateCustomDomain();
    }
  };
  
  // Update business name
  const handleUpdateBusinessName = () => {
    onUpdate({ businessName: businessNameInput });
  };
  
  // Verify domain DNS settings
  const verifyDomainSettings = () => {
    setIsCheckingDomain(true);
    
    // Simulate verification (would be an API call in a real app)
    setTimeout(() => {
      setIsCheckingDomain(false);
      setDomainStatus({
        status: 'active',
        message: t('storefront.domain.status.active'),
        lastChecked: new Date()
      });
    }, 2000);
  };
  
  // Get status badge for domain
  const getDomainStatusBadge = (status: DomainStatus['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
            <Check size={12} className="mr-1" />
            {t('storefront.domain.status.active')}
          </span>
        );
      case 'checking':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
            <Loader2 size={12} className="mr-1 animate-spin" />
            {t('storefront.domain.status.checking')}
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center">
            <Clock size={12} className="mr-1" />
            {t('storefront.domain.status.pending')}
          </span>
        );
      case 'invalid':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
            <X size={12} className="mr-1" />
            {t('storefront.domain.status.invalid')}
          </span>
        );
      case 'valid':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
            <Check size={12} className="mr-1" />
            {t('storefront.domain.status.valid')}
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Business Info Section */}
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
              {t('storefront.domain.businessNameHelper')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Current Domain Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium">{t('storefront.domain.current')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('storefront.domain.currentHelper')}</p>
          </div>
          {getDomainStatusBadge(domainStatus.status)}
        </div>
        
        <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-md border">
          <Globe className="h-5 w-5 text-gray-500 mr-3" />
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium">{domain}</span>
              {useHttps && <Lock size={14} className="ml-2 text-green-500" />}
            </div>
            <div className="mt-1 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`http${useHttps ? 's' : ''}://${domain}`, '_blank')}
                className="text-xs text-blue-600 p-0 h-auto"
              >
                {`http${useHttps ? 's' : ''}://${domain}`}
                <ExternalLink size={10} className="ml-1" />
              </Button>
            </div>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={verifyDomainSettings}
              disabled={isCheckingDomain}
              className="text-gray-600"
            >
              {isCheckingDomain ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <RefreshCw size={14} className="mr-1" />
              )}
              {t('storefront.domain.verify')}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <Switch
            checked={useHttps}
            onCheckedChange={setUseHttps}
            id="https-toggle"
          />
          <label htmlFor="https-toggle" className="ml-2 text-sm text-gray-700">
            {t('storefront.domain.useHttps')}
          </label>
        </div>
        
        {domainStatus.lastChecked && (
          <div className="text-xs text-gray-500">
            {t('storefront.domain.lastChecked')}: {domainStatus.lastChecked.toLocaleString()}
          </div>
        )}
      </div>
      
      {/* Free Subdomain Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.domain.freeSubdomain')}</h3>
        <p className="text-sm text-gray-600 mb-4">{t('storefront.domain.freeSubdomainHelper')}</p>
        
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
        </div>
      </div>
      
      {/* Domain Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.domain.suggestions')}</h3>
        <p className="text-sm text-gray-600 mb-4">{t('storefront.domain.suggestionsHelper')}</p>
        
        <div className="space-y-3">
          {suggestedDomains.map((suggestedDomain) => (
            <div 
              key={suggestedDomain.domain}
              className="border rounded-md p-3 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{suggestedDomain.domain}</span>
                  {suggestedDomain.type === 'free' && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      {t('storefront.domain.free')}
                    </span>
                  )}
                </div>
                {suggestedDomain.type === 'premium' && (
                  <div className="text-sm text-gray-600 mt-0.5">
                    {suggestedDomain.available ? (
                      <span className="text-green-600 font-medium flex items-center">
                        <Check size={12} className="mr-1" />
                        {t('storefront.domain.available')} 
                        {suggestedDomain.price && ` - ${suggestedDomain.price}`}
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <X size={12} className="mr-1" />
                        {t('storefront.domain.unavailable')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant={suggestedDomain.domain === domain ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleApplySuggestedDomain(suggestedDomain.domain)}
                disabled={suggestedDomain.type === 'premium' && !suggestedDomain.available}
              >
                {suggestedDomain.domain === domain ? (
                  <>
                    <Check size={14} className="mr-1" />
                    {t('storefront.domain.selected')}
                  </>
                ) : (
                  suggestedDomain.type === 'free' ? t('storefront.domain.select') : t('storefront.domain.buy')
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Domain Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t('storefront.domain.customDomain')}</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCustomDomain(!showCustomDomain)}
          >
            {showCustomDomain ? t('common.hide') : t('common.setup')}
          </Button>
        </div>
        <p className="text-sm text-gray-600">{t('storefront.domain.customDomainDescription')}</p>
        
        {showCustomDomain && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('storefront.domain.customDomainName')}
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setHasDomainError(false);
                  }}
                  placeholder="example.com"
                  className={`flex-1 ${hasDomainError ? 'border-red-300' : ''}`}
                />
                <Button 
                  variant="outline"
                  onClick={validateCustomDomain}
                  disabled={isCheckingDomain || !customDomain}
                >
                  {isCheckingDomain ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      {t('storefront.domain.checking')}
                    </>
                  ) : (
                    t('storefront.domain.verify')
                  )}
                </Button>
              </div>
              {hasDomainError && (
                <p className="mt-1 text-sm text-red-600">
                  {t('storefront.domain.invalidFormat')}
                </p>
              )}
            </div>
            
            {domainStatus.status === 'valid' && (
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                {domainStatus.message}
              </div>
            )}
            
            {dnsRecords.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 mr-1 text-amber-500" />
                  <h4 className="font-medium text-sm">{t('storefront.domain.dnsRecords')}</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border text-sm overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium py-2 pr-4">{t('storefront.domain.recordType')}</th>
                        <th className="text-left font-medium py-2 pr-4">{t('storefront.domain.name')}</th>
                        <th className="text-left font-medium py-2">{t('storefront.domain.value')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dnsRecords.map((record, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-2 pr-4">{record.type}</td>
                          <td className="py-2 pr-4">{record.name}</td>
                          <td className="py-2 font-mono">{record.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('storefront.domain.dnsHelper')}
                </p>
              </div>
            )}
            
            <div>
              <Button
                onClick={handleApplyCustomDomain}
                disabled={!customDomain || domainStatus.status !== 'valid'}
                className="mt-2"
              >
                {t('storefront.domain.apply')}
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm mt-4">
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
      
      {/* Domain Protection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-1">{t('storefront.domain.protection')}</h3>
            <p className="text-sm text-gray-600">{t('storefront.domain.protectionDesc')}</p>
          </div>
          <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
            {t('storefront.domain.premium')}
          </div>
        </div>
        
        <div className="mt-4 bg-gray-50 p-4 rounded-md border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">{t('storefront.domain.privacyProtection')}</span>
            </div>
            <Switch disabled />
          </div>
          <p className="text-sm text-gray-500">
            {t('storefront.domain.privacyProtectionDesc')}
          </p>
        </div>
        
        <div className="mt-4">
          <Button variant="outline" disabled>
            {t('storefront.domain.upgradePlan')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDomainSettings;