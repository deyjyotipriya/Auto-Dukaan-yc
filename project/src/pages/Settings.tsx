import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, 
  Store, 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Camera,
  Save
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectUser, setProfileImage } from '../store/slices/userSlice';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  
  const [activeTab, setActiveTab] = useState<'account' | 'business' | 'notifications' | 'language' | 'privacy' | 'help'>('account');
  
  const tabs = [
    { id: 'account', label: t('settings.account'), icon: User },
    { id: 'business', label: t('settings.business'), icon: Store },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'privacy', label: t('settings.privacy'), icon: Shield },
    { id: 'help', label: t('settings.help'), icon: HelpCircle },
  ];
  
  // Mock profile image if not set
  const profileImage = user.profileImage || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg';
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imageUrl = URL.createObjectURL(files[0]);
      dispatch(setProfileImage(imageUrl));
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900"
      >
        {t('settings.title')}
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 text-center border-b border-gray-200">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{user.businessName || 'Seller'}</h2>
              <p className="text-sm text-gray-500">{user.businessCategory || 'Social Seller'}</p>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab(tab.id as any)}
                    >
                      <tab.icon size={18} className="mr-3" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </motion.div>
        
        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-3"
        >
          {activeTab === 'account' && (
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-6">{t('settings.account')}</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      defaultValue="Seller"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      defaultValue="Seller"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex">
                      <div className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center border border-r-0 border-gray-300">
                        <Mail size={18} className="text-gray-500" />
                      </div>
                      <input
                        type="email"
                        className="input rounded-l-none flex-1"
                        defaultValue="admin@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex">
                      <div className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center border border-r-0 border-gray-300">
                        <Phone size={18} className="text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        className="input rounded-l-none flex-1"
                        defaultValue="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-4">Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {activeTab === 'business' && (
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-6">{t('settings.business')}</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      defaultValue={user.businessName || 'Your Business'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Category
                    </label>
                    <select className="input">
                      <option value="clothing">{user.businessCategory || 'Clothing & Accessories'}</option>
                      <option value="jewelry">Jewelry & Accessories</option>
                      <option value="home">Home & Kitchen</option>
                      <option value="beauty">Beauty & Personal Care</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food & Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <div className="flex">
                      <div className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center border border-r-0 border-gray-300">
                        <MapPin size={18} className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        className="input rounded-l-none flex-1"
                        defaultValue={user.businessLocation || 'Mumbai, Maharashtra'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <div className="flex">
                      <div className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center border border-r-0 border-gray-300">
                        <CreditCard size={18} className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        className="input rounded-l-none flex-1"
                        defaultValue={user.upiId || 'business@upi'}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-4">Business Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        About Your Business
                      </label>
                      <textarea
                        className="input h-32 resize-none"
                        placeholder="Describe your business..."
                        defaultValue="We sell high-quality products directly to customers through social commerce."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Logo
                      </label>
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          <Store size={32} className="text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <label className="btn-outline text-sm cursor-pointer">
                            <Camera size={16} className="mr-2" />
                            Upload Logo
                            <input type="file" className="hidden" accept="image/*" />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512px</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {activeTab === 'notifications' && (
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-6">{t('settings.notifications')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">New Orders</p>
                        <p className="text-sm text-gray-500">Receive emails when new orders are placed</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Order Updates</p>
                        <p className="text-sm text-gray-500">Receive emails when order status changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Inventory Alerts</p>
                        <p className="text-sm text-gray-500">Receive emails when products are low in stock</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Marketing Updates</p>
                        <p className="text-sm text-gray-500">Receive promotional emails and newsletters</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Real-time Order Alerts</p>
                        <p className="text-sm text-gray-500">Receive push notifications for new orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Chat Messages</p>
                        <p className="text-sm text-gray-500">Receive push notifications for new chat messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">System Notifications</p>
                        <p className="text-sm text-gray-500">Receive push notifications for system updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="btn-primary"
                  >
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'language' && (
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-6">{t('settings.language')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Select Your Preferred Language</h3>
                  <div className="max-w-md">
                    <LanguageSwitcher />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-4">Regional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Format
                      </label>
                      <select className="input">
                        <option value="inr">Indian Rupee (₹)</option>
                        <option value="usd">US Dollar ($)</option>
                        <option value="eur">Euro (€)</option>
                        <option value="gbp">British Pound (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select className="input">
                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                        <option value="yyyy/mm/dd">YYYY/MM/DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Format
                      </label>
                      <select className="input">
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select className="input">
                        <option value="ist">Indian Standard Time (IST)</option>
                        <option value="utc">Coordinated Universal Time (UTC)</option>
                        <option value="et">Eastern Time (ET)</option>
                        <option value="pt">Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'privacy' && (
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-6">{t('settings.privacy')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-sm text-gray-500">Make your business profile visible to everyone</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Show Contact Information</p>
                        <p className="text-sm text-gray-500">Display your contact information to customers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Data Analytics</p>
                        <p className="text-sm text-gray-500">Allow us to collect anonymous usage data to improve the platform</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Marketing Cookies</p>
                        <p className="text-sm text-gray-500">Allow marketing cookies for personalized advertisements</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Download Your Data</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        You can download a copy of all your data from Auto-Dukaan, including your profile information, orders, and products.
                      </p>
                      <button className="btn-outline text-sm">
                        Request Data Export
                      </button>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Delete Your Account</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button className="btn-sm border border-red-300 bg-white text-red-700 hover:bg-red-50">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'help' && (
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-6">{t('settings.help')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">How do I process orders?</h4>
                      <p className="text-sm text-gray-600">
                        You can process orders by going to the Orders page, selecting an order, and updating its status as you progress through fulfillment.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">How do I add products?</h4>
                      <p className="text-sm text-gray-600">
                        Navigate to the Products page and click on the "Add Product" button. Fill in the product details, upload images, and save to add products to your catalog.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">How does the chat system work?</h4>
                      <p className="text-sm text-gray-600">
                        The chat system allows you to communicate directly with your customers. You can use the "sell" command to create orders directly from the chat.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">How do I change my language settings?</h4>
                      <p className="text-sm text-gray-600">
                        You can change your language settings in the Language tab of the Settings page. Auto-Dukaan supports 5 different languages.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-4">Contact Support</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-4">
                      Our support team is available 24/7 to help you with any questions or issues you may have.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Mail size={20} className="text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email Support</p>
                          <p className="text-xs text-gray-500">support@autodukaan.com</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone size={20} className="text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone Support</p>
                          <p className="text-xs text-gray-500">+91 1800 123 4567</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Send a Message</h4>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="What can we help you with?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <textarea
                          className="input h-32 resize-none"
                          placeholder="Describe your issue or question..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="btn-primary"
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;