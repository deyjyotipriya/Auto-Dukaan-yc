import React from 'react';
import { useTranslation } from 'react-i18next';
import { StorefrontConfig } from '../../services/StorefrontService';

interface StorefrontPreviewProps {
  config: StorefrontConfig;
  activeTab?: string;
}

const StorefrontPreview: React.FC<StorefrontPreviewProps> = ({ 
  config,
  activeTab = 'appearance'
}) => {
  const { t } = useTranslation();
  
  const renderHomePage = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="h-12 bg-primary text-white flex items-center justify-between px-3">
        <div className="font-medium truncate">{config.businessName}</div>
        <div className="flex space-x-2">
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="bg-gray-100 h-40 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold">Welcome to {config.businessName}</h2>
          <p className="text-sm text-gray-600">Shop our products</p>
          <button className="mt-2 bg-primary text-white text-xs py-1 px-2 rounded">
            Shop Now
          </button>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="p-3">
        <h3 className="text-sm font-medium mb-2">Featured Products</h3>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-gray-100 rounded p-2 h-20">
              <div className="w-full h-10 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="p-3 border-t">
        <h3 className="text-sm font-medium mb-2">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((item) => (
            <div key={item} className="bg-gray-100 rounded p-2 h-16 flex items-center justify-center">
              <span className="text-xs text-gray-600">Category {item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-auto border-t p-3">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">&copy; {config.businessName}</div>
          <div className="flex space-x-2">
            {config.socialMedia.slice(0, 3).map((social, index) => (
              <div key={index} className="w-4 h-4 rounded-full bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderAppearancePreview = () => (
    <div 
      className="w-full h-full flex flex-col"
      style={{
        backgroundColor: config.colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        color: config.colorScheme === 'dark' ? '#f3f4f6' : '#333333'
      }}
    >
      {/* Header */}
      <div 
        className="h-12 flex items-center justify-between px-3"
        style={{
          backgroundColor: config.customColors?.primary || '#3b82f6', 
          color: '#ffffff'
        }}
      >
        <div className="font-medium truncate">{config.businessName}</div>
        <div className="flex space-x-2">
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
        </div>
      </div>
      
      {/* Theme Preview */}
      <div className="flex-1 p-3">
        <div 
          className="mb-3 p-2 rounded"
          style={{
            backgroundColor: config.customColors?.secondary || '#6b7280', 
            color: '#ffffff'
          }}
        >
          <div className="text-xs">Secondary Color</div>
        </div>
        
        <div 
          className="mb-3 p-2 rounded"
          style={{
            backgroundColor: config.customColors?.accent || '#ef4444', 
            color: '#ffffff'
          }}
        >
          <div className="text-xs">Accent Color</div>
        </div>
        
        <div className="mb-3">
          <h3 
            className="text-sm font-medium mb-1"
            style={{fontFamily: `var(--font-${config.fontFamily.toLowerCase()})`}}
          >
            Heading with {config.fontFamily} Font
          </h3>
          <p 
            className="text-xs"
            style={{fontFamily: `var(--font-${config.fontFamily.toLowerCase()})`}}
          >
            This is a paragraph with {config.fontFamily} font to showcase the selected typography.
          </p>
        </div>
        
        <div 
          className="p-2 rounded border flex items-center justify-center"
          style={{
            borderColor: config.customColors?.primary || '#3b82f6',
          }}
        >
          <span 
            className="text-xs"
            style={{color: config.customColors?.primary || '#3b82f6'}}
          >
            Button in Primary Color
          </span>
        </div>
      </div>
      
      <div className="p-3 border-t text-xs text-center">
        {config.theme} Theme with {config.colorScheme} color scheme
      </div>
    </div>
  );

  const renderSEOPreview = () => (
    <div className="w-full h-full flex flex-col">
      {/* Search Result Preview */}
      <div className="p-4">
        <div className="mb-5">
          <h3 className="text-sm font-medium mb-2">Google Search Preview</h3>
          <div className="border rounded p-3 bg-white">
            <div className="text-blue-600 text-sm font-medium truncate">
              {config.seo.title || config.businessName} | Online Store
            </div>
            <div className="text-green-600 text-xs truncate">
              {config.domain}
            </div>
            <div className="text-xs text-gray-700 mt-1 line-clamp-2">
              {config.seo.description || `Welcome to ${config.businessName}. Shop our products online.`}
            </div>
          </div>
        </div>
        
        {/* Social Share Preview */}
        <div className="mb-5">
          <h3 className="text-sm font-medium mb-2">Social Media Preview</h3>
          <div className="border rounded overflow-hidden">
            <div className="h-24 bg-gray-200 flex items-center justify-center">
              {config.seo.ogImage ? (
                <img 
                  src={config.seo.ogImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500">No Image Set</span>
              )}
            </div>
            <div className="p-2">
              <div className="text-sm font-medium">
                {config.seo.title || config.businessName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {config.domain}
              </div>
              <div className="text-xs text-gray-700 mt-1 line-clamp-2">
                {config.seo.description || `Welcome to ${config.businessName}. Shop our products online.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderContactPreview = () => (
    <div className="w-full h-full flex flex-col">
      {/* Contact Page Preview */}
      <div className="h-12 bg-primary text-white flex items-center justify-between px-3">
        <div className="font-medium truncate">{config.businessName}</div>
        <div className="flex space-x-2">
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
        </div>
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-bold mb-3">Contact Us</h2>
        
        <div className="space-y-3 mb-4">
          {config.contactInfo.email && (
            <div className="flex items-center text-xs">
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
              {config.contactInfo.email}
            </div>
          )}
          
          {config.contactInfo.phone && (
            <div className="flex items-center text-xs">
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
              {config.contactInfo.phone}
            </div>
          )}
          
          {config.contactInfo.address && (
            <div className="flex items-center text-xs">
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
              {config.contactInfo.address}
            </div>
          )}
          
          {config.contactInfo.whatsapp && (
            <div className="flex items-center text-xs">
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
              WhatsApp: {config.contactInfo.whatsapp}
            </div>
          )}
        </div>
        
        <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
          <span className="text-xs text-gray-500">Contact Form</span>
        </div>
      </div>
    </div>
  );
  
  const renderProductsPreview = () => (
    <div className="w-full h-full flex flex-col">
      {/* Products Page Preview */}
      <div className="h-12 bg-primary text-white flex items-center justify-between px-3">
        <div className="font-medium truncate">{config.businessName}</div>
        <div className="flex space-x-2">
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
          <div className="w-4 h-4 rounded-full bg-white/20"></div>
        </div>
      </div>
      
      <div className="p-3">
        <h2 className="text-lg font-bold mb-3">Products</h2>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs bg-gray-100 rounded px-2 py-1">Filter</div>
          <div className="text-xs bg-gray-100 rounded px-2 py-1">Sort</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-100 rounded p-2 h-24">
              <div className="w-full h-14 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderDomainPreview = () => (
    <div className="w-full h-full flex items-center justify-center p-3">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
          {config.businessName.charAt(0)}
        </div>
        <h2 className="text-lg font-bold">{config.businessName}</h2>
        <p className="text-sm text-gray-600 mb-3">{config.domain}</p>
        <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          {isValidDomain(config.domain) ? 'Valid Domain' : 'Configure Domain'}
        </div>
      </div>
    </div>
  );
  
  const renderSocialPreview = () => (
    <div className="w-full h-full flex flex-col">
      {/* Social Preview */}
      <div className="h-12 bg-primary text-white flex items-center justify-between px-3">
        <div className="font-medium truncate">{config.businessName}</div>
        <div className="flex space-x-2">
          {config.socialMedia.filter(s => s.displayOnHeader).slice(0, 3).map((social, index) => (
            <div key={index} className="w-4 h-4 rounded-full bg-white/20"></div>
          ))}
        </div>
      </div>
      
      <div className="flex-1"></div>
      
      <div className="border-t p-3">
        <div className="flex justify-center space-x-3 mb-2">
          {config.socialMedia.filter(s => s.displayOnFooter).slice(0, 5).map((social, index) => (
            <div key={index} className="w-5 h-5 rounded-full bg-gray-200"></div>
          ))}
        </div>
        <div className="text-xs text-center text-gray-500">
          &copy; {new Date().getFullYear()} {config.businessName}
        </div>
      </div>
    </div>
  );
  
  const renderLegalPreview = () => (
    <div className="w-full h-full flex flex-col">
      {/* Legal Page Preview */}
      <div className="h-12 bg-primary text-white flex items-center justify-between px-3">
        <div className="font-medium truncate">{config.businessName}</div>
        <div className="w-4 h-4 rounded-full bg-white/20"></div>
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-bold mb-3">
          {activeTab === 'legal' && config.legalPages.privacyPolicy ? 'Privacy Policy' : 'Legal Document'}
        </h2>
        
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="h-2 bg-gray-100 rounded"
              style={{width: `${Math.floor(Math.random() * 30) + 70}%`}}
            ></div>
          ))}
          
          <div className="h-4"></div>
          
          <h3 className="text-sm font-medium">Section 1</h3>
          
          {Array(5).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="h-2 bg-gray-100 rounded"
              style={{width: `${Math.floor(Math.random() * 30) + 70}%`}}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Simple domain validation
  const isValidDomain = (domain: string) => {
    return domain.includes('.') && domain.length > 4;
  };
  
  // Choose which preview to render based on activeTab
  const renderPreview = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearancePreview();
      case 'pages':
        return renderHomePage();
      case 'products':
        return renderProductsPreview();
      case 'domain':
        return renderDomainPreview();
      case 'seo':
        return renderSEOPreview();
      case 'social':
        return renderSocialPreview();
      case 'contact':
        return renderContactPreview();
      case 'legal':
        return renderLegalPreview();
      default:
        return renderHomePage();
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-6 bg-gray-800 rounded-t-md flex items-center px-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-400 mx-auto">
          {config.domain}
        </div>
      </div>
      
      <div className="flex-1 bg-white overflow-hidden">
        {renderPreview()}
      </div>
    </div>
  );
};

export default StorefrontPreview;