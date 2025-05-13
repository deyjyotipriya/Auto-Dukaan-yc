import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { X, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { 
  clearFirstTimeVisitor, 
  guestLogin, 
  loginBuyer, 
  registerBuyer,
  selectIsFirstTimeVisitor
} from '../../store/slices/buyerSlice';
import { AppDispatch } from '../../store';

const FirstTimeVisitorWelcome: React.FC<{
  storeName: string;
  storeImage?: string;
}> = ({ storeName, storeImage }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const isFirstTimeVisitor = useSelector(selectIsFirstTimeVisitor);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Show modal when first time visitor
  useEffect(() => {
    if (isFirstTimeVisitor) {
      // Slight delay to allow the page to load first
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeVisitor]);

  const handleCloseModal = () => {
    setShowModal(false);
    dispatch(clearFirstTimeVisitor());
  };

  const handleContinueAsGuest = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(guestLogin()).unwrap();
      setShowModal(false);
    } catch (error) {
      setErrorMessage('Failed to continue as guest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await dispatch(loginBuyer({ email: loginEmail, password: loginPassword })).unwrap();
      setShowModal(false);
    } catch (error) {
      setErrorMessage('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await dispatch(registerBuyer({
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword
      })).unwrap();
      setShowModal(false);
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="relative">
          {/* Header with store info */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X size={24} />
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white rounded-full mr-4 flex items-center justify-center overflow-hidden">
                {storeImage ? (
                  <img src={storeImage} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-primary-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('storefront.welcome.title', { storeName })}</h2>
                <p className="text-sm text-white/80">{t('storefront.welcome.subtitle')}</p>
              </div>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'login' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              {t('storefront.welcome.login')}
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'register' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('register')}
            >
              {t('storefront.welcome.register')}
            </button>
          </div>
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storefront.welcome.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('storefront.welcome.emailPlaceholder')}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storefront.welcome.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('storefront.welcome.passwordPlaceholder')}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      {t('storefront.welcome.rememberMe')}
                    </label>
                  </div>
                  <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    {t('storefront.welcome.forgotPassword')}
                  </a>
                </div>
                
                {errorMessage && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? t('storefront.welcome.loggingIn') : t('storefront.welcome.loginButton')}
                  </button>
                </div>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        {t('storefront.welcome.or')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {t('storefront.welcome.continueAsGuest')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Register Form */}
          {activeTab === 'register' && (
            <div className="p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storefront.welcome.fullName')}
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('storefront.welcome.namePlaceholder')}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storefront.welcome.email')}
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('storefront.welcome.emailPlaceholder')}
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storefront.welcome.phone')}
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('storefront.welcome.phonePlaceholder')}
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storefront.welcome.password')}
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('storefront.welcome.passwordPlaceholder')}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center">
                  <ShieldCheck size={16} className="text-green-600 mr-2" />
                  <p className="text-xs text-gray-500">
                    {t('storefront.welcome.privacyNotice')}
                  </p>
                </div>
                
                {errorMessage && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? t('storefront.welcome.registering') : t('storefront.welcome.registerButton')}
                  </button>
                </div>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        {t('storefront.welcome.or')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {t('storefront.welcome.continueAsGuest')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
            {t('storefront.welcome.termsNotice')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeVisitorWelcome;