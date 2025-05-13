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
  PackageCheck,
  AlertTriangle,
  Printer,
  Send,
  Download,
  Plus,
  Edit2,
  RefreshCw,
  Sparkles,
  Loader
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectOrderById, updateOrderStatus, updatePaymentStatus, addTrackingInfo } from '../store/slices/ordersSlice';
import { selectAllProducts, updateStockQuantity } from '../store/slices/productsSlice';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import OrderProcessingService, { 
  ShippingMethod, 
  NotificationType, 
  DocumentType,
  FulfillmentStatus
} from '../services/OrderProcessingService';
import { cn } from '../utils/helpers';

// Fulfillment steps interface
interface FulfillmentStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'in_progress' | 'completed';
}

const EnhancedOrderDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const order = useAppSelector(selectOrderById(id || ''));
  const allProducts = useAppSelector(selectAllProducts);
  
  const [activeTab, setActiveTab] = useState<'details' | 'fulfillment' | 'documents'>('details');
  const [paymentStatusUpdating, setPaymentStatusUpdating] = useState(false);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [isAddingTracking, setIsAddingTracking] = useState(false);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState<DocumentType | null>(null);
  const [documentPreview, setDocumentPreview] = useState<{type: DocumentType; content: string} | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>(ShippingMethod.STANDARD);
  const [isValidatingInventory, setIsValidatingInventory] = useState(false);
  const [inventoryStatus, setInventoryStatus] = useState<{
    checked: boolean;
    valid: boolean;
    issues?: { id: string; name: string; requested: number; available: number }[];
  }>({
    checked: false,
    valid: true
  });
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  
  // Mock fulfillment status for the order
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>({
    isPicked: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered',
    isPacked: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered',
    isLabeled: order?.status === 'shipped' || order?.status === 'delivered',
    isShipped: order?.status === 'shipped' || order?.status === 'delivered',
    isDelivered: order?.status === 'delivered',
    pickedAt: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered' 
      ? new Date(new Date(order.updatedAt).getTime() - 2 * 3600000).toISOString() 
      : undefined,
    packedAt: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered'
      ? new Date(new Date(order.updatedAt).getTime() - 1 * 3600000).toISOString()
      : undefined,
    labeledAt: order?.status === 'shipped' || order?.status === 'delivered'
      ? new Date(new Date(order.updatedAt).getTime()).toISOString()
      : undefined,
    shippedAt: order?.status === 'shipped' || order?.status === 'delivered'
      ? new Date(new Date(order.updatedAt).getTime()).toISOString()
      : undefined,
    deliveredAt: order?.status === 'delivered'
      ? new Date(new Date(order.updatedAt).getTime()).toISOString()
      : undefined,
    currentLocation: order?.status === 'shipped' && !order?.status === 'delivered'
      ? 'Mumbai Distribution Center'
      : undefined,
    estimatedDelivery: order?.status === 'shipped' && !order?.status === 'delivered'
      ? new Date(new Date().getTime() + 2 * 24 * 3600000).toISOString()
      : undefined
  });
  
  // Fulfillment steps
  const fulfillmentSteps: FulfillmentStep[] = [
    {
      id: 'validate_inventory',
      title: 'Validate Inventory',
      description: 'Check if all items are in stock',
      icon: PackageCheck,
      status: inventoryStatus.checked 
        ? (inventoryStatus.valid ? 'completed' : 'pending') 
        : 'pending'
    },
    {
      id: 'confirm_order',
      title: 'Confirm Order',
      description: 'Verify and confirm the order',
      icon: CheckCircle,
      status: order?.status === 'confirmed' || order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered'
        ? 'completed'
        : order?.status === 'pending'
          ? (inventoryStatus.checked && inventoryStatus.valid ? 'in_progress' : 'pending')
          : 'pending'
    },
    {
      id: 'pick_items',
      title: 'Pick Items',
      description: 'Collect items from inventory',
      icon: Package,
      status: fulfillmentStatus.isPicked ? 'completed' : (order?.status === 'confirmed' ? 'in_progress' : 'pending')
    },
    {
      id: 'pack_order',
      title: 'Pack Order',
      description: 'Package items for shipping',
      icon: Box,
      status: fulfillmentStatus.isPacked ? 'completed' : (fulfillmentStatus.isPicked ? 'in_progress' : 'pending')
    },
    {
      id: 'generate_label',
      title: 'Generate Shipping Label',
      description: 'Create and print shipping label',
      icon: FileText,
      status: fulfillmentStatus.isLabeled ? 'completed' : (fulfillmentStatus.isPacked ? 'in_progress' : 'pending')
    },
    {
      id: 'ship_order',
      title: 'Ship Order',
      description: 'Hand off to shipping carrier',
      icon: Truck,
      status: fulfillmentStatus.isShipped ? 'completed' : (fulfillmentStatus.isLabeled ? 'in_progress' : 'pending')
    },
    {
      id: 'deliver_order',
      title: 'Deliver Order',
      description: 'Order delivered to customer',
      icon: MapPin,
      status: fulfillmentStatus.isDelivered ? 'completed' : (fulfillmentStatus.isShipped ? 'in_progress' : 'pending')
    }
  ];
  
  if (!order) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/orders" className="btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }
  
  // Get order timeline
  const timeline = OrderProcessingService.generateOrderTimeline(order);
  
  // Handle order status update
  const handleStatusUpdate = async (status: string) => {
    setOrderStatusUpdating(true);
    
    try {
      await dispatch(updateOrderStatus({ 
        id: order.id, 
        status: status as any 
      }));
      
      // If transitioning to processing, update stock quantities
      if (status === 'processing') {
        order.items.forEach(item => {
          dispatch(updateStockQuantity({
            id: item.productId,
            quantity: -item.quantity
          }));
        });
        
        // Update fulfillment status
        setFulfillmentStatus(prev => ({
          ...prev,
          isPicked: true,
          isPacked: true,
          pickedAt: new Date().toISOString(),
          packedAt: new Date(new Date().getTime() + 30 * 60000).toISOString()
        }));
      }
      
      // If transitioning to shipped, update the fulfillment
      if (status === 'shipped') {
        setFulfillmentStatus(prev => ({
          ...prev,
          isLabeled: true,
          isShipped: true,
          labeledAt: new Date().toISOString(),
          shippedAt: new Date().toISOString(),
          currentLocation: 'Mumbai Distribution Center',
          estimatedDelivery: new Date(new Date().getTime() + 3 * 24 * 3600000).toISOString()
        }));
        
        // Add tracking if it doesn't exist
        if (!order.shippingInfo?.trackingId && !trackingNumber) {
          const generatedTrackingId = OrderProcessingService.generateTrackingId();
          setTrackingNumber(generatedTrackingId);
          
          dispatch(addTrackingInfo({
            id: order.id,
            trackingId: generatedTrackingId,
            carrier: 'AutoDukaan Logistics',
            trackingUrl: `https://tracking.autodukaan.com/${generatedTrackingId}`,
            trackingUpdates: [
              {
                status: 'shipped',
                location: 'Mumbai Distribution Center',
                timestamp: new Date().toISOString(),
                description: 'Package has been shipped'
              }
            ]
          }));
        }
      }
      
      // If transitioning to delivered, update the fulfillment
      if (status === 'delivered') {
        setFulfillmentStatus(prev => ({
          ...prev,
          isDelivered: true,
          deliveredAt: new Date().toISOString()
        }));
        
        // Add delivered status to tracking
        if (order.shippingInfo?.trackingId) {
          const trackingUpdates = order.shippingInfo.trackingUpdates 
            ? [...order.shippingInfo.trackingUpdates] 
            : [];
          
          trackingUpdates.push({
            status: 'delivered',
            location: order.shippingAddress.city,
            timestamp: new Date().toISOString(),
            description: 'Package has been delivered'
          });
          
          dispatch(addTrackingInfo({
            id: order.id,
            trackingId: order.shippingInfo.trackingId,
            carrier: order.shippingInfo.carrier,
            trackingUrl: order.shippingInfo.trackingUrl,
            trackingUpdates
          }));
        }
      }
      
      // Send appropriate notification
      let notificationType: NotificationType;
      
      switch (status) {
        case 'confirmed':
          notificationType = NotificationType.ORDER_CONFIRMED;
          break;
        case 'processing':
          notificationType = NotificationType.ORDER_PROCESSING;
          break;
        case 'shipped':
          notificationType = NotificationType.ORDER_SHIPPED;
          break;
        case 'delivered':
          notificationType = NotificationType.ORDER_DELIVERED;
          break;
        case 'cancelled':
          notificationType = NotificationType.ORDER_CANCELLED;
          break;
        default:
          notificationType = NotificationType.ORDER_CREATED;
      }
      
      await sendNotification(notificationType);
      
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setOrderStatusUpdating(false);
    }
  };
  
  // Handle payment status update
  const handlePaymentStatusUpdate = async (status: string) => {
    setPaymentStatusUpdating(true);
    
    try {
      await dispatch(updatePaymentStatus({ 
        id: order.id, 
        status: status as any 
      }));
      
      // Send payment notification if it's now paid
      if (status === 'paid') {
        await sendNotification(NotificationType.PAYMENT_RECEIVED);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setPaymentStatusUpdating(false);
    }
  };
  
  // Handle adding tracking information
  const handleAddTracking = () => {
    if (!trackingNumber) return;
    
    setIsAddingTracking(true);
    
    try {
      dispatch(addTrackingInfo({
        id: order.id,
        trackingId: trackingNumber,
        carrier: 'AutoDukaan Logistics',
        trackingUrl: `https://tracking.autodukaan.com/${trackingNumber}`,
        trackingUpdates: [
          {
            status: 'processing',
            location: 'Mumbai Sorting Center',
            timestamp: new Date().toISOString(),
            description: 'Package has been processed'
          }
        ]
      }));
      
      // If the order is already at processing or later, update to shipped
      if (['processing', 'confirmed'].includes(order.status)) {
        handleStatusUpdate('shipped');
      }
      
      setTrackingNumber('');
    } catch (error) {
      console.error('Error adding tracking info:', error);
    } finally {
      setIsAddingTracking(false);
    }
  };
  
  // Generate document (invoice, shipping label, etc)
  const handleGenerateDocument = (type: DocumentType) => {
    setIsGeneratingDocument(type);
    
    setTimeout(() => {
      let content = '';
      
      switch (type) {
        case DocumentType.INVOICE:
          content = OrderProcessingService.generateInvoice(order);
          break;
        case DocumentType.SHIPPING_LABEL:
          content = OrderProcessingService.generateShippingLabel(order);
          break;
        case DocumentType.PACKING_SLIP:
          content = OrderProcessingService.generatePackingSlip(order);
          break;
        default:
          content = '<p>Document not supported</p>';
      }
      
      setDocumentPreview({ type, content });
      setIsGeneratingDocument(null);
    }, 1500);
  };
  
  // Close document preview
  const handleCloseDocumentPreview = () => {
    setDocumentPreview(null);
  };
  
  // Download document
  const handleDownloadDocument = () => {
    if (!documentPreview) return;
    
    // In a real app, we'd convert the HTML to PDF and download it
    // For demo purposes, we'll just provide a dummy function
    alert('In a real app, this would download a PDF version of the document.');
    
    handleCloseDocumentPreview();
  };
  
  // Validate inventory availability
  const handleValidateInventory = () => {
    setIsValidatingInventory(true);
    
    setTimeout(() => {
      const inventoryCheck = OrderProcessingService.checkInventory(order.items, allProducts);
      
      setInventoryStatus({
        checked: true,
        valid: inventoryCheck.inStock,
        issues: inventoryCheck.outOfStockItems
      });
      
      setIsValidatingInventory(false);
    }, 1500);
  };
  
  // Function to handle order progression based on current step
  const handleProcessStep = async (step: FulfillmentStep) => {
    switch (step.id) {
      case 'validate_inventory':
        handleValidateInventory();
        break;
      case 'confirm_order':
        if (inventoryStatus.checked && inventoryStatus.valid) {
          handleStatusUpdate('confirmed');
        } else {
          alert('Please validate inventory first.');
        }
        break;
      case 'pick_items':
        // Update fulfillment status for picking
        setFulfillmentStatus(prev => ({
          ...prev,
          isPicked: true,
          pickedAt: new Date().toISOString()
        }));
        break;
      case 'pack_order':
        // Update fulfillment status for packing
        setFulfillmentStatus(prev => ({
          ...prev,
          isPacked: true,
          packedAt: new Date().toISOString()
        }));
        
        // Generate packing slip
        handleGenerateDocument(DocumentType.PACKING_SLIP);
        break;
      case 'generate_label':
        // Update fulfillment status for label generation
        setFulfillmentStatus(prev => ({
          ...prev,
          isLabeled: true,
          labeledAt: new Date().toISOString()
        }));
        
        // Generate shipping label
        handleGenerateDocument(DocumentType.SHIPPING_LABEL);
        break;
      case 'ship_order':
        // If there's no tracking yet, generate one
        if (!order.shippingInfo?.trackingId && !trackingNumber) {
          const generatedTrackingId = OrderProcessingService.generateTrackingId();
          setTrackingNumber(generatedTrackingId);
          await handleAddTracking();
        }
        
        // Update order status to shipped
        handleStatusUpdate('shipped');
        break;
      case 'deliver_order':
        // Update order status to delivered
        handleStatusUpdate('delivered');
        break;
    }
  };
  
  // Send notification to customer
  const sendNotification = async (type: NotificationType) => {
    setIsSendingNotification(true);
    
    try {
      await OrderProcessingService.sendNotification(
        type,
        order,
        { email: true, sms: true, whatsapp: true }
      );
      
      setNotificationSent(true);
      
      // Reset notification status after a while
      setTimeout(() => {
        setNotificationSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsSendingNotification(false);
    }
  };
  
  // Get the next step that needs to be completed
  const getNextStep = () => {
    const pendingStep = fulfillmentSteps.find(step => step.status === 'pending');
    const inProgressStep = fulfillmentSteps.find(step => step.status === 'in_progress');
    
    return inProgressStep || pendingStep;
  };
  
  // Determine if an action button should be disabled
  const isStepDisabled = (step: FulfillmentStep) => {
    const currentStep = getNextStep();
    
    // If there's no current step, all steps are complete
    if (!currentStep) return true;
    
    // If the current step is this step, it's not disabled
    if (currentStep.id === step.id) return false;
    
    // Otherwise, disable if this step is not the current one
    return true;
  };
  
  // Get shipping cost and delivery estimates
  const shippingCost = OrderProcessingService.calculateShipping(order, selectedShippingMethod);
  const deliveryEstimate = OrderProcessingService.calculateDeliveryEstimate(selectedShippingMethod);
  
  // Get status icon based on order status
  const getStatusIcon = (status: string) => {
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
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-8"
    >
      {/* Header with back button and order ID */}
      <div className="flex items-center mb-6">
        <button
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{t('orderDetails.title')}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            {t('orderDetails.orderId')}: #{order.id}
          </p>
        </div>
      </div>
      
      {/* Quick action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          className="btn-outline text-left flex items-center gap-3 p-4 h-auto"
          onClick={() => {
            handleGenerateDocument(DocumentType.INVOICE);
            setActiveTab('documents');
          }}
        >
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <span className="font-medium block">Generate Invoice</span>
            <span className="text-sm text-gray-500">Create a GST compliant invoice</span>
          </div>
        </button>
        
        <button
          className="btn-outline text-left flex items-center gap-3 p-4 h-auto"
          onClick={() => {
            setActiveTab('fulfillment');
          }}
        >
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Package size={24} />
          </div>
          <div>
            <span className="font-medium block">Process Order</span>
            <span className="text-sm text-gray-500">Pick, pack and ship this order</span>
          </div>
        </button>
        
        <button
          className="btn-outline text-left flex items-center gap-3 p-4 h-auto"
          onClick={() => sendNotification(NotificationType.ORDER_CONFIRMED)}
          disabled={isSendingNotification}
        >
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            {isSendingNotification ? <Loader size={24} className="animate-spin" /> : <Send size={24} />}
          </div>
          <div>
            <span className="font-medium block">
              {notificationSent ? 'Notification Sent!' : 'Send Update'}
            </span>
            <span className="text-sm text-gray-500">Notify the customer about their order</span>
          </div>
        </button>
      </div>
      
      {/* Tabs for order management */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm inline-flex items-center ${
                activeTab === 'details'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={18} className="mr-2" />
              Order Details
            </button>
            
            <button
              className={`py-4 px-6 font-medium text-sm inline-flex items-center ${
                activeTab === 'fulfillment'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('fulfillment')}
            >
              <Package size={18} className="mr-2" />
              Fulfillment
            </button>
            
            <button
              className={`py-4 px-6 font-medium text-sm inline-flex items-center ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              <Printer size={18} className="mr-2" />
              Documents
            </button>
          </nav>
        </div>
      </div>
      
      {/* Order details tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order summary, Customer info, and Payment info column */}
          <div className="md:col-span-2 space-y-6">
            {/* Order summary */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <ShoppingBag size={20} className="mr-2 text-gray-500" />
                  Order Summary
                </h2>
                <span className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              {item.variant && (
                                <div className="text-xs text-gray-500">
                                  {item.variant}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-500">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th colSpan={3} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                      </th>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax (18% GST)
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount * 0.18)}
                      </th>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shipping
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(40)}
                      </th>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-base font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Customer information */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <User size={20} className="mr-2 text-gray-500" />
                  {t('orderDetails.customerInfo')}
                </h2>
                <a 
                  href={`https://wa.me/${order.customerPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  <MessageCircle size={16} className="mr-1" />
                  Chat with Customer
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Name</h3>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Phone</h3>
                  <p className="font-medium flex items-center">
                    <Phone size={16} className="mr-1 text-gray-400" />
                    {order.customerPhone}
                  </p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm text-gray-500 mb-1">Shipping Address</h3>
                  <p className="font-medium flex items-start">
                    <Map size={16} className="mr-1 mt-1 text-gray-400 flex-shrink-0" />
                    <span>
                      {order.shippingAddress.name}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Payment information */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <CreditCard size={20} className="mr-2 text-gray-500" />
                  {t('orderDetails.paymentInfo')}
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.payment.status)}`}>
                  {order.payment.status === 'paid' && <CheckCircle size={16} />}
                  {order.payment.status === 'pending' && <Clock size={16} />}
                  {order.payment.status === 'failed' && <XCircle size={16} />}
                  <span>
                    {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Method</h3>
                  <p className="font-medium capitalize">{order.payment.method}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Amount</h3>
                  <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                </div>
                {order.payment.transactionId && (
                  <div className="col-span-2">
                    <h3 className="text-sm text-gray-500 mb-1">Transaction ID</h3>
                    <p className="font-medium font-mono text-sm">{order.payment.transactionId}</p>
                  </div>
                )}
                
                {order.payment.status === 'pending' && (
                  <div className="col-span-2 mt-2">
                    <button
                      className="btn-primary w-full"
                      onClick={() => handlePaymentStatusUpdate('paid')}
                      disabled={paymentStatusUpdating}
                    >
                      {paymentStatusUpdating ? (
                        <>
                          <Loader size={16} className="mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Banknote size={16} className="mr-2" />
                          Mark as Paid
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Shipping information */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Truck size={20} className="mr-2 text-gray-500" />
                    {t('orderDetails.shippingInfo')}
                  </h2>
                  {order.shippingInfo?.trackingId && (
                    <a 
                      href={order.shippingInfo.trackingUrl || `https://tracking.autodukaan.com/${order.shippingInfo.trackingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Track Package
                    </a>
                  )}
                </div>
                
                {order.shippingInfo?.trackingId ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm text-gray-500 mb-1">Carrier</h3>
                        <p className="font-medium">{order.shippingInfo.carrier || 'AutoDukaan Logistics'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 mb-1">Tracking ID</h3>
                        <p className="font-medium font-mono">{order.shippingInfo.trackingId}</p>
                      </div>
                    </div>
                    
                    {/* Tracking timeline */}
                    {order.shippingInfo.trackingUpdates && order.shippingInfo.trackingUpdates.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Tracking Updates</h3>
                        <div className="space-y-4">
                          {order.shippingInfo.trackingUpdates.map((update, index) => (
                            <div key={index} className="relative pl-8">
                              {/* Timeline connector */}
                              {index < order.shippingInfo!.trackingUpdates!.length - 1 && (
                                <div className="absolute left-3 top-3 h-full w-0.5 bg-gray-200"></div>
                              )}
                              
                              {/* Status dot */}
                              <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full flex items-center justify-center ${
                                update.status === 'delivered' 
                                  ? 'bg-green-500' 
                                  : update.status === 'shipped'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                              }`}>
                                {update.status === 'delivered' && <PackageCheck size={14} className="text-white" />}
                                {update.status === 'shipped' && <Truck size={14} className="text-white" />}
                                {update.status !== 'delivered' && update.status !== 'shipped' && <Package size={14} className="text-white" />}
                              </div>
                              
                              {/* Update details */}
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{update.status}</p>
                                <p className="text-sm text-gray-500">{update.description}</p>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <CalendarClock size={12} className="mr-1" />
                                  <span>{formatDate(update.timestamp)}</span>
                                  {update.location && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <Map size={12} className="mr-1" />
                                      <span>{update.location}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Estimated delivery */}
                    {order.status === 'shipped' && !order.status === 'delivered' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
                        <CalendarClock size={20} className="text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Estimated Delivery</p>
                          <p className="text-sm text-blue-600">
                            {new Date(fulfillmentStatus.estimatedDelivery || new Date()).toLocaleDateString(undefined, {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-sm">No tracking information available yet.</p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number..."
                          className="input pr-20 w-full"
                        />
                        <button
                          className="absolute right-2 px-3 py-1 bg-primary-500 text-white text-sm rounded"
                          onClick={handleAddTracking}
                          disabled={!trackingNumber || isAddingTracking}
                        >
                          {isAddingTracking ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            'Add'
                          )}
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Leave empty to automatically generate a tracking number when shipping.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Order status and actions column */}
          <div className="space-y-6">
            {/* Order timeline */}
            <div className="card">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <CalendarClock size={20} className="mr-2 text-gray-500" />
                {t('orderDetails.timeline')}
              </h2>
              
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={index} className="relative pl-8">
                    {/* Timeline connector */}
                    {index < timeline.length - 1 && (
                      <div className={`absolute left-3 top-3 h-full w-0.5 ${
                        event.isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                    
                    {/* Status dot */}
                    <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full flex items-center justify-center ${
                      event.isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                    }`}>
                      {event.isCompleted && <Check size={14} className="text-white" />}
                    </div>
                    
                    {/* Event details */}
                    <div>
                      <p className="font-medium text-gray-900">{event.status}</p>
                      <p className="text-sm text-gray-500">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order actions */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">
                {t('orderDetails.updateStatus')}
              </h2>
              
              <div className="space-y-3">
                {/* Pending to Confirmed */}
                {order.status === 'pending' && (
                  <button
                    className="btn-outline w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={orderStatusUpdating}
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Mark as Confirmed
                  </button>
                )}
                
                {/* Confirmed to Processing */}
                {order.status === 'confirmed' && (
                  <button
                    className="btn-outline w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => handleStatusUpdate('processing')}
                    disabled={orderStatusUpdating}
                  >
                    <Package size={18} className="mr-2" />
                    Mark as Processing
                  </button>
                )}
                
                {/* Processing to Shipped */}
                {order.status === 'processing' && (
                  <button
                    className="btn-outline w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => handleStatusUpdate('shipped')}
                    disabled={orderStatusUpdating}
                  >
                    <Truck size={18} className="mr-2" />
                    Mark as Shipped
                  </button>
                )}
                
                {/* Shipped to Delivered */}
                {order.status === 'shipped' && (
                  <button
                    className="btn-outline w-full text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={orderStatusUpdating}
                  >
                    <PackageCheck size={18} className="mr-2" />
                    Mark as Delivered
                  </button>
                )}
                
                {/* Cancel order (for any non-final status) */}
                {['pending', 'confirmed', 'processing'].includes(order.status) && (
                  <button
                    className="btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={orderStatusUpdating}
                  >
                    <XCircle size={18} className="mr-2" />
                    Cancel Order
                  </button>
                )}
                
                {/* Loading indicator */}
                {orderStatusUpdating && (
                  <div className="flex justify-center mt-2">
                    <RefreshCw size={20} className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes */}
            {order.notes && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">
                  Order Notes
                </h2>
                <p className="text-gray-600 text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Fulfillment tab */}
      {activeTab === 'fulfillment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fulfillment process column */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Order Fulfillment Process</h2>
              
              <div className="space-y-8">
                {fulfillmentSteps.map((step, index) => (
                  <div key={step.id} className="relative pl-10">
                    {/* Connector line */}
                    {index < fulfillmentSteps.length - 1 && (
                      <div className={`absolute left-5 top-8 h-full w-0.5 ${
                        step.status === 'completed' ? 'bg-primary-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                    
                    {/* Step icon */}
                    <div className={`absolute left-0 top-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-primary-500 text-white' 
                        : step.status === 'in_progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <Check size={20} />
                      ) : (
                        <step.icon size={20} />
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div className="pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${
                          step.status === 'completed' 
                            ? 'text-primary-600' 
                            : step.status === 'in_progress'
                              ? 'text-blue-600'
                              : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          step.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : step.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'completed' ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">{step.description}</p>
                      
                      {/* Special content for certain steps */}
                      {step.id === 'validate_inventory' && inventoryStatus.checked && !inventoryStatus.valid && (
                        <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <h4 className="text-sm font-medium text-red-800 mb-1">Inventory Issues</h4>
                          <ul className="space-y-1">
                            {inventoryStatus.issues?.map((issue, i) => (
                              <li key={i} className="text-sm text-red-600 flex items-center">
                                <AlertTriangle size={14} className="mr-1 flex-shrink-0" />
                                <span>
                                  {issue.name}: Requested {issue.requested}, only {issue.available} available
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Step action buttons */}
                      <div className="flex gap-2">
                        {step.status === 'in_progress' ? (
                          <button
                            className="btn-primary"
                            onClick={() => handleProcessStep(step)}
                            disabled={isStepDisabled(step)}
                          >
                            {step.id === 'validate_inventory' && isValidatingInventory ? (
                              <>
                                <RefreshCw size={16} className="mr-2 animate-spin" />
                                Checking Inventory...
                              </>
                            ) : (
                              <>Complete {step.title}</>
                            )}
                          </button>
                        ) : step.status === 'pending' && !isStepDisabled(step) ? (
                          <button
                            className="btn-primary"
                            onClick={() => handleProcessStep(step)}
                          >
                            {step.id === 'validate_inventory' ? 'Check Inventory' : `Start ${step.title}`}
                          </button>
                        ) : null}
                        
                        {/* Special buttons for certain steps */}
                        {step.id === 'generate_label' && step.status === 'completed' && (
                          <button
                            className="btn-outline"
                            onClick={() => handleGenerateDocument(DocumentType.SHIPPING_LABEL)}
                          >
                            <Printer size={16} className="mr-2" />
                            Print Label
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Shipping options and fulfillment summary column */}
          <div className="space-y-6">
            {/* Shipping method selector */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
              
              <div className="space-y-3">
                {Object.values(ShippingMethod).map((method) => (
                  <label key={method} className={`block border rounded-lg p-3 cursor-pointer ${
                    selectedShippingMethod === method 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        checked={selectedShippingMethod === method}
                        onChange={() => setSelectedShippingMethod(method)}
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-sm font-medium capitalize">
                          {method} Shipping
                        </span>
                        <span className="block text-sm text-gray-500">
                          {method === ShippingMethod.STANDARD ? '3-5 days' : 
                           method === ShippingMethod.EXPRESS ? '1-2 days' : 
                           'Today'}
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}
                      </div>
                    </div>
                  </label>
                ))}
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span>Estimated Delivery</span>
                    <span className="font-medium text-gray-900">
                      {deliveryEstimate.from.toLocaleDateString()} - {deliveryEstimate.to.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order snapshot */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-sm font-medium">{order.id}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Items</span>
                  <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Weight</span>
                  <span>~1.2 kg</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${
                    order.status === 'cancelled' 
                      ? 'text-red-600' 
                      : order.status === 'delivered'
                        ? 'text-green-600' 
                        : 'text-blue-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Payment</span>
                  <span className={`font-medium ${
                    order.payment.status === 'paid' 
                      ? 'text-green-600' 
                      : order.payment.status === 'failed'
                        ? 'text-red-600' 
                        : 'text-amber-600'
                  }`}>
                    {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  className="btn-outline w-full justify-between"
                  onClick={() => sendNotification(NotificationType.ORDER_CONFIRMED)}
                  disabled={isSendingNotification}
                >
                  <span className="flex items-center">
                    <Send size={16} className="mr-2" />
                    Send Order Confirmation
                  </span>
                  <ChevronRight size={16} />
                </button>
                
                <button
                  className="btn-outline w-full justify-between"
                  onClick={() => handleGenerateDocument(DocumentType.PACKING_SLIP)}
                >
                  <span className="flex items-center">
                    <Printer size={16} className="mr-2" />
                    Print Packing Slip
                  </span>
                  <ChevronRight size={16} />
                </button>
                
                <button
                  className="btn-outline w-full justify-between"
                  onClick={() => handleGenerateDocument(DocumentType.INVOICE)}
                >
                  <span className="flex items-center">
                    <FileText size={16} className="mr-2" />
                    Generate Invoice
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Documents tab */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Document preview */}
            {documentPreview ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {documentPreview.type === DocumentType.INVOICE ? 'Invoice' : 
                     documentPreview.type === DocumentType.SHIPPING_LABEL ? 'Shipping Label' : 
                     documentPreview.type === DocumentType.PACKING_SLIP ? 'Packing Slip' : 
                     'Document'} Preview
                  </h2>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={handleCloseDocumentPreview}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[600px] mb-4 border border-gray-200">
                  <div dangerouslySetInnerHTML={{ __html: documentPreview.content }} />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    className="btn-outline"
                    onClick={handleCloseDocumentPreview}
                  >
                    Close
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleDownloadDocument}
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="card h-full flex flex-col items-center justify-center py-12">
                <FileText size={60} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Selected</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Select a document type from the options on the right to generate and preview it.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Document types */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Generate Documents</h2>
              
              <div className="space-y-4">
                <button
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  onClick={() => handleGenerateDocument(DocumentType.INVOICE)}
                >
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded text-blue-600 mr-3">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Tax Invoice</h3>
                      <p className="text-sm text-gray-500">Generate a GST compliant tax invoice for this order</p>
                    </div>
                  </div>
                </button>
                
                <button
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  onClick={() => handleGenerateDocument(DocumentType.SHIPPING_LABEL)}
                >
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded text-green-600 mr-3">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Shipping Label</h3>
                      <p className="text-sm text-gray-500">Generate a printable shipping label for this order</p>
                    </div>
                  </div>
                </button>
                
                <button
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  onClick={() => handleGenerateDocument(DocumentType.PACKING_SLIP)}
                >
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded text-purple-600 mr-3">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Packing Slip</h3>
                      <p className="text-sm text-gray-500">Generate a packing slip for warehouse fulfillment</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Document history */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Document History</h2>
              
              <div className="py-3 text-center text-gray-500 text-sm">
                <p>No documents have been generated for this order yet.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state for document generation */}
      {isGeneratingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 flex flex-col items-center">
            <RefreshCw size={40} className="text-primary-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">Generating Document</h3>
            <p className="text-gray-500 text-center mb-4">
              Please wait while we generate your {
                isGeneratingDocument === DocumentType.INVOICE ? 'invoice' :
                isGeneratingDocument === DocumentType.SHIPPING_LABEL ? 'shipping label' :
                isGeneratingDocument === DocumentType.PACKING_SLIP ? 'packing slip' :
                'document'
              }...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Mock Box component for missing imports
const Box: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <Package size={size} className={className} />
);

const MapPin: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <Map size={size} className={className} />
);

export default EnhancedOrderDetail;