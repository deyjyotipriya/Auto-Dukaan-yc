# Mock API Server for Setu, Shiprocket and Buyer Workflows

This Express.js server provides mock implementations of Setu (UPI Deep Link + Payouts), Shiprocket (Authentication + Order Creation + Tracking), Chat notifications, and Buyer workflow APIs for development and demo purposes.

## Features

- Simulates key endpoints of Setu and Shiprocket APIs
- Includes automatic payment verification and order confirmation features
- Real-time chat notifications for order updates and payments
- Enhanced buyer workflow with registration, ordering, and order management
- Matches real API request and response structures
- Includes JWT authentication for Shiprocket
- Provides persistent storage using LowDB
- Logs all API requests to console
- Configurable via environment variables
- CORS enabled for cross-origin requests

## Installation

```bash
cd mock-apis
npm install
```

## Usage

### Start the server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server runs on port 3001 by default (configurable in .env file).

## API Documentation

### Setu API Endpoints

#### 1. Create UPI Deep Link

- **URL**: `/setu/upi-links`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "amount": 1000,
    "payerName": "John Doe",
    "payerPhone": "9999999999",
    "expiry": 60,
    "orderId": "ORDER-123456"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "upiLinkId": "setu_upi_1620000000000_abc123",
      "upiLink": "upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=1000&tn=Payment%20for%20johndoe&cu=INR",
      "status": "CREATED",
      "expiresAt": "2023-05-04T10:00:00.000Z"
    }
  }
  ```

#### 2. Verify Payment

- **URL**: `/setu/verify-payment`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "upiLinkId": "setu_upi_1620000000000_abc123",
    "orderId": "ORDER-123456",
    "transactionId": "TXN123456789"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "upiLinkId": "setu_upi_1620000000000_abc123",
      "status": "PAID",
      "transactionId": "TXN123456789",
      "paidAt": "2023-05-03T11:00:00.000Z",
      "message": "Payment verified successfully"
    }
  }
  ```

#### 3. Get Payment Status by Order ID

- **URL**: `/setu/payment-status/:orderId`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "orderId": "ORDER-123456",
      "paymentStatus": "PAID",
      "amount": 1000,
      "upiLinkId": "setu_upi_1620000000000_abc123",
      "transactionId": "TXN123456789",
      "paidAt": "2023-05-03T11:00:00.000Z"
    }
  }
  ```

#### 4. Get All UPI Links

- **URL**: `/setu/upi-links`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": [
      {
        "id": "setu_upi_1620000000000_abc123",
        "upiLink": "upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=1000&tn=Payment%20for%20johndoe&cu=INR",
        "amount": 1000,
        "payerName": "John Doe",
        "payerPhone": "9999999999",
        "orderId": "ORDER-123456",
        "status": "CREATED",
        "createdAt": "2023-05-03T10:00:00.000Z",
        "expiresAt": "2023-05-04T10:00:00.000Z"
      }
    ]
  }
  ```

#### 5. Get UPI Link by ID

- **URL**: `/setu/upi-links/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "setu_upi_1620000000000_abc123",
      "upiLink": "upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=1000&tn=Payment%20for%20johndoe&cu=INR",
      "amount": 1000,
      "payerName": "John Doe",
      "payerPhone": "9999999999",
      "orderId": "ORDER-123456",
      "status": "CREATED",
      "createdAt": "2023-05-03T10:00:00.000Z",
      "expiresAt": "2023-05-04T10:00:00.000Z"
    }
  }
  ```

#### 6. Create Payout

- **URL**: `/setu/payouts`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "amount": 5000,
    "accountNumber": "1234567890",
    "ifsc": "HDFC0000001"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "payoutId": "setu_payout_1620000000000_abc123",
      "status": "INITIATED",
      "message": "Payout initiated successfully"
    }
  }
  ```

#### 7. Get All Payouts

- **URL**: `/setu/payouts`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": [
      {
        "id": "setu_payout_1620000000000_abc123",
        "name": "John Doe",
        "amount": 5000,
        "accountNumber": "1234567890",
        "ifsc": "HDFC0000001",
        "status": "INITIATED",
        "createdAt": "2023-05-03T10:00:00.000Z",
        "updatedAt": "2023-05-03T10:00:00.000Z"
      }
    ]
  }
  ```

#### 8. Get Payout by ID

- **URL**: `/setu/payouts/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "setu_payout_1620000000000_abc123",
      "name": "John Doe",
      "amount": 5000,
      "accountNumber": "1234567890",
      "ifsc": "HDFC0000001",
      "status": "INITIATED",
      "createdAt": "2023-05-03T10:00:00.000Z",
      "updatedAt": "2023-05-03T10:00:00.000Z"
    }
  }
  ```

### Shiprocket API Endpoints

#### 1. Authentication

- **URL**: `/shiprocket/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "demo@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user_id": "mock_user_123",
    "first_name": "Demo",
    "last_name": "User",
    "email": "demo@example.com",
    "company_id": "mock_company_456",
    "created_at": "2023-05-03T10:00:00.000Z",
    "status": "SUCCESS"
  }
  ```

#### 2. Create Order

- **URL**: `/shiprocket/orders/create/adhoc`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "order_id": "TEST-1234",
    "order_date": "2023-05-03 10:00",
    "pickup_location": "Primary",
    "billing_customer_name": "John Doe",
    "billing_address": "123 Main St",
    "billing_city": "Mumbai",
    "billing_pincode": "400001",
    "billing_state": "Maharashtra",
    "billing_country": "India",
    "billing_email": "john@example.com",
    "billing_phone": "9999999999",
    "shipping_is_billing": true,
    "order_items": [
      {
        "name": "Product 1",
        "sku": "SKU1",
        "units": 1,
        "selling_price": 500
      }
    ],
    "payment_method": "prepaid"
  }
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "order_id": "TEST-1234",
    "shipment_id": 9912345678,
    "awb_code": "9912345678901",
    "courier_company_id": "mock_courier_123",
    "courier_name": "Mock Courier Express",
    "status": "Order Created",
    "message": "Order Created Successfully",
    "status_code": 1
  }
  ```

#### 3. Confirm Order

- **URL**: `/shiprocket/orders/confirm`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "order_id": "TEST-1234"
  }
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "message": "Order confirmed successfully",
    "order_id": "TEST-1234",
    "confirmed_at": "2023-05-03T11:00:00.000Z"
  }
  ```

#### 4. Update Order Status

- **URL**: `/shiprocket/orders/update-status`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "order_id": "TEST-1234",
    "status": "In Transit",
    "comment": "Order is in transit to the destination"
  }
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "message": "Order status updated successfully",
    "order_id": "TEST-1234",
    "status": "In Transit",
    "updated_at": "2023-05-03T15:30:00.000Z"
  }
  ```

#### 5. Track Order

- **URL**: `/shiprocket/orders/track/:shipment_id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": 200,
    "tracking_data": {
      "shipment_id": 9912345678,
      "awb_code": "9912345678901",
      "order_id": "TEST-1234",
      "current_status": "In Transit",
      "current_status_id": 1,
      "delivered_date": null,
      "eta": "2023-05-08",
      "shipment_track": [
        {
          "id": "some_id_1",
          "awb_code": "9912345678901",
          "scan_type": "pickup",
          "scan_datetime": "2023-05-03T10:00:00.000Z",
          "location": "Mumbai",
          "status": "Order Picked Up",
          "status_id": 1
        },
        {
          "id": "some_id_2",
          "awb_code": "9912345678901",
          "scan_type": "in_transit",
          "scan_datetime": "2023-05-04T15:30:00.000Z",
          "location": "Delhi",
          "status": "In Transit",
          "status_id": 2
        }
      ]
    }
  }
  ```

#### 6. Get All Orders

- **URL**: `/shiprocket/orders`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "id": "shiprocket_order_1620000000000_abc123",
        "order_id": "TEST-1234",
        "shipment_id": 9912345678,
        "awb_code": "9912345678901",
        "order_date": "2023-05-03T10:00:00.000Z",
        "pickup_location": "Primary",
        "channel_id": "mock_channel_123",
        "comment": "Mock Order",
        "billing_customer_name": "John Doe",
        "billing_address": "123 Main St",
        "billing_city": "Mumbai",
        "billing_pincode": "400001",
        "billing_state": "Maharashtra",
        "billing_country": "India",
        "billing_email": "john@example.com",
        "billing_phone": "9999999999",
        "shipping_is_billing": true,
        "shipping_customer_name": "John Doe",
        "shipping_address": "123 Main St",
        "shipping_city": "Mumbai",
        "shipping_pincode": "400001",
        "shipping_state": "Maharashtra",
        "shipping_country": "India",
        "shipping_email": "john@example.com",
        "shipping_phone": "9999999999",
        "order_items": [
          {
            "name": "Product 1",
            "sku": "SKU1",
            "units": 1,
            "selling_price": 500
          }
        ],
        "payment_method": "prepaid",
        "payment_status": "PAID",
        "payment_verified": true,
        "order_confirmed": true,
        "status": "In Transit",
        "created_at": "2023-05-03T10:00:00.000Z",
        "updated_at": "2023-05-04T15:30:00.000Z"
      }
    ]
  }
  ```

#### 7. Get Order by ID

- **URL**: `/shiprocket/orders/:order_id`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "data": {
      "id": "shiprocket_order_1620000000000_abc123",
      "order_id": "TEST-1234",
      "shipment_id": 9912345678,
      "awb_code": "9912345678901",
      "order_date": "2023-05-03T10:00:00.000Z",
      "pickup_location": "Primary",
      "channel_id": "mock_channel_123",
      "comment": "Mock Order",
      "billing_customer_name": "John Doe",
      "billing_address": "123 Main St",
      "billing_city": "Mumbai",
      "billing_pincode": "400001",
      "billing_state": "Maharashtra",
      "billing_country": "India",
      "billing_email": "john@example.com",
      "billing_phone": "9999999999",
      "shipping_is_billing": true,
      "shipping_customer_name": "John Doe",
      "shipping_address": "123 Main St",
      "shipping_city": "Mumbai",
      "shipping_pincode": "400001",
      "shipping_state": "Maharashtra",
      "shipping_country": "India",
      "shipping_email": "john@example.com",
      "shipping_phone": "9999999999",
      "order_items": [
        {
          "name": "Product 1",
          "sku": "SKU1",
          "units": 1,
          "selling_price": 500
        }
      ],
      "payment_method": "prepaid",
      "payment_status": "PAID",
      "payment_verified": true,
      "order_confirmed": true,
      "status": "In Transit",
      "created_at": "2023-05-03T10:00:00.000Z",
      "updated_at": "2023-05-04T15:30:00.000Z"
    }
  }
  ```

#### 8. Cancel Order

- **URL**: `/shiprocket/orders/cancel`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "ids": ["TEST-1234"],
    "reason": "Customer requested cancellation"
  }
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "message": "Orders cancelled successfully",
    "cancelled_orders": ["TEST-1234"],
    "failed_orders": [],
    "cancelled_at": "2023-05-05T10:00:00.000Z"
  }
  ```

### Chat API Endpoints

#### 1. Send a Chat Message

- **URL**: `/chat/messages`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "orderId": "TEST-1234",
    "sender": "John Doe",
    "content": "When will my order be delivered?",
    "senderType": "buyer",
    "metadata": {
      "buyerId": "buyer_123456"
    }
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "msg_1620000000000_abc123",
      "orderId": "TEST-1234",
      "sender": "John Doe",
      "senderType": "buyer",
      "content": "When will my order be delivered?",
      "timestamp": "2023-05-03T15:30:00.000Z",
      "metadata": {
        "buyerId": "buyer_123456"
      },
      "read": false
    }
  }
  ```

#### 2. Get Chat Messages for an Order

- **URL**: `/chat/messages/:orderId`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": [
      {
        "id": "msg_1620000000000_abc123",
        "orderId": "TEST-1234",
        "sender": "system",
        "senderType": "system",
        "content": "Thank you for your order! We'll process it shortly.",
        "timestamp": "2023-05-03T10:00:00.000Z",
        "metadata": {},
        "read": true
      },
      {
        "id": "msg_1620000000001_def456",
        "orderId": "TEST-1234",
        "sender": "John Doe",
        "senderType": "buyer",
        "content": "When will my order be delivered?",
        "timestamp": "2023-05-03T15:30:00.000Z",
        "metadata": {
          "buyerId": "buyer_123456"
        },
        "read": false
      }
    ]
  }
  ```

#### 3. Get Notifications

- **URL**: `/chat/notifications`
- **Method**: `GET`
- **Query Parameters**:
  - `orderId` (optional): Filter notifications by order ID
  - `type` (optional): Filter notifications by type
  - `limit` (optional): Limit the number of notifications returned (default: 50)
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": [
      {
        "id": "notif_1620000000000_abc123",
        "type": "ORDER_CREATED",
        "orderId": "TEST-1234",
        "message": "New order #TEST-1234 created for John Doe",
        "timestamp": "2023-05-03T10:00:00.000Z"
      },
      {
        "id": "notif_1620000000001_def456",
        "type": "PAYMENT_VERIFIED",
        "orderId": "TEST-1234",
        "message": "Payment of ₹500 received for order #TEST-1234",
        "transactionId": "TXN123456789",
        "timestamp": "2023-05-03T11:00:00.000Z"
      },
      {
        "id": "notif_1620000000002_ghi789",
        "type": "STATUS_UPDATE",
        "orderId": "TEST-1234",
        "status": "In Transit",
        "message": "Order #TEST-1234 status updated to: In Transit",
        "timestamp": "2023-05-04T15:30:00.000Z"
      }
    ]
  }
  ```

#### 4. Mark Messages as Read

- **URL**: `/chat/mark-read`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "messageIds": ["msg_1620000000001_def456"],
    "orderId": "TEST-1234"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "message": "Messages marked as read successfully"
  }
  ```

#### 5. Get Unread Message Count

- **URL**: `/chat/unread-count`
- **Method**: `GET`
- **Query Parameters**:
  - `orderId` (optional): Filter unread messages by order ID
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "unreadCount": 3
    }
  }
  ```

#### 6. Send Automatic Order Status Notification

- **URL**: `/chat/order-status-notification`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "orderId": "TEST-1234",
    "status": "Out for Delivery",
    "additionalMessage": "Your order will be delivered today between 2-4 PM."
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "msg_1620000000003_jkl012",
      "orderId": "TEST-1234",
      "sender": "system",
      "senderType": "system",
      "content": "Your order #TEST-1234 is out for delivery and should arrive today! Your order will be delivered today between 2-4 PM.",
      "timestamp": "2023-05-05T10:00:00.000Z",
      "metadata": {
        "orderStatus": "Out for Delivery"
      },
      "read": false
    }
  }
  ```

#### 7. Send Automatic Payment Notification

- **URL**: `/chat/payment-notification`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "orderId": "TEST-1234",
    "amount": 500,
    "transactionId": "TXN123456789"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "msg_1620000000004_mno345",
      "orderId": "TEST-1234",
      "sender": "system",
      "senderType": "system",
      "content": "Payment of ₹500 received for your order #TEST-1234. Transaction ID: TXN123456789. Thank you!",
      "timestamp": "2023-05-05T10:30:00.000Z",
      "metadata": {
        "paymentAmount": 500,
        "transactionId": "TXN123456789"
      },
      "read": false
    }
  }
  ```

### Buyer API Endpoints

#### 1. Register a Buyer

- **URL**: `/buyer/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "9999999999",
    "email": "john@example.com",
    "address": "123 Main St",
    "pincode": "400001",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "buyer_1620000000000_abc123",
      "name": "John Doe",
      "phone": "9999999999",
      "email": "john@example.com",
      "address": "123 Main St",
      "pincode": "400001",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "createdAt": "2023-05-03T10:00:00.000Z",
      "updatedAt": "2023-05-03T10:00:00.000Z",
      "lastActive": "2023-05-03T10:00:00.000Z"
    }
  }
  ```

#### 2. Get Buyer Profile

- **URL**: `/buyer/profile/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "buyer_1620000000000_abc123",
      "name": "John Doe",
      "phone": "9999999999",
      "email": "john@example.com",
      "address": "123 Main St",
      "pincode": "400001",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "createdAt": "2023-05-03T10:00:00.000Z",
      "updatedAt": "2023-05-03T10:00:00.000Z",
      "lastActive": "2023-05-03T10:00:00.000Z"
    }
  }
  ```

#### 3. Get Buyer by Phone Number

- **URL**: `/buyer/by-phone/:phone`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "buyer_1620000000000_abc123",
      "name": "John Doe",
      "phone": "9999999999",
      "email": "john@example.com",
      "address": "123 Main St",
      "pincode": "400001",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "createdAt": "2023-05-03T10:00:00.000Z",
      "updatedAt": "2023-05-03T10:00:00.000Z",
      "lastActive": "2023-05-03T10:00:00.000Z"
    }
  }
  ```

#### 4. Update Buyer Profile

- **URL**: `/buyer/profile/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "9999999999",
    "email": "john.updated@example.com",
    "address": "456 New St",
    "pincode": "400002",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "buyer_1620000000000_abc123",
      "name": "John Doe",
      "phone": "9999999999",
      "email": "john.updated@example.com",
      "address": "456 New St",
      "pincode": "400002",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "createdAt": "2023-05-03T10:00:00.000Z",
      "updatedAt": "2023-05-03T15:00:00.000Z",
      "lastActive": "2023-05-03T15:00:00.000Z"
    }
  }
  ```

#### 5. Place an Order

- **URL**: `/buyer/place-order`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "buyerId": "buyer_1620000000000_abc123",
    "products": [
      {
        "name": "Product 1",
        "sku": "SKU1",
        "price": 500,
        "quantity": 1,
        "discount": 0
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "address": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "phone": "9999999999"
    },
    "paymentMethod": "upi"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "order_id": "ORDER-1620000000000-123",
      "shipment_id": 9912345678,
      "awb_code": "9912345678901",
      "total_amount": 500,
      "payment_method": "upi",
      "payment_link": {
        "upiLinkId": "setu_upi_1620000000000_abc123",
        "upiLink": "upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=500&tn=Payment%20for%20order%20ORDER-1620000000000-123&cu=INR",
        "amount": 500,
        "status": "CREATED",
        "expiresAt": "2023-05-04T10:00:00.000Z"
      },
      "status": "Order Created",
      "created_at": "2023-05-03T10:00:00.000Z"
    }
  }
  ```

#### 6. Get Buyer Orders

- **URL**: `/buyer/orders/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": [
      {
        "id": "shiprocket_order_1620000000000_abc123",
        "order_id": "ORDER-1620000000000-123",
        "shipment_id": 9912345678,
        "awb_code": "9912345678901",
        "order_date": "2023-05-03T10:00:00.000Z",
        "pickup_location": "Primary",
        "channel_id": "mock_channel_123",
        "comment": "Order placed through buyer API",
        "billing_customer_name": "John Doe",
        "billing_address": "123 Main St",
        "billing_city": "Mumbai",
        "billing_pincode": "400001",
        "billing_state": "Maharashtra",
        "billing_country": "India",
        "billing_email": "john@example.com",
        "billing_phone": "9999999999",
        "shipping_is_billing": true,
        "shipping_customer_name": "John Doe",
        "shipping_address": "123 Main St",
        "shipping_city": "Mumbai",
        "shipping_pincode": "400001",
        "shipping_state": "Maharashtra",
        "shipping_country": "India",
        "shipping_email": "john@example.com",
        "shipping_phone": "9999999999",
        "order_items": [
          {
            "name": "Product 1",
            "sku": "SKU1",
            "units": 1,
            "selling_price": 500,
            "discount": 0
          }
        ],
        "payment_method": "upi",
        "payment_status": "PENDING",
        "payment_verified": false,
        "order_confirmed": false,
        "sub_total": 500,
        "shipping_charges": 0,
        "total": 500,
        "status": "Order Created",
        "buyer_id": "buyer_1620000000000_abc123",
        "created_at": "2023-05-03T10:00:00.000Z",
        "updated_at": "2023-05-03T10:00:00.000Z"
      }
    ]
  }
  ```

#### 7. Get Order Details

- **URL**: `/buyer/order/:orderId`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "id": "shiprocket_order_1620000000000_abc123",
      "order_id": "ORDER-1620000000000-123",
      "shipment_id": 9912345678,
      "awb_code": "9912345678901",
      "order_date": "2023-05-03T10:00:00.000Z",
      "pickup_location": "Primary",
      "channel_id": "mock_channel_123",
      "comment": "Order placed through buyer API",
      "billing_customer_name": "John Doe",
      "billing_address": "123 Main St",
      "billing_city": "Mumbai",
      "billing_pincode": "400001",
      "billing_state": "Maharashtra",
      "billing_country": "India",
      "billing_email": "john@example.com",
      "billing_phone": "9999999999",
      "shipping_is_billing": true,
      "shipping_customer_name": "John Doe",
      "shipping_address": "123 Main St",
      "shipping_city": "Mumbai",
      "shipping_pincode": "400001",
      "shipping_state": "Maharashtra",
      "shipping_country": "India",
      "shipping_email": "john@example.com",
      "shipping_phone": "9999999999",
      "order_items": [
        {
          "name": "Product 1",
          "sku": "SKU1",
          "units": 1,
          "selling_price": 500,
          "discount": 0
        }
      ],
      "payment_method": "upi",
      "payment_status": "PENDING",
      "payment_verified": false,
      "order_confirmed": false,
      "sub_total": 500,
      "shipping_charges": 0,
      "total": 500,
      "status": "Order Created",
      "buyer_id": "buyer_1620000000000_abc123",
      "created_at": "2023-05-03T10:00:00.000Z",
      "updated_at": "2023-05-03T10:00:00.000Z",
      "payment": {
        "id": "setu_upi_1620000000000_abc123",
        "upiLink": "upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=500&tn=Payment%20for%20order%20ORDER-1620000000000-123&cu=INR",
        "amount": 500,
        "payerName": "John Doe",
        "payerPhone": "9999999999",
        "orderId": "ORDER-1620000000000-123",
        "status": "CREATED",
        "createdAt": "2023-05-03T10:00:00.000Z",
        "expiresAt": "2023-05-04T10:00:00.000Z"
      },
      "tracking": {
        "shipment_id": 9912345678,
        "awb_code": "9912345678901",
        "current_status": "Order Created",
        "delivery_date": null,
        "eta": "2023-05-06T10:00:00.000Z"
      }
    }
  }
  ```

#### 8. Verify Payment for an Order

- **URL**: `/buyer/verify-payment`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "orderId": "ORDER-1620000000000-123",
    "upiLinkId": "setu_upi_1620000000000_abc123",
    "transactionId": "TXN123456789"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "orderId": "ORDER-1620000000000-123",
      "upiLinkId": "setu_upi_1620000000000_abc123",
      "status": "PAID",
      "transactionId": "TXN123456789",
      "paidAt": "2023-05-03T11:00:00.000Z",
      "message": "Payment verified successfully"
    }
  }
  ```

#### 9. Cancel Order

- **URL**: `/buyer/cancel-order`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "orderId": "ORDER-1620000000000-123",
    "reason": "Changed my mind"
  }
  ```
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "data": {
      "orderId": "ORDER-1620000000000-123",
      "status": "Cancelled",
      "cancellation_reason": "Changed my mind",
      "cancelled_at": "2023-05-03T15:00:00.000Z"
    }
  }
  ```

## Configuration

The mock API server can be configured using environment variables in the `.env` file:

```
PORT=3001                   # Server port
JWT_SECRET=mock_jwt_secret  # Secret for JWT token generation
API_MODE=mock               # 'mock' for mock APIs, 'real' for real APIs

# Real API endpoints (for future integration)
SETU_API_BASE_URL=https://api.setu.co
SETU_CLIENT_ID=your_setu_client_id
SETU_CLIENT_SECRET=your_setu_client_secret

SHIPROCKET_API_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
```

## Persistent Storage

The mock API server uses [LowDB](https://github.com/typicode/lowdb) for persistent storage. Data is stored in a `db.json` file in the project root directory.

## Switching to Real APIs

To switch to real APIs, update the `API_MODE` environment variable to `real` and provide the necessary credentials for the respective APIs in the `.env` file. Then, update the route handlers to call the real API endpoints instead of returning mock data.

## License

MIT