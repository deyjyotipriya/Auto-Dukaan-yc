import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  MessageCircle, 
  Search, 
  Filter, 
  Heart, 
  Home, 
  ArrowLeft, 
  Send,
  Plus,
  CheckCheck,
  Phone,
  Mic,
  X
} from 'lucide-react';
// Import the safe versions of Redux hooks
// These will automatically handle the "Class constructor cannot be invoked without 'new'" error
import { useSelector, useAppSelector, useDispatch, useAppDispatch } from '../utils/reduxFix';

// Import React for type definitions
import * as React from 'react';

// Mock types instead of importing from Redux
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'seller';
  timestamp: Date;
  isRead: boolean;
  productId?: string;
}

interface ProductOrder {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

// Mock product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

// Simple mock for store config
interface StoreConfig {
  businessName: string;
  domain: string;
  theme: string;
  colorScheme: string;
  customColors: {
    primary: string;
    [key: string]: string;
  };
  socialMedia: any[];
}

// Static data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium T-shirt',
    description: 'High quality cotton t-shirt',
    price: 599,
    category: 'Clothing',
    images: ['https://via.placeholder.com/300?text=T-shirt']
  },
  {
    id: '2',
    name: 'Designer Jeans',
    description: 'Stylish jeans for all occasions',
    price: 1299,
    category: 'Clothing',
    images: ['https://via.placeholder.com/300?text=Jeans']
  },
  {
    id: '3',
    name: 'Smartwatch',
    description: 'Feature-rich smartwatch with health tracking',
    price: 2999,
    category: 'Electronics',
    images: ['https://via.placeholder.com/300?text=Smartwatch']
  },
  {
    id: '4',
    name: 'Wireless Headphones',
    description: 'Premium sound quality with noise cancellation',
    price: 1499,
    category: 'Electronics',
    images: ['https://via.placeholder.com/300?text=Headphones']
  },
  {
    id: '5',
    name: 'Casual Shoes',
    description: 'Comfortable everyday shoes',
    price: 899,
    category: 'Footwear',
    images: ['https://via.placeholder.com/300?text=Shoes']
  },
  {
    id: '6',
    name: 'Backpack',
    description: 'Durable backpack with laptop compartment',
    price: 1199,
    category: 'Accessories',
    images: ['https://via.placeholder.com/300?text=Backpack']
  }
];

const MOCK_STORE_CONFIG: StoreConfig = {
  businessName: 'Auto-Dukaan Store',
  domain: 'store.autodukaan.com',
  theme: 'modern',
  colorScheme: 'light',
  customColors: {
    primary: '#3b82f6'
  },
  socialMedia: []
};

const BuyerView: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  
  // State variables
  const [allProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [storefrontConfig] = useState<StoreConfig>(MOCK_STORE_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<ProductOrder[]>([]);

  // Try to use Redux selectors but fall back to mock data if they fail
  const tryUseRedux = () => {
    try {
      // This is wrapped in a try/catch as a safety mechanism
      // We've already provided mock data above, so this is just a demonstration
      // of how you would use the safe selector
      
      // Example (only if Redux store is available):
      // const storeProducts = useSafeSelector(state => state.products?.items);
      // if (storeProducts?.length > 0) setAllProducts(storeProducts);
      
      // const storeConfig = useSafeSelector(state => state.storefront?.config);
      // if (storeConfig) setStorefrontConfig(storeConfig);
    } catch (error) {
      console.warn('Redux selector error, using mock data instead:', error);
    }
  };

  // Attempt to use Redux on first render
  useEffect(() => {
    tryUseRedux();
  }, []);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = allProducts;
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, allProducts]);

  // When component mounts, add welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Welcome to ${storefrontConfig.businessName}! How can I help you today?`,
      sender: 'seller',
      timestamp: new Date(),
      isRead: true
    };
    
    setMessages([welcomeMessage]);
  }, [storefrontConfig.businessName]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      isRead: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageText('');
    
    // Simulate seller response after a delay
    setTimeout(() => {
      const sellerMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getSellerResponse(messageText),
        sender: 'seller',
        timestamp: new Date(),
        isRead: false
      };
      
      setMessages(prev => [...prev, sellerMessage]);
    }, 1500);
  };

  // Generate seller response based on user message
  const getSellerResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! Thanks for contacting ${storefrontConfig.businessName}. How may I assist you today?`;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Our prices are very competitive. Is there a specific product you are interested in?';
    }
    
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return 'We provide delivery within 3-5 business days. Shipping is free for orders above ₹499.';
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'We accept all major payment methods including UPI, credit/debit cards, and cash on delivery.';
    }
    
    if (lowerMessage.includes('discount') || lowerMessage.includes('offer')) {
      return 'We currently have a 10% discount on all products. Use code WELCOME10 at checkout.';
    }
    
    return 'Thank you for your message. How else can I help you with your shopping today?';
  };

  // Handle product inquiry through chat
  const handleProductInquiry = (product: Product) => {
    setSelectedProduct(product);
    setShowChat(true);
    
    const productMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `I'm interested in this product: ${product.name}`,
      sender: 'user',
      timestamp: new Date(),
      isRead: true,
      productId: product.id
    };
    
    const responseMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Great choice! ${product.name} is available for ₹${product.price}. Would you like to place an order or have any questions about it?`,
      sender: 'seller',
      timestamp: new Date(Date.now() + 1000),
      isRead: false
    };
    
    setMessages(prev => [...prev, productMessage, responseMessage]);
  };

  // Handle ordering a product
  const handleOrderProduct = (product: Product) => {
    const orderMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `I would like to order ${product.name}`,
      sender: 'user',
      timestamp: new Date(),
      isRead: true,
      productId: product.id
    };
    
    const confirmMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Thank you for your order! I've created an order for ${product.name} priced at ₹${product.price}. Would you like to complete the payment now?`,
      sender: 'seller',
      timestamp: new Date(Date.now() + 1000),
      isRead: false
    };
    
    setMessages(prev => [...prev, orderMessage, confirmMessage]);
    
    // Create an order
    const newOrder: ProductOrder = {
      id: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
      productId: product.id,
      quantity: 1,
      price: product.price,
      name: product.name,
      status: 'pending'
    };
    
    setOrders(prev => [...prev, newOrder]);
    setShowChat(true);
  };

  // Handle key press in chat
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get all unique categories from products
  const categories = Array.from(new Set(allProducts.map(product => product.category)));

  // Rendering functions
  const renderProduct = (product: Product) => (
    <div 
      key={product.id} 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-100">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow">
          <Heart size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="font-semibold">₹{product.price}</span>
          <div className="flex space-x-1">
            <button 
              className="p-1.5 bg-gray-100 rounded-full"
              onClick={() => handleProductInquiry(product)}
            >
              <MessageCircle size={16} className="text-blue-500" />
            </button>
            <button 
              className="p-1.5 bg-blue-100 rounded-full"
              onClick={() => handleOrderProduct(product)}
            >
              <ShoppingBag size={16} className="text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="mr-3 lg:hidden"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-blue-600">
                {storefrontConfig.businessName}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="relative"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle size={22} />
                {messages.some(m => m.sender === 'seller' && !m.isRead) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {messages.filter(m => m.sender === 'seller' && !m.isRead).length}
                  </span>
                )}
              </button>
              <button className="relative">
                <ShoppingBag size={22} />
                {orders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="mt-3 flex items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="ml-2 p-2 bg-gray-100 rounded-lg">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button 
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === null 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </button>
            
            {categories.map((category) => (
              <button 
                key={category}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Featured banner (if on home page) */}
        {!selectedCategory && !searchQuery && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-2">
              Welcome to {storefrontConfig.businessName}
            </h2>
            <p className="mb-4 text-blue-100">
              Discover our amazing products and get in touch with us directly through chat.
            </p>
            <button 
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium"
              onClick={() => setShowChat(true)}
            >
              Chat with us
            </button>
          </div>
        )}
        
        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(renderProduct)}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filter to find what you are looking for.
            </p>
          </div>
        )}
      </main>
      
      {/* Chat window */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:inset-auto md:right-4 md:bottom-4 md:top-auto md:left-auto md:w-96 md:h-[500px] md:rounded-lg md:shadow-xl">
          <div className="flex items-center justify-between bg-blue-600 text-white p-3 md:rounded-t-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-2">
                {storefrontConfig.businessName.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{storefrontConfig.businessName}</h3>
                <p className="text-xs opacity-80">Usually replies within minutes</p>
              </div>
            </div>
            <button 
              className="p-1"
              onClick={() => setShowChat(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg relative ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {message.productId && (
                    <div className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                      <div className="text-xs">
                        Product: {allProducts.find(p => p.id === message.productId)?.name}
                      </div>
                    </div>
                  )}
                  <div>{message.text}</div>
                  <div className="text-xs opacity-70 mt-1 text-right flex justify-end items-center">
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {message.sender === 'user' && (
                      <span className="ml-1">
                        <CheckCheck size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Product selection (optional) */}
          {selectedProduct && (
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={selectedProduct.images[0]} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="ml-2 flex-1">
                  <div className="text-sm font-medium line-clamp-1">{selectedProduct.name}</div>
                  <div className="text-xs text-gray-500">₹{selectedProduct.price}</div>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Chat input */}
          <div className="p-3 border-t border-gray-200 bg-white md:rounded-b-lg">
            <div className="flex items-center">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Plus size={18} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Mic size={18} />
                </button>
              </div>
              <div className="flex-1 mx-2">
                <textarea
                  placeholder="Type a message..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={1}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <button 
                className="p-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom navigation */}
      <nav className="bg-white border-t sticky bottom-0 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center p-2">
              <Home size={20} className="text-blue-500" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button className="flex flex-col items-center p-2">
              <Search size={20} className="text-gray-500" />
              <span className="text-xs mt-1">Search</span>
            </button>
            <button 
              className="flex flex-col items-center p-2"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle size={20} className="text-gray-500" />
              <span className="text-xs mt-1">Chat</span>
            </button>
            <button className="flex flex-col items-center p-2">
              <ShoppingBag size={20} className="text-gray-500" />
              <span className="text-xs mt-1">Orders</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default BuyerView;