import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle,
  AlertTriangle,
  Camera,
  Trash2,
  Sparkles,
  Layers,
  Edit2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { addProduct, ProductVariant } from '../store/slices/productsSlice';
import ProductRecognitionService, { RecognizedProduct } from '../services/ProductRecognitionService';
import { cn } from '../utils/helpers';

// Enhanced Product form with more fields for AI-detected attributes
interface ProductForm {
  name: string;
  price: string;
  description: string;
  stock: string;
  category: string;
  tags: string[];
  images: string[];
  variants: ProductVariant[];
  attributes: {
    name: string;
    value: string;
  }[];
}

const EnhancedAddProduct: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'basic' | 'ai'>('basic');
  const [currentStep, setCurrentStep] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [recognizedProducts, setRecognizedProducts] = useState<RecognizedProduct[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [multipleProductsDetected, setMultipleProductsDetected] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Product form state
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    tags: [],
    images: [],
    variants: [],
    attributes: []
  });
  
  // New variant state
  const [newVariant, setNewVariant] = useState({
    name: '',
    values: ['']
  });
  
  // New tag input
  const [tagInput, setTagInput] = useState('');
  
  // When a product is recognized, update the form
  useEffect(() => {
    if (recognizedProducts.length > 0 && selectedProductIndex < recognizedProducts.length) {
      const recognizedProduct = recognizedProducts[selectedProductIndex];
      
      // Update form with recognized data
      setProductForm(prev => ({
        ...prev,
        name: recognizedProduct.name,
        price: recognizedProduct.suggestedPrice.toString(),
        category: recognizedProduct.category,
        // Convert AI attributes to form attributes
        attributes: recognizedProduct.attributes.map(attr => ({
          name: attr.name,
          value: attr.value
        })),
        tags: ProductRecognitionService.generateTags(recognizedProduct),
      }));
      
      // Generate description if none exists
      if (!productForm.description || productForm.description === '') {
        const generatedDescription = ProductRecognitionService.generateDescription(recognizedProduct);
        setProductForm(prev => ({
          ...prev,
          description: generatedDescription
        }));
      }
    }
  }, [recognizedProducts, selectedProductIndex]);
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Preview images
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = URL.createObjectURL(file);
      imageUrls.push(imageUrl);
    }
    
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };
  
  // Handle product detection with AI
  const handleDetectProduct = async () => {
    if (productForm.images.length === 0) return;
    
    setIsDetecting(true);
    
    try {
      // Simulate AI product detection
      const detectedProducts = await ProductRecognitionService.analyzeImage(
        productForm.images[0],
        Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1 // Sometimes detect multiple products
      );
      
      setRecognizedProducts(detectedProducts);
      setMultipleProductsDetected(detectedProducts.length > 1);
      setSelectedProductIndex(0);
      setDetectionComplete(true);
      
      // Move to the next step after detection
      if (currentStep === 0) setCurrentStep(1);
    } catch (error) {
      console.error('Error detecting product:', error);
    } finally {
      setIsDetecting(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description,
      images: productForm.images,
      category: productForm.category,
      stock: parseInt(productForm.stock) || 10,
      variants: productForm.variants,
      tags: productForm.tags,
      attributes: productForm.attributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    dispatch(addProduct(newProduct));
    navigate('/products');
  };
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    setProductForm(prev => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim().toLowerCase()]
    }));
    
    setTagInput('');
  };
  
  // Remove a tag
  const handleRemoveTag = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };
  
  // Handle attribute changes
  const handleAttributeChange = (index: number, field: 'name' | 'value', value: string) => {
    setProductForm(prev => {
      const newAttributes = [...prev.attributes];
      newAttributes[index] = {
        ...newAttributes[index],
        [field]: value
      };
      return {
        ...prev,
        attributes: newAttributes
      };
    });
  };
  
  // Add a new attribute
  const handleAddAttribute = () => {
    setProductForm(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }]
    }));
  };
  
  // Remove an attribute
  const handleRemoveAttribute = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };
  
  // Handle variant input changes
  const handleVariantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVariant(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  // Handle variant value changes
  const handleVariantValueChange = (index: number, value: string) => {
    setNewVariant(prev => {
      const newValues = [...prev.values];
      newValues[index] = value;
      return {
        ...prev,
        values: newValues
      };
    });
  };
  
  // Add a new variant value input
  const handleAddVariantValue = () => {
    setNewVariant(prev => ({
      ...prev,
      values: [...prev.values, '']
    }));
  };
  
  // Remove a variant value input
  const handleRemoveVariantValue = (index: number) => {
    setNewVariant(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };
  
  // Add the new variant to the product
  const handleAddVariant = () => {
    if (newVariant.name.trim() === '' || newVariant.values.some(v => v.trim() === '')) return;
    
    setProductForm(prev => ({
      ...prev,
      variants: [...prev.variants, {
        name: newVariant.name,
        values: newVariant.values.filter(v => v.trim() !== '')
      }]
    }));
    
    // Reset the variant form
    setNewVariant({
      name: '',
      values: ['']
    });
    
    setShowVariantForm(false);
  };
  
  // Remove a variant from the product
  const handleRemoveVariant = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };
  
  // Remove an image
  const handleRemoveImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Generate product description with AI
  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      if (recognizedProducts.length > 0 && selectedProductIndex < recognizedProducts.length) {
        const description = ProductRecognitionService.generateDescription(
          recognizedProducts[selectedProductIndex]
        );
        
        setProductForm(prev => ({
          ...prev,
          description
        }));
      }
      
      setIsGenerating(false);
    }, 1000);
  };

  // Step titles for multistep form
  const stepTitles = [
    'Upload Product Images',
    'Product Information',
    'Variants & Pricing',
    'Review & Publish'
  ];
  
  // Render Step 1: Image Upload
  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Product Images</h3>
      
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="mb-4">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 text-center mb-4">
            Drag and drop your product images here, or click to browse
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} className="mr-2" />
            Upload Images
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />
        </div>
      </div>
      
      {/* Image preview */}
      {productForm.images.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-gray-700">
            Uploaded Images ({productForm.images.length})
          </h4>
          <div className="grid grid-cols-4 gap-4">
            {productForm.images.map((image, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden group">
                <img
                  src={image}
                  alt={`Product preview ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    className="p-1 bg-red-500 text-white rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* AI detection section */}
      {productForm.images.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Sparkles size={20} className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium">AI Product Recognition</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Let our AI analyze your product images to automatically detect product details and attributes.
          </p>
          
          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleDetectProduct}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Detecting Product...
              </>
            ) : (
              <>
                <Scan size={18} className="mr-2" />
                Detect Product with AI
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Detection results */}
      {detectionComplete && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center mb-3">
            <CheckCircle size={20} className="text-primary-500 mr-2" />
            <h4 className="font-medium text-primary-700">Product Detected Successfully!</h4>
          </div>
          
          {multipleProductsDetected ? (
            <div>
              <p className="text-sm text-primary-800 mb-3">
                We detected {recognizedProducts.length} products in your image. Select the one you want to add:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {recognizedProducts.map((product, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`px-3 py-2 text-sm rounded-md ${
                      selectedProductIndex === index
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSelectedProductIndex(index)}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-primary-800 mb-1">
                Detected: <span className="font-medium">{recognizedProducts[0]?.name}</span>
              </p>
              <p className="text-sm text-primary-800">
                Confidence Score: <span className="font-medium">{recognizedProducts[0]?.confidence}%</span>
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="btn-primary"
          disabled={productForm.images.length === 0}
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render Step 2: Product Information
  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Product Information</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={productForm.name}
            onChange={handleInputChange}
            className="input w-full"
            placeholder="e.g. Handcrafted Silk Saree"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          <select
            id="category"
            name="category"
            value={productForm.category}
            onChange={handleInputChange}
            className="input w-full"
            required
          >
            <option value="">Select a category</option>
            <option value="Clothing & Accessories">Clothing & Accessories</option>
            <option value="Jewelry & Accessories">Jewelry & Accessories</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Beauty & Personal Care">Beauty & Personal Care</option>
            <option value="Electronics">Electronics</option>
            <option value="Food & Beverages">Food & Beverages</option>
            <option value="Handicrafts">Handicrafts</option>
            <option value="Art & Collectibles">Art & Collectibles</option>
          </select>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <button
              type="button"
              className="text-xs flex items-center text-primary-600 hover:text-primary-700"
              onClick={handleGenerateDescription}
              disabled={isGenerating || recognizedProducts.length === 0}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={12} className="mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={12} className="mr-1" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
          <textarea
            id="description"
            name="description"
            value={productForm.description}
            onChange={handleInputChange}
            className="input w-full min-h-[120px]"
            placeholder="Describe your product in detail..."
            required
          />
        </div>
        
        {/* Product attributes section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Attributes
            </label>
            <button
              type="button"
              className="text-xs flex items-center text-primary-600 hover:text-primary-700"
              onClick={handleAddAttribute}
            >
              <Plus size={12} className="mr-1" />
              Add Attribute
            </button>
          </div>
          
          {productForm.attributes.length > 0 ? (
            <div className="space-y-3">
              {productForm.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                    className="input flex-1"
                    placeholder="Attribute name (e.g. Material)"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    className="input flex-1"
                    placeholder="Value (e.g. Cotton)"
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveAttribute(index)}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No attributes added yet. Attributes help customers understand product specifications.
            </p>
          )}
        </div>
        
        {/* Tags section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
          </div>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="input flex-1"
              placeholder="Add a tag (e.g. cotton, handmade)"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              type="button"
              className="btn-outline py-2"
              onClick={handleAddTag}
            >
              <Plus size={20} />
            </button>
          </div>
          
          {productForm.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {productForm.tags.map((tag, index) => (
                <div key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1 text-gray-500" />
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-gray-500 hover:text-red-500"
                    onClick={() => handleRemoveTag(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No tags added yet. Tags help customers find your product in search results.
            </p>
          )}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="btn-outline"
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={!productForm.name || !productForm.category || !productForm.description}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render Step 3: Variants & Pricing
  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Variants & Pricing</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={productForm.price}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="e.g. 1299"
              min="0"
              required
            />
          </div>
          
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity*
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={productForm.stock}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="e.g. 20"
              min="0"
              required
            />
          </div>
        </div>
        
        {/* Variants section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Product Variants
            </label>
            <button
              type="button"
              className="text-xs flex items-center text-primary-600 hover:text-primary-700"
              onClick={() => setShowVariantForm(true)}
            >
              <Plus size={12} className="mr-1" />
              Add Variant
            </button>
          </div>
          
          {showVariantForm && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <h4 className="text-sm font-medium mb-3">New Variant</h4>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">
                  Variant Name (e.g. Size, Color)
                </label>
                <input
                  type="text"
                  value={newVariant.name}
                  onChange={handleVariantNameChange}
                  className="input w-full"
                  placeholder="e.g. Size"
                />
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-gray-600">
                    Variant Values
                  </label>
                  <button
                    type="button"
                    className="text-xs flex items-center text-primary-600 hover:text-primary-700"
                    onClick={handleAddVariantValue}
                  >
                    <Plus size={10} className="mr-1" />
                    Add Value
                  </button>
                </div>
                
                {newVariant.values.map((value, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleVariantValueChange(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`e.g. ${
                        newVariant.name === 'Size' ? 'Small' : 
                        newVariant.name === 'Color' ? 'Red' : 'Option'
                      }`}
                    />
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveVariantValue(index)}
                      disabled={newVariant.values.length === 1}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-outline py-1 px-3 text-sm"
                  onClick={() => setShowVariantForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary py-1 px-3 text-sm"
                  onClick={handleAddVariant}
                  disabled={!newVariant.name || newVariant.values.some(v => !v)}
                >
                  Add Variant
                </button>
              </div>
            </div>
          )}
          
          {productForm.variants.length > 0 ? (
            <div className="space-y-3">
              {productForm.variants.map((variant, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Layers size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm font-medium">{variant.name}</span>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variant.values.map((value, i) => (
                      <div key={i} className="bg-white px-2 py-1 rounded text-xs border border-gray-200">
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No variants added yet. Variants like size or color help customers choose the right product.
            </p>
          )}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="btn-outline"
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={!productForm.price || !productForm.stock}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render Step 4: Review & Publish
  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Review & Publish</h3>
      
      {/* Image preview */}
      {productForm.images.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-gray-700">
            Product Images
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {productForm.images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Product preview ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Product summary */}
      <div className="space-y-4">
        <div className="flex gap-6">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-500">Product Name</h4>
            <p className="mt-1">{productForm.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Price</h4>
            <p className="mt-1 font-semibold">₹{productForm.price}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Stock</h4>
            <p className="mt-1">{productForm.stock} units</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Category</h4>
          <p className="mt-1">{productForm.category}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Description</h4>
          <p className="mt-1 text-sm text-gray-600">{productForm.description}</p>
        </div>
        
        {/* Attributes summary */}
        {productForm.attributes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Attributes</h4>
            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
              {productForm.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-sm font-medium">{attr.name}:</span>
                  <span className="text-sm text-gray-600">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Variants summary */}
        {productForm.variants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Variants</h4>
            <div className="mt-1 space-y-2">
              {productForm.variants.map((variant, index) => (
                <div key={index}>
                  <span className="text-sm font-medium">{variant.name}:</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {variant.values.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags summary */}
        {productForm.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Tags</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {productForm.tags.map((tag, index) => (
                <div key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn-outline"
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
        >
          Publish Product
        </button>
      </div>
    </div>
  );
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pb-8"
    >
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">{t('addProduct.title')}</h1>
      </div>
      
      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {stepTitles.map((title, index) => (
            <React.Fragment key={index}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 font-medium relative",
                    currentStep === index
                      ? "border-primary-500 text-primary-500"
                      : currentStep > index
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-gray-300 text-gray-400"
                  )}
                >
                  {currentStep > index ? (
                    <Check size={20} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium",
                    currentStep === index
                      ? "text-primary-500"
                      : currentStep > index
                        ? "text-gray-700"
                        : "text-gray-400"
                  )}
                >
                  {title}
                </span>
              </div>
              
              {/* Connector line (except after last step) */}
              {index < stepTitles.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-1 mx-2",
                    currentStep > index
                      ? "bg-primary-500"
                      : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step content */}
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
      </form>
    </motion.div>
  );
};

export default EnhancedAddProduct;