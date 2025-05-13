import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Filter, 
  SlidersHorizontal,
  X,
  Tag,
  Sparkles,
  Edit,
  Trash2
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { 
  selectAllProducts, 
  deleteProduct,
  Product
} from '../store/slices/productsSlice';
import ProductCard from '../components/products/ProductCard';
import { formatCurrency } from '../utils/helpers';

const Products: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const products = useAppSelector(selectAllProducts);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleEditProduct = (id: string) => {
    navigate(`/products/${id}`);
  };
  
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          {t('products.title')}
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link 
            to="/products/add" 
            className="btn-primary px-4 py-2 flex items-center gap-2 add-product-button"
          >
            <div className="bg-white bg-opacity-20 p-1 rounded">
              <Plus size={18} />
            </div>
            <span>{t('products.addProduct')}</span>
            <div className="hidden md:flex items-center ml-1 text-xs bg-primary-400 bg-opacity-30 px-2 py-0.5 rounded-full">
              <Sparkles size={10} className="mr-1" />
              <span>AI-powered</span>
            </div>
          </Link>
        </motion.div>
      </div>
      
      {/* Search and filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('products.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input"
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm('')}
            >
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            className="btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            {t('products.filters')}
          </button>
          
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Filters panel */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-lg shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <SlidersHorizontal size={18} className="mr-2 text-gray-500" />
              {t('products.filters')}
            </h3>
            <button
              className="text-sm text-primary-600 hover:text-primary-700"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-500 mb-2">{t('products.categories')}</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === category 
                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                        : 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-card"
        >
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button 
            className="btn-outline"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid grid-cols-1 ${
            viewMode === 'grid' 
              ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : ''
          } gap-6`}
        >
          {filteredProducts.map(product => (
            <motion.div key={product.id} variants={itemVariants}>
              {viewMode === 'grid' ? (
                <ProductCard 
                  product={product} 
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ) : (
                <ProductListItem
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

interface ProductListItemProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product, onEdit, onDelete }) => {
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden flex">
      <Link to={`/products/${product.id}`} className="block relative w-40">
        <div className="w-full h-full overflow-hidden bg-gray-100">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex justify-between">
          <div>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-500 text-sm">{product.category}</p>
          </div>
          
          {/* Stock badge */}
          {isOutOfStock ? (
            <span className="bg-red-100 text-red-800 text-xs font-medium h-fit px-2 py-1 rounded-full">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium h-fit px-2 py-1 rounded-full">
              Low Stock ({product.stock})
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 text-xs font-medium h-fit px-2 py-1 rounded-full">
              In Stock ({product.stock})
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto pt-3 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          
          <div className="flex gap-2">
            <button 
              className="btn-sm btn-outline text-primary-600 border-primary-200"
              onClick={() => onEdit && onEdit(product.id)}
            >
              <Edit size={16} />
              Edit
            </button>
            <button 
              className="btn-sm btn-outline text-red-600 border-red-200"
              onClick={() => onDelete && onDelete(product.id)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;