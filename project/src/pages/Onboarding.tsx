import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Check, ArrowRight, Package, Star, MapPin, CreditCard } from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { setOnboardingData, setLanguage } from '../store/slices/userSlice';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import TutorialService from '../services/TutorialService';

const Onboarding: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Completely disable tutorials on the onboarding page
  useEffect(() => {
    // End any active tutorials
    if (TutorialService.getActiveTutorial()) {
      TutorialService.endTutorial(true);
    }
    
    // Store original functions to restore them later
    const originalGetAutoStartTutorials = TutorialService.getAutoStartTutorials;
    const originalGetTutorialsForRoute = TutorialService.getTutorialsForRoute;
    const originalStartTutorial = TutorialService.startTutorial;
    
    // Override tutorial functions to prevent any tutorials
    TutorialService.getAutoStartTutorials = () => undefined;
    TutorialService.getTutorialsForRoute = () => [];
    TutorialService.startTutorial = () => false;
    
    return () => {
      // Restore original functions when component unmounts
      TutorialService.getAutoStartTutorials = originalGetAutoStartTutorials;
      TutorialService.getTutorialsForRoute = originalGetTutorialsForRoute;
      TutorialService.startTutorial = originalStartTutorial;
    };
  }, []);
  
  // Add keyboard accessibility for language selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If ESC key is pressed and we're on the language selection step
      if (e.key === 'Escape' && step === 1) {
        handleSkipLanguageSelection();
      }
    };
    
    // Add event listener for keyboard events
    window.addEventListener('keydown', handleKeyDown);
    
    // Set timeout for automatic dismissal if no selection is made
    const timeoutId = setTimeout(() => {
      if (step === 1) {
        console.log('Language selection timed out - using default language');
        handleSkipLanguageSelection();
      }
    }, 15000); // 15 seconds timeout
    
    // Clean up event listener and timeout on unmount or step change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [step]);
  
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState<{
    text: string;
    isUser: boolean;
    isTyping?: boolean;
    isLanguageSelector?: boolean;
  }[]>([
    { text: t('onboarding.welcome'), isUser: false },
    { text: t('onboarding.selectLanguage'), isUser: false, isLanguageSelector: true },
  ]);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessCategory: '',
    businessLocation: '',
    upiId: '',
  });
  
  const categories = [
    'Clothing & Accessories',
    'Jewelry & Accessories',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Electronics',
    'Food & Beverages',
    'Handicrafts',
    'Art & Collectibles',
  ];
  
  const addMessage = (text: string, isUser: boolean, delay = 500) => {
    const newMessage = { text, isUser, isTyping: !isUser };
    setMessages(prev => [...prev, newMessage]);
    
    if (!isUser) {
      setTimeout(() => {
        setMessages(prev => 
          prev.map(m => 
            m === newMessage ? { ...m, isTyping: false } : m
          )
        );
      }, delay);
    }
  };
  
  const handleContinue = () => {
    switch (step) {
      case 1:
        addMessage(t('onboarding.businessName'), false);
        setStep(2);
        break;
      case 2:
        if (formData.businessName) {
          addMessage(formData.businessName, true);
          addMessage(t('onboarding.businessCategory'), false);
          setStep(3);
        }
        break;
      case 3:
        if (formData.businessCategory) {
          addMessage(formData.businessCategory, true);
          addMessage(t('onboarding.businessLocation'), false);
          setStep(4);
        }
        break;
      case 4:
        if (formData.businessLocation) {
          addMessage(formData.businessLocation, true);
          addMessage(t('onboarding.upiId'), false);
          setStep(5);
        }
        break;
      case 5:
        if (formData.upiId) {
          addMessage(formData.upiId, true);
          addMessage(t('onboarding.confirmation'), false, 800);
          setStep(6);
          
          // Save onboarding data
          setTimeout(() => {
            dispatch(setOnboardingData(formData));
            navigate('/');
          }, 3000);
        }
        break;
      default:
        break;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };
  
  const handleLanguageSelect = (code: string) => {
    // Set a flag to prevent redundant calls
    if (step !== 1) return;
    
    try {
      // Log the selection
      console.log(`Language selected: ${code}`);
      
      // Change language
      i18n.changeLanguage(code);
      dispatch(setLanguage(code as any));
      
      // Add language selection as user message
      const languageName = {
        'en': 'English',
        'hi': 'हिन्दी',
        'hinglish': 'Hinglish',
        'bn': 'বাংলা',
        'banglish': 'Banglish'
      }[code] || code;
      
      // Update messages with language selection and proceed to next step
      setMessages(prev => [
        { text: t('onboarding.welcome'), isUser: false },
        { text: t('onboarding.selectLanguage'), isUser: false, isLanguageSelector: false },
        { text: languageName, isUser: true }
      ]);
      
      // Immediately proceed to next step
      setStep(2);
      addMessage(t('onboarding.businessName'), false);
    } catch (error) {
      console.error('Error selecting language:', error);
      // Fallback
      handleSkipLanguageSelection();
    }
  };
  
  // Handler for skipping language selection
  const handleSkipLanguageSelection = () => {
    // Set a flag to prevent redundant calls
    if (step !== 1) return;
    
    try {
      console.log('Skipping language selection, using default');
      
      // Default to English
      const defaultLanguage = 'en';
      i18n.changeLanguage(defaultLanguage);
      dispatch(setLanguage(defaultLanguage as any));
      
      // Update messages to remove language selector
      setMessages(prev => prev.map(msg => 
        msg.isLanguageSelector ? { ...msg, isLanguageSelector: false } : msg
      ));
      
      // Proceed to next step
      setStep(2);
      addMessage(t('onboarding.businessName'), false);
    } catch (error) {
      console.error('Error skipping language selection:', error);
      // Force proceed to next step
      setStep(2);
      addMessage('What\'s your business name?', false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
        style={{ isolation: 'isolate', zIndex: 50 }} 
      >
        {/* Header */}
        <div className="bg-primary-500 text-white p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-500">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Auto-Dukaan</h1>
            <p className="text-sm text-primary-100">WhatsApp + Business Made Easy</p>
          </div>
        </div>
        
        {/* Chat area */}
        <div className="h-96 overflow-y-auto p-4 flex flex-col space-y-3">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${
                  message.isUser 
                    ? 'bg-primary-500 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.isTyping ? (
                  <div className="typing-indicator">
                    <span className="h-2 w-2 mr-1"></span>
                    <span className="h-2 w-2 mr-1"></span>
                    <span className="h-2 w-2"></span>
                  </div>
                ) : message.isLanguageSelector ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p>{message.text}</p>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" 
                        onClick={() => handleSkipLanguageSelection()}
                        aria-label="Close language selection"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        onClick={() => handleLanguageSelect('en')}
                      >
                        English
                      </button>
                      <button
                        className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        onClick={() => handleLanguageSelect('hi')}
                      >
                        हिन्दी
                      </button>
                      <button
                        className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        onClick={() => handleLanguageSelect('hinglish')}
                      >
                        Hinglish
                      </button>
                      <button
                        className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        onClick={() => handleLanguageSelect('bn')}
                      >
                        বাংলা
                      </button>
                      <button
                        className="col-span-2 px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        onClick={() => handleLanguageSelect('banglish')}
                      >
                        Banglish
                      </button>
                    </div>
                  </div>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-200">
          {step === 1 && (
            <div className="p-2 text-center">
              <button
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
                onClick={handleSkipLanguageSelection}
                aria-label="Skip language selection"
              >
                <span>{t('common.next')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="flex gap-2">
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Sharma Fashion"
                className="input flex-1"
                autoFocus
              />
              <button
                className="btn-primary"
                onClick={handleContinue}
                disabled={!formData.businessName}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
          
          {step === 3 && (
            <div className="flex gap-2">
              <select
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleInputChange}
                className="input flex-1"
                autoFocus
              >
                <option value="">{t('common.select')}...</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button
                className="btn-primary"
                onClick={handleContinue}
                disabled={!formData.businessCategory}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
          
          {step === 4 && (
            <div className="flex gap-2">
              <input
                type="text"
                name="businessLocation"
                value={formData.businessLocation}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Mumbai, Maharashtra"
                className="input flex-1"
                autoFocus
              />
              <button
                className="btn-primary"
                onClick={handleContinue}
                disabled={!formData.businessLocation}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
          
          {step === 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g. businessname@upi"
                className="input flex-1"
                autoFocus
              />
              <button
                className="btn-primary"
                onClick={handleContinue}
                disabled={!formData.upiId}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
          
          {step === 6 && (
            <button
              className="w-full btn-primary btn-lg gap-2"
              onClick={() => navigate('/')}
            >
              <span>{t('onboarding.getStarted')}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <MessageCircle size={16} className="mr-1" />
            <span>Auto-Dukaan</span>
          </div>
          <div className="flex items-center">
            <Check size={14} className="text-primary-500" />
            <span className="text-xs text-gray-500 ml-1">end-to-end encrypted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;