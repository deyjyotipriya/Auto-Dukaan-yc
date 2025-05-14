import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BuyerHeaderProps {
  buyerInfo: any;
}

const BuyerHeader: React.FC<BuyerHeaderProps> = ({ buyerInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Dummy notifications for demo
  const notifications = [
    {
      id: 'notif1',
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: 'notif2',
      title: 'Payment Confirmed',
      message: 'Payment for order #12346 has been confirmed',
      time: 'Yesterday',
      isRead: true
    },
    {
      id: 'notif3',
      title: 'New Message',
      message: 'You have a new message from Ganesh Electronics',
      time: '3 days ago',
      isRead: true
    }
  ];

  const unreadNotifications = notifications.filter(notif => !notif.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    localStorage.removeItem('buyerId');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/buyer-dashboard" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Auto-Dukaan</span>
              <span className="ml-1 text-sm text-gray-500">Buyer</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, stores, or orders..."
                className="w-full px-4 py-2 pl-10 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </form>
          </div>

          {/* Right Nav Items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="p-1 text-gray-500 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={toggleNotifications}
              >
                <span className="sr-only">View notifications</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 z-10 w-80 mt-2 bg-white rounded-md shadow-lg">
                  <div className="py-2 border-b border-gray-200">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700">Notifications</div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-500">{notification.message}</p>
                                <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="py-2 border-t border-gray-200">
                    <div className="flex items-center justify-center">
                      <button className="px-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-800">
                        Mark all as read
                      </button>
                      <div className="mx-2 h-4 border-l border-gray-200"></div>
                      <Link to="/buyer-notifications" className="px-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-800">
                        View all
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={toggleProfileMenu}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                    {buyerInfo?.name?.charAt(0) || 'U'}
                  </div>
                </button>
              </div>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <div className="font-medium">{buyerInfo?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate">{buyerInfo?.email || ''}</div>
                  </div>
                  <Link
                    to="/buyer-dashboard?tab=orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Orders
                  </Link>
                  <Link
                    to="/buyer-dashboard?tab=settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BuyerHeader;