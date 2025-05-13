import React from 'react';
import { useTranslation } from 'react-i18next';
import { StorefrontTheme } from '../../services/StorefrontService';

interface TemplateOption {
  theme: StorefrontTheme;
  name: string;
  description: string;
  imageUrl: string;
  bestFor: string[];
}

interface StorefrontTemplateSelectorProps {
  selectedTheme: string;
  onSelect: (theme: string) => void;
}

const StorefrontTemplateSelector: React.FC<StorefrontTemplateSelectorProps> = ({
  selectedTheme,
  onSelect
}) => {
  const { t } = useTranslation();

  const templates: TemplateOption[] = [
    {
      theme: StorefrontTheme.MINIMAL,
      name: t('storefront.templates.minimal.name'),
      description: t('storefront.templates.minimal.description'),
      imageUrl: '/minimal-template.jpg',
      bestFor: [
        t('storefront.templates.minimal.bestFor1'),
        t('storefront.templates.minimal.bestFor2'),
        t('storefront.templates.minimal.bestFor3'),
      ]
    },
    {
      theme: StorefrontTheme.MODERN,
      name: t('storefront.templates.modern.name'),
      description: t('storefront.templates.modern.description'),
      imageUrl: '/modern-template.jpg',
      bestFor: [
        t('storefront.templates.modern.bestFor1'),
        t('storefront.templates.modern.bestFor2'),
        t('storefront.templates.modern.bestFor3'),
      ]
    },
    {
      theme: StorefrontTheme.VINTAGE,
      name: t('storefront.templates.vintage.name'),
      description: t('storefront.templates.vintage.description'),
      imageUrl: '/vintage-template.jpg',
      bestFor: [
        t('storefront.templates.vintage.bestFor1'),
        t('storefront.templates.vintage.bestFor2'),
        t('storefront.templates.vintage.bestFor3'),
      ]
    },
    {
      theme: StorefrontTheme.BOLD,
      name: t('storefront.templates.bold.name'),
      description: t('storefront.templates.bold.description'),
      imageUrl: '/bold-template.jpg',
      bestFor: [
        t('storefront.templates.bold.bestFor1'),
        t('storefront.templates.bold.bestFor2'),
        t('storefront.templates.bold.bestFor3'),
      ]
    },
    {
      theme: StorefrontTheme.ELEGANT,
      name: t('storefront.templates.elegant.name'),
      description: t('storefront.templates.elegant.description'),
      imageUrl: '/elegant-template.jpg',
      bestFor: [
        t('storefront.templates.elegant.bestFor1'),
        t('storefront.templates.elegant.bestFor2'),
        t('storefront.templates.elegant.bestFor3'),
      ]
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">{t('storefront.templates.title')}</h3>
      <p className="text-gray-600 mb-6">{t('storefront.templates.subtitle')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div 
            key={template.theme}
            className={`
              relative border rounded-lg overflow-hidden cursor-pointer transition-all duration-200
              ${selectedTheme === template.theme ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
            `}
            onClick={() => onSelect(template.theme)}
          >
            <div className="relative aspect-video bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <span>{template.name} Preview</span>
              </div>
              {/* If you have actual template previews, use this instead */}
              {/* <img 
                src={template.imageUrl} 
                alt={template.name}
                className="w-full h-full object-cover"
              /> */}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{template.name}</h4>
                {selectedTheme === template.theme && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                    {t('storefront.templates.selected')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">{t('storefront.templates.bestFor')}</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {template.bestFor.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorefrontTemplateSelector;