import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Plus,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  Scan,
  RefreshCw,
  Check,
  Percent
} from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { addProduct, ProductVariant } from '../store/slices/productsSlice';
import { generateConfidenceScore } from '../utils/helpers';

const AddProduct: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'ai'>('basic');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  // AI recognition states
  const [isScanning, setIsScanning] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [detectedImage, setDetectedImage] = useState<string>('');
  const [confidenceScores, setConfidenceScores] = useState<{
    name: number;
    category: number;
    price: number;
  }>({
    name: 0,
    category: 0,
    price: 0,
  });
  
  const [newVariant, setNewVariant] = useState({
    name: '',
    values: '',
  });
  
  const categories = [
    'Clothing',
    'Jewelry',
    'Accessories',
    'Home & Kitchen',
    'Beauty',
    'Health',
    'Electronics',
    'Food',
  ];
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddVariant = () => {
    if (newVariant.name.trim() && newVariant.values.trim()) {
      const values = newVariant.values.split(',').map(value => value.trim());
      setVariants([
        ...variants,
        {
          id: newVariant.name.toLowerCase().replace(/\s+/g, '-'),
          name: newVariant.name,
          values: values.filter(Boolean),
        },
      ]);
      setNewVariant({ name: '', values: '' });
    }
  };
  
  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter(variant => variant.id !== variantId));
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleAIRecognition = () => {
    setIsScanning(true);
    
    // Simulate AI recognition with sample product images
    const sampleProducts = [
      {
        name: 'Handcrafted Silver Jhumkas',
        category: 'Jewelry',
        price: '399',
        image: 'https://images.pexels.com/photos/13992207/pexels-photo-13992207.jpeg',
      },
      {
        name: 'Traditional Cotton Kurti',
        category: 'Clothing',
        price: '599',
        image: 'https://images.pexels.com/photos/4956771/pexels-photo-4956771.jpeg',
      },
      {
        name: 'Handwoven Silk Saree',
        category: 'Clothing',
        price: '1499',
        image: 'https://images.pexels.com/photos/12592595/pexels-photo-12592595.jpeg',
      }
    ];
    
    setTimeout(() => {
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      
      setDetectionComplete(true);
      setIsScanning(false);
      setDetectedImage(randomProduct.image);
      
      // Generate confidence scores between 80% and 99%
      setConfidenceScores({
        name: generateConfidenceScore(),
        category: generateConfidenceScore(),
        price: generateConfidenceScore(),
      });
      
      // Set product details
      setProductName(randomProduct.name);
      setCategory(randomProduct.category);
      setPrice(randomProduct.price);
      setImages([randomProduct.image]);
    }, 3000);
  };
  
  const handleSaveProduct = () => {
    // Basic validation
    if (!productName || !price || !category || !stock || images.length === 0) {
      alert('Please fill in all required fields and add at least one image');
      return;
    }
    
    dispatch(addProduct({
      name: productName,
      price: parseFloat(price),
      description,
      images,
      category,
      tags,
      stock: parseInt(stock, 10),
      variants: variants.length > 0 ? variants : undefined,
    }));
    
    navigate('/products');
  };
  
  const placeholderImage = 'https://images.pexels.com/photos/7679733/pexels-photo-7679733.jpeg';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('addProduct.title')}</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            className="btn-outline"
            onClick={() => navigate('/products')}
          >
            <X size={18} />
            {t('common.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveProduct}
          >
            <Save size={18} />
            {t('addProduct.save')}
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'basic' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          {t('addProduct.basicDetails')}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'ai' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('ai')}
        >
          {t('addProduct.aiRecognition')}
        </button>
      </div>
      
      {activeTab === 'basic' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left column - Images */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium mb-4">{t('addProduct.images')}</h2>
              
              {/* Image preview */}
              <div className="space-y-4">
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X size={18} className="text-gray-700" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No images uploaded yet</p>
                  </div>
                )}
                
                <label className="btn-outline w-full justify-center cursor-pointer">
                  <Upload size={18} />
                  {t('addProduct.uploadImage')}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            
            {/* Variants */}
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-lg font-medium mb-4">{t('addProduct.variants')}</h2>
              
              <div className="space-y-4">
                {variants.length > 0 ? (
                  <div className="space-y-3">
                    {variants.map((variant) => (
                      <div key={variant.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-900">{variant.name}</h3>
                          <button
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveVariant(variant.id)}
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {variant.values.map((value) => (
                            <span 
                              key={value}
                              className="px-2 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">No variants added yet</p>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variant Name
                      </label>
                      <input
                        type="text"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                        placeholder="e.g. Size, Color, Material"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Values (comma separated)
                      </label>
                      <input
                        type="text"
                        value={newVariant.values}
                        onChange={(e) => setNewVariant({ ...newVariant, values: e.target.value })}
                        placeholder="e.g. S, M, L, XL"
                        className="input"
                      />
                    </div>
                    <button
                      className="btn-outline w-full justify-center"
                      onClick={handleAddVariant}
                      disabled={!newVariant.name || !newVariant.values}
                    >
                      <Plus size={18} />
                      Add Variant
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right column - Product details */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium mb-4">{t('addProduct.basicDetails')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.name')} *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Handcrafted Silver Jhumkas"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the product..."
                    className="input h-32 resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('addProduct.fields.category')} *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input"
                      required
                    >
                      <option value="">{t('common.select')}...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('addProduct.fields.price')} (₹) *
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 599"
                      className="input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.stock')} *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="input"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.tags')}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {tag}
                        <button 
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Enter tags (e.g. handmade, traditional)"
                      className="input rounded-r-none flex-grow"
                    />
                    <button
                      className="bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg px-4 hover:bg-gray-200"
                      onClick={handleAddTag}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // AI Recognition Tab
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left column - Scan area */}
          <div className="card">
            <h2 className="text-lg font-medium mb-4">{t('addProduct.aiRecognition')}</h2>
            
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
                {detectedImage ? (
                  <img 
                    src={detectedImage} 
                    alt="Detected product" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={placeholderImage} 
                    alt="Example product" 
                    className="w-full h-full object-cover opacity-30"
                  />
                )}
                
                {isScanning && (
                  <div className="absolute inset-0 bg-primary-900 bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                      <RefreshCw size={32} className="text-primary-500 animate-spin mb-2" />
                      <p className="text-gray-800 font-medium">{t('addProduct.detecting')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <label className="btn-outline flex-1 justify-center cursor-pointer">
                  <Upload size={18} />
                  {t('addProduct.uploadImage')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDetectedImage(URL.createObjectURL(e.target.files[0]));
                        setDetectionComplete(false);
                      }
                    }}
                  />
                </label>
                
                <button
                  className="btn-primary flex-1"
                  onClick={handleAIRecognition}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {t('addProduct.detecting')}
                    </>
                  ) : (
                    <>
                      <Scan size={18} />
                      {t('addProduct.scanProduct')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - Detection results */}
          <div className="card">
            <h2 className="text-lg font-medium mb-4">
              {detectionComplete 
                ? t('addProduct.detectionComplete') 
                : 'Ready to detect product'}
            </h2>
            
            {detectionComplete ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600">
                    <Check size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Detection Complete</p>
                    <p className="text-sm text-green-700">Product details have been automatically filled in</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.name')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="input pr-16"
                    />
                    <div className="absolute right-2 top-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Percent size={12} className="mr-1" />
                      {confidenceScores.name}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.category')}
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input pr-16"
                    >
                      <option value="">{t('common.select')}...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Percent size={12} className="mr-1" />
                      {confidenceScores.category}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.price')} (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input pr-16"
                      min="0"
                    />
                    <div className="absolute right-2 top-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Percent size={12} className="mr-1" />
                      {confidenceScores.price}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('addProduct.fields.stock')}
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Enter stock quantity"
                    className="input"
                    min="0"
                  />
                </div>
                
                <button
                  className="btn-primary w-full mt-4"
                  onClick={() => setActiveTab('basic')}
                >
                  Continue to Basic Details
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Scan size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to detect product</h3>
                <p className="text-gray-500 mb-6">
                  Upload an image or use the scan function to automatically detect product details
                </p>
                <button
                  className="btn-primary"
                  onClick={handleAIRecognition}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {t('addProduct.detecting')}
                    </>
                  ) : (
                    <>
                      <Scan size={18} />
                      {t('addProduct.scanProduct')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AddProduct;