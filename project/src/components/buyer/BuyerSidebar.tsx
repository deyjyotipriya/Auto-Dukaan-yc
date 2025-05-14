import React from 'react';

interface BuyerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BuyerSidebar: React.FC<BuyerSidebarProps> = ({ activeTab, setActiveTab }) => {
  // Navigation items
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'chat', label: 'Chat with Sellers', icon: '💬' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'recommendations', label: 'For You', icon: '🛍️' },
    { id: 'settings', label: 'Account Settings', icon: '⚙️' },
  ];

  // Recently visited stores (demo data)
  const recentStores = [
    { id: 'store1', name: 'Ganesh Electronics', avatar: 'GE' },
    { id: 'store2', name: 'Ananya Fashion', avatar: 'AF' },
    { id: 'store3', name: 'Mumbai Spices', avatar: 'MS' },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
      {/* Navigation Menu */}
      <nav className="px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 my-6 border-t border-gray-200"></div>

      {/* Recently Visited Stores */}
      <div className="px-4 mb-6">
        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Stores
        </h3>
        <ul className="space-y-2">
          {recentStores.map((store) => (
            <li key={store.id}>
              <button
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  // In a real app, this would navigate to the store page
                  console.log(`Navigating to store: ${store.name}`);
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full mr-3 text-sm font-medium">
                  {store.avatar}
                </div>
                <span className="truncate">{store.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Access Section */}
      <div className="px-4 mb-6">
        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quick Access
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              onClick={() => window.open('/help-center', '_blank')}
            >
              <span className="mr-3 text-xl">❓</span>
              Help Center
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              onClick={() => window.open('/wishlist', '_blank')}
            >
              <span className="mr-3 text-xl">❤️</span>
              Wishlist
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              onClick={() => window.open('/track-package', '_blank')}
            >
              <span className="mr-3 text-xl">🚚</span>
              Track Package
            </button>
          </li>
        </ul>
      </div>

      {/* Promotional Banner */}
      <div className="px-6 py-4 mx-4 mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
        <p className="text-sm font-semibold mb-1">Refer & Earn!</p>
        <p className="text-xs">Invite friends to Auto-Dukaan and get ₹100 off on your next purchase.</p>
        <button className="mt-2 px-3 py-1 text-xs font-medium bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors">
          Invite Now
        </button>
      </div>
    </div>
  );
};

export default BuyerSidebar;