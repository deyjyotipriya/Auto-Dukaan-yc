import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ShoppingBag, IndianRupee, Users, Package, AlertTriangle, Bell, Database } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { selectRecentOrders } from '../store/slices/ordersSlice';
import { selectLowStockProducts } from '../store/slices/productsSlice';
import { formatCurrency, formatDate } from '../utils/helpers';
import RevenueChart from '../components/dashboard/RevenueChart';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const recentOrders = useAppSelector(selectRecentOrders);
  const lowStockProducts = useAppSelector(selectLowStockProducts);
  
  // Mock metrics data
  const metrics = [
    {
      title: t('dashboard.metrics.orders'),
      value: 25,
      change: 12,
      isPositive: true,
      icon: ShoppingBag,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: t('dashboard.metrics.revenue'),
      value: 15235,
      change: 8,
      isPositive: true,
      icon: IndianRupee,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: t('dashboard.metrics.customers'),
      value: 18,
      change: 5,
      isPositive: false,
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];
  
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
        duration: 0.5
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="card"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg ${metric.iconBg}`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.isPositive ? '+' : '-'}{metric.change}%
                </span>
                {metric.isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              <p className="text-2xl font-semibold mt-1">
                {metric.title === t('dashboard.metrics.revenue') 
                  ? formatCurrency(metric.value) 
                  : metric.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Revenue Chart */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Revenue (7 Days)</h2>
          <div className="flex space-x-2">
            <button className="btn-sm btn-outline">This Week</button>
            <button className="btn-sm btn-outline">Last Week</button>
          </div>
        </div>
        <div className="h-80">
          <RevenueChart />
        </div>
      </motion.div>
      
      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentOrders')}</h2>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders found</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all orders
          </button>
        </motion.div>
        
        <motion.div variants={itemVariants} className="card">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.lowStock')}</h2>
          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No low stock products</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="text-amber-500 mr-1" />
                    <span className="text-amber-600 font-medium">{product.stock} left</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all inventory
          </button>
        </motion.div>
      </div>
      
      {/* Results Management Banner */}
      <motion.div variants={itemVariants} className="card p-6 bg-indigo-50 border border-indigo-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-indigo-900">Product Detection Results</h2>
              <p className="text-indigo-700">Manage and organize your livestream detection results</p>
            </div>
          </div>
          <Link 
            to="/results" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            View Results
          </Link>
        </div>
      </motion.div>
      
      {/* Notifications */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Bell size={18} className="mr-2 text-primary-500" />
            {t('dashboard.notifications')}
          </h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Mark all as read
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-900">New order received</p>
              <p className="text-sm text-gray-500">Order #ORD123458 from Priya Patel</p>
              <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center text-amber-600">
              <Package size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Low stock alert</p>
              <p className="text-sm text-gray-500">Handwoven Saree (5 units left)</p>
              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600">
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Payment received</p>
              <p className="text-sm text-gray-500">₹1,497 from Rahul Verma</p>
              <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;