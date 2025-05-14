import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import Onboarding from './pages/Onboarding';
import WhatsAppOnboarding from './pages/WhatsAppOnboarding';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Chat from './pages/Chat';
import Compliance from './pages/Compliance';
import SupplyChain from './pages/SupplyChain';
import Settings from './pages/Settings';
import ProductDetail from './pages/ProductDetail';
import OrderDetail from './pages/OrderDetail';
import EnhancedOrderDetail from './pages/EnhancedOrderDetail';
import AddProduct from './pages/AddProduct';
import EnhancedAddProduct from './pages/EnhancedAddProduct';
import StorefrontSettings from './pages/StorefrontSettings';
import StorefrontManagement from './pages/StorefrontManagement';
import BuyerView from './pages/BuyerView';
import LivestreamCatalog from './pages/LivestreamCatalog';
import ResultsManagement from './pages/ResultsManagement';
import StorefrontDemo from './pages/StorefrontDemo';
import GuidedTutorial from './components/tutorial/GuidedTutorial';
import TutorialOverlay from './components/tutorial/TutorialOverlay';
import { TutorialProvider } from './contexts/TutorialContext';
import { useAppSelector } from './hooks/redux';
import { selectIsOnboarded } from './store/slices/userSlice';

function App() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isOnboarded = useAppSelector(selectIsOnboarded);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Check if tutorial should be shown (from URL parameter)
  useEffect(() => {
    const tutorialParam = searchParams.get('tutorial');
    if (tutorialParam === 'true') {
      setShowTutorial(true);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Auto-Dukaan...</p>
        </div>
      </div>
    );
  }

  return (
    <TutorialProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Traditional Onboarding */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* WhatsApp Onboarding */}
          <Route path="/whatsapp-onboarding" element={<WhatsAppOnboarding />} />
          
          {/* Buyer-facing Storefront */}
          <Route path="/store/:storeId" element={<BuyerView />} />
          
          {/* Main App Routes */}
          <Route path="/" element={!isOnboarded ? <WhatsAppOnboarding /> : <MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/add" element={<EnhancedAddProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<EnhancedOrderDetail />} />
            <Route path="chat" element={<Chat />} />
            <Route path="results" element={<ResultsManagement />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="supply-chain" element={<SupplyChain />} />
            <Route path="settings" element={<Settings />} />
            <Route path="storefront" element={<StorefrontSettings />} />
            <Route path="storefront-management" element={<StorefrontManagement />} />
            <Route path="storefront-demo" element={<StorefrontDemo />} />
            <Route path="livestream-catalog" element={<LivestreamCatalog />} />
          </Route>
        </Routes>
      </AnimatePresence>
      
      {/* Choose which tutorial system to use - prefer the new one */}
      {!location.pathname.includes('onboarding') && (
        !showTutorial ? (
          <TutorialOverlay />
        ) : (
          <GuidedTutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        )
      )}
    </TutorialProvider>
  );
}

export default App;