import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectLanguage, setLanguage } from '../../store/slices/userSlice';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(selectLanguage);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'hinglish', name: 'Hinglish' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'banglish', name: 'Banglish' }
  ];

  const handleLanguageChange = (code: 'en' | 'hi' | 'hinglish' | 'bn' | 'banglish') => {
    i18n.changeLanguage(code);
    dispatch(setLanguage(code));
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Language / भाषा
      </label>
      <div className="grid grid-cols-1 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              currentLanguage === lang.code
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-100 border border-transparent'
            }`}
            onClick={() => handleLanguageChange(lang.code as any)}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;