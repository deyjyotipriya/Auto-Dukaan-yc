import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'upi' | 'cod' | 'card' | 'bank_transfer';

export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface TrackingUpdate {
  status: string;
  location?: string;
  timestamp: string;
  description?: string;
}

export interface ShippingInfo {
  trackingId: string;
  carrier: string;
  trackingUrl?: string;
  trackingUpdates?: TrackingUpdate[];
}

export interface PaymentInfo {
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  payment: PaymentInfo;
  shippingAddress: ShippingAddress;
  shippingInfo?: ShippingInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [
    {
      id: 'ORD123456',
      customerId: 'CUST1',
      customerName: 'Anjali Sharma',
      customerPhone: '+91 98765 43210',
      items: [
        {
          productId: '3',
          name: 'Handwoven Saree',
          image: 'https://images.pexels.com/photos/12592595/pexels-photo-12592595.jpeg',
          quantity: 1,
          price: 1499,
          variant: 'Red'
        }
      ],
      totalAmount: 1499,
      status: 'confirmed',
      payment: {
        status: 'paid',
        method: 'upi',
        transactionId: 'TXN98765432',
        updatedAt: '2023-06-15T09:15:00Z'
      },
      shippingAddress: {
        name: 'Anjali Sharma',
        phone: '+91 98765 43210',
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      },
      createdAt: '2023-06-15T08:30:00Z',
      updatedAt: '2023-06-15T09:15:00Z'
    },
    {
      id: 'ORD123457',
      customerId: 'CUST2',
      customerName: 'Rahul Verma',
      customerPhone: '+91 87654 32109',
      items: [
        {
          productId: '1',
          name: 'Cotton Kurti',
          image: 'https://images.pexels.com/photos/4956771/pexels-photo-4956771.jpeg',
          quantity: 2,
          price: 599,
          variant: 'M / Blue'
        },
        {
          productId: '2',
          name: 'Handmade Jhumkas',
          image: 'https://images.pexels.com/photos/13992207/pexels-photo-13992207.jpeg',
          quantity: 1,
          price: 299
        }
      ],
      totalAmount: 1497,
      status: 'processing',
      payment: {
        status: 'paid',
        method: 'upi',
        transactionId: 'TXN87654321',
        updatedAt: '2023-06-16T14:30:00Z'
      },
      shippingAddress: {
        name: 'Rahul Verma',
        phone: '+91 87654 32109',
        street: '456 Gandhi Road',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
      },
      createdAt: '2023-06-16T14:20:00Z',
      updatedAt: '2023-06-16T15:10:00Z'
    },
    {
      id: 'ORD123458',
      customerId: 'CUST3',
      customerName: 'Priya Patel',
      customerPhone: '+91 76543 21098',
      items: [
        {
          productId: '4',
          name: 'Silver Anklet',
          image: 'https://images.pexels.com/photos/10605196/pexels-photo-10605196.jpeg',
          quantity: 1,
          price: 399
        }
      ],
      totalAmount: 399,
      status: 'pending',
      payment: {
        status: 'pending',
        method: 'cod'
      },
      shippingAddress: {
        name: 'Priya Patel',
        phone: '+91 76543 21098',
        street: '789 Nehru Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      createdAt: '2023-06-17T09:45:00Z',
      updatedAt: '2023-06-17T09:45:00Z'
    },
    {
      id: 'ORD123459',
      customerId: 'CUST4',
      customerName: 'Vikram Singh',
      customerPhone: '+91 65432 10987',
      items: [
        {
          productId: '5',
          name: 'Handcrafted Lamp',
          image: 'https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg',
          quantity: 1,
          price: 899
        },
        {
          productId: '6',
          name: 'Wooden Coasters (Set of 4)',
          image: 'https://images.pexels.com/photos/6152103/pexels-photo-6152103.jpeg',
          quantity: 2,
          price: 349
        }
      ],
      totalAmount: 1597,
      status: 'shipped',
      payment: {
        status: 'paid',
        method: 'card',
        transactionId: 'TXN76543210',
        updatedAt: '2023-06-18T10:15:00Z'
      },
      shippingAddress: {
        name: 'Vikram Singh',
        phone: '+91 65432 10987',
        street: '321 Tagore Lane',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001'
      },
      shippingInfo: {
        trackingId: 'ADTK123456789',
        carrier: 'AutoDukaan Logistics',
        trackingUrl: 'https://tracking.autodukaan.com/ADTK123456789',
        trackingUpdates: [
          {
            status: 'processing',
            location: 'Jaipur Sorting Center',
            timestamp: '2023-06-19T09:30:00Z',
            description: 'Package received at sorting center'
          },
          {
            status: 'shipped',
            location: 'Jaipur Distribution Center',
            timestamp: '2023-06-19T14:20:00Z',
            description: 'Package has been shipped'
          }
        ]
      },
      createdAt: '2023-06-18T10:00:00Z',
      updatedAt: '2023-06-19T14:20:00Z'
    },
    {
      id: 'ORD123460',
      customerId: 'CUST5',
      customerName: 'Meera Iyer',
      customerPhone: '+91 54321 09876',
      items: [
        {
          productId: '7',
          name: 'Silk Scarf',
          image: 'https://images.pexels.com/photos/6765164/pexels-photo-6765164.jpeg',
          quantity: 1,
          price: 599,
          variant: 'Blue Floral'
        }
      ],
      totalAmount: 599,
      status: 'delivered',
      payment: {
        status: 'paid',
        method: 'upi',
        transactionId: 'TXN65432109',
        updatedAt: '2023-06-14T16:45:00Z'
      },
      shippingAddress: {
        name: 'Meera Iyer',
        phone: '+91 54321 09876',
        street: '567 Bose Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001'
      },
      shippingInfo: {
        trackingId: 'ADTK987654321',
        carrier: 'AutoDukaan Logistics',
        trackingUrl: 'https://tracking.autodukaan.com/ADTK987654321',
        trackingUpdates: [
          {
            status: 'processing',
            location: 'Chennai Sorting Center',
            timestamp: '2023-06-14T18:30:00Z',
            description: 'Package received at sorting center'
          },
          {
            status: 'shipped',
            location: 'Chennai Distribution Center',
            timestamp: '2023-06-15T09:15:00Z',
            description: 'Package has been shipped'
          },
          {
            status: 'out_for_delivery',
            location: 'Chennai',
            timestamp: '2023-06-16T08:30:00Z',
            description: 'Package out for delivery'
          },
          {
            status: 'delivered',
            location: 'Chennai',
            timestamp: '2023-06-16T14:20:00Z',
            description: 'Package has been delivered'
          }
        ]
      },
      createdAt: '2023-06-14T16:30:00Z',
      updatedAt: '2023-06-16T14:20:00Z'
    }
  ],
  loading: false,
  error: null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newOrder: Order = {
        ...action.payload,
        id: `ORD${Math.floor(Math.random() * 900000) + 100000}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.orders.push(newOrder);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = new Date().toISOString();
      }
    },
    updatePaymentStatus: (state, action: PayloadAction<{ id: string; status: PaymentStatus }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.payment.status = action.payload.status;
        order.payment.updatedAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
      }
    },
    updatePaymentMethod: (state, action: PayloadAction<{ id: string; method: PaymentMethod; transactionId?: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.payment.method = action.payload.method;
        if (action.payload.transactionId) {
          order.payment.transactionId = action.payload.transactionId;
        }
        order.payment.updatedAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
      }
    },
    addTrackingInfo: (state, action: PayloadAction<{
      id: string;
      trackingId: string;
      carrier: string;
      trackingUrl?: string;
      trackingUpdates?: TrackingUpdate[];
    }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.shippingInfo = {
          trackingId: action.payload.trackingId,
          carrier: action.payload.carrier,
          trackingUrl: action.payload.trackingUrl,
          trackingUpdates: action.payload.trackingUpdates || []
        };
        order.updatedAt = new Date().toISOString();
      }
    },
    addTrackingUpdate: (state, action: PayloadAction<{
      id: string;
      update: TrackingUpdate;
    }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order && order.shippingInfo) {
        if (!order.shippingInfo.trackingUpdates) {
          order.shippingInfo.trackingUpdates = [];
        }
        order.shippingInfo.trackingUpdates.push(action.payload.update);
        order.updatedAt = new Date().toISOString();
      }
    },
    updateOrderNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.notes = action.payload.notes;
        order.updatedAt = new Date().toISOString();
      }
    },
    // Create an order from chat conversation
    createOrderFromChat: (state, action: PayloadAction<{
      customerId: string;
      customerName: string;
      customerPhone: string;
      items: OrderItem[];
      shippingAddress: ShippingAddress;
    }>) => {
      const { customerId, customerName, customerPhone, items, shippingAddress } = action.payload;
      
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const newOrder: Order = {
        id: `ORD${Math.floor(Math.random() * 900000) + 100000}`,
        customerId,
        customerName,
        customerPhone,
        items,
        totalAmount,
        status: 'pending',
        payment: {
          status: 'pending',
          method: 'cod'
        },
        shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      state.orders.push(newOrder);
    }
  },
});

export const { 
  addOrder, 
  updateOrderStatus, 
  updatePaymentStatus, 
  updatePaymentMethod,
  addTrackingInfo,
  addTrackingUpdate,
  updateOrderNotes,
  createOrderFromChat
} = ordersSlice.actions;

export const selectAllOrders = (state: RootState) => state.orders.orders;
export const selectOrderById = (id: string) => (state: RootState) => 
  state.orders.orders.find(order => order.id === id);
export const selectOrdersByStatus = (status: OrderStatus) => (state: RootState) => 
  state.orders.orders.filter(order => order.status === status);
export const selectOrdersByCustomerId = (customerId: string) => (state: RootState) => 
  state.orders.orders.filter(order => order.customerId === customerId);
export const selectRecentOrders = (state: RootState) => 
  [...state.orders.orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
export const selectOrderStats = (state: RootState) => {
  const orders = state.orders.orders;
  
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.payment.status === 'paid' ? order.totalAmount : 0), 0),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
      : 0
  };
};

export default ordersSlice.reducer;