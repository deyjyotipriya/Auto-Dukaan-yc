import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  StorefrontTheme, 
  ColorScheme, 
  FontFamily,
  CustomColors
} from '../../services/StorefrontService';

interface ThemeCustomizerProps {
  currentTheme: string;
  currentColorScheme: string;
  currentFontFamily: string;
  customColors?: CustomColors;
  onThemeChange: (theme: string, colorScheme: string) => void;
  onCustomColorsChange?: (colors: CustomColors) => void;
  onFontChange?: (font: string) => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentTheme,
  currentColorScheme,
  currentFontFamily,
  customColors,
  onThemeChange,
  onCustomColorsChange,
  onFontChange
}) => {
  const { t } = useTranslation();
  const [showCustomColors, setShowCustomColors] = useState(currentColorScheme === ColorScheme.CUSTOM);
  const [localCustomColors, setLocalCustomColors] = useState<CustomColors>(
    customColors || {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#ef4444',
      background: '#ffffff',
      text: '#333333',
    }
  );

  const handleColorSchemeChange = (scheme: string) => {
    if (scheme === ColorScheme.CUSTOM) {
      setShowCustomColors(true);
      if (onCustomColorsChange) {
        onCustomColorsChange(localCustomColors);
      }
    } else {
      setShowCustomColors(false);
      onThemeChange(currentTheme, scheme);
    }
  };

  const handleCustomColorChange = (colorType: keyof CustomColors, value: string) => {
    const updatedColors = {
      ...localCustomColors,
      [colorType]: value
    };
    setLocalCustomColors(updatedColors);
    if (onCustomColorsChange) {
      onCustomColorsChange(updatedColors);
    }
  };

  const handleFontChange = (font: string) => {
    if (onFontChange) {
      onFontChange(font);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">{t('storefront.themeCustomizer.title')}</h3>
      
      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Color Scheme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('storefront.themeCustomizer.colorScheme')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

          {/* Custom Colors */}
          {showCustomColors && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('storefront.themeCustomizer.primaryColor')}
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={localCustomColors.primary}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                    className="w-8 h-8 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomColors.primary}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                    className="ml-2 text-sm border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('storefront.themeCustomizer.secondaryColor')}
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={localCustomColors.secondary}
                    onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                    className="w-8 h-8 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomColors.secondary}
                    onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                    className="ml-2 text-sm border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('storefront.themeCustomizer.accentColor')}
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={localCustomColors.accent}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                    className="w-8 h-8 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomColors.accent}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                    className="ml-2 text-sm border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('storefront.themeCustomizer.backgroundColor')}
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={localCustomColors.background}
                    onChange={(e) => handleCustomColorChange('background', e.target.value)}
                    className="w-8 h-8 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomColors.background}
                    onChange={(e) => handleCustomColorChange('background', e.target.value)}
                    className="ml-2 text-sm border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('storefront.themeCustomizer.textColor')}
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={localCustomColors.text}
                    onChange={(e) => handleCustomColorChange('text', e.target.value)}
                    className="w-8 h-8 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localCustomColors.text}
                    onChange={(e) => handleCustomColorChange('text', e.target.value)}
                    className="ml-2 text-sm border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Font Family Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('storefront.themeCustomizer.fontFamily')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.values(FontFamily).map((font) => (
              <div 
                key={font}
                className={`
                  relative rounded-md border p-3 flex items-center justify-center cursor-pointer font-${font.toLowerCase()}
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
    </div>
  );
};

export default ThemeCustomizer;