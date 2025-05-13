import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { 
  ShoppingBag, 
  Layers, 
  Tag, 
  Edit, 
  Trash, 
  CheckCircle, 
  Plus,
  Box,
  ArrowUpDown,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Camera,
  Copy,
  Upload,
  Search,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import LivestreamRecordingService, { RecordingSession } from '../../services/LivestreamRecordingService';
import ProductDetectionService, { 
  DetectedProduct, 
  DetectionSettings, 
  ProcessingStats 
} from '../../services/ProductDetectionService';
import ProductInformationService, {
  ProductInformation,
  GenerationSettings
} from '../../services/ProductInformationService';
import ProductInformationEditor from './ProductInformationEditor';
import ProcessingVisualization from './ProcessingVisualization';
import { AppDispatch } from '../../store';
import { formatFileSize, formatDuration } from '../../lib/utils';

interface ProductProcessingResultsProps {
  sessionId: string;
}

const ProductProcessingResults: React.FC<ProductProcessingResultsProps> = ({
  sessionId
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
  const [extractedProducts, setExtractedProducts] = useState<ProductInformation[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [activeTab, setActiveTab] = useState('detected');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'confidence' | 'timestamp'>('confidence');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showExtractForm, setShowExtractForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detection settings
  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    minConfidence: 0.5,
    maxProductsPerFrame: 5,
    trackingThreshold: 0.5,
    similarityThreshold: 0.7,
    frameSamplingRate: 3,
    enableOCR: true,
    includeFramesWithoutProducts: false,
    enhanceImageQuality: true,
    detectGroupedProducts: true,
    strictAttributeDetection: false,
    enableFaceBlurring: true,
  });
  
  // Information extraction settings
  const [extractionSettings, setExtractionSettings] = useState<GenerationSettings>({
    languages: ['en', 'hinglish'],
    nameMaxLength: 60,
    descriptionMaxLength: 500,
    generateVariants: true,
    includeBrandName: true,
    includeKeyFeatures: true,
    generateMultipleDescriptions: false,
    toneOfVoice: 'enthusiastic',
    priceSuggestionStrategy: 'extracted',
    includeTags: true,
    tagsCount: 5,
    includeSpecifications: true,
    generateSKU: true,
    inventoryEstimation: true,
    businessName: 'Our Shop',
  });
  
  // Load session data
  useEffect(() => {
    const loadSession = () => {
      const loadedSession = LivestreamRecordingService.getSession(sessionId);
      if (loadedSession) {
        setSession(loadedSession);
      }
    };
    
    loadSession();
  }, [sessionId]);
  
  // Add event listener for detection progress
  useEffect(() => {
    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent;
      setProcessingProgress(customEvent.detail.percentage);
    };
    
    window.addEventListener('productDetectionProgress', handleProgress);
    
    return () => {
      window.removeEventListener('productDetectionProgress', handleProgress);
    };
  }, []);
  
  // Process frames to detect products
  const processFrames = async () => {
    if (!session) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      setProcessingProgress(0);
      setDetectedProducts([]);
      
      // Process frames to detect products
      const result = await ProductDetectionService.processFrames(
        session.frames,
        detectionSettings
      );
      
      setDetectedProducts(result.detectedProducts);
      setProcessingStats(result.stats);
      setIsProcessing(false);
      setProcessingProgress(100);
      setShowVisualization(true);
    } catch (error) {
      console.error('Error processing frames:', error);
      setError(t('livestream.results.processingError'));
      setIsProcessing(false);
    }
  };
  
  // Extract product information
  const extractProductInformation = async (productId?: string) => {
    if (!productId && selectedProducts.length === 0) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const productsToProcess = productId 
        ? [detectedProducts.find(p => p.id === productId)!]
        : selectedProducts.map(id => detectedProducts.find(p => p.id === id)!);
      
      const extractedInfos: ProductInformation[] = [];
      
      for (const product of productsToProcess) {
        const info = await ProductInformationService.generateProductInformation(
          product,
          extractionSettings
        );
        extractedInfos.push(info);
      }
      
      setExtractedProducts(prev => [...prev, ...extractedInfos]);
      setIsProcessing(false);
      setActiveTab('extracted');
      
      // Clear selected products
      if (!productId) {
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error extracting product information:', error);
      setError(t('livestream.results.extractionError'));
      setIsProcessing(false);
    }
  };
  
  // Handle selection of a product
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  
  // Handle selecting all products
  const selectAllProducts = () => {
    const allIds = filteredProducts.map(product => product.id);
    setSelectedProducts(allIds);
  };
  
  // Handle deselecting all products
  const deselectAllProducts = () => {
    setSelectedProducts([]);
  };
  
  // Handle removing a detected product
  const removeDetectedProduct = (productId: string) => {
    setDetectedProducts(prev => prev.filter(product => product.id !== productId));
    
    // Also remove from selected products
    setSelectedProducts(prev => prev.filter(id => id !== productId));
    
    // If the product was the selected product, clear selection
    if (selectedProduct === productId) {
      setSelectedProduct(null);
    }
  };
  
  // Handle removing an extracted product
  const removeExtractedProduct = (productId: string) => {
    setExtractedProducts(prev => prev.filter(product => product.id !== productId));
  };
  
  // Extract all categories from detected products
  const categories = Array.from(
    new Set(detectedProducts.map(p => p.attributes.category?.value || 'Unknown'))
  );
  
  // Filter and sort products
  const filteredProducts = detectedProducts
    .filter(product => {
      // Apply category filter if set
      if (filterCategory && product.attributes.category?.value !== filterCategory) {
        return false;
      }
      
      // Apply search filter if present
      if (searchQuery) {
        const category = product.attributes.category?.value || '';
        const type = product.attributes.type?.value || '';
        const color = product.attributes.color?.value || '';
        const pattern = product.attributes.pattern?.value || '';
        const material = product.attributes.material?.value || '';
        
        const searchLower = searchQuery.toLowerCase();
        return (
          category.toLowerCase().includes(searchLower) ||
          type.toLowerCase().includes(searchLower) ||
          color.toLowerCase().includes(searchLower) ||
          pattern.toLowerCase().includes(searchLower) ||
          material.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'confidence') {
        return sortDirection === 'desc' 
          ? b.confidence - a.confidence 
          : a.confidence - b.confidence;
      } else {
        return sortDirection === 'desc' 
          ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() 
          : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
    });
  
  // Render process button
  const renderProcessButton = () => (
    <div className="flex justify-center">
      {session && !isProcessing && detectedProducts.length === 0 ? (
        <Button 
          onClick={processFrames}
          className="w-full md:w-auto"
          size="lg"
        >
          <Camera className="h-4 w-4 mr-2" />
          {t('livestream.results.detectProducts')}
        </Button>
      ) : isProcessing ? (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm mb-1">
            <span>{t('livestream.results.processing')}</span>
            <span>{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="h-2 w-full" />
        </div>
      ) : null}
    </div>
  );
  
  // Render session summary
  const renderSessionSummary = () => {
    if (!session) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">{t('livestream.results.sessionSummary')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('livestream.results.frames')}</h3>
            <div className="flex items-center">
              <Camera className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-2xl font-bold">{session.frames.length}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('livestream.results.captureInterval', { 
                interval: session.settings.captureInterval / 1000 
              })}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('livestream.results.duration')}</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-2xl font-bold">
                {session.startedAt && session.endedAt 
                  ? formatDuration((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
                  : '00:00:00'
                }
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {session.startedAt && session.endedAt
                ? `${new Date(session.startedAt).toLocaleTimeString()} - ${new Date(session.endedAt).toLocaleTimeString()}`
                : ''
              }
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('livestream.results.storage')}</h3>
            <div className="flex items-center">
              <Database className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-2xl font-bold">{formatFileSize(session.totalStorageUsed)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('livestream.results.averageFrameSize', { 
                size: formatFileSize(session.totalStorageUsed / session.frames.length) 
              })}
            </p>
          </div>
        </div>
        
        {detectedProducts.length > 0 && (
          <div className="mt-6">
            <div className="h-px bg-gray-200 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('livestream.results.productsDetected')}</h3>
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-2xl font-bold">{detectedProducts.length}</span>
                </div>
                {processingStats && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('livestream.results.averageConfidence', { 
                      confidence: Math.round(processingStats.averageConfidence * 100) 
                    })}
                  </p>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('livestream.results.topCategories')}</h3>
                <div className="space-y-1">
                  {getCategoryDistribution().slice(0, 3).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-xs">{category}</span>
                      <span className="text-xs font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('livestream.results.processingTime')}</h3>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {processingStats
                      ? Math.round(processingStats.totalProcessingTime / 1000)
                      : 0
                    }s
                  </span>
                </div>
                {processingStats && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('livestream.results.framesPerSecond', { 
                      fps: processingStats.frameProcessingRate.toFixed(1) 
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Get category distribution
  const getCategoryDistribution = () => {
    const distribution: Record<string, number> = {};
    
    for (const product of detectedProducts) {
      const category = product.attributes.category?.value || 'Unknown';
      distribution[category] = (distribution[category] || 0) + 1;
    }
    
    return Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  };
  
  // Render product grid
  const renderProductGrid = () => {
    if (isProcessing) {
      return (
        <div className="text-center py-12">
          <RefreshCw className="h-10 w-10 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">{t('livestream.results.processingInProgress')}</p>
        </div>
      );
    }
    
    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('livestream.results.noProductsDetected')}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={processFrames}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('livestream.results.tryAgain')}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            className={`border rounded-md overflow-hidden hover:shadow-md transition-shadow ${
              selectedProducts.includes(product.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => toggleProductSelection(product.id)}
          >
            <div className="aspect-square bg-white relative">
              <img 
                src={product.image} 
                alt=""
                className="w-full h-full object-contain"
              />
              
              <div className="absolute top-2 right-2">
                {selectedProducts.includes(product.id) ? (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                {t('livestream.results.confidence')}: {Math.round(product.confidence * 100)}%
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm capitalize">
                    {product.attributes.type?.value || 'Product'}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.attributes.category?.value && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {product.attributes.category.value}
                      </span>
                    )}
                    {product.attributes.color?.value && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                        {product.attributes.color.value}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product.id);
                    }}
                    className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDetectedProduct(product.id);
                    }}
                    className="text-red-600 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    extractProductInformation(product.id);
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {t('livestream.results.extract')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render extracted products
  const renderExtractedProducts = () => {
    if (extractedProducts.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Copy className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('livestream.results.noExtractedProducts')}</p>
          {detectedProducts.length > 0 && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveTab('detected')}
            >
              {t('livestream.results.goToDetected')}
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {extractedProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-white border rounded-lg shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 p-4">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0].url} 
                    alt={product.name.text}
                    className="w-full aspect-square object-contain"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="md:w-3/4 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{product.name.text}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {product.category.main}
                      </span>
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <span 
                          key={key}
                          className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
                        >
                          {key}: {value.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeExtractedProduct(product.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description.text}
                  </p>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.slice(0, 5).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      #{tag.text}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold">
                      ₹{product.price.value}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {product.price.source === 'extracted' 
                        ? t('livestream.results.extractedPrice') 
                        : t('livestream.results.estimatedPrice')}
                    </span>
                  </div>
                  
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('livestream.results.publishToCatalog')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render detailed product view
  const renderDetailedProduct = () => {
    if (!selectedProduct) return null;
    
    const product = detectedProducts.find(p => p.id === selectedProduct);
    if (!product) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">
              {t('livestream.results.productDetails')}
            </h3>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="border rounded-md overflow-hidden">
                  <img 
                    src={product.image} 
                    alt=""
                    className="w-full aspect-square object-contain"
                  />
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">{t('livestream.results.originalFrame')}</h4>
                  <div className="border rounded-md overflow-hidden relative">
                    {session?.frames.find(f => f.id === product.originalFrameId)?.dataUrl && (
                      <img 
                        src={session?.frames.find(f => f.id === product.originalFrameId)?.dataUrl} 
                        alt=""
                        className="w-full object-contain"
                      />
                    )}
                    
                    <div 
                      className="absolute border-2 border-red-500"
                      style={{
                        left: `${product.boundingBox.x * 100}%`,
                        top: `${product.boundingBox.y * 100}%`,
                        width: `${product.boundingBox.width * 100}%`,
                        height: `${product.boundingBox.height * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-2">
                    {product.attributes.type?.value || 'Product'}
                  </h3>
                  
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.round(product.confidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {Math.round(product.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('livestream.results.confidenceScore')}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('livestream.results.detectedAttributes')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(product.attributes).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key} className="bg-gray-50 p-3 rounded-md">
                            <div className="text-sm font-medium capitalize">
                              {key}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm">{value.value}</span>
                              <span className="text-xs text-gray-500">
                                {Math.round(value.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {product.priceDetection && (
                    <div>
                      <h4 className="font-medium mb-2">{t('livestream.results.priceDetection')}</h4>
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="text-lg font-bold text-green-800">
                          {product.priceDetection.currency} {product.priceDetection.value}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-green-700">
                            {product.priceDetection.text}
                          </span>
                          <span className="text-xs text-green-600">
                            {Math.round(product.priceDetection.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {product.ocr && (
                    <div>
                      <h4 className="font-medium mb-2">{t('livestream.results.textDetection')}</h4>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          {product.ocr.raw}
                        </p>
                        {product.ocr.structured.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            {product.ocr.structured.map((item, index) => (
                              <div key={index} className="flex justify-between text-xs mt-1">
                                <span className="font-medium text-blue-700">{item.key}:</span>
                                <span className="text-blue-900">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {product.isSimilarTo && product.isSimilarTo.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">{t('livestream.results.similarProducts')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.isSimilarTo.map(id => {
                          const similarProduct = detectedProducts.find(p => p.id === id);
                          if (!similarProduct) return null;
                          
                          return (
                            <div 
                              key={id} 
                              className="w-16 h-16 border rounded-md overflow-hidden"
                              onClick={() => setSelectedProduct(id)}
                            >
                              <img 
                                src={similarProduct.image} 
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={() => {
                      extractProductInformation(product.id);
                      setSelectedProduct(null);
                    }}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t('livestream.results.extractProductInfo')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render method
  return (
    <div className="space-y-6">
      {/* Show visualization if enabled */}
      {showVisualization && (
        <div className="fixed inset-0 z-50 bg-white">
          <ProcessingVisualization 
            sessionId={sessionId} 
            onClose={() => setShowVisualization(false)}
            detectedProducts={detectedProducts}
          />
        </div>
      )}
      
      {/* Session summary */}
      {renderSessionSummary()}
      
      {/* Process button */}
      {renderProcessButton()}
      
      {/* Results tabs */}
      {(detectedProducts.length > 0 || extractedProducts.length > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs 
            defaultValue="detected" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-gray-100 rounded-lg p-1">
                <TabsTrigger 
                  value="detected" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
                >
                  {t('livestream.results.detectedProducts')} ({detectedProducts.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="extracted" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
                >
                  {t('livestream.results.extractedProducts')} ({extractedProducts.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
                >
                  {t('livestream.results.settings')}
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'detected' && detectedProducts.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVisualization(true)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  {t('livestream.results.showVisualization')}
                </Button>
              )}
            </div>
            
            <TabsContent value="detected" className="space-y-6">
              {detectedProducts.length > 0 && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex space-x-2 items-center">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('livestream.results.search')}
                          className="pl-9"
                        />
                      </div>
                      
                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center"
                          onClick={() => setFilterCategory(null)}
                        >
                          <Filter className="h-4 w-4 mr-1.5" />
                          {filterCategory || t('livestream.results.allCategories')}
                          <ChevronDown className="h-4 w-4 ml-1.5" />
                        </Button>
                        
                        {filterCategory === null && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md border z-10">
                            <div className="py-1">
                              <button
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => setFilterCategory(null)}
                              >
                                {t('livestream.results.allCategories')}
                              </button>
                              {categories.map(category => (
                                <button
                                  key={category}
                                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={() => setFilterCategory(category)}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => {
                          setSortBy(sortBy === 'confidence' ? 'timestamp' : 'confidence');
                        }}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-1.5" />
                        {sortBy === 'confidence' 
                          ? t('livestream.results.sortByConfidence') 
                          : t('livestream.results.sortByTime')}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                        }}
                      >
                        {sortDirection === 'desc' 
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronUp className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                  
                  {selectedProducts.length > 0 && (
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
                      <div className="text-sm text-blue-800">
                        {t('livestream.results.selectedProducts', { count: selectedProducts.length })}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={deselectAllProducts}
                        >
                          {t('livestream.results.deselectAll')}
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => extractProductInformation()}
                        >
                          <Copy className="h-4 w-4 mr-1.5" />
                          {t('livestream.results.extractSelected')}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {filteredProducts.length === 0 && searchQuery && (
                    <div className="text-center py-6 bg-gray-50 rounded-md">
                      <p className="text-gray-500">
                        {t('livestream.results.noMatchingProducts')}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {renderProductGrid()}
            </TabsContent>
            
            <TabsContent value="extracted" className="space-y-6">
              {renderExtractedProducts()}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-md p-4">
                  <h3 className="font-medium mb-4">{t('livestream.results.detectionSettings')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{t('livestream.results.minConfidence')}</span>
                        <span>{Math.round(detectionSettings.minConfidence * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={detectionSettings.minConfidence}
                        onChange={(e) => setDetectionSettings(prev => ({
                          ...prev,
                          minConfidence: parseFloat(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{t('livestream.results.frameSamplingRate')}</span>
                        <span>{detectionSettings.frameSamplingRate}x</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={detectionSettings.frameSamplingRate}
                        onChange={(e) => setDetectionSettings(prev => ({
                          ...prev,
                          frameSamplingRate: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('livestream.results.frameSamplingRateHelp')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {t('livestream.results.enableOCR')}
                        </label>
                        <p className="text-xs text-gray-500">
                          {t('livestream.results.enableOCRHelp')}
                        </p>
                      </div>
                      <Switch
                        checked={detectionSettings.enableOCR}
                        onCheckedChange={(checked) => setDetectionSettings(prev => ({
                          ...prev,
                          enableOCR: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {t('livestream.results.enhanceImageQuality')}
                        </label>
                        <p className="text-xs text-gray-500">
                          {t('livestream.results.enhanceImageQualityHelp')}
                        </p>
                      </div>
                      <Switch
                        checked={detectionSettings.enhanceImageQuality}
                        onCheckedChange={(checked) => setDetectionSettings(prev => ({
                          ...prev,
                          enhanceImageQuality: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {t('livestream.results.enableFaceBlurring')}
                        </label>
                        <p className="text-xs text-gray-500">
                          {t('livestream.results.enableFaceBlurringHelp')}
                        </p>
                      </div>
                      <Switch
                        checked={detectionSettings.enableFaceBlurring}
                        onCheckedChange={(checked) => setDetectionSettings(prev => ({
                          ...prev,
                          enableFaceBlurring: checked
                        }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-md p-4">
                  <h3 className="font-medium mb-4">{t('livestream.results.extractionSettings')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        {t('livestream.results.pricingStrategy')}
                      </label>
                      <select
                        value={extractionSettings.priceSuggestionStrategy}
                        onChange={(e) => setExtractionSettings(prev => ({
                          ...prev,
                          priceSuggestionStrategy: e.target.value as any
                        }))}
                        className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="extracted">{t('livestream.results.useExtractedPrice')}</option>
                        <option value="market">{t('livestream.results.useMarketPrice')}</option>
                        <option value="premium">{t('livestream.results.usePremiumPrice')}</option>
                        <option value="budget">{t('livestream.results.useBudgetPrice')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        {t('livestream.results.businessName')}
                      </label>
                      <Input
                        type="text"
                        value={extractionSettings.businessName || ''}
                        onChange={(e) => setExtractionSettings(prev => ({
                          ...prev,
                          businessName: e.target.value
                        }))}
                        placeholder={t('livestream.results.businessNamePlaceholder')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {t('livestream.results.includeVariants')}
                        </label>
                        <p className="text-xs text-gray-500">
                          {t('livestream.results.includeVariantsHelp')}
                        </p>
                      </div>
                      <Switch
                        checked={extractionSettings.generateVariants}
                        onCheckedChange={(checked) => setExtractionSettings(prev => ({
                          ...prev,
                          generateVariants: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {t('livestream.results.includeKeyFeatures')}
                        </label>
                        <p className="text-xs text-gray-500">
                          {t('livestream.results.includeKeyFeaturesHelp')}
                        </p>
                      </div>
                      <Switch
                        checked={extractionSettings.includeKeyFeatures}
                        onCheckedChange={(checked) => setExtractionSettings(prev => ({
                          ...prev,
                          includeKeyFeatures: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {t('livestream.results.includeTags')}
                        </label>
                        <p className="text-xs text-gray-500">
                          {t('livestream.results.includeTagsHelp')}
                        </p>
                      </div>
                      <Switch
                        checked={extractionSettings.includeTags}
                        onCheckedChange={(checked) => setExtractionSettings(prev => ({
                          ...prev,
                          includeTags: checked
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={processFrames}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('livestream.results.reprocessWithSettings')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Detailed product view */}
      {selectedProduct && renderDetailedProduct()}
    </div>
  );
};

// Clock icon component
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

// Database icon component
function Database(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  );
}

export default ProductProcessingResults;