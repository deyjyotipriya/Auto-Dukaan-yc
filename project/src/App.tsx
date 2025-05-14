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
import StorefrontUnified from './pages/StorefrontUnified';
// Using the fixed BuyerView component
import BuyerView from './pages/BuyerView';
import LivestreamCatalog from './pages/LivestreamCatalog';
import ResultsManagement from './pages/ResultsManagement';
import StorefrontDemo from './pages/StorefrontDemo';
import GuidedTutorial from './components/tutorial/GuidedTutorial';
import TutorialOverlay from './components/tutorial/TutorialOverlay';
import { TutorialProvider } from './contexts/TutorialContext';
// Use our safe version of useSelector for Redux
import { useSelector, useAppSelector } from './utils/reduxFix';
import { selectIsOnboarded } from './store/slices/userSlice';
// Import Error Boundaries
import ErrorBoundary from './components/common/ErrorBoundary';
import ReduxErrorBoundary from './components/common/ReduxErrorBoundary';
import APIErrorBoundary from './components/common/APIErrorBoundary';
import LivestreamErrorBoundary from './components/common/LivestreamErrorBoundary';

function App() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Use our safe version of useSelector to prevent errors
  // Fallback to false if there's an issue with Redux
  let isOnboarded = false;
  try {
    isOnboarded = useAppSelector(selectIsOnboarded);
  } catch (error) {
    console.warn("Error accessing Redux state, defaulting isOnboarded to false:", error);
  }
  
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
    <ErrorBoundary
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-white">
          <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">We're sorry, but something went wrong with the application. Please refresh the page or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
        // Here you could send error to a monitoring service like Sentry
      }}
    >
      <TutorialProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Traditional Onboarding */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* WhatsApp Onboarding */}
            <Route path="/whatsapp-onboarding" element={<WhatsAppOnboarding />} />
            
            {/* Buyer-facing Storefront - Using the fixed version */}
            <Route path="/store/:storeId" element={
              <ErrorBoundary 
                fallback={<div className="p-4 text-center">Unable to load store. Please try again later.</div>}
              >
                <BuyerView />
              </ErrorBoundary>
            } />
            
            {/* For testing purposes, provide a direct path to the HTML version */}
            <Route path="/store-html/:storeId" element={
              <iframe 
                src="/buyer-view.html" 
                style={{ width: '100%', height: '100vh', border: 'none' }} 
                title="Store View"
              />
            } />
            
            {/* Main App Routes */}
            <Route path="/" element={
              <ReduxErrorBoundary>
                {!isOnboarded ? <WhatsAppOnboarding /> : <MainLayout />}
              </ReduxErrorBoundary>
            }>
              <Route index element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="products" element={
                <ErrorBoundary>
                  <Products />
                </ErrorBoundary>
              } />
              <Route path="products/:id" element={
                <ErrorBoundary>
                  <ProductDetail />
                </ErrorBoundary>
              } />
              <Route path="products/add" element={
                <ErrorBoundary>
                  <EnhancedAddProduct />
                </ErrorBoundary>
              } />
              <Route path="orders" element={
                <ErrorBoundary>
                  <Orders />
                </ErrorBoundary>
              } />
              <Route path="orders/:id" element={
                <ErrorBoundary>
                  <EnhancedOrderDetail />
                </ErrorBoundary>
              } />
              <Route path="chat" element={
                <ErrorBoundary>
                  <Chat />
                </ErrorBoundary>
              } />
              <Route path="results" element={
                <ErrorBoundary>
                  <ResultsManagement />
                </ErrorBoundary>
              } />
              <Route path="compliance" element={
                <ErrorBoundary>
                  <Compliance />
                </ErrorBoundary>
              } />
              <Route path="supply-chain" element={
                <ErrorBoundary>
                  <SupplyChain />
                </ErrorBoundary>
              } />
              <Route path="settings" element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              } />
              <Route path="storefront" element={
                <ErrorBoundary>
                  <StorefrontUnified />
                </ErrorBoundary>
              } />
              <Route path="storefront/:tab" element={
                <ErrorBoundary>
                  <StorefrontUnified />
                </ErrorBoundary>
              } />
              <Route path="storefront-management" element={
                <ErrorBoundary>
                  <StorefrontManagement />
                </ErrorBoundary>
              } />
              <Route path="storefront-demo" element={
                <ErrorBoundary>
                  <StorefrontDemo />
                </ErrorBoundary>
              } />
              <Route path="storefront-settings" element={
                <ErrorBoundary>
                  <StorefrontSettings />
                </ErrorBoundary>
              } />
              <Route path="livestream-catalog" element={
                <LivestreamErrorBoundary>
                  <LivestreamCatalog />
                </LivestreamErrorBoundary>
              } />
            </Route>
          </Routes>
        </AnimatePresence>
        
        {/* Choose which tutorial system to use - prefer the new one */}
        {!location.pathname.includes('onboarding') && (
          !showTutorial ? (
            <ErrorBoundary fallback={null}>
              <TutorialOverlay />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary fallback={null}>
              <GuidedTutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
            </ErrorBoundary>
          )
        )}
      </TutorialProvider>
    </ErrorBoundary>
  );
}

export default App;