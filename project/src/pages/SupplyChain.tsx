import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Link, 
  Users, 
  Store, 
  Factory, 
  Truck, 
  Globe, 
  ChevronRight,
  Database,
  FileText,
  Milestone,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { selectAllProducts } from '../store/slices/productsSlice';

const SupplyChain: React.FC = () => {
  const { t } = useTranslation();
  const products = useAppSelector(selectAllProducts);
  
  const [activeView, setActiveView] = useState<'current' | 'future' | 'vision'>('current');
  
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
  
  const phases = [
    { 
      id: 'current', 
      label: t('supplyChain.current'), 
      icon: Users, 
      color: 'bg-primary-100 text-primary-600',
      description: 'Direct connection between sellers and their customers',
      entities: ['Live Sellers', 'Customers']
    },
    { 
      id: 'future', 
      label: t('supplyChain.nextPhase'), 
      icon: Store, 
      color: 'bg-blue-100 text-blue-600',
      description: 'Expand to connect sellers with wholesale suppliers',
      entities: ['Sellers', 'Wholesalers']
    },
    { 
      id: 'vision', 
      label: t('supplyChain.vision'), 
      icon: Globe, 
      color: 'bg-indigo-100 text-indigo-600',
      description: 'Complete commerce ecosystem connecting all players',
      entities: ['Brands', 'Wholesalers', 'Sellers', 'Customers']
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900"
      >
        {t('supplyChain.title')}
      </motion.h1>
      
      {/* Phase selector */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white shadow-card rounded-lg overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {phases.map((phase) => (
            <button
              key={phase.id}
              className={`py-5 px-6 text-left transition-colors ${
                activeView === phase.id
                  ? 'bg-gray-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveView(phase.id as any)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${phase.color} mr-3`}>
                    <phase.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{phase.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
                  </div>
                </div>
                {activeView === phase.id && (
                  <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* Supply Chain Visualization */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Current Phase - Seller to Customer */}
        {activeView === 'current' && (
          <motion.div variants={itemVariants} className="card">
            <h2 className="text-lg font-medium mb-4">Direct Seller to Customer Model</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              {/* Visualization */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                    <Users size={32} className="text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Live Sellers</h3>
                  <p className="text-xs text-gray-500 mt-1">Social commerce entrepreneurs</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-0 w-16 md:h-16 md:w-0 border-l-0 md:border-l-2 border-t-2 md:border-t-0 border-dashed border-primary-300 mb-3"></div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white">
                    <Zap size={20} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Auto-Dukaan Platform</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mb-3">
                    <Users size={32} className="text-secondary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Customers</h3>
                  <p className="text-xs text-gray-500 mt-1">End consumers of products</p>
                </div>
              </div>
              
              {/* Data Flow */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Database size={16} className="text-primary-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Product Data</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Product information, images, prices, and inventory managed by sellers
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Truck size={16} className="text-primary-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Order Flow</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Direct order processing and fulfillment from seller to customer
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <FileText size={16} className="text-primary-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Communication</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Direct chat between sellers and customers within the platform
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-4">
              <h3 className="text-md font-medium mb-2">Current Products ({products.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {products.slice(0, 4).map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all products
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Next Phase - Seller to Wholesaler */}
        {activeView === 'future' && (
          <motion.div variants={itemVariants} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-medium">Seller to Wholesaler Connection</h2>
                <p className="text-sm text-gray-500 mt-1">Next phase of the supply chain ecosystem</p>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Coming Soon
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              {/* Visualization */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Factory size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Wholesalers</h3>
                  <p className="text-xs text-gray-500 mt-1">Bulk suppliers of products</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-0 w-16 md:h-16 md:w-0 border-l-0 md:border-l-2 border-t-2 md:border-t-0 border-dashed border-blue-300 mb-3"></div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white">
                    <Zap size={20} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Auto-Dukaan Platform</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                    <Users size={32} className="text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Sellers</h3>
                  <p className="text-xs text-gray-500 mt-1">Social commerce entrepreneurs</p>
                </div>
              </div>
              
              {/* Benefits */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Truck size={16} className="text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Bulk Ordering</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Place bulk orders directly from verified wholesalers at better prices
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Database size={16} className="text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Inventory Management</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Automated inventory updates and reorder suggestions
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Milestone size={16} className="text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Product Discovery</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Discover new trending products to add to your catalog
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Would you like to join the beta program?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Get early access to our wholesaler network and be among the first to benefit from bulk ordering capabilities.
              </p>
              <button className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                <ArrowRight size={18} className="mr-2" />
                Join Waiting List
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Vision - Complete Ecosystem */}
        {activeView === 'vision' && (
          <motion.div variants={itemVariants} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-medium">Complete Commerce Ecosystem</h2>
                <p className="text-sm text-gray-500 mt-1">The future vision of Auto-Dukaan platform</p>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Vision
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              {/* Visualization */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                    <Store size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900">Brands</h3>
                  <p className="text-xs text-gray-500 mt-1">Product creators</p>
                </div>
                
                <div className="flex items-center">
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                    <Factory size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900">Wholesalers</h3>
                  <p className="text-xs text-gray-500 mt-1">Bulk suppliers</p>
                </div>
                
                <div className="flex items-center">
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                    <Users size={24} className="text-primary-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900">Sellers</h3>
                  <p className="text-xs text-gray-500 mt-1">Entrepreneurs</p>
                </div>
                
                <div className="flex items-center">
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-2">
                    <Users size={24} className="text-secondary-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900">Customers</h3>
                  <p className="text-xs text-gray-500 mt-1">End consumers</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white">
                  <Zap size={28} />
                </div>
              </div>
              <p className="text-center text-sm font-medium text-gray-900 mt-2">Auto-Dukaan Platform</p>
              <p className="text-center text-xs text-gray-500 mt-1 max-w-lg mx-auto">
                Connecting all parts of the commerce ecosystem through a single integrated platform
              </p>
              
              {/* Benefits */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">For Brands</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Direct market insights</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Streamlined distribution</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Brand protection</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">For Wholesalers</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Expanded seller network</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Demand forecasting</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Simplified logistics</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">For Sellers</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Better sourcing prices</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Product authenticity</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Business scaling</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">For Customers</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Authentic products</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Better prices</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={14} className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>Personalized shopping</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h3 className="font-medium text-indigo-800 mb-2">Future Roadmap</h3>
              <p className="text-sm text-indigo-700 mb-4">
                Our vision is to create a complete commerce ecosystem that connects everyone from brands to customers, streamlining the entire supply chain.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600">
                    <Check size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Phase 1: Seller to Customer</p>
                    <p className="text-xs text-gray-500">Currently active</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                    <Milestone size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Phase 2: Wholesaler Integration</p>
                    <p className="text-xs text-gray-500">Coming Q3 2023</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                    <Milestone size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Phase 3: Brand Integration</p>
                    <p className="text-xs text-gray-500">Planned for Q1 2024</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                    <Globe size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Phase 4: Complete Ecosystem</p>
                    <p className="text-xs text-gray-500">Vision for 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SupplyChain;