import React, { useState } from 'react';

interface AccountSettingsProps {
  buyerInfo: any;
  setBuyerInfo: (info: any) => void;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ buyerInfo, setBuyerInfo }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: buyerInfo?.name || '',
    email: buyerInfo?.email || '',
    phone: buyerInfo?.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mock addresses data
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr1',
      name: buyerInfo?.name || 'John Doe',
      phone: buyerInfo?.phone || '9999999999',
      address_line1: '123 Main Street',
      address_line2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      is_default: true
    },
    {
      id: 'addr2',
      name: buyerInfo?.name || 'John Doe',
      phone: buyerInfo?.phone || '9999999999',
      address_line1: '456 Work Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      country: 'India',
      is_default: false
    }
  ]);

  // Mock payment methods data
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pay1',
      type: 'upi',
      provider: 'Google Pay',
      vpa: 'user@okicici',
      is_default: true
    },
    {
      id: 'pay2',
      type: 'card',
      bank: 'HDFC Bank',
      card_type: 'Credit Card',
      number: '•••• •••• •••• 4567',
      expiry: '06/25',
      is_default: false
    }
  ]);

  // Mock notifications preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    order_updates: true,
    promotions: true,
    price_drops: true,
    recommendations: true,
    chat_messages: true,
    email_notifications: true,
    sms_notifications: true,
    whatsapp_notifications: false
  });

  // Handle input change in profile form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update buyer info
      setBuyerInfo({
        ...buyerInfo,
        ...formData
      });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle notification preference toggle
  const handleNotificationToggle = (key: string) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  // Handle setting default address
  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      }))
    );
  };

  // Handle setting default payment method
  const handleSetDefaultPayment = (paymentId: string) => {
    setPaymentMethods(prev => 
      prev.map(payment => ({
        ...payment,
        is_default: payment.id === paymentId
      }))
    );
  };

  // Handle deleting an address
  const handleDeleteAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  // Handle deleting a payment method
  const handleDeletePayment = (paymentId: string) => {
    setPaymentMethods(prev => prev.filter(payment => payment.id !== paymentId));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-600">Manage your profile, addresses, and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Information
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'addresses'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Addresses
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'payments'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('payments')}
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Methods
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'privacy'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('privacy')}
                  >
                    <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacy & Security
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Success/Error Message */}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => setSuccessMessage(null)}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => setErrorMessage(null)}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to current values
                        setFormData({
                          name: buyerInfo?.name || '',
                          email: buyerInfo?.email || '',
                          phone: buyerInfo?.phone || ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
                        {buyerInfo?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-6">
                        <h3 className="text-lg font-medium text-gray-900">{buyerInfo?.name}</h3>
                        <p className="text-gray-500">Member since {new Date().getFullYear()}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-4 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                          <dd className="text-sm font-medium text-gray-900">{buyerInfo?.name}</dd>
                        </div>
                        <div className="py-4 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                          <dd className="text-sm font-medium text-gray-900">{buyerInfo?.email}</dd>
                        </div>
                        <div className="py-4 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                          <dd className="text-sm font-medium text-gray-900">{buyerInfo?.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Your Addresses</h2>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add New Address
                  </button>
                </div>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 ${
                        address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-base font-medium text-gray-900">{address.name}</h3>
                            {address.is_default && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>{address.address_line1}</p>
                        {address.address_line2 && <p>{address.address_line2}</p>}
                        <p>{address.city}, {address.state} {address.pincode}</p>
                        <p>{address.country}</p>
                      </div>
                      {!address.is_default && (
                        <button
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => handleSetDefaultAddress(address.id)}
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payments' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Payment Methods</h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add UPI ID
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Add Card
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((payment) => (
                    <div
                      key={payment.id}
                      className={`border rounded-lg p-4 ${
                        payment.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          {payment.type === 'upi' ? (
                            <div className="w-10 h-10 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-medium">
                              UPI
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
                              CC
                            </div>
                          )}
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-base font-medium text-gray-900">
                                {payment.type === 'upi' ? payment.provider : payment.bank}
                              </h3>
                              {payment.is_default && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {payment.type === 'upi' ? payment.vpa : 
                               `${payment.card_type} ending in ${payment.number.split(' ').pop()}`}
                            </p>
                            {payment.type === 'card' && payment.expiry && (
                              <p className="mt-1 text-xs text-gray-500">
                                Expires: {payment.expiry}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {!payment.is_default && (
                        <button
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => handleSetDefaultPayment(payment.id)}
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-6">Notification Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Order Updates</h4>
                          <p className="text-xs text-gray-500">Get notified about your order status</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.order_updates ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('order_updates')}
                          >
                            <span
                              className={`${
                                notificationPreferences.order_updates ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Promotions</h4>
                          <p className="text-xs text-gray-500">Receive updates on deals and discounts</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.promotions ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('promotions')}
                          >
                            <span
                              className={`${
                                notificationPreferences.promotions ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Price Drops</h4>
                          <p className="text-xs text-gray-500">Get notified when products you've viewed drop in price</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.price_drops ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('price_drops')}
                          >
                            <span
                              className={`${
                                notificationPreferences.price_drops ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Personalized Recommendations</h4>
                          <p className="text-xs text-gray-500">Receive personalized product recommendations</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.recommendations ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('recommendations')}
                          >
                            <span
                              className={`${
                                notificationPreferences.recommendations ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Chat Messages</h4>
                          <p className="text-xs text-gray-500">Get notified when you receive new messages</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.chat_messages ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('chat_messages')}
                          >
                            <span
                              className={`${
                                notificationPreferences.chat_messages ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('email_notifications')}
                          >
                            <span
                              className={`${
                                notificationPreferences.email_notifications ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.sms_notifications ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('sms_notifications')}
                          >
                            <span
                              className={`${
                                notificationPreferences.sms_notifications ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">WhatsApp Notifications</h4>
                          <p className="text-xs text-gray-500">Receive notifications via WhatsApp</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className={`${
                              notificationPreferences.whatsapp_notifications ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() => handleNotificationToggle('whatsapp_notifications')}
                          >
                            <span
                              className={`${
                                notificationPreferences.whatsapp_notifications ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-6">Privacy & Security</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Password</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      It's a good idea to use a strong password that you don't use elsewhere
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add an extra layer of security to your account by requiring both your password and a verification code when you log in
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Enable Two-Factor Authentication
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Data Privacy</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Privacy Policy</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Learn how we collect, use, and protect your personal information
                        </p>
                        <a
                          href="#"
                          className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Privacy Policy
                        </a>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Download Your Data</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Request a copy of all data associated with your account
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Request Data Download
                        </button>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Permanently delete your account and all associated data
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;