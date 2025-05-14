import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  Check, 
  ArrowRight, 
  Package, 
  Camera,
  Image as ImageIcon,
  Send,
  Phone,
  Mic,
  Plus,
  ChevronLeft,
  MoreVertical,
  CheckCheck
} from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { setOnboardingData, setLanguage } from '../store/slices/userSlice';

// Simulate WhatsApp verification
interface VerificationState {
  phoneNumber: string;
  verificationCode: string;
  verified: boolean;
  codeSent: boolean;
  verificationStep: 'phone' | 'otp' | 'business';
}

const WhatsAppOnboarding: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State to control language popup visibility
  const [showLanguagePopup, setShowLanguagePopup] = useState(true);
  
  // Verification state
  const [verification, setVerification] = useState<VerificationState>({
    phoneNumber: '',
    verificationCode: '',
    verified: false,
    codeSent: false,
    verificationStep: 'phone'
  });
  
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState<{
    text: string;
    isUser: boolean;
    isWhatsApp?: boolean;
    isTyping?: boolean;
    hasTick?: boolean;
  }[]>([
    { text: 'Welcome to Auto-Dukaan WhatsApp Onboarding!', isUser: false, isWhatsApp: true },
    { text: 'Let\'s set up your business on WhatsApp and Auto-Dukaan', isUser: false, isWhatsApp: true },
  ]);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessCategory: '',
    businessLocation: '',
    upiId: '',
    phoneNumber: ''
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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Add keyboard accessibility for language selection popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process when language popup is shown
      if (!showLanguagePopup) return;
      
      // Close popup on Escape key
      if (e.key === 'Escape') {
        dismissLanguagePopup();
      }
      
      // Select English on Enter if focused on continue button
      if (e.key === 'Enter' && document.activeElement === document.querySelector('.language-continue-button')) {
        handleLanguageSelect('en');
        dismissLanguagePopup();
      }
    };
    
    // Auto-dismiss language popup after 30 seconds if no selection (fallback)
    const timeoutId = setTimeout(() => {
      if (showLanguagePopup) {
        console.log('Language selection timed out - dismissing popup');
        handleLanguageSelect('en'); // Default to English
        dismissLanguagePopup();
      }
    }, 30000); // 30 seconds timeout
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [showLanguagePopup]);
  
  const addMessage = (text: string, isUser: boolean, hasTick = false, delay = 500) => {
    const newMessage = { 
      text, 
      isUser, 
      isWhatsApp: true, 
      isTyping: !isUser,
      hasTick
    };
    
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
  
  const handleSendVerificationCode = () => {
    if (verification.phoneNumber.length < 10) {
      addMessage('Please enter a valid phone number', false);
      return;
    }
    
    addMessage(`Sending verification code to +91 ${verification.phoneNumber}...`, false);
    
    // Simulate verification code sending
    setTimeout(() => {
      addMessage('Verification code sent! Please enter the 6-digit code you received.', false);
      setVerification(prev => ({
        ...prev,
        codeSent: true,
        verificationStep: 'otp'
      }));
    }, 1500);
  };
  
  const handleVerifyCode = () => {
    if (verification.verificationCode.length !== 6) {
      addMessage('Please enter a valid 6-digit verification code', false);
      return;
    }
    
    addMessage(`Verifying code: ${verification.verificationCode}`, false);
    
    // Simulate verification
    setTimeout(() => {
      addMessage('Phone number verified successfully! ✅', false);
      setVerification(prev => ({
        ...prev,
        verified: true,
        verificationStep: 'business'
      }));
      
      // Update formData with verified phone
      setFormData(prev => ({
        ...prev,
        phoneNumber: verification.phoneNumber
      }));
      
      // Move to business setup
      setTimeout(() => {
        addMessage(t('onboarding.businessName'), false);
        setStep(2);
      }, 1000);
    }, 2000);
  };
  
  const handleContinue = () => {
    switch (step) {
      case 1:
        // Phone verification is handled separately
        break;
      case 2:
        if (formData.businessName) {
          addMessage(formData.businessName, true, true);
          addMessage(t('onboarding.businessCategory'), false);
          setStep(3);
        }
        break;
      case 3:
        if (formData.businessCategory) {
          addMessage(formData.businessCategory, true, true);
          addMessage(t('onboarding.businessLocation'), false);
          setStep(4);
        }
        break;
      case 4:
        if (formData.businessLocation) {
          addMessage(formData.businessLocation, true, true);
          addMessage(t('onboarding.upiId'), false);
          setStep(5);
        }
        break;
      case 5:
        if (formData.upiId) {
          addMessage(formData.upiId, true, true);
          addMessage('Great! Your business is verified and set up on Auto-Dukaan 🎉', false);
          addMessage('You can now access your dashboard to set up your products and start selling!', false);
          setStep(6);
          
          // Save onboarding data
          setTimeout(() => {
            dispatch(setOnboardingData({
              businessName: formData.businessName,
              businessCategory: formData.businessCategory,
              businessLocation: formData.businessLocation,
              upiId: formData.upiId
            }));
            
            // Show final confirmation message
            addMessage('Redirecting you to your dashboard...', false);
            
            // Redirect to dashboard with tutorial overlay
            setTimeout(() => {
              navigate('/?tutorial=true');
            }, 2000);
          }, 2000);
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
    i18n.changeLanguage(code);
    dispatch(setLanguage(code as any));
    
    // Update first two messages with translated content
    setMessages([
      { text: 'Welcome to Auto-Dukaan WhatsApp Onboarding!', isUser: false, isWhatsApp: true },
      { text: 'Let\'s set up your business on WhatsApp and Auto-Dukaan', isUser: false, isWhatsApp: true },
    ]);
  };
  
  // Function to dismiss the language popup and proceed
  const dismissLanguagePopup = () => {
    // Hide the language popup
    setShowLanguagePopup(false);
    
    // Add a message instructing the user to enter their phone number
    setMessages(prev => [...prev, { 
      text: 'Please enter your phone number to continue.', 
      isUser: false, 
      isWhatsApp: true 
    }]);
    
    // Focus on the phone input after popup is dismissed (using setTimeout to ensure the DOM is updated)
    setTimeout(() => {
      const phoneInput = document.querySelector('input[name="phoneNumber"]') as HTMLInputElement;
      if (phoneInput) phoneInput.focus();
    }, 100);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVerificationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber' && !/^\d*$/.test(value)) return;
    if (name === 'verificationCode' && !/^\d*$/.test(value)) return;
    
    setVerification(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="min-h-screen bg-[#e5ded8] flex flex-col">
      {/* WhatsApp header */}
      <div className="bg-[#008069] text-white p-2 flex items-center gap-3 sticky top-0 z-10">
        <button className="p-1">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-lg font-medium">Auto-Dukaan</h1>
            <p className="text-xs opacity-80">Online • WhatsApp Business</p>
          </div>
        </div>
        <div className="ml-auto flex gap-5">
          <Phone size={20} />
          <MoreVertical size={20} />
        </div>
      </div>
        
      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3 bg-[#e5ded8]">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs md:max-w-sm px-3 py-2 rounded-lg relative ${
                message.isUser 
                  ? 'bg-[#dcf8c6] text-black rounded-tr-none' 
                  : 'bg-white text-black rounded-tl-none'
              }`}
            >
              {message.isTyping ? (
                <div className="flex gap-1 items-center py-1 px-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              ) : (
                <div>
                  {message.text}
                  {message.isUser && message.hasTick && (
                    <span className="absolute bottom-1 right-2 text-[#65b073]">
                      <CheckCheck size={14} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="bg-[#f0f2f5] p-2 sticky bottom-0 border-t border-gray-200">
        {verification.verificationStep === 'phone' && (
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-white rounded-full overflow-hidden flex items-center px-4 py-2">
              <span className="text-gray-500 whitespace-nowrap mr-2">+91</span>
              <input
                type="text"
                name="phoneNumber"
                value={verification.phoneNumber}
                onChange={handleVerificationInputChange}
                placeholder="Enter your phone number"
                className="flex-1 outline-none"
                maxLength={10}
                autoFocus
              />
            </div>
            <button
              className="p-2 rounded-full bg-[#008069] text-white"
              onClick={handleSendVerificationCode}
              disabled={verification.phoneNumber.length < 10}
            >
              <Send size={22} />
            </button>
          </div>
        )}
        
        {verification.verificationStep === 'otp' && (
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-white rounded-full overflow-hidden flex items-center px-4 py-2">
              <input
                type="text"
                name="verificationCode"
                value={verification.verificationCode}
                onChange={handleVerificationInputChange}
                placeholder="Enter 6-digit verification code"
                className="flex-1 outline-none"
                maxLength={6}
                autoFocus
              />
            </div>
            <button
              className="p-2 rounded-full bg-[#008069] text-white"
              onClick={handleVerifyCode}
              disabled={verification.verificationCode.length !== 6}
            >
              <Send size={22} />
            </button>
          </div>
        )}
        
        {verification.verificationStep === 'business' && (
          <>
            {step === 2 && (
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white rounded-full overflow-hidden flex items-center px-4 py-2">
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Sharma Fashion"
                    className="flex-1 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  className="p-2 rounded-full bg-[#008069] text-white"
                  onClick={handleContinue}
                  disabled={!formData.businessName}
                >
                  <Send size={22} />
                </button>
              </div>
            )}
            
            {step === 3 && (
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white rounded-full overflow-hidden px-4 py-2">
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className="w-full outline-none py-1"
                    autoFocus
                  >
                    <option value="">{t('common.select')}...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="p-2 rounded-full bg-[#008069] text-white"
                  onClick={handleContinue}
                  disabled={!formData.businessCategory}
                >
                  <Send size={22} />
                </button>
              </div>
            )}
            
            {step === 4 && (
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white rounded-full overflow-hidden flex items-center px-4 py-2">
                  <input
                    type="text"
                    name="businessLocation"
                    value={formData.businessLocation}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="flex-1 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  className="p-2 rounded-full bg-[#008069] text-white"
                  onClick={handleContinue}
                  disabled={!formData.businessLocation}
                >
                  <Send size={22} />
                </button>
              </div>
            )}
            
            {step === 5 && (
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white rounded-full overflow-hidden flex items-center px-4 py-2">
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. businessname@upi"
                    className="flex-1 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  className="p-2 rounded-full bg-[#008069] text-white"
                  onClick={handleContinue}
                  disabled={!formData.upiId}
                >
                  <Send size={22} />
                </button>
              </div>
            )}
            
            {step === 6 && (
              <div className="flex items-center justify-center bg-white rounded-md p-3">
                <button
                  className="w-full bg-[#008069] text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2"
                  onClick={() => navigate('/?tutorial=true')}
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
          
        {/* WhatsApp chat toolbar */}
        {verification.verificationStep === 'business' && step < 6 && (
          <div className="flex justify-between mt-2">
            <button className="p-2 text-[#8696a0]">
              <Plus size={24} />
            </button>
            <button className="p-2 text-[#8696a0]">
              <Camera size={24} />
            </button>
            <button className="p-2 text-[#8696a0]">
              <Mic size={24} />
            </button>
          </div>
        )}
      </div>
      
      {/* Language selection (only shown at start) */}
      {verification.verificationStep === 'phone' && !verification.codeSent && showLanguagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="language-selection-title">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-11/12 max-w-md relative"
          >
            {/* Close button */}
            <button 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={dismissLanguagePopup}
              aria-label="Close language selection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 id="language-selection-title" className="text-lg font-medium mb-4 text-center">Select Your Language</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                onClick={() => handleLanguageSelect('en')}
              >
                English
              </button>
              <button
                className="px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                onClick={() => handleLanguageSelect('hi')}
              >
                हिन्दी
              </button>
              <button
                className="px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                onClick={() => handleLanguageSelect('hinglish')}
              >
                Hinglish
              </button>
              <button
                className="px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                onClick={() => handleLanguageSelect('bn')}
              >
                বাংলা
              </button>
              <button
                className="col-span-2 px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                onClick={() => handleLanguageSelect('banglish')}
              >
                Banglish
              </button>
            </div>
            <button
              className="language-continue-button w-full mt-4 px-4 py-3 bg-[#008069] text-white rounded-md hover:bg-[#006e5a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008069]"
              onClick={dismissLanguagePopup}
              tabIndex={0}
              autoFocus
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppOnboarding;