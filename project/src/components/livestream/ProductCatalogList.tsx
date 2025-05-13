import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingBag, Check, Truck, Star, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { publishStreamProduct, selectCurrentStream, selectPublishedProducts } from '../../store/slices/livestreamSlice';
import { RootState, AppDispatch } from '../../store';
import { Product } from '../../store/slices/productsSlice';

const ProductCatalogList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const stream = useSelector(selectCurrentStream);
  const publishedProducts = useSelector(selectPublishedProducts);
  const products = useSelector((state: RootState) => state.products.products);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Filter products based on search query
  useEffect(() => {
    if (!products) {
      setFilteredProducts([]);
      return;
    }
    
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Publish product to the stream
  const handlePublishProduct = (product: Product) => {
    if (stream) {
      dispatch(publishStreamProduct({ streamId: stream.id, productId: product.id }));
    }
  };
  
  // Check if product is already published
  const isProductPublished = (productId: string) => {
    return publishedProducts.includes(productId) || 
           stream?.publishedProducts.includes(productId);
  };
  
  // Mock products if none exist yet
  const mockProducts = [
    {
      id: 'product_001',
      name: 'Cotton Kurta',
      price: 1499,
      description: 'Comfortable cotton kurta for daily wear',
      image: '',
      category: 'Clothing',
      inventory: 24,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'product_002',
      name: 'Silk Saree',
      price: 3999,
      description: 'Elegant silk saree for special occasions',
      image: '',
      category: 'Clothing',
      inventory: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'product_003',
      name: 'Leather Wallet',
      price: 899,
      description: 'Durable leather wallet with multiple compartments',
      image: '',
      category: 'Accessories',
      inventory: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'product_004',
      name: 'Silver Earrings',
      price: 1299,
      description: 'Handcrafted silver earrings with traditional design',
      image: '',
      category: 'Jewelry',
      inventory: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'product_005',
      name: 'Cotton Bedsheet',
      price: 1999,
      description: 'Premium cotton bedsheet with beautiful prints',
      image: '',
      category: 'Home',
      inventory: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  // Use mock products if no real products exist
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : mockProducts;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <ShoppingBag className="h-5 w-5 mr-2" />
        {t('livestream.products.yourCatalog')}
      </h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('livestream.products.searchProducts')}
          className="pl-9"
        />
      </div>
      
      <div className="overflow-y-auto max-h-[350px] space-y-3">
        {displayProducts.map(product => (
          <div 
            key={product.id}
            className="border rounded-md p-3 bg-white flex items-center"
          >
            {/* Product image placeholder */}
            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-gray-300" />
            </div>
            
            <div className="ml-3 flex-1">
              <h4 className="font-medium text-sm">{product.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-bold">₹{product.price}</span>
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded flex items-center">
                  <Truck className="h-3 w-3 mr-0.5" />
                  {product.inventory > 0 ? t('livestream.products.inStock') : t('livestream.products.outOfStock')}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  (4.8)
                </span>
              </div>
            </div>
            
            <div className="ml-3">
              {isProductPublished(product.id) ? (
                <Button variant="outline" size="sm" className="text-green-600 border-green-600" disabled>
                  <Check className="h-4 w-4 mr-1" />
                  {t('livestream.products.published')}
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => handlePublishProduct(product)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('livestream.products.publish')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalogList;