import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter,
  ShoppingBag,
  X,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Calendar
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { 
  selectAllOrders, 
  selectOrdersByStatus,
  OrderStatus
} from '../store/slices/ordersSlice';
import { formatCurrency, formatDate } from '../utils/helpers';

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const allOrders = useAppSelector(selectAllOrders);
  
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get orders based on active tab
  const filteredOrders = activeTab === 'all'
    ? allOrders
    : useAppSelector(selectOrdersByStatus(activeTab));
  
  // Filter by search term
  const searchedOrders = filteredOrders.filter(order => {
    const searchString = [
      order.id,
      order.customerName,
      order.customerPhone,
      ...order.items.map(item => item.productName)
    ].join(' ').toLowerCase();
    
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  // Sort orders by date (newest first)
  const sortedOrders = [...searchedOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const tabs: Array<{ id: OrderStatus | 'all', label: string, icon: React.FC<{ size?: number }> }> = [
    { id: 'all', label: t('orders.all'), icon: ShoppingBag },
    { id: 'pending', label: t('orders.pending'), icon: Clock },
    { id: 'confirmed', label: t('orders.confirmed'), icon: CheckCircle },
    { id: 'processing', label: t('orders.processing'), icon: ShoppingBag },
    { id: 'shipped', label: t('orders.shipped'), icon: Truck },
    { id: 'delivered', label: t('orders.delivered'), icon: PackageCheck },
    { id: 'cancelled', label: t('orders.cancelled'), icon: XCircle },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          {t('orders.title')}
        </motion.h1>
      </div>
      
      {/* Tabs and Search */}
      <div className="flex flex-col gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex overflow-x-auto pb-2 space-x-2 -mx-2 px-2"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-full flex items-center whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('orders.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input"
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm('')}
            >
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </motion.div>
      </div>
      
      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-card"
        >
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.orderId')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.total')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    variants={itemVariants}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          {order.customerName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('common.view')}
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Orders;