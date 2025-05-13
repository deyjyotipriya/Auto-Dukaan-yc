import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, 
  Heart, 
  Search, 
  ChevronDown, 
  Menu, 
  X, 
  Phone,
  Mail,
  Share2,
  Star,
  Filter,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectIsGuest, 
  selectBuyer,
  addToCart,
  addToWishlist,
  selectCart,
  logout
} from '../store/slices/buyerSlice';
import FirstTimeVisitorWelcome from '../components/storefront/FirstTimeVisitorWelcome';
import { AppDispatch } from '../store';

// Mock products for demo
const DEMO_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Hand-Embroidered Cotton Kurti',
    price: 1299,
    originalPrice: 1599,
    image: 'https://images.pexels.com/photos/4957669/pexels-photo-4957669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4.8,
    reviewCount: 124,
    tags: ['New', 'Featured'],
    category: 'Women',
    isAvailable: true
  },
  {
    id: 'prod-2',
    name: 'Handcrafted Wooden Bowl Set',
    price: 899,
    originalPrice: 1200,
    image: 'https://images.pexels.com/photos/5758770/pexels-photo-5758770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4.6,
    reviewCount: 78,
    tags: ['Featured'],
    category: 'Home',
    isAvailable: true
  },
  {
    id: 'prod-3',
    name: 'Traditional Copper Water Bottle',
    price: 799,
    originalPrice: 999,
    image: 'https://images.pexels.com/photos/6045028/pexels-photo-6045028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4.9,
    reviewCount: 215,
    tags: ['Best Seller'],
    category: 'Home',
    isAvailable: true
  },
  {
    id: 'prod-4',
    name: 'Handloom Woolen Scarf',
    price: 549,
    originalPrice: 799,
    image: 'https://images.pexels.com/photos/6781117/pexels-photo-6781117.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4.7,
    reviewCount: 92,
    tags: [],
    category: 'Accessories',
    isAvailable: true
  },
  {
    id: 'prod-5',
    name: 'Organic Honey (500g)',
    price: 349,
    originalPrice: 425,
    image: 'https://images.pexels.com/photos/7469529/pexels-photo-7469529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4.8,
    reviewCount: 156,
    tags: ['Organic'],
    category: 'Food',
    isAvailable: true
  },
  {
    id: 'prod-6',
    name: 'Handmade Leather Wallet',
    price: 899,
    originalPrice: 1250,
    image: 'https://images.pexels.com/photos/5054541/pexels-photo-5054541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4.5,
    reviewCount: 87,
    tags: [],
    category: 'Accessories',
    isAvailable: true
  }
];

const STORE_INFO = {
  name: 'Artisan Crafts India',
  logo: 'https://images.pexels.com/photos/1416367/pexels-photo-1416367.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  tagline: 'Handcrafted with love, direct from artisans',
  categories: ['All', 'Women', 'Men', 'Home', 'Accessories', 'Food'],
  banner: 'https://images.pexels.com/photos/6045183/pexels-photo-6045183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
};

// Product card component
const ProductCard: React.FC<{
  product: typeof DEMO_PRODUCTS[0];
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
}> = ({ product, onAddToCart, onAddToWishlist }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm border transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        </div>
        
        {/* Quick actions */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => onAddToWishlist(product.id)}
            className="p-2 bg-white rounded-full shadow hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Heart size={18} />
          </button>
          <button
            onClick={() => onAddToCart(product.id)}
            className="p-2 bg-white rounded-full shadow hover:bg-primary-50 hover:text-primary-500 transition-colors"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
        
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.tags.map((tag) => (
              <span 
                key={tag} 
                className={`text-xs font-medium px-2 py-1 rounded ${
                  tag === 'New' ? 'bg-green-100 text-green-800' :
                  tag === 'Featured' ? 'bg-purple-100 text-purple-800' :
                  tag === 'Best Seller' ? 'bg-amber-100 text-amber-800' :
                  tag === 'Organic' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            <Star size={14} className="text-amber-400 fill-current" />
            <span className="text-sm font-medium ml-1">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            {t('storefront.demo.inStock')}
          </span>
        </div>
      </div>
    </div>
  );
};

// Mini cart component
const MiniCart: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: Array<{productId: string; quantity: number}>;
}> = ({ isOpen, onClose, cart }) => {
  const { t } = useTranslation();
  
  // Find product details for cart items
  const cartItems = cart.map(item => {
    const product = DEMO_PRODUCTS.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  });
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{t('storefront.demo.cart')}</h3>
          <button onClick={onClose}>
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {t('storefront.demo.emptyCart')}
        </div>
      ) : (
        <>
          <div className="max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex p-4 border-b">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3">
                  <img 
                    src={item.product?.image} 
                    alt={item.product?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{item.product?.name}</h4>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    <span className="font-medium">₹{item.product?.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-600">{t('storefront.demo.subtotal')} ({totalItems} items)</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>
            
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium">
                {t('storefront.demo.checkout')}
              </button>
              <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md text-sm font-medium">
                {t('storefront.demo.viewCart')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// User menu component
const UserMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  buyerName?: string;
  onLogout: () => void;
}> = ({ isOpen, onClose, isAuthenticated, isGuest, buyerName, onLogout }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-3 border-b">
        {isAuthenticated && !isGuest ? (
          <div>
            <p className="font-medium text-gray-900">{buyerName}</p>
            <p className="text-xs text-gray-500">Verified Buyer</p>
          </div>
        ) : isGuest ? (
          <div>
            <p className="font-medium text-gray-900">Guest User</p>
            <p className="text-xs text-gray-500">Create an account to save your orders</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">Sign in to view your account</p>
          </div>
        )}
      </div>
      
      <div className="py-1">
        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          {t('storefront.demo.myOrders')}
        </a>
        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          {t('storefront.demo.wishlist')}
        </a>
        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          {t('storefront.demo.accountSettings')}
        </a>
      </div>
      
      <div className="py-1 border-t">
        {(isAuthenticated || isGuest) ? (
          <button 
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onLogout}
          >
            {t('storefront.demo.logout')}
          </button>
        ) : (
          <a href="#" className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-100">
            {t('storefront.demo.signIn')}
          </a>
        )}
      </div>
    </div>
  );
};

// Main storefront demo component
const StorefrontDemo: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Buyer state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isGuest = useSelector(selectIsGuest);
  const buyer = useSelector(selectBuyer);
  const cart = useSelector(selectCart);
  
  // UI state
  const [activeCategory, setActiveCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter products by active category
  const filteredProducts = DEMO_PRODUCTS.filter(product => {
    return activeCategory === 'All' || product.category === activeCategory;
  });
  
  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = (productId: string) => {
    dispatch(addToWishlist(productId));
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        {/* Top bar */}
        <div className="bg-primary-600 text-white py-2 px-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center text-xs">
              <a href="#" className="flex items-center mr-4 hover:text-primary-100">
                <Phone size={14} className="mr-1" />
                <span>+91 99584 12547</span>
              </a>
              <a href="#" className="flex items-center hover:text-primary-100">
                <Mail size={14} className="mr-1" />
                <span>support@artisancrafts.in</span>
              </a>
            </div>
            
            <div className="text-xs">
              <a href="#" className="hover:text-primary-100 mr-4">
                {t('storefront.demo.trackOrder')}
              </a>
              <a href="#" className="hover:text-primary-100">
                <span className="hidden sm:inline">{t('storefront.demo.helpCenter')}</span>
                <span className="sm:hidden">{t('storefront.demo.help')}</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Main header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                className="md:hidden mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center">
                <img 
                  src={STORE_INFO.logo} 
                  alt={STORE_INFO.name}
                  className="h-10 w-10 rounded-full object-cover mr-2"
                />
                <div>
                  <h1 className="font-bold text-xl text-gray-900">{STORE_INFO.name}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{STORE_INFO.tagline}</p>
                </div>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('storefront.demo.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* User */}
              <div className="relative">
                <button 
                  className="flex items-center focus:outline-none"
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setCartOpen(false);
                  }}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {isAuthenticated || isGuest ? (
                      <span className="text-xs font-medium text-gray-600">
                        {buyer?.name?.charAt(0).toUpperCase() || 'G'}
                      </span>
                    ) : (
                      <User size={16} className="text-gray-600" />
                    )}
                  </div>
                  <span className="hidden md:block ml-1 text-sm text-gray-700">
                    {isAuthenticated && !isGuest ? buyer?.name : 
                     isGuest ? t('storefront.demo.guest') : 
                     t('storefront.demo.account')}
                  </span>
                  <ChevronDown size={16} className="hidden md:block text-gray-500" />
                </button>
                
                <UserMenu
                  isOpen={userMenuOpen}
                  onClose={() => setUserMenuOpen(false)}
                  isAuthenticated={isAuthenticated}
                  isGuest={isGuest}
                  buyerName={buyer?.name}
                  onLogout={handleLogout}
                />
              </div>
              
              {/* Wishlist */}
              <a href="#" className="flex items-center focus:outline-none">
                <div className="relative">
                  <Heart size={22} className="text-gray-600" />
                </div>
                <span className="hidden md:block ml-1 text-sm text-gray-700">
                  {t('storefront.demo.wishlist')}
                </span>
              </a>
              
              {/* Cart */}
              <div className="relative">
                <button 
                  className="flex items-center focus:outline-none"
                  onClick={() => {
                    setCartOpen(!cartOpen);
                    setUserMenuOpen(false);
                  }}
                >
                  <div className="relative">
                    <ShoppingCart size={22} className="text-gray-600" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center h-4 w-4 rounded-full bg-primary-500 text-white text-xs">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block ml-1 text-sm text-gray-700">
                    {t('storefront.demo.cart')}
                  </span>
                </button>
                
                <MiniCart
                  isOpen={cartOpen}
                  onClose={() => setCartOpen(false)}
                  cart={cart}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile search - visible only on mobile */}
          <div className="mt-4 md:hidden">
            <div className="relative w-full">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('storefront.demo.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="bg-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="hidden md:flex justify-center">
              {STORE_INFO.categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-3 text-sm font-medium focus:outline-none ${
                    activeCategory === category 
                      ? 'text-primary-300 border-b-2 border-primary-500' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
            <div className="bg-white h-full w-64 shadow-lg overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 border-b">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                  {t('storefront.demo.categories')}
                </p>
                <div className="space-y-2">
                  {STORE_INFO.categories.map((category) => (
                    <button
                      key={category}
                      className={`block w-full text-left py-2 text-sm font-medium ${
                        activeCategory === category 
                          ? 'text-primary-600' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                      onClick={() => {
                        setActiveCategory(category);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                  {t('storefront.demo.account')}
                </p>
                <div className="space-y-2">
                  <a href="#" className="block py-2 text-sm text-gray-700 hover:text-primary-600">
                    {t('storefront.demo.myOrders')}
                  </a>
                  <a href="#" className="block py-2 text-sm text-gray-700 hover:text-primary-600">
                    {t('storefront.demo.wishlist')}
                  </a>
                  <a href="#" className="block py-2 text-sm text-gray-700 hover:text-primary-600">
                    {t('storefront.demo.trackOrder')}
                  </a>
                  <a href="#" className="block py-2 text-sm text-gray-700 hover:text-primary-600">
                    {t('storefront.demo.helpCenter')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero banner */}
      <section className="relative">
        <div 
          className="h-80 sm:h-96 bg-center bg-cover"
          style={{ backgroundImage: `url(${STORE_INFO.banner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/30"></div>
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div className="max-w-xl">
              <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">
                Handcrafted Treasures from India's Artisans
              </h2>
              <p className="text-white/90 mb-6">
                Discover unique art forms and craftsmanship passed down through generations. 
                Every purchase directly supports our artisan community.
              </p>
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow">
                {t('storefront.demo.shopNow')}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category title and filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeCategory}</h2>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex">
            <button className="flex items-center mr-4 text-sm text-gray-700">
              <Filter size={16} className="mr-1" />
              <span>{t('storefront.demo.filter')}</span>
            </button>
            
            <div className="relative">
              <button className="flex items-center text-sm text-gray-700">
                <span>{t('storefront.demo.sortBy')}</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          ))}
        </div>
        
        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center">
            <button className="p-2 border rounded-l-md flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <button className="py-2 px-4 border-t border-b border-r bg-primary-50 text-primary-600 font-medium">
              1
            </button>
            <button className="py-2 px-4 border-t border-b border-r">
              2
            </button>
            <button className="py-2 px-4 border-t border-b border-r">
              3
            </button>
            <button className="p-2 border-t border-b border-r rounded-r-md flex items-center justify-center">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white pt-10 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src={STORE_INFO.logo} 
                  alt={STORE_INFO.name}
                  className="h-10 w-10 rounded-full object-cover mr-2"
                />
                <h3 className="font-bold text-xl">{STORE_INFO.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {STORE_INFO.tagline}
              </p>
              <div className="flex space-x-3">
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.48 10.5H14V7.56c0-.72.59-1.3 1.31-1.3h2.89V2h-3.92c-3.1 0-5.61 2.51-5.61 5.62v2.88H5v4.25h3.67V24h5.33V14.75h3.66l.82-4.25z"/>
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.95 4.57c-.88.39-1.83.65-2.82.77 1.01-.6 1.79-1.56 2.16-2.7-.95.56-2 .97-3.12 1.2-.9-.96-2.17-1.56-3.58-1.56-2.72 0-4.92 2.2-4.92 4.92 0 .39.05.77.13 1.13-4.08-.2-7.7-2.16-10.12-5.14-.42.72-.66 1.56-.66 2.46 0 1.7.87 3.21 2.19 4.09-.8-.03-1.56-.25-2.22-.61v.06c0 2.38 1.7 4.37 3.95 4.82-.41.11-.85.17-1.29.17-.32 0-.62-.03-.93-.09.63 1.96 2.45 3.38 4.61 3.42-1.69 1.32-3.82 2.11-6.14 2.11-.4 0-.79-.02-1.17-.07 2.19 1.41 4.79 2.22 7.58 2.22 9.09 0 14.06-7.53 14.06-14.06 0-.21 0-.42-.01-.64.97-.7 1.8-1.57 2.47-2.55z"/>
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.16c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm5.52 7.68c-.07 1.53-.46 8.09-6.49 8.09-1.29 0-2.48-.34-3.48-.94.96-.06 1.83-.28 2.68-.69-1.71-.04-2.88-1.15-3.34-2.26.52.1 1.04.07 1.54-.06-1.8-.36-3.04-1.92-3.04-3.92v-.05c.5.28 1.09.45 1.71.47-1.07-.71-1.76-1.93-1.76-3.31 0-.73.19-1.42.54-2.02 1.98 2.43 4.93 4.04 8.23 4.2-.07-.28-.1-.58-.1-.86 0-2.12 1.72-3.84 3.84-3.84 1.1 0 2.1.47 2.8 1.21.88-.17 1.7-.48 2.45-.92-.29.9-.9 1.65-1.7 2.13.78-.09 1.52-.29 2.21-.59-.52.81-1.16 1.52-1.89 2.09z"/>
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.16c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-3.85 14.41v-6.82l5.57 3.41-5.57 3.41z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">{t('storefront.demo.quickLinks')}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.about')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.contactUs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.blog')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.faqs')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">{t('storefront.demo.account')}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.myAccount')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.orderHistory')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.wishlist')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t('storefront.demo.newsletter')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">{t('storefront.demo.contact')}</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">📍</span>
                  <span className="text-gray-400">123 Craft Street, New Delhi, India 110001</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-2">📱</span>
                  <span className="text-gray-400">+91 99584 12547</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-2">✉️</span>
                  <span className="text-gray-400">support@artisancrafts.in</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between">
            <p className="text-gray-400 text-sm">
              &copy; 2025 {STORE_INFO.name}. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex flex-wrap space-x-4">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">{t('storefront.demo.privacyPolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">{t('storefront.demo.termsOfService')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">{t('storefront.demo.shipping')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm">{t('storefront.demo.returns')}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      {/* First time visitor welcome modal */}
      <FirstTimeVisitorWelcome 
        storeName={STORE_INFO.name} 
        storeImage={STORE_INFO.logo}
      />
    </div>
  );
};

export default StorefrontDemo;