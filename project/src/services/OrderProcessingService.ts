// OrderProcessingService.ts
// Handles order lifecycle management from receipt to fulfillment

import { Order, OrderItem, PaymentStatus, OrderStatus } from '../store/slices/ordersSlice';
import { Product } from '../store/slices/productsSlice';

// Available shipping methods
export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day'
}

// Shipping rates
const SHIPPING_RATES = {
  [ShippingMethod.STANDARD]: 40,
  [ShippingMethod.EXPRESS]: 120,
  [ShippingMethod.SAME_DAY]: 200
};

// Shipping time estimates (in days)
const SHIPPING_TIMES = {
  [ShippingMethod.STANDARD]: { min: 3, max: 5 },
  [ShippingMethod.EXPRESS]: { min: 1, max: 2 },
  [ShippingMethod.SAME_DAY]: { min: 0, max: 0 }
};

// Webhook notification types
export enum NotificationType {
  ORDER_CREATED = 'order_created',
  PAYMENT_RECEIVED = 'payment_received',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_PROCESSING = 'order_processing',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled'
}

// Document types
export enum DocumentType {
  INVOICE = 'invoice',
  SHIPPING_LABEL = 'shipping_label',
  PACKING_SLIP = 'packing_slip',
  RETURN_LABEL = 'return_label'
}

// Customer notification preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

// Order fulfillment status
export interface FulfillmentStatus {
  isPicked: boolean;
  isPacked: boolean;
  isLabeled: boolean;
  isShipped: boolean;
  isDelivered: boolean;
  pickedAt?: string;
  packedAt?: string;
  labeledAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
}

// Order Processing Service
export class OrderProcessingService {
  // Calculate shipping costs based on order and selected shipping method
  static calculateShipping(order: Order, method: ShippingMethod): number {
    // Base shipping cost
    let shippingCost = SHIPPING_RATES[method];
    
    // Adjust for weight/size if necessary
    // This is a placeholder for more complex shipping calculations
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 5) {
      shippingCost += 30; // Extra fee for large orders
    }
    
    // Free shipping for orders above a threshold
    if (order.totalAmount > 2000) {
      return 0;
    }
    
    return shippingCost;
  }
  
  // Calculate delivery estimate based on shipping method
  static calculateDeliveryEstimate(method: ShippingMethod): { from: Date; to: Date } {
    const now = new Date();
    
    const fromDays = SHIPPING_TIMES[method].min;
    const toDays = SHIPPING_TIMES[method].max;
    
    const from = new Date(now);
    from.setDate(from.getDate() + fromDays);
    
    const to = new Date(now);
    to.setDate(to.getDate() + toDays);
    
    return { from, to };
  }
  
  // Check if all items in the order are in stock
  static checkInventory(order: OrderItem[], products: Product[]): { 
    inStock: boolean; 
    outOfStockItems: { id: string; name: string; requested: number; available: number }[]
  } {
    const outOfStockItems = [];
    
    for (const orderItem of order) {
      const product = products.find(p => p.id === orderItem.productId);
      
      if (!product) {
        outOfStockItems.push({
          id: orderItem.productId,
          name: orderItem.name,
          requested: orderItem.quantity,
          available: 0
        });
        continue;
      }
      
      if (product.stock < orderItem.quantity) {
        outOfStockItems.push({
          id: product.id,
          name: product.name,
          requested: orderItem.quantity,
          available: product.stock
        });
      }
    }
    
    return {
      inStock: outOfStockItems.length === 0,
      outOfStockItems
    };
  }
  
  // Generate order timeline based on status and timestamps
  static generateOrderTimeline(order: Order): {
    status: string;
    date: string;
    description: string;
    isCompleted: boolean;
  }[] {
    const timeline = [
      {
        status: 'Order Placed',
        date: order.createdAt,
        description: 'Your order has been received',
        isCompleted: true
      }
    ];
    
    // Payment status
    if (order.payment.status === 'paid') {
      timeline.push({
        status: 'Payment Confirmed',
        date: order.payment.updatedAt || order.createdAt,
        description: `Payment of ₹${order.totalAmount} received via ${order.payment.method}`,
        isCompleted: true
      });
    } else if (order.payment.status === 'pending') {
      timeline.push({
        status: 'Payment Pending',
        date: order.createdAt,
        description: `Waiting for payment of ₹${order.totalAmount}`,
        isCompleted: false
      });
    }
    
    // Order processing stages
    const statusCompletionMap: Record<OrderStatus, boolean> = {
      pending: false,
      confirmed: order.status === 'confirmed' || ['processing', 'shipped', 'delivered'].includes(order.status),
      processing: order.status === 'processing' || ['shipped', 'delivered'].includes(order.status),
      shipped: order.status === 'shipped' || order.status === 'delivered',
      delivered: order.status === 'delivered',
      cancelled: order.status === 'cancelled'
    };
    
    if (order.status !== 'cancelled' && order.status !== 'pending') {
      timeline.push({
        status: 'Order Confirmed',
        date: order.updatedAt || new Date(new Date(order.createdAt).getTime() + 30 * 60000).toISOString(),
        description: 'Your order has been confirmed and is being prepared',
        isCompleted: statusCompletionMap.confirmed
      });
      
      if (statusCompletionMap.confirmed) {
        timeline.push({
          status: 'Order Processing',
          date: order.updatedAt || new Date(new Date(order.createdAt).getTime() + 6 * 3600000).toISOString(),
          description: 'Your order is being processed and packed',
          isCompleted: statusCompletionMap.processing
        });
      }
      
      if (statusCompletionMap.processing) {
        timeline.push({
          status: 'Order Shipped',
          date: order.shippingInfo?.trackingUpdates?.find(u => u.status === 'shipped')?.timestamp || 
                 new Date(new Date(order.createdAt).getTime() + 24 * 3600000).toISOString(),
          description: order.shippingInfo?.trackingId 
            ? `Your order has been shipped. Tracking ID: ${order.shippingInfo.trackingId}`
            : 'Your order has been shipped',
          isCompleted: statusCompletionMap.shipped
        });
      }
      
      if (statusCompletionMap.shipped) {
        timeline.push({
          status: 'Order Delivered',
          date: order.shippingInfo?.trackingUpdates?.find(u => u.status === 'delivered')?.timestamp || 
                 new Date(new Date(order.createdAt).getTime() + 4 * 24 * 3600000).toISOString(),
          description: 'Your order has been delivered',
          isCompleted: statusCompletionMap.delivered
        });
      }
    }
    
    if (order.status === 'cancelled') {
      timeline.push({
        status: 'Order Cancelled',
        date: order.updatedAt || new Date().toISOString(),
        description: order.notes || 'Order was cancelled',
        isCompleted: true
      });
    }
    
    return timeline;
  }
  
  // Generate notification content for various order events
  static generateNotificationContent(
    notificationType: NotificationType,
    order: Order,
    lang: string = 'en'
  ): { subject: string; body: string } {
    // Simple notification templates (could be moved to i18n)
    const templates: Record<
      NotificationType, 
      Record<string, { subject: string; body: string }>
    > = {
      [NotificationType.ORDER_CREATED]: {
        en: {
          subject: 'New Order Received',
          body: `Thank you for your order #${order.id}. We've received your order and are processing it now.`
        },
        hi: {
          subject: 'नया ऑर्डर प्राप्त हुआ',
          body: `आपके ऑर्डर #${order.id} के लिए धन्यवाद। हमें आपका ऑर्डर मिल गया है और हम इसे प्रोसेस कर रहे हैं।`
        }
      },
      [NotificationType.PAYMENT_RECEIVED]: {
        en: {
          subject: 'Payment Received',
          body: `We've received your payment of ₹${order.totalAmount} for order #${order.id}.`
        },
        hi: {
          subject: 'भुगतान प्राप्त हुआ',
          body: `हमें आपके ऑर्डर #${order.id} के लिए ₹${order.totalAmount} का भुगतान प्राप्त हुआ है।`
        }
      },
      [NotificationType.ORDER_CONFIRMED]: {
        en: {
          subject: 'Order Confirmed',
          body: `Good news! Your order #${order.id} has been confirmed and is being prepared for shipping.`
        },
        hi: {
          subject: 'ऑर्डर की पुष्टि हुई',
          body: `अच्छी खबर! आपका ऑर्डर #${order.id} कन्फर्म हो गया है और शिपिंग के लिए तैयार किया जा रहा है।`
        }
      },
      [NotificationType.ORDER_PROCESSING]: {
        en: {
          subject: 'Order Processing',
          body: `We're now processing your order #${order.id}. We'll notify you once it ships.`
        },
        hi: {
          subject: 'ऑर्डर प्रोसेसिंग',
          body: `हम अब आपका ऑर्डर #${order.id} प्रोसेस कर रहे हैं। जब यह शिप होगा, तब हम आपको सूचित करेंगे।`
        }
      },
      [NotificationType.ORDER_SHIPPED]: {
        en: {
          subject: 'Order Shipped',
          body: `Your order #${order.id} has been shipped! ${
            order.shippingInfo?.trackingId 
              ? `Track your package with tracking ID: ${order.shippingInfo.trackingId}` 
              : ''
          }`
        },
        hi: {
          subject: 'ऑर्डर शिप हो गया',
          body: `आपका ऑर्डर #${order.id} शिप हो गया है! ${
            order.shippingInfo?.trackingId 
              ? `ट्रैकिंग आईडी के साथ अपने पैकेज को ट्रैक करें: ${order.shippingInfo.trackingId}` 
              : ''
          }`
        }
      },
      [NotificationType.ORDER_DELIVERED]: {
        en: {
          subject: 'Order Delivered',
          body: `Your order #${order.id} has been delivered! We hope you enjoy your purchase.`
        },
        hi: {
          subject: 'ऑर्डर डिलीवर हो गया',
          body: `आपका ऑर्डर #${order.id} डिलीवर हो गया है! हमें आशा है कि आप अपनी खरीदारी का आनंद लेंगे।`
        }
      },
      [NotificationType.ORDER_CANCELLED]: {
        en: {
          subject: 'Order Cancelled',
          body: `Your order #${order.id} has been cancelled. ${order.notes ? `Reason: ${order.notes}` : ''}`
        },
        hi: {
          subject: 'ऑर्डर रद्द हो गया',
          body: `आपका ऑर्डर #${order.id} रद्द कर दिया गया है। ${order.notes ? `कारण: ${order.notes}` : ''}`
        }
      }
    };
    
    // Default to English if requested language not available
    const language = templates[notificationType][lang] ? lang : 'en';
    
    return templates[notificationType][language];
  }
  
  // Generate a shipping label for the order
  static generateShippingLabel(order: Order): string {
    // This would normally generate a PDF, but for now we'll return HTML
    const shippingHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; border: 2px solid #000; padding: 20px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0;">SHIPPING LABEL</h2>
          <p style="margin: 5px 0;">Auto-Dukaan Marketplace</p>
        </div>
        
        <div style="display: flex; margin-bottom: 20px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 5px 0; font-size: 12px;">FROM:</h3>
            <p style="margin: 0; font-size: 14px;">
              Seller Name<br>
              Auto-Dukaan Seller<br>
              123 Seller Street<br>
              Mumbai, Maharashtra<br>
              India - 400001
            </p>
          </div>
          
          <div style="flex: 1;">
            <h3 style="margin: 0 0 5px 0; font-size: 12px;">TO:</h3>
            <p style="margin: 0; font-size: 14px;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
              India - ${order.shippingAddress.pincode}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>
        </div>
        
        <div style="border: 1px solid #000; padding: 10px; text-align: center; margin-bottom: 15px;">
          <h1 style="margin: 0; font-size: 20px;">Order #${order.id}</h1>
          ${order.shippingInfo?.trackingId ? `<p style="margin: 5px 0;">Tracking: ${order.shippingInfo.trackingId}</p>` : ''}
        </div>
        
        <div style="text-align: center;">
          <svg id="barcode"></svg>
          <p style="font-size: 12px; margin-top: 10px;">This shipping label was generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    return shippingHTML;
  }
  
  // Generate an invoice for the order
  static generateInvoice(order: Order): string {
    // Calculate subtotal and taxes
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const shippingCost = order.totalAmount - subtotal - taxAmount;
    
    // This would normally generate a PDF, but for now we'll return HTML
    const invoiceHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h1 style="margin: 0;">INVOICE</h1>
            <p>Auto-Dukaan Marketplace</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #666;">Invoice #INV-${order.id}</h2>
            <p style="margin: 5px 0;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="display: flex; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0;">Seller:</h3>
            <p style="margin: 0;">
              Seller Name<br>
              Auto-Dukaan Seller<br>
              GSTIN: 27AABCT1234Z1ZT<br>
              Phone: +91 9XXXXXXXXX<br>
              Email: seller@example.com
            </p>
          </div>
          
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0;">Bill To:</h3>
            <p style="margin: 0;">
              ${order.customerName}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
              Phone: ${order.customerPhone}
            </p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  ${item.name}
                  ${item.variant ? `<br><span style="font-size: 12px; color: #666;">${item.variant}</span>` : ''}
                </td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-left: auto; width: 300px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>GST (18%):</span>
            <span>₹${taxAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Shipping:</span>
            <span>₹${shippingCost.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #ddd; font-weight: bold;">
            <span>Total:</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    `;
    
    return invoiceHTML;
  }
  
  // Generate a packing slip for the order
  static generatePackingSlip(order: Order): string {
    // This would normally generate a PDF, but for now we'll return HTML
    const packingSlipHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0;">PACKING SLIP</h1>
          <p>Order #${order.id}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style="display: flex; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0;">Ship To:</h3>
            <p style="margin: 0;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
              ${order.shippingAddress.pincode}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Check</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  ${item.name}
                  ${item.variant ? `<br><span style="font-size: 12px; color: #666;">${item.variant}</span>` : ''}
                </td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">
                  <div style="width: 20px; height: 20px; border: 1px solid #000; margin: 0 auto;"></div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px;">
          <h3>Notes:</h3>
          <p>${order.notes || 'No special instructions.'}</p>
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px;">
          <p>This is a packing slip only. No price information is included.</p>
        </div>
      </div>
    `;
    
    return packingSlipHTML;
  }
  
  // Send a notification (email, SMS, WhatsApp) about an order event
  static sendNotification(
    notificationType: NotificationType,
    order: Order,
    preferences: NotificationPreferences,
    lang: string = 'en'
  ): Promise<boolean> {
    // This would normally connect to a notification service
    // For demo purposes, we'll just simulate success
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Notification sent: ${notificationType}`);
        resolve(true);
      }, 500);
    });
  }
  
  // Updates product inventory based on order
  static updateInventory(order: OrderItem[], shouldRestock: boolean = false): Promise<boolean> {
    // This would normally update the inventory in the database
    // For demo purposes, we'll just simulate success
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Inventory ${shouldRestock ? 'restocked' : 'updated'} for order items`);
        resolve(true);
      }, 500);
    });
  }
  
  // Process a payment for an order
  static processPayment(
    order: Order, 
    paymentDetails: { method: string; transactionId?: string }
  ): Promise<{ success: boolean; transactionId?: string; errorMessage?: string }> {
    // This would normally connect to a payment gateway
    // For demo purposes, we'll just simulate a payment process
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate 95% success rate
        const isSuccessful = Math.random() < 0.95;
        
        if (isSuccessful) {
          resolve({
            success: true,
            transactionId: paymentDetails.transactionId || `txn_${Date.now()}`
          });
        } else {
          resolve({
            success: false,
            errorMessage: 'Payment failed. Please try again.'
          });
        }
      }, 1500);
    });
  }
  
  // Generate a unique tracking ID for an order
  static generateTrackingId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let trackingId = 'AD';
    
    for (let i = 0; i < 10; i++) {
      trackingId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return trackingId;
  }
  
  // Estimated delivery date based on shipping method and location
  static estimateDeliveryDate(
    order: Order,
    shippingMethod: ShippingMethod
  ): { min: Date; max: Date } {
    const now = new Date();
    const { min, max } = SHIPPING_TIMES[shippingMethod];
    
    // Adjust for weekends and remote locations
    let additionalDays = 0;
    
    // Check if delivery location is in a metro city
    const metroCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
    if (!metroCities.some(city => 
      order.shippingAddress.city.toLowerCase().includes(city.toLowerCase())
    )) {
      additionalDays += 1; // Add a day for non-metro cities
    }
    
    const minDate = new Date(now);
    minDate.setDate(minDate.getDate() + min + additionalDays);
    
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + max + additionalDays);
    
    return { min: minDate, max: maxDate };
  }
}

export default OrderProcessingService;