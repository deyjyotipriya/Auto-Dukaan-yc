import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  EyeOff, 
  Layers, 
  Copy, 
  Check, 
  RotateCcw,
  Code,
  Palette,
  Type
} from 'lucide-react';
import { 
  StorefrontTheme, 
  ColorScheme, 
  FontFamily,
  CustomColors
} from '../../services/StorefrontService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import StorefrontPreview from './StorefrontPreview';

interface EnhancedThemeCustomizerProps {
  currentTheme: string;
  currentColorScheme: string;
  currentFontFamily: string;
  customColors?: CustomColors;
  onThemeChange: (theme: string, colorScheme: string) => void;
  onCustomColorsChange?: (colors: CustomColors) => void;
  onFontChange?: (font: string) => void;
  onCustomCSSChange?: (css: string) => void;
}

const EnhancedThemeCustomizer: React.FC<EnhancedThemeCustomizerProps> = ({
  currentTheme,
  currentColorScheme,
  currentFontFamily,
  customColors,
  onThemeChange,
  onCustomColorsChange,
  onFontChange,
  onCustomCSSChange
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'code'>('colors');
  const [localCustomColors, setLocalCustomColors] = useState<CustomColors>(
    customColors || {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#ef4444',
      background: '#ffffff',
      text: '#333333',
    }
  );
  const [customCSS, setCustomCSS] = useState<string>('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const colorPresets = [
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Green', color: '#10b981' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Yellow', color: '#eab308' },
    { name: 'Pink', color: '#ec4899' },
    { name: 'Teal', color: '#14b8a6' },
  ];

  const fontSets = [
    { name: 'Modern', primary: FontFamily.SANS, heading: FontFamily.SANS },
    { name: 'Classic', primary: FontFamily.SERIF, heading: FontFamily.SERIF },
    { name: 'Tech', primary: FontFamily.MONO, heading: FontFamily.MONO },
    { name: 'Creative', primary: FontFamily.SANS, heading: FontFamily.DISPLAY },
    { name: 'Playful', primary: FontFamily.SANS, heading: FontFamily.HANDWRITTEN },
  ];

  // Mock storefront config for preview
  const mockConfig = {
    id: 'preview',
    businessName: 'Store Preview',
    domain: 'preview.autodukaan.com',
    theme: currentTheme as StorefrontTheme,
    colorScheme: currentColorScheme as ColorScheme,
    customColors: localCustomColors,
    fontFamily: currentFontFamily as FontFamily,
    defaultLayout: 'grid' as any,
    pages: [],
    navigation: { mainItems: [], footerCategories: [] },
    categories: [],
    seo: { title: '', description: '', keywords: [], sitemapEnabled: true },
    socialMedia: [],
    paymentMethods: [],
    shippingOptions: [],
    contactInfo: {},
    legalPages: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: false,
  };

  const handleColorSchemeChange = (scheme: string) => {
    if (scheme === ColorScheme.CUSTOM) {
      if (onCustomColorsChange) {
        onCustomColorsChange(localCustomColors);
      }
    } else {
      onThemeChange(currentTheme, scheme);
    }
  };

  const handleCustomColorChange = (colorType: keyof CustomColors, value: string) => {
    const updatedColors = {
      ...localCustomColors,
      [colorType]: value
    };
    setLocalCustomColors(updatedColors);
    
    // Add to recent colors if not already in the list
    if (!recentColors.includes(value)) {
      setRecentColors(prev => [value, ...prev].slice(0, 8));
    }
    
    if (onCustomColorsChange) {
      onCustomColorsChange(updatedColors);
    }
  };

  const handleFontChange = (font: string) => {
    if (onFontChange) {
      onFontChange(font);
    }
  };

  const handleCustomCSSChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomCSS(e.target.value);
    if (onCustomCSSChange) {
      onCustomCSSChange(e.target.value);
    }
  };

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const resetCustomColors = () => {
    const defaultColors = {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#ef4444',
      background: '#ffffff',
      text: '#333333',
    };
    setLocalCustomColors(defaultColors);
    if (onCustomColorsChange) {
      onCustomColorsChange(defaultColors);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">{t('storefront.themeCustomizer.title')}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? t('common.basic') : t('common.advanced')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6 border-r">
          {/* Theme Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('storefront.themeCustomizer.theme')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.values(StorefrontTheme).map((theme) => (
                <div 
                  key={theme}
                  className={`
                    relative rounded-md border p-3 flex items-center justify-center cursor-pointer
                    ${currentTheme === theme ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => onThemeChange(theme, currentColorScheme)}
                >
                  <span className="capitalize">{theme}</span>
                  {currentTheme === theme && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {showAdvanced ? (
            <div>
              <div className="mb-4 border-b">
                <nav className="flex space-x-4">
                  <button
                    className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'colors' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('colors')}
                  >
                    <Palette size={16} className="inline mr-1" />
                    {t('storefront.themeCustomizer.colors')}
                  </button>
                  <button
                    className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'fonts' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('fonts')}
                  >
                    <Type size={16} className="inline mr-1" />
                    {t('storefront.themeCustomizer.typography')}
                  </button>
                  <button
                    className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'code' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('code')}
                  >
                    <Code size={16} className="inline mr-1" />
                    {t('storefront.themeCustomizer.customCode')}
                  </button>
                </nav>
              </div>
              
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(localCustomColors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Tooltip content={copiedColor === value ? "Copied!" : "Copy color"}>
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => copyColorToClipboard(value)}
                              >
                                {copiedColor === value ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </Tooltip>
                          </div>
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleCustomColorChange(key as keyof CustomColors, e.target.value)}
                            className="w-8 h-8 p-0 border rounded overflow-hidden cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleCustomColorChange(key as keyof CustomColors, e.target.value)}
                            className="flex-1 text-sm border rounded px-2 py-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        {t('storefront.themeCustomizer.colorPresets')}
                      </h4>
                      <button 
                        className="text-xs text-primary flex items-center"
                        onClick={resetCustomColors}
                      >
                        <RotateCcw size={12} className="mr-1" />
                        {t('common.reset')}
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {colorPresets.map((preset) => (
                        <Tooltip key={preset.name} content={preset.name}>
                          <button
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: preset.color }}
                            onClick={() => handleCustomColorChange('primary', preset.color)}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  
                  {recentColors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {t('storefront.themeCustomizer.recentlyUsed')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recentColors.map((color, index) => (
                          <Tooltip key={index} content={color}>
                            <button
                              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                              style={{ backgroundColor: color }}
                              onClick={() => handleCustomColorChange('primary', color)}
                            />
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'fonts' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('storefront.themeCustomizer.fontSets')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fontSets.map((set) => (
                        <div 
                          key={set.name}
                          className="border rounded-md p-3 cursor-pointer hover:border-gray-300"
                          onClick={() => handleFontChange(set.primary)}
                        >
                          <h4 className="font-medium text-gray-800 mb-1">{set.name}</h4>
                          <div className="flex flex-col space-y-1">
                            <p 
                              className={`text-sm ${
                                set.heading === FontFamily.SANS ? 'font-sans' : 
                                set.heading === FontFamily.SERIF ? 'font-serif' : 
                                set.heading === FontFamily.MONO ? 'font-mono' : 
                                set.heading === FontFamily.DISPLAY ? 'font-medium' : 
                                'font-medium italic'
                              }`}
                            >
                              {t('storefront.themeCustomizer.headingExample')}
                            </p>
                            <p 
                              className={`text-xs text-gray-600 ${
                                set.primary === FontFamily.SANS ? 'font-sans' : 
                                set.primary === FontFamily.SERIF ? 'font-serif' : 
                                set.primary === FontFamily.MONO ? 'font-mono' : 
                                'font-sans'
                              }`}
                            >
                              {t('storefront.themeCustomizer.bodyExample')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('storefront.themeCustomizer.fontFamily')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Object.values(FontFamily).map((font) => (
                        <div 
                          key={font}
                          className={`
                            relative rounded-md border p-3 flex items-center justify-center cursor-pointer
                            ${currentFontFamily === font ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
                          `}
                          onClick={() => handleFontChange(font)}
                        >
                          <span 
                            className={`
                              capitalize
                              ${font === FontFamily.SANS ? 'font-sans' : 
                                font === FontFamily.SERIF ? 'font-serif' : 
                                font === FontFamily.MONO ? 'font-mono' : 
                                font === FontFamily.DISPLAY ? 'font-medium' : 
                                'font-medium italic'}
                            `}
                          >
                            {font}
                          </span>
                          {currentFontFamily === font && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'code' && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('storefront.themeCustomizer.customCSS')}
                    </label>
                    <div className="relative">
                      <textarea
                        value={customCSS}
                        onChange={handleCustomCSSChange}
                        placeholder=":root { --custom-color: #ff0000; }\n.my-class { color: var(--custom-color); }"
                        className="w-full h-64 font-mono text-sm p-3 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('storefront.themeCustomizer.customCSSHelp')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Color Scheme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('storefront.themeCustomizer.colorScheme')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(ColorScheme).map((scheme) => (
                    <div 
                      key={scheme}
                      className={`
                        relative rounded-md border p-3 flex items-center justify-center cursor-pointer
                        ${currentColorScheme === scheme ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
                      `}
                      onClick={() => handleColorSchemeChange(scheme)}
                    >
                      <div className="flex items-center">
                        <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                          scheme === ColorScheme.LIGHT ? 'bg-blue-500' :
                          scheme === ColorScheme.DARK ? 'bg-gray-800' :
                          scheme === ColorScheme.BLUE ? 'bg-blue-600' :
                          scheme === ColorScheme.GREEN ? 'bg-green-600' :
                          scheme === ColorScheme.PURPLE ? 'bg-purple-600' :
                          scheme === ColorScheme.ORANGE ? 'bg-orange-500' :
                          'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500'
                        }`}></span>
                        <span className="capitalize">{scheme}</span>
                      </div>
                      {currentColorScheme === scheme && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Font Family Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('storefront.themeCustomizer.fontFamily')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.values(FontFamily).map((font) => (
                    <div 
                      key={font}
                      className={`
                        relative rounded-md border p-3 flex items-center justify-center cursor-pointer
                        ${currentFontFamily === font ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
                      `}
                      onClick={() => handleFontChange(font)}
                    >
                      <span 
                        className={`
                          capitalize
                          ${font === FontFamily.SANS ? 'font-sans' : 
                            font === FontFamily.SERIF ? 'font-serif' : 
                            font === FontFamily.MONO ? 'font-mono' : ''}
                        `}
                      >
                        {font}
                      </span>
                      {currentFontFamily === font && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {showPreview && (
          <div className="w-full lg:w-1/3 p-4">
            <div className="sticky top-20">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t('storefront.themeCustomizer.preview')}
              </h4>
              <div className="aspect-[9/16] border rounded-md overflow-hidden">
                <StorefrontPreview 
                  config={mockConfig} 
                  activeTab="appearance"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedThemeCustomizer;