import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Globe, PaintBucket, Tag, Phone } from 'lucide-react';
import { createStorefront, updateBusinessInfo } from '../store/slices/storefrontSlice';
import { selectUser } from '../store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StorefrontTemplateSelector from '../components/storefront/StorefrontTemplateSelector';
import { StorefrontTheme } from '../services/StorefrontService';

const StorefrontCreation: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessDescription, setBusinessDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(StorefrontTheme.MODERN);
  const [isLoading, setIsLoading] = useState(false);
  
  const totalSteps = 4;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme as StorefrontTheme);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Create the storefront with the basic info
      await dispatch(createStorefront({
        businessName,
        businessId: user?.id || 'temp-id'
      }) as any);
      
      // Update with additional info
      await dispatch(updateBusinessInfo({
        businessName,
        description: businessDescription
      }) as any);
      
      // Redirect to the storefront settings page
      navigate('/storefront-settings');
    } catch (error) {
      console.error('Error creating storefront:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2
                ${step >= stepNumber 
                  ? 'bg-primary border-primary text-white' 
                  : 'border-gray-300 text-gray-400'
                }`}
            >
              {step > stepNumber ? <Check size={16} /> : stepNumber}
            </div>
            
            {stepNumber < totalSteps && (
              <div 
                className={`flex-1 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex justify-between mt-2 px-1">
        <div className={`text-xs font-medium ${step >= 1 ? 'text-primary' : 'text-gray-500'}`}>
          {t('storefront.creation.step1')}
        </div>
        <div className={`text-xs font-medium ${step >= 2 ? 'text-primary' : 'text-gray-500'}`}>
          {t('storefront.creation.step2')}
        </div>
        <div className={`text-xs font-medium ${step >= 3 ? 'text-primary' : 'text-gray-500'}`}>
          {t('storefront.creation.step3')}
        </div>
        <div className={`text-xs font-medium ${step >= 4 ? 'text-primary' : 'text-gray-500'}`}>
          {t('storefront.creation.step4')}
        </div>
      </div>
    </div>
  );
  
  const renderBusinessInfoStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">{t('storefront.creation.businessInfo')}</h3>
      <p className="text-gray-600 mb-6">{t('storefront.creation.businessInfoDesc')}</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('storefront.domain.businessName')} *
          </label>
          <Input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={t('storefront.domain.businessNamePlaceholder')}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('storefront.creation.businessDescription')}
          </label>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder={t('storefront.creation.businessDescriptionPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
  
  const renderThemeStep = () => (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-medium mb-4">{t('storefront.creation.selectTheme')}</h3>
        <p className="text-gray-600 mb-6">{t('storefront.creation.selectThemeDesc')}</p>
      </div>
      
      <StorefrontTemplateSelector 
        selectedTheme={selectedTheme}
        onSelect={handleThemeSelect}
      />
    </div>
  );
  
  const renderPreviewStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">{t('storefront.creation.previewStore')}</h3>
      <p className="text-gray-600 mb-6">{t('storefront.creation.previewStoreDesc')}</p>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex space-x-3 items-center">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{t('storefront.creation.domain')}</h4>
              <p className="text-sm text-gray-600">
                {businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.autodukaan.com
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex space-x-3 items-center">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
              <PaintBucket size={20} />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{t('storefront.appearance')}</h4>
              <p className="text-sm text-gray-600">
                {t('storefront.templates.'+selectedTheme+'.name')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFinalStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">{t('storefront.creation.readyToLaunch')}</h3>
      <p className="text-gray-600 mb-6">{t('storefront.creation.readyToLaunchDesc')}</p>
      
      <div className="space-y-5 mb-8">
        <div className="flex space-x-3 items-start">
          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{t('storefront.creation.storeInfo')}</h4>
            <p className="text-sm text-gray-600">{t('storefront.creation.storeInfoComplete')}</p>
          </div>
        </div>
        
        <div className="flex space-x-3 items-start">
          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{t('storefront.creation.themeDesign')}</h4>
            <p className="text-sm text-gray-600">{t('storefront.creation.themeDesignComplete')}</p>
          </div>
        </div>
        
        <div className="flex space-x-3 items-start">
          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Tag size={14} />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{t('storefront.creation.seoSettings')}</h4>
            <p className="text-sm text-gray-600">{t('storefront.creation.seoSettingsNote')}</p>
          </div>
        </div>
        
        <div className="flex space-x-3 items-start">
          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Phone size={14} />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{t('storefront.creation.contactInfo')}</h4>
            <p className="text-sm text-gray-600">{t('storefront.creation.contactInfoNote')}</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderBusinessInfoStep();
      case 2:
        return renderThemeStep();
      case 3:
        return renderPreviewStep();
      case 4:
        return renderFinalStep();
      default:
        return renderBusinessInfoStep();
    }
  };
  
  const isNextDisabled = () => {
    if (step === 1 && !businessName) return true;
    return false;
  };
  
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('storefront.creation.title')}</h1>
          <p className="text-gray-600">{t('storefront.creation.subtitle')}</p>
        </div>
        
        {renderStepIndicator()}
        
        <div className="mb-6">
          {renderCurrentStep()}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            {t('common.back')}
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="flex items-center"
            >
              {t('common.next')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('common.loading')}
                </>
              ) : (
                t('storefront.creation.createStore')
              )}
            </Button>
          )}
        </div>
      </div>
  );
};

export default StorefrontCreation;