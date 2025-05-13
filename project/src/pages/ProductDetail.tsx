import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Edit2,
  Trash2,
  Package,
  Tag,
  Box,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectProductById, deleteProduct, updateProduct } from '../store/slices/productsSlice';
import { formatCurrency } from '../utils/helpers';

const ProductDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const product = useAppSelector(selectProductById(id || ''));
  
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Product not found</p>
        <Link to="/products" className="btn-outline mt-4">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(product.id));
      navigate('/products');
    }
  };
  
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            className="btn-outline text-primary-600 border-primary-200"
            onClick={() => navigate(`/products/edit/${product.id}`)}
          >
            <Edit2 size={18} />
            {t('productDetails.edit')}
          </button>
          <button
            className="btn-outline text-red-600 border-red-200"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
            {t('productDetails.delete')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product images */}
        <div className="lg:col-span-2">
          <motion.div 
            className="bg-white rounded-lg shadow-card overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="aspect-square bg-gray-100 relative">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
              
              {/* Stock badge */}
              {isOutOfStock ? (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center">
                  <AlertTriangle size={16} className="mr-1" />
                  Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full flex items-center">
                  <AlertTriangle size={16} className="mr-1" />
                  Low Stock ({product.stock})
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  In Stock ({product.stock})
                </div>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                      selectedImage === index ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Product info */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <div className="mt-4 space-y-4">
            {/* Category */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('productDetails.category')}</h3>
              <div className="flex items-center">
                <Tag size={16} className="mr-2 text-gray-400" />
                <span className="text-base text-gray-900">{product.category}</span>
              </div>
            </div>
            
            {/* Stock */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('productDetails.stock')}</h3>
              <div className="flex items-center">
                <Box size={16} className="mr-2 text-gray-400" />
                <span className="text-base text-gray-900">{product.stock} units</span>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('productDetails.description')}</h3>
              <p className="text-base text-gray-700">{product.description}</p>
            </div>
            
            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('productDetails.variants')}</h3>
                <div className="space-y-3">
                  {product.variants.map(variant => (
                    <div key={variant.id} className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{variant.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {variant.values.map(value => (
                          <span 
                            key={value}
                            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('productDetails.tags')}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
            <div className="text-sm text-gray-500">
              Created: {new Date(product.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              Updated: {new Date(product.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;