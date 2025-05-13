import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Product } from '../../store/slices/productsSlice';
import { formatCurrency } from '../../utils/helpers';

interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="w-full aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Stock badge */}
        {isOutOfStock ? (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            Low Stock
          </span>
        ) : (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            In Stock
          </span>
        )}
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1 truncate">{product.category}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            <span className="text-sm text-gray-500">
              {product.stock} {product.stock === 1 ? 'unit' : 'units'}
            </span>
          </div>
        </Link>
        
        {/* Variants summary */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.variants.map(variant => (
              <span 
                key={variant.id}
                className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
              >
                {variant.name}: {variant.values.length}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-4 flex justify-between">
          <button 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
            onClick={() => onEdit && onEdit(product.id)}
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
          <button 
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
            onClick={() => onDelete && onDelete(product.id)}
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;