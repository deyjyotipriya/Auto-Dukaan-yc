import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { StorefrontConfig } from '../../services/StorefrontService';
import { 
  FileText, 
  ArrowRight, 
  Copy, 
  CheckCircle 
} from 'lucide-react';

interface LegalPagesSettingsProps {
  legalPages: StorefrontConfig['legalPages'];
  onUpdate: (updates: Partial<StorefrontConfig['legalPages']>) => void;
}

// Rich text editor component mock
const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  return (
    <div className="border rounded-md">
      <div className="border-b p-2 bg-gray-50 flex space-x-2">
        <button className="p-1 hover:bg-gray-200 rounded">B</button>
        <button className="p-1 hover:bg-gray-200 rounded">I</button>
        <button className="p-1 hover:bg-gray-200 rounded">U</button>
        <span className="border-r mx-1"></span>
        <button className="p-1 hover:bg-gray-200 rounded">H1</button>
        <button className="p-1 hover:bg-gray-200 rounded">H2</button>
        <span className="border-r mx-1"></span>
        <button className="p-1 hover:bg-gray-200 rounded">•</button>
        <button className="p-1 hover:bg-gray-200 rounded">1.</button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 min-h-[300px] focus:outline-none resize-none"
      />
    </div>
  );
};

const legalPageTemplates = {
  privacyPolicy: `# Privacy Policy

**Last Updated: [Date]**

## 1. Introduction

Welcome to [Your Business Name] ("we," "our," or "us"). We are committed to protecting your privacy and handling your personal information with care.

## 2. Information We Collect

We collect information that you provide directly to us, such as when you create an account, place an order, contact customer service, or otherwise interact with our services.

## 3. How We Use Your Information

We use your information to:
- Process and fulfill your orders
- Communicate with you about your orders, accounts, and services
- Improve our website and services
- Send you marketing communications (if you've opted in)

## 4. Information Sharing

We do not sell your personal information. We may share your information with service providers who help us operate our business and deliver services to you.

## 5. Your Rights

You have the right to access, correct, or delete your personal information. You may also object to certain uses of your information.

## 6. Contact Us

If you have any questions about this privacy policy, please contact us at [Your Contact Information].`,

  termsConditions: `# Terms and Conditions

**Last Updated: [Date]**

## 1. Introduction

Welcome to [Your Business Name]. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.

## 2. Use of Services

You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services:
- In any way that violates applicable laws or regulations
- To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service

## 3. Products and Orders

All product descriptions, pricing, and availability are subject to change without notice. We reserve the right to limit quantities of products purchased.

## 4. Payment Terms

Payment must be made at the time of order. We accept [list payment methods].

## 5. Shipping and Delivery

Delivery times are estimates only. We are not responsible for delays beyond our control.

## 6. Returns and Refunds

Please see our separate Return Policy for details on returns and refunds.

## 7. Contact Us

If you have any questions about these Terms, please contact us at [Your Contact Information].`,

  returnPolicy: `# Return Policy

**Last Updated: [Date]**

## 1. Return Period

You may return most new, unopened items within 30 days of delivery for a full refund.

## 2. Return Process

To initiate a return, please contact us at [Your Contact Information] with your order number and reason for return.

## 3. Refund Processing

Refunds will be processed within 5-7 business days after we receive the returned item.

## 4. Non-Returnable Items

The following items cannot be returned:
- Custom or personalized products
- Downloadable products
- Items marked as final sale
- Perishable goods

## 5. Damaged or Defective Items

If you receive a damaged or defective item, please contact us immediately for a replacement or refund.

## 6. Contact Us

If you have questions about our return policy, please contact us at [Your Contact Information].`,

  shippingPolicy: `# Shipping Policy

**Last Updated: [Date]**

## 1. Processing Time

Orders are typically processed within 1-2 business days.

## 2. Shipping Methods

We offer the following shipping methods:
- Standard Shipping (5-7 business days)
- Express Shipping (2-3 business days)

## 3. Shipping Rates

Shipping rates are calculated at checkout based on weight, dimensions, and destination.

## 4. Tracking Information

You will receive tracking information via email once your order ships.

## 5. International Shipping

For international orders, please note that you may be responsible for import duties and taxes.

## 6. Contact Us

If you have questions about our shipping policy, please contact us at [Your Contact Information].`,
};

const LegalPagesSettings: React.FC<LegalPagesSettingsProps> = ({
  legalPages,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("privacyPolicy");
  const [privacyPolicy, setPrivacyPolicy] = useState(legalPages.privacyPolicy || '');
  const [termsConditions, setTermsConditions] = useState(legalPages.termsConditions || '');
  const [returnPolicy, setReturnPolicy] = useState(legalPages.returnPolicy || '');
  const [shippingPolicy, setShippingPolicy] = useState(legalPages.shippingPolicy || '');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleSave = () => {
    const updates: Partial<StorefrontConfig['legalPages']> = {
      privacyPolicy: privacyPolicy || undefined,
      termsConditions: termsConditions || undefined,
      returnPolicy: returnPolicy || undefined,
      shippingPolicy: shippingPolicy || undefined,
    };
    
    onUpdate(updates);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleUseTemplate = (template: string) => {
    switch (activeTab) {
      case 'privacyPolicy':
        setPrivacyPolicy(legalPageTemplates.privacyPolicy);
        break;
      case 'termsConditions':
        setTermsConditions(legalPageTemplates.termsConditions);
        break;
      case 'returnPolicy':
        setReturnPolicy(legalPageTemplates.returnPolicy);
        break;
      case 'shippingPolicy':
        setShippingPolicy(legalPageTemplates.shippingPolicy);
        break;
    }
    
    setCopiedTemplate(activeTab);
    setTimeout(() => setCopiedTemplate(null), 3000);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'privacyPolicy':
        return privacyPolicy;
      case 'termsConditions':
        return termsConditions;
      case 'returnPolicy':
        return returnPolicy;
      case 'shippingPolicy':
        return shippingPolicy;
      default:
        return '';
    }
  };

  const setActiveContent = (content: string) => {
    switch (activeTab) {
      case 'privacyPolicy':
        setPrivacyPolicy(content);
        break;
      case 'termsConditions':
        setTermsConditions(content);
        break;
      case 'returnPolicy':
        setReturnPolicy(content);
        break;
      case 'shippingPolicy':
        setShippingPolicy(content);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.legal.title')}</h3>
        <p className="text-sm text-gray-600 mb-5">
          {t('storefront.legal.description')}
        </p>
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="flex mb-6 border-b overflow-x-auto">
            <TabsTrigger value="privacyPolicy" className="flex items-center px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              {t('storefront.legal.privacyPolicy')}
            </TabsTrigger>
            <TabsTrigger value="termsConditions" className="flex items-center px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              {t('storefront.legal.termsConditions')}
            </TabsTrigger>
            <TabsTrigger value="returnPolicy" className="flex items-center px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              {t('storefront.legal.returnPolicy')}
            </TabsTrigger>
            <TabsTrigger value="shippingPolicy" className="flex items-center px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              {t('storefront.legal.shippingPolicy')}
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium">
              {activeTab === 'privacyPolicy' && t('storefront.legal.privacyPolicyTitle')}
              {activeTab === 'termsConditions' && t('storefront.legal.termsConditionsTitle')}
              {activeTab === 'returnPolicy' && t('storefront.legal.returnPolicyTitle')}
              {activeTab === 'shippingPolicy' && t('storefront.legal.shippingPolicyTitle')}
            </h4>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUseTemplate(activeTab)}
              className="flex items-center"
            >
              {copiedTemplate === activeTab ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  {t('storefront.legal.templateApplied')}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  {t('storefront.legal.useTemplate')}
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <RichTextEditor
              value={getActiveContent()}
              onChange={setActiveContent}
              placeholder={t('storefront.legal.placeholder')}
            />
            
            <div className="text-sm text-gray-500">
              <p>{t('storefront.legal.markdownSupported')}</p>
            </div>
          </div>

          <TabsContent value="privacyPolicy">
            {/* Content handled by the RichTextEditor above */}
          </TabsContent>
          
          <TabsContent value="termsConditions">
            {/* Content handled by the RichTextEditor above */}
          </TabsContent>
          
          <TabsContent value="returnPolicy">
            {/* Content handled by the RichTextEditor above */}
          </TabsContent>
          
          <TabsContent value="shippingPolicy">
            {/* Content handled by the RichTextEditor above */}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.legal.displaySettings')}</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('storefront.legal.displayDescription')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-3" />
                <span>{t('storefront.legal.footerLinks')}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="p-4 border rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-3" />
                <span>{t('storefront.legal.checkoutDisclosures')}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
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

export default LegalPagesSettings;