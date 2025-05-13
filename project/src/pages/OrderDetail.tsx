import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ShoppingBag,
  User,
  Map,
  Phone,
  CreditCard,
  Package,
  Truck,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  CalendarClock,
  Banknote,
  PackageCheck
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { 
  selectOrderById, 
  updateOrderStatus, 
  updatePaymentStatus, 
  addTrackingInfo,
  OrderStatus
} from '../store/slices/ordersSlice';
import { formatCurrency, formatDateTime } from '../utils/helpers';

const OrderDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const order = useAppSelector(selectOrderById(id || ''));
  
  const [trackingId, setTrackingId] = useState('');
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  
  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Order not found</p>
        <Link to="/orders" className="btn-outline mt-4">
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
      </div>
    );
  }
  
  const handleStatusUpdate = (status: OrderStatus) => {
    if (window.confirm(`Are you sure you want to update the order status to ${status}?`)) {
      dispatch(updateOrderStatus({ id: order.id, status }));
    }
  };
  
  const handlePaymentStatusUpdate = (paymentStatus: 'pending' | 'paid' | 'failed') => {
    if (window.confirm(`Are you sure you want to update the payment status to ${paymentStatus}?`)) {
      dispatch(updatePaymentStatus({ id: order.id, paymentStatus }));
    }
  };
  
  const handleAddTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      dispatch(addTrackingInfo({ id: order.id, trackingId }));
      setShowTrackingForm(false);
      setTrackingId('');
    }
  };
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle size={20} className="text-blue-500" />;
      case 'processing':
        return <Package size={20} className="text-purple-500" />;
      case 'shipped':
        return <Truck size={20} className="text-indigo-500" />;
      case 'delivered':
        return <PackageCheck size={20} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };
  
  // Timeline events
  const timeline = [
    {
      status: 'Order placed',
      date: order.createdAt,
      icon: ShoppingBag,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      description: `Order #${order.id} was placed by ${order.customerName}`,
    },
  ];
  
  if (order.status !== 'pending') {
    timeline.push({
      status: 'Order confirmed',
      date: new Date(new Date(order.createdAt).getTime() + 30 * 60000).toISOString(), // Mock: 30 min after creation
      icon: CheckCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      description: 'Order was confirmed and is being prepared',
    });
  }
  
  if (['processing', 'shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'Processing',
      date: new Date(new Date(order.createdAt).getTime() + 120 * 60000).toISOString(), // Mock: 2 hours after creation
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      description: 'Order is being processed and packed',
    });
  }
  
  if (['shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'Shipped',
      date: new Date(new Date(order.createdAt).getTime() + 360 * 60000).toISOString(), // Mock: 6 hours after creation
      icon: Truck,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
      description: `Order shipped with tracking ID: ${order.trackingId || 'TRK123456789'}`,
    });
  }
  
  if (order.status === 'delivered') {
    timeline.push({
      status: 'Delivered',
      date: new Date(new Date(order.createdAt).getTime() + 4320 * 60000).toISOString(), // Mock: 3 days after creation
      icon: PackageCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: 'Order was delivered successfully',
    });
  }
  
  if (order.status === 'cancelled') {
    timeline.push({
      status: 'Cancelled',
      date: new Date(new Date(order.createdAt).getTime() + 60 * 60000).toISOString(), // Mock: 1 hour after creation
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      description: 'Order was cancelled',
    });
  }
  
  // Sort timeline by date
  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/orders')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('orderDetails.title')}</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            className="btn-outline"
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft size={18} />
            {t('common.back')}
          </button>
        </div>
      </div>
      
      {/* Order information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order header */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">{order.id}</h2>
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  <CalendarClock size={14} className="inline-block mr-1" />
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Order items */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-medium mb-4">{t('orderDetails.items')}</h3>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <p className="text-sm text-gray-500">
                        {Object.entries(item.variants).map(([key, value]) => (
                          `${key}: ${value}`
                        )).join(', ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-500 mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-500 mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-500 mb-2">
                <span>Tax</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-4 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </motion.div>
          
          {/* Order timeline */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">{t('orderDetails.timeline')}</h3>
            
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 ${event.bgColor} rounded-full flex items-center justify-center ${event.color}`}>
                      <event.icon size={16} />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <div className="ml-4 pb-4">
                    <p className="font-medium text-gray-900">{event.status}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(event.date)}</p>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Right column - Customer, payment, and shipping info */}
        <div className="space-y-6">
          {/* Customer information */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-medium mb-4">{t('orderDetails.customerInfo')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                  <User size={16} />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600">
                  <Phone size={16} />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Payment information */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">{t('orderDetails.paymentInfo')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-600">
                  <CreditCard size={16} />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {order.paymentMethod === 'upi' ? 'UPI' : 
                     order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     'Card Payment'}
                  </p>
                  <p className="text-sm text-gray-500">Payment Method</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex-shrink-0 flex items-center justify-center text-yellow-600">
                  <Banknote size={16} />
                </div>
                <div className="ml-3">
                  <p className={`font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 
                    order.paymentStatus === 'failed' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 
                     order.paymentStatus === 'failed' ? 'Failed' : 
                     'Pending'}
                  </p>
                  <p className="text-sm text-gray-500">Payment Status</p>
                </div>
              </div>
              
              {/* Payment actions */}
              {order.paymentStatus !== 'paid' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Update Payment Status:</p>
                  <div className="flex gap-2">
                    <button 
                      className="btn-sm btn-outline flex-1 text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handlePaymentStatusUpdate('paid')}
                    >
                      Mark as Paid
                    </button>
                    {order.paymentStatus !== 'failed' && (
                      <button 
                        className="btn-sm btn-outline flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handlePaymentStatusUpdate('failed')}
                      >
                        Mark as Failed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Shipping information */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4">{t('orderDetails.shippingInfo')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                  <User size={16} />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                  <Map size={16} />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{order.shippingAddress.street}</p>
                  <p className="text-sm text-gray-500">
                    {`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`}
                  </p>
                </div>
              </div>
              
              {order.trackingId && (
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                    <Truck size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{order.trackingId}</p>
                    <p className="text-sm text-gray-500">Tracking ID</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tracking form */}
            {!order.trackingId && order.status === 'processing' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {showTrackingForm ? (
                  <form onSubmit={handleAddTracking}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking ID
                      </label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="input"
                        placeholder="Enter tracking ID"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn-sm btn-primary flex-1"
                      >
                        Add Tracking
                      </button>
                      <button
                        type="button"
                        className="btn-sm btn-outline flex-1"
                        onClick={() => setShowTrackingForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="btn-sm btn-outline w-full"
                    onClick={() => setShowTrackingForm(true)}
                  >
                    <Truck size={16} className="mr-1" />
                    Add Tracking Info
                  </button>
                )}
              </div>
            )}
          </motion.div>
          
          {/* Order actions */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-medium mb-4">{t('orderDetails.updateStatus')}</h3>
            
            <div className="space-y-3">
              {order.status !== 'confirmed' && order.status !== 'cancelled' && (
                <button
                  className="btn-outline w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleStatusUpdate('confirmed')}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Mark as Confirmed
                </button>
              )}
              
              {order.status !== 'processing' && order.status !== 'cancelled' && order.status !== 'shipped' && order.status !== 'delivered' && (
                <button
                  className="btn-outline w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={() => handleStatusUpdate('processing')}
                >
                  <Package size={18} className="mr-2" />
                  Mark as Processing
                </button>
              )}
              
              {order.status !== 'shipped' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  className="btn-outline w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => handleStatusUpdate('shipped')}
                  disabled={!order.trackingId && order.status === 'processing'}
                >
                  <Truck size={18} className="mr-2" />
                  Mark as Shipped
                </button>
              )}
              
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button
                  className="btn-outline w-full text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => handleStatusUpdate('delivered')}
                >
                  <PackageCheck size={18} className="mr-2" />
                  Mark as Delivered
                </button>
              )}
              
              {order.status !== 'cancelled' && (
                <button
                  className="btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  <XCircle size={18} className="mr-2" />
                  {t('orderDetails.cancelled')}
                </button>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
              <button
                className="btn-outline flex-1"
              >
                <FileText size={18} className="mr-2" />
                {t('orderDetails.generateInvoice')}
              </button>
              
              {order.status !== 'cancelled' && order.status !== 'pending' && (
                <button
                  className="btn-outline flex-1"
                >
                  <Truck size={18} className="mr-2" />
                  {t('orderDetails.generateShipping')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;