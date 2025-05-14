import React, { useState, useEffect } from 'react';

interface ProductRecommendationsProps {
  buyerId: string;
}

// Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url: string;
  rating: number;
  rating_count: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  is_bestseller?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
}

// Category interface
interface Category {
  id: string;
  name: string;
  icon: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ buyerId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showWishlistMessage, setShowWishlistMessage] = useState<string | null>(null);

  // Mock categories
  const categories: Category[] = [
    { id: 'all', name: 'All', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'home', name: 'Home & Kitchen', icon: '🏠' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'food', name: 'Food & Grocery', icon: '🥑' },
  ];

  // Mock data for products (in a real app, this would come from an API)
  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Wireless Bluetooth Earbuds',
      price: 1299,
      original_price: 1999,
      discount_percentage: 35,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.5,
      rating_count: 128,
      seller: {
        id: 'seller1',
        name: 'Ganesh Electronics',
        avatar: 'GE'
      },
      category: 'electronics',
      tags: ['audio', 'wireless', 'bluetooth'],
      is_bestseller: true,
      is_sale: true
    },
    {
      id: 'prod2',
      name: 'Smart LED TV - 43 inch',
      price: 25990,
      original_price: 32999,
      discount_percentage: 21,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.3,
      rating_count: 42,
      seller: {
        id: 'seller1',
        name: 'Ganesh Electronics',
        avatar: 'GE'
      },
      category: 'electronics',
      tags: ['tv', 'led', 'smart'],
      is_sale: true
    },
    {
      id: 'prod3',
      name: 'Cotton Saree with Blouse Piece',
      price: 1899,
      original_price: 2199,
      discount_percentage: 14,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.7,
      rating_count: 56,
      seller: {
        id: 'seller2',
        name: 'Ananya Fashion',
        avatar: 'AF'
      },
      category: 'fashion',
      tags: ['saree', 'cotton', 'traditional'],
      is_bestseller: true
    },
    {
      id: 'prod4',
      name: 'Men\'s Slim Fit Formal Shirt',
      price: 899,
      original_price: 1199,
      discount_percentage: 25,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.2,
      rating_count: 78,
      seller: {
        id: 'seller2',
        name: 'Ananya Fashion',
        avatar: 'AF'
      },
      category: 'fashion',
      tags: ['shirt', 'formal', 'men'],
      is_sale: true
    },
    {
      id: 'prod5',
      name: 'Premium Spice Gift Box Set',
      price: 749,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.8,
      rating_count: 32,
      seller: {
        id: 'seller3',
        name: 'Mumbai Spices',
        avatar: 'MS'
      },
      category: 'food',
      tags: ['spices', 'gift', 'premium'],
      is_new: true
    },
    {
      id: 'prod6',
      name: 'Non-Stick Cookware Set - 5 Pieces',
      price: 2499,
      original_price: 3499,
      discount_percentage: 29,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.4,
      rating_count: 45,
      seller: {
        id: 'seller4',
        name: 'Kitchen Essentials',
        avatar: 'KE'
      },
      category: 'home',
      tags: ['cookware', 'kitchen', 'non-stick'],
      is_sale: true
    },
    {
      id: 'prod7',
      name: 'Premium Skincare Kit',
      price: 1899,
      original_price: 2499,
      discount_percentage: 24,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.6,
      rating_count: 64,
      seller: {
        id: 'seller5',
        name: 'Glow Beauty',
        avatar: 'GB'
      },
      category: 'beauty',
      tags: ['skincare', 'beauty', 'premium'],
      is_new: true,
      is_sale: true
    },
    {
      id: 'prod8',
      name: 'Organic Green Tea - 100g',
      price: 349,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.7,
      rating_count: 82,
      seller: {
        id: 'seller3',
        name: 'Mumbai Spices',
        avatar: 'MS'
      },
      category: 'food',
      tags: ['tea', 'organic', 'health'],
      is_bestseller: true
    }
  ];

  // Mock recently viewed products
  const mockRecentlyViewed: Product[] = [
    {
      id: 'prod9',
      name: 'Smartphone Case - Protective Cover',
      price: 599,
      original_price: 799,
      discount_percentage: 25,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.1,
      rating_count: 38,
      seller: {
        id: 'seller1',
        name: 'Ganesh Electronics',
        avatar: 'GE'
      },
      category: 'electronics',
      tags: ['phone', 'accessories', 'case']
    },
    {
      id: 'prod10',
      name: 'Wireless Charging Pad',
      price: 899,
      original_price: 1299,
      discount_percentage: 31,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.3,
      rating_count: 52,
      seller: {
        id: 'seller1',
        name: 'Ganesh Electronics',
        avatar: 'GE'
      },
      category: 'electronics',
      tags: ['charging', 'wireless', 'accessories']
    },
    {
      id: 'prod11',
      name: 'Casual T-Shirt - Pack of 2',
      price: 799,
      original_price: 999,
      discount_percentage: 20,
      image_url: 'https://via.placeholder.com/300',
      rating: 4.2,
      rating_count: 47,
      seller: {
        id: 'seller2',
        name: 'Ananya Fashion',
        avatar: 'AF'
      },
      category: 'fashion',
      tags: ['t-shirt', 'casual', 'men']
    }
  ];

  // Load products
  useEffect(() => {
    // In a real app, this would be an API call based on user preferences
    setTimeout(() => {
      setProducts(mockProducts);
      setRecentlyViewed(mockRecentlyViewed);
      setIsLoading(false);
    }, 1000);
  }, [buyerId]);

  // Format price to currency
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Filter products based on activeCategory
  const filteredProducts = products.filter(product => {
    if (activeCategory === 'all') return true;
    return product.category === activeCategory;
  });

  // Add to wishlist handler
  const handleAddToWishlist = (productId: string, productName: string) => {
    // In a real app, this would be an API call
    setShowWishlistMessage(`${productName} added to wishlist`);
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setShowWishlistMessage(null);
    }, 3000);
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
        <h1 className="text-2xl font-bold text-gray-800">Recommended For You</h1>
        <p className="text-gray-600">Products personalized for your preferences</p>
      </div>

      {/* Categories navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Wishlist message toast */}
      {showWishlistMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{showWishlistMessage}</span>
          <button className="ml-auto" onClick={() => setShowWishlistMessage(null)}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Recently viewed section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recently Viewed</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        
        {recentlyViewed.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No recently viewed products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {recentlyViewed.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended products grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {activeCategory === 'all' ? 'Recommended Products' : `${categories.find(c => c.id === activeCategory)?.name} Products`}
        </h2>
        
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Featured collections */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Featured Collections</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeaturedCollectionCard
            title="Electronics Sale"
            description="Up to 40% off on top electronics"
            imageUrl="https://via.placeholder.com/400x200"
            bgColor="from-blue-500 to-indigo-600"
          />
          <FeaturedCollectionCard
            title="Fashion Week"
            description="Latest trends at best prices"
            imageUrl="https://via.placeholder.com/400x200"
            bgColor="from-pink-500 to-rose-500"
          />
          <FeaturedCollectionCard
            title="Home Essentials"
            description="Make your home beautiful"
            imageUrl="https://via.placeholder.com/400x200"
            bgColor="from-green-500 to-teal-500"
          />
        </div>
      </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
  onAddToWishlist: (productId: string, productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Format price to currency
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product image and badges */}
      <div className="relative">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-48 object-cover object-center"
        />
        
        {/* Quick action buttons */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="flex space-x-2">
              <button 
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                title="Quick view"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button 
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                title="Add to wishlist"
                onClick={() => onAddToWishlist(product.id, product.name)}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button 
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                title="Add to cart"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.is_new && (
            <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-md">
              NEW
            </span>
          )}
          {product.is_bestseller && (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-md">
              BESTSELLER
            </span>
          )}
          {product.is_sale && (
            <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-md">
              SALE
            </span>
          )}
        </div>
        
        {/* Discount badge */}
        {product.discount_percentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {product.discount_percentage}% OFF
          </div>
        )}
        
        {/* Seller badge */}
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <div className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
              {product.seller.avatar}
            </div>
            <span className="ml-1.5 text-xs font-medium text-gray-800">{product.seller.name}</span>
          </div>
        </div>
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        
        {/* Pricing */}
        <div className="mt-1 flex items-center">
          <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
        
        {/* Rating */}
        <div className="mt-1 flex items-center">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg 
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(product.rating) 
                    ? 'text-yellow-400'
                    : index < product.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">({product.rating_count})</span>
        </div>
        
        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Add to cart button */}
        <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Featured Collection Card Component
interface FeaturedCollectionCardProps {
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;
}

const FeaturedCollectionCard: React.FC<FeaturedCollectionCardProps> = ({ 
  title, 
  description, 
  imageUrl,
  bgColor
}) => {
  return (
    <div className={`rounded-lg overflow-hidden shadow-md relative bg-gradient-to-r ${bgColor}`}>
      <img 
        src={imageUrl}
        alt={title}
        className="w-full h-40 object-cover mix-blend-overlay opacity-60"
      />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-white">{description}</p>
        <button className="mt-2 self-start bg-white text-sm font-medium px-4 py-1.5 rounded-md text-gray-800 hover:bg-gray-100 transition-colors">
          Explore Now
        </button>
      </div>
    </div>
  );
};

export default ProductRecommendations;