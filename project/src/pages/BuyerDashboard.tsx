import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Components for each section
import ChatInterface from '../components/buyer/ChatInterface';
import OrderHistory from '../components/buyer/OrderHistory';
import ProductRecommendations from '../components/buyer/ProductRecommendations';
import AccountSettings from '../components/buyer/AccountSettings';
import BuyerHeader from '../components/buyer/BuyerHeader';
import BuyerSidebar from '../components/buyer/BuyerSidebar';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [buyerInfo, setBuyerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch buyer information from API or localStorage
    const fetchBuyerInfo = async () => {
      try {
        // For demo purposes, we'll use a mock API call
        // In production, this would be a real API call
        const buyerId = localStorage.getItem('buyerId');
        
        if (!buyerId) {
          // If no buyer ID is found, redirect to login/onboarding
          navigate('/buyer-onboarding');
          return;
        }
        
        // Mock API call to get buyer info
        const response = await fetch(`/api/buyer/profile/${buyerId}`);
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
          setBuyerInfo(data.data);
        } else {
          // Handle error
          console.error('Failed to fetch buyer info');
          navigate('/buyer-onboarding');
        }
      } catch (error) {
        console.error('Error fetching buyer info:', error);
        // For demo, create mock buyer data
        setBuyerInfo({
          id: 'buyer_123456',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9999999999',
          address: '123 Main St, Mumbai',
          pincode: '400001',
          lastActive: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyerInfo();
  }, [navigate]);

  // Render appropriate component based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface buyerId={buyerInfo?.id} />;
      case 'orders':
        return <OrderHistory buyerId={buyerInfo?.id} />;
      case 'recommendations':
        return <ProductRecommendations buyerId={buyerInfo?.id} />;
      case 'settings':
        return <AccountSettings buyerInfo={buyerInfo} setBuyerInfo={setBuyerInfo} />;
      default:
        return (
          <div className="p-6">
            <BuyerDashboardHome buyerInfo={buyerInfo} setActiveTab={setActiveTab} />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <BuyerHeader buyerInfo={buyerInfo} />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <BuyerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Home dashboard component
const BuyerDashboardHome = ({ buyerInfo, setActiveTab }: any) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {buyerInfo?.name || 'Shopper'}!</h1>
        <p className="text-gray-600">Here's what's happening with your recent orders and favorite stores.</p>
      </div>
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <DashboardCard 
          title="Active Orders" 
          value="2" 
          description="You have 2 orders in progress"
          icon="📦"
          onClick={() => setActiveTab('orders')}
        />
        <DashboardCard 
          title="New Messages" 
          value="3" 
          description="You have 3 unread messages"
          icon="💬"
          onClick={() => setActiveTab('chat')}
        />
        <DashboardCard 
          title="Recent Savings" 
          value="₹1,245" 
          description="Saved in the last 30 days"
          icon="💰"
          onClick={() => {}}
        />
      </div>
      
      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setActiveTab('orders')}
          >
            View All
          </button>
        </div>
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              <ActivityItem 
                title="Order #12345 has been delivered"
                description="Your order from Ganesh Electronics has been delivered"
                time="2 hours ago"
                icon="📦"
              />
              <ActivityItem 
                title="New message from Ananya Fashion"
                description="Thanks for your order! Let us know if you have any questions."
                time="Yesterday"
                icon="💬"
              />
              <ActivityItem 
                title="Payment confirmed for Order #12346"
                description="₹2,499 paid via UPI"
                time="Yesterday"
                icon="💳"
              />
            </ul>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <QuickActionButton 
            title="Track Orders" 
            icon="📍" 
            onClick={() => setActiveTab('orders')}
          />
          <QuickActionButton 
            title="Chat with Sellers" 
            icon="💬" 
            onClick={() => setActiveTab('chat')}
          />
          <QuickActionButton 
            title="Browse Recommendations" 
            icon="🛍️" 
            onClick={() => setActiveTab('recommendations')}
          />
          <QuickActionButton 
            title="Update Profile" 
            icon="👤" 
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </div>
      
      {/* Recent Orders Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setActiveTab('orders')}
          >
            View All Orders
          </button>
        </div>
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order ID</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <OrderRow 
                orderId="ORDER-12345"
                date="May 12, 2023"
                status="Delivered"
                total="₹1,499"
                setActiveTab={setActiveTab}
              />
              <OrderRow 
                orderId="ORDER-12346"
                date="May 10, 2023"
                status="In Transit"
                total="₹2,499"
                setActiveTab={setActiveTab}
              />
              <OrderRow 
                orderId="ORDER-12347"
                date="May 5, 2023"
                status="Processing"
                total="₹999"
                setActiveTab={setActiveTab}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Dashboard Card Component
const DashboardCard = ({ title, value, description, icon, onClick }: any) => {
  return (
    <div 
      className="p-6 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ title, description, time, icon }: any) => {
  return (
    <li className="py-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full text-xl">
          {icon}
        </div>
        <div className="flex-1 ml-4">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
          <p className="text-xs text-gray-400">{time}</p>
        </div>
      </div>
    </li>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ title, icon, onClick }: any) => {
  return (
    <button 
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-blue-50 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <span className="text-sm font-medium text-gray-800">{title}</span>
    </button>
  );
};

// Order Row Component
const OrderRow = ({ orderId, date, status, total, setActiveTab }: any) => {
  // Status color mapping
  const statusColors: any = {
    'Delivered': 'bg-green-100 text-green-800',
    'In Transit': 'bg-blue-100 text-blue-800',
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{orderId}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{date}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {total}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button 
          className="text-blue-600 hover:text-blue-900 mr-3"
          onClick={() => setActiveTab('orders')}
        >
          View
        </button>
        <button 
          className="text-indigo-600 hover:text-indigo-900"
          onClick={() => setActiveTab('chat')}
        >
          Contact Seller
        </button>
      </td>
    </tr>
  );
};

export default BuyerDashboard;