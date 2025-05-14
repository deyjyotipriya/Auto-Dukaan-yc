import React, { useState, useEffect } from 'react';

interface OrderHistoryProps {
  buyerId: string;
}

// Order interface
interface Order {
  id: string;
  order_id: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  items: OrderItem[];
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  delivery_date?: string;
  tracking_info?: {
    courier: string;
    tracking_number: string;
    tracking_url: string;
    current_status: string;
    current_location?: string;
    estimated_delivery?: string;
    tracking_events?: TrackingEvent[];
  };
}

// Order item interface
interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  variant?: string;
}

// Tracking event interface
interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ buyerId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Mock data for orders (in a real app, this would come from an API)
  const mockOrders: Order[] = [
    {
      id: 'order1',
      order_id: 'ORDER-12345',
      seller: {
        id: 'seller1',
        name: 'Ganesh Electronics',
        avatar: 'GE'
      },
      items: [
        {
          id: 'item1',
          product_id: 'prod1',
          name: 'Bluetooth Headphones',
          price: 1499,
          quantity: 1,
          image_url: 'https://via.placeholder.com/100'
        }
      ],
      status: 'Delivered',
      payment_status: 'Paid',
      payment_method: 'UPI',
      total_amount: 1499,
      created_at: '2023-05-10T10:00:00Z',
      updated_at: '2023-05-12T15:30:00Z',
      delivery_date: '2023-05-12T15:30:00Z',
      tracking_info: {
        courier: 'Express Delivery',
        tracking_number: 'TRK123456789',
        tracking_url: 'https://example.com/track/TRK123456789',
        current_status: 'Delivered',
        current_location: 'Mumbai',
        estimated_delivery: '2023-05-12T15:00:00Z',
        tracking_events: [
          {
            id: 'event1',
            status: 'Order Placed',
            location: 'Online',
            timestamp: '2023-05-10T10:00:00Z',
            description: 'Your order has been placed'
          },
          {
            id: 'event2',
            status: 'Order Processed',
            location: 'Seller Warehouse',
            timestamp: '2023-05-10T14:00:00Z',
            description: 'Your order has been processed and packed'
          },
          {
            id: 'event3',
            status: 'Shipped',
            location: 'Delhi',
            timestamp: '2023-05-11T09:00:00Z',
            description: 'Your order has been shipped'
          },
          {
            id: 'event4',
            status: 'In Transit',
            location: 'Mumbai Hub',
            timestamp: '2023-05-11T18:00:00Z',
            description: 'Your order is in transit to the delivery location'
          },
          {
            id: 'event5',
            status: 'Out for Delivery',
            location: 'Mumbai',
            timestamp: '2023-05-12T09:00:00Z',
            description: 'Your order is out for delivery'
          },
          {
            id: 'event6',
            status: 'Delivered',
            location: 'Mumbai',
            timestamp: '2023-05-12T15:30:00Z',
            description: 'Your order has been delivered'
          }
        ]
      }
    },
    {
      id: 'order2',
      order_id: 'ORDER-12346',
      seller: {
        id: 'seller2',
        name: 'Ananya Fashion',
        avatar: 'AF'
      },
      items: [
        {
          id: 'item2',
          product_id: 'prod2',
          name: 'Cotton Saree',
          price: 2499,
          quantity: 1,
          image_url: 'https://via.placeholder.com/100',
          variant: 'Blue'
        }
      ],
      status: 'In Transit',
      payment_status: 'Paid',
      payment_method: 'UPI',
      total_amount: 2499,
      created_at: '2023-05-11T11:00:00Z',
      updated_at: '2023-05-11T16:00:00Z',
      tracking_info: {
        courier: 'Fast Track Logistics',
        tracking_number: 'TRK987654321',
        tracking_url: 'https://example.com/track/TRK987654321',
        current_status: 'In Transit',
        current_location: 'Delhi Hub',
        estimated_delivery: '2023-05-14T18:00:00Z',
        tracking_events: [
          {
            id: 'event7',
            status: 'Order Placed',
            location: 'Online',
            timestamp: '2023-05-11T11:00:00Z',
            description: 'Your order has been placed'
          },
          {
            id: 'event8',
            status: 'Order Processed',
            location: 'Seller Warehouse',
            timestamp: '2023-05-11T15:00:00Z',
            description: 'Your order has been processed and packed'
          },
          {
            id: 'event9',
            status: 'Shipped',
            location: 'Delhi',
            timestamp: '2023-05-11T16:00:00Z',
            description: 'Your order has been shipped'
          },
          {
            id: 'event10',
            status: 'In Transit',
            location: 'Delhi Hub',
            timestamp: '2023-05-12T10:00:00Z',
            description: 'Your order is in transit to the delivery location'
          }
        ]
      }
    },
    {
      id: 'order3',
      order_id: 'ORDER-12347',
      seller: {
        id: 'seller3',
        name: 'Mumbai Spices',
        avatar: 'MS'
      },
      items: [
        {
          id: 'item3',
          product_id: 'prod3',
          name: 'Premium Spice Set',
          price: 999,
          quantity: 1,
          image_url: 'https://via.placeholder.com/100'
        }
      ],
      status: 'Processing',
      payment_status: 'Paid',
      payment_method: 'Card',
      total_amount: 999,
      created_at: '2023-05-12T09:30:00Z',
      updated_at: '2023-05-12T10:00:00Z'
    }
  ];

  // Load orders
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, [buyerId]);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format price to currency
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Filter orders based on activeFilter
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status.toLowerCase() === activeFilter.toLowerCase();
  }).filter(order => {
    if (!searchQuery) return true;
    return (
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show tracking details modal
  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeFilter === 'processing'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('processing')}
          >
            Processing
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeFilter === 'in transit'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('in transit')}
          >
            In Transit
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeFilter === 'delivered'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('delivered')}
          >
            Delivered
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery 
              ? `No orders matching "${searchQuery}"`
              : activeFilter !== 'all'
                ? `You don't have any ${activeFilter} orders yet.`
                : "You haven't placed any orders yet."}
          </p>
          {searchQuery && (
            <button
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">{order.order_id}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Ordered on {formatDate(order.created_at)} • {order.payment_method}
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  {order.status === 'Delivered' && (
                    <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Buy Again
                    </button>
                  )}
                  {(order.status === 'In Transit' || order.status === 'Shipped') && order.tracking_info && (
                    <button 
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleTrackOrder(order)}
                    >
                      Track Order
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    View Details
                  </button>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {order.seller.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.seller.name}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Contact Seller</button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            {item.variant && (
                              <p className="text-xs text-gray-500">Variant: {item.variant}</p>
                            )}
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Total: {formatPrice(order.total_amount)}</p>
                  <p className="text-gray-500">Payment: {order.payment_status}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  {order.status === 'Processing' && (
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Cancel Order
                    </button>
                  )}
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Need Help?
                  </button>
                  {order.status === 'Delivered' && (
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && selectedOrder.tracking_info && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowTrackingModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Track Your Order</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowTrackingModal(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-lg font-semibold">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.tracking_info.current_status)}`}>
                      {selectedOrder.tracking_info.current_status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-start mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Courier</p>
                    <p className="font-medium">{selectedOrder.tracking_info.courier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium">{selectedOrder.tracking_info.tracking_number}</p>
                  </div>
                </div>
                {selectedOrder.tracking_info.estimated_delivery && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.tracking_info.estimated_delivery)}
                    </p>
                  </div>
                )}
              </div>

              {/* Tracking Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Tracking Updates</h4>
                <div className="space-y-6">
                  {selectedOrder.tracking_info.tracking_events?.map((event, index) => (
                    <div key={event.id} className="relative flex items-start">
                      <div className="flex items-center h-full">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                          {index === 0 ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        {index < (selectedOrder.tracking_info.tracking_events?.length || 0) - 1 && (
                          <div className="w-0.5 bg-blue-300 h-full absolute left-3 top-6"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-900">{event.status}</h5>
                        <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        <div className="flex space-x-2 mt-1 text-xs text-gray-500">
                          <span>{formatDate(event.timestamp)}</span>
                          <span>•</span>
                          <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <a 
                href={selectedOrder.tracking_info.tracking_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Track on Courier Website
              </a>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowTrackingModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;