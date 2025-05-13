import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchResultDetail, 
  selectDetailResult, 
  selectResultsLoading, 
  updateResultStatus,
  updateProductInformation,
  addResultTags,
  addResultNotes
} from '../../store/slices/resultsSlice';
import { AppDispatch } from '../../store';
import { addProduct } from '../../store/slices/productsSlice';
import ProductDetectionService from '../../services/ProductDetectionService';
import ProductInformationService from '../../services/ProductInformationService';

interface ResultsDetailProps {
  resultId: string;
}

const ResultsDetail: React.FC<ResultsDetailProps> = ({ resultId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const result = useSelector(selectDetailResult);
  const loading = useSelector(selectResultsLoading);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProductInfo, setEditedProductInfo] = useState<any>(null);
  const [isAddingToCatalog, setIsAddingToCatalog] = useState(false);

  // Fetch result details
  useEffect(() => {
    dispatch(fetchResultDetail(resultId));
  }, [dispatch, resultId]);

  // Initialize edited product info when result changes
  useEffect(() => {
    if (result && result.productInformation) {
      setEditedProductInfo({
        name: result.productInformation.name.text,
        description: result.productInformation.description.text,
        price: result.productInformation.price.value,
        category: result.productInformation.category.main,
        tags: result.productInformation.tags.map(tag => tag.text).join(', ')
      });
    }
  }, [result]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 text-center text-gray-500">
        No result found.
      </div>
    );
  }

  // Format an attribute value with confidence
  const formatAttributeWithConfidence = (attribute: any) => {
    if (!attribute) return 'N/A';
    return `${attribute.value} (${(attribute.confidence * 100).toFixed(0)}%)`;
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    let details = {};
    
    if (status === 'rejected') {
      const reason = prompt('Enter reason for rejection:');
      if (!reason) return; // Cancel if no reason provided
      details = { reason };
    }
    
    if (status === 'added_to_catalog') {
      setIsAddingToCatalog(true);
      return;
    }
    
    dispatch(updateResultStatus({
      resultId: result.id,
      status: status as any,
      details
    }));
  };

  // Handle adding to catalog
  const handleAddToCatalog = () => {
    if (!result.productInformation) {
      alert('Please generate product information first.');
      return;
    }
    
    // Create a product from the product information
    const product = {
      name: result.productInformation.name.text,
      price: result.productInformation.price.value,
      description: result.productInformation.description.text,
      images: [result.detectedProduct.image],
      category: result.productInformation.category.main,
      tags: result.productInformation.tags.map(tag => tag.text),
      stock: result.productInformation.estimatedInventory || 10,
      variants: result.productInformation.variants.map(variant => ({
        id: variant.type.toLowerCase().replace(/\s+/g, '_'),
        name: variant.type,
        values: variant.options
      }))
    };
    
    // Add to catalog
    dispatch(addProduct(product));
    
    // Update status
    dispatch(updateResultStatus({
      resultId: result.id,
      status: 'added_to_catalog',
      details: { catalogProductId: `catalog_${Date.now()}` }
    }));
    
    setIsAddingToCatalog(false);
  };

  // Handle adding tag
  const handleAddTag = () => {
    const tagInput = prompt('Enter tags (comma separated):');
    if (!tagInput) return;
    
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tags.length === 0) return;
    
    dispatch(addResultTags({
      resultId: result.id,
      tags
    }));
  };

  // Handle adding note
  const handleAddNote = () => {
    const note = prompt('Enter notes:');
    if (!note) return;
    
    dispatch(addResultNotes({
      resultId: result.id,
      notes: note
    }));
  };

  // Generate product information
  const handleGenerateInfo = async () => {
    try {
      // Generate product information for the detected product
      const productInfo = await ProductInformationService.generateProductInformation(
        result.detectedProduct
      );
      
      // Update product information
      dispatch(updateProductInformation({
        resultId: result.id,
        productInformation: productInfo
      }));
    } catch (error) {
      console.error('Error generating product information:', error);
      alert('Failed to generate product information.');
    }
  };

  // Handle editing changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProductInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited product information
  const handleSaveChanges = () => {
    if (!result.productInformation) return;
    
    // Parse tags
    const tags = editedProductInfo.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter(Boolean)
      .map((tag: string) => ({
        text: tag,
        confidence: 1.0,
        source: 'manual' as const
      }));
    
    // Create updated product information
    const updatedInfo = {
      ...result.productInformation,
      name: {
        text: editedProductInfo.name,
        confidence: 1.0,
        source: 'manual' as const
      },
      description: {
        text: editedProductInfo.description,
        confidence: 1.0,
        source: 'manual' as const
      },
      price: {
        ...result.productInformation.price,
        value: parseFloat(editedProductInfo.price),
        source: 'manual' as const
      },
      category: {
        main: editedProductInfo.category,
        confidence: 1.0
      },
      tags
    };
    
    // Update product information
    dispatch(updateProductInformation({
      resultId: result.id,
      productInformation: updatedInfo,
      manuallyEdited: true
    }));
    
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column - Product Image and Detection Details */}
      <div>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Product Image</h3>
          </div>
          <div className="p-4">
            <img 
              src={result.detectedProduct.image} 
              alt="Detected Product" 
              className="w-full h-auto max-h-96 object-contain rounded"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Detection Details</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Detected At</p>
                <p className="font-medium">{new Date(result.detectedProduct.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="font-medium">{(result.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{result.status.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session</p>
                <p className="font-medium">{result.sessionId}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Detected Attributes</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium">{formatAttributeWithConfidence(result.detectedProduct.attributes.category)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium">{formatAttributeWithConfidence(result.detectedProduct.attributes.type)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="text-sm font-medium">{formatAttributeWithConfidence(result.detectedProduct.attributes.color)}</p>
                </div>
                {result.detectedProduct.attributes.pattern && (
                  <div>
                    <p className="text-xs text-gray-500">Pattern</p>
                    <p className="text-sm font-medium">{formatAttributeWithConfidence(result.detectedProduct.attributes.pattern)}</p>
                  </div>
                )}
                {result.detectedProduct.attributes.material && (
                  <div>
                    <p className="text-xs text-gray-500">Material</p>
                    <p className="text-sm font-medium">{formatAttributeWithConfidence(result.detectedProduct.attributes.material)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {result.detectedProduct.priceDetection && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Detected Price</p>
                <p className="text-sm font-medium">
                  {result.detectedProduct.priceDetection.text} ({(result.detectedProduct.priceDetection.confidence * 100).toFixed(0)}%)
                </p>
              </div>
            )}
            
            {result.detectedProduct.ocr && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">OCR Text</p>
                <p className="text-sm">{result.detectedProduct.ocr.raw}</p>
                
                {result.detectedProduct.ocr.structured.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Structured Data</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {result.detectedProduct.ocr.structured.map((item, index) => (
                        <div key={index}>
                          <p className="text-xs text-gray-500 capitalize">{item.key}</p>
                          <p className="text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {result.reviewTags && result.reviewTags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Review Tags</p>
                <div className="flex flex-wrap gap-1">
                  {result.reviewTags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {result.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <p className="text-sm">{result.notes}</p>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Processing History</p>
              <div className="space-y-2">
                {result.processingHistory.map((entry, index) => (
                  <div key={index} className="flex space-x-2 text-sm">
                    <span className="text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="font-medium capitalize">{entry.action.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column - Product Information and Actions */}
      <div>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Product Information</h3>
            <div className="space-x-2">
              {result.productInformation ? (
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Info'}
                </button>
              ) : (
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleGenerateInfo}
                >
                  Generate Info
                </button>
              )}
            </div>
          </div>
          
          {result.productInformation ? (
            <div className="p-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editedProductInfo.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ({result.productInformation.price.currency})
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={editedProductInfo.price}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={editedProductInfo.category}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={editedProductInfo.description}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={editedProductInfo.tags}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Product Name</p>
                    <p className="font-medium">{result.productInformation.name.text}</p>
                    <p className="text-xs text-gray-400">
                      Confidence: {(result.productInformation.name.confidence * 100).toFixed(0)}%
                      {' | '}
                      Source: {result.productInformation.name.source}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">{result.productInformation.price.currency} {result.productInformation.price.value}</p>
                    <p className="text-xs text-gray-400">
                      Confidence: {(result.productInformation.price.confidence * 100).toFixed(0)}%
                      {' | '}
                      Source: {result.productInformation.price.source}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{result.productInformation.category.main}</p>
                    {result.productInformation.category.sub && (
                      <p className="text-sm">{result.productInformation.category.sub}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Confidence: {(result.productInformation.category.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm">{result.productInformation.description.text}</p>
                    <p className="text-xs text-gray-400">
                      Confidence: {(result.productInformation.description.confidence * 100).toFixed(0)}%
                      {' | '}
                      Source: {result.productInformation.description.source}
                    </p>
                  </div>
                  
                  {result.productInformation.variants.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Variants</p>
                      <div className="space-y-2">
                        {result.productInformation.variants.map((variant, index) => (
                          <div key={index}>
                            <p className="text-sm font-medium">{variant.type}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {variant.options.map((option, i) => (
                                <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  variant.default === option
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.productInformation.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {result.productInformation.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(result.productInformation.attributes).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Attributes</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(result.productInformation.attributes).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500 capitalize">{key}</p>
                            <p className="text-sm">
                              {Array.isArray(value.value) 
                                ? value.value.join(', ')
                                : value.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.productInformation.specifications && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Specifications</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(result.productInformation.specifications).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500">{key}</p>
                            <p className="text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No product information generated yet.</p>
              <button
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleGenerateInfo}
              >
                Generate Product Information
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Actions</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-2">
              <button
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => handleStatusChange('added_to_catalog')}
              >
                Add to Catalog
              </button>
              
              <button
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => handleStatusChange('pending_review')}
              >
                Mark for Review
              </button>
              
              <button
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => handleStatusChange('rejected')}
              >
                Reject
              </button>
              
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleAddTag}
                  >
                    Add Tag
                  </button>
                  
                  <button
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleAddNote}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add to Catalog Modal */}
      {isAddingToCatalog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Add to Catalog</h3>
            </div>
            <div className="p-4">
              <p className="mb-4">
                Are you sure you want to add this product to your catalog?
              </p>
              
              {!result.productInformation && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No product information has been generated. It's recommended to generate product information first.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsAddingToCatalog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleAddToCatalog}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDetail;