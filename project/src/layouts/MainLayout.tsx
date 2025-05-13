import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  MessageCircle, 
  FileText, 
  Link as LinkIcon, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  Database,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils/helpers';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import TutorialMenu from '../components/tutorial/TutorialMenu';
import TutorialButton from '../components/tutorial/TutorialButton';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectBusinessName, logout } from '../store/slices/userSlice';
import { selectTotalUnreadCount } from '../store/slices/chatSlice';
import { useTutorial } from '../contexts/TutorialContext';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { availableTutorials } = useTutorial();
  
  const businessName = useAppSelector(selectBusinessName);
  const unreadMessageCount = useAppSelector(selectTotalUnreadCount);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Chat', href: '/chat', icon: MessageCircle, badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { name: 'Livestream Catalog', href: '/livestream-catalog', icon: BarChart3 },
    { name: 'Storefront', href: '/storefront-management', icon: LinkIcon },
    { name: 'Storefront Demo', href: '/storefront-demo', icon: LinkIcon },
    { name: 'Results', href: '/results', icon: Database },
    { name: 'Compliance', href: '/compliance', icon: FileText },
    { name: 'Supply Chain', href: '/supply-chain', icon: LinkIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div 
        className={`md:hidden fixed inset-0 z-30 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 flex flex-col flex-shrink-0 w-64 max-w-xs bg-white border-r border-gray-200 pt-5 pb-4 transform transition-all ease-in-out duration-300 md:translate-x-0 md:static md:inset-auto md:flex-shrink-0 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center px-4 justify-between">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white">
              <Package size={20} />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">Auto-Dukaan</span>
          </div>
          <button 
            type="button" 
            className="md:hidden text-gray-500 hover:text-gray-600" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 mt-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Business
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900 truncate">
            {businessName || 'Your Business'}
          </h2>
        </div>
        <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                )}
              >
                {({isActive}) => (
                  <>
                    <item.icon 
                      className={cn(
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )} 
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-6 p-4 flex flex-col gap-3">
          <LanguageSwitcher />
          
          {/* Onboarding Tutorial Button */}
          <TutorialButton
            tutorialId="onboarding"
            variant="outline"
            icon="book"
            label="App Tutorial"
            className="w-full justify-start"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-3">
              {/* Tutorial Menu - only shown when tutorials are available */}
              {availableTutorials && availableTutorials.length > 0 && (
                <TutorialMenu variant="ghost" size="sm" />
              )}
              {/* Notifications dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={toggleNotifications}
                >
                  <Bell size={20} />
                </button>
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="none">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm font-medium text-gray-900">New order received</p>
                          <p className="text-xs text-gray-500">Order #ORD123458 from Priya Patel</p>
                          <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm font-medium text-gray-900">Low stock alert</p>
                          <p className="text-xs text-gray-500">Handwoven Saree (5 units left)</p>
                          <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm font-medium text-gray-900">Payment received</p>
                          <p className="text-xs text-gray-500">₹1,497 from Rahul Verma</p>
                          <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200 text-center">
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex max-w-xs items-center gap-2 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 p-1 px-2"
                  onClick={toggleUserMenu}
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    <User size={16} />
                  </div>
                  <span className="hidden md:flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Seller</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="none">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => navigate('/settings')}
                      >
                        Settings
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center">
                          <LogOut size={16} className="mr-3 text-gray-400" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;