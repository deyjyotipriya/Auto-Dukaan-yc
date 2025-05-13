import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  reprocessResults,
  selectReprocessingStatus,
  selectResultsError
} from '../../store/slices/resultsSlice';
import { AppDispatch } from '../../store';
import { ProcessingSession, DetectionResult } from '../../services/ResultsManagementService';

interface ResultsReprocessingProps {
  session: ProcessingSession;
  selectedResults?: DetectionResult[];
  onClose: () => void;
}

const ResultsReprocessing: React.FC<ResultsReprocessingProps> = ({ 
  session, 
  selectedResults,
  onClose 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isReprocessing = useSelector(selectReprocessingStatus);
  const error = useSelector(selectResultsError);
  
  const [reprocessType, setReprocessType] = useState<'all' | 'selected' | 'failed'>('all');
  const [enhanceImageQuality, setEnhanceImageQuality] = useState(true);
  const [minConfidence, setMinConfidence] = useState(50);
  const [enableOCR, setEnableOCR] = useState(true);
  const [detectGroupedProducts, setDetectGroupedProducts] = useState(true);
  const [prioritizeCategories, setPrioritizeCategories] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  
  // Available categories
  const categoryOptions = [
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Jewelry', label: 'Jewelry' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Home & Decor', label: 'Home & Decor' },
    { value: 'Handicrafts', label: 'Handicrafts' },
    { value: 'Beauty', label: 'Beauty' }
  ];
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    const currentCategories = [...prioritizeCategories];
    const index = currentCategories.indexOf(category);
    
    if (index === -1) {
      // Add category
      currentCategories.push(category);
    } else {
      // Remove category
      currentCategories.splice(index, 1);
    }
    
    setPrioritizeCategories(currentCategories);
  };
  
  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare frames and product IDs based on reprocess type
    const frameIds = undefined; // In a real implementation, you would get all frame IDs from the session
    const productIds = reprocessType === 'selected' && selectedResults
      ? selectedResults.map(r => r.id)
      : undefined;
    
    // Prepare settings
    const settings = {
      minConfidence: minConfidence / 100,
      enhanceImageQuality,
      enableOCR,
      detectGroupedProducts,
      prioritizeCategories: prioritizeCategories.length > 0 ? prioritizeCategories : undefined
    };
    
    // Create reprocessing options
    const options = {
      sessionId: session.id,
      frameIds,
      productIds,
      settings,
      reason
    };
    
    // Dispatch reprocessing
    dispatch(reprocessResults(options))
      .then(() => {
        // Close modal on success
        onClose();
      });
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Reprocess Session: {session.name}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="space-y-6">
              {/* Reprocess Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What to Reprocess
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="reprocess-all"
                      name="reprocess-type"
                      type="radio"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      checked={reprocessType === 'all'}
                      onChange={() => setReprocessType('all')}
                    />
                    <label htmlFor="reprocess-all" className="ml-2 block text-sm text-gray-700">
                      All frames and products
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="reprocess-selected"
                      name="reprocess-type"
                      type="radio"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      checked={reprocessType === 'selected'}
                      onChange={() => setReprocessType('selected')}
                      disabled={!selectedResults || selectedResults.length === 0}
                    />
                    <label 
                      htmlFor="reprocess-selected" 
                      className={`ml-2 block text-sm ${
                        !selectedResults || selectedResults.length === 0
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}
                    >
                      Selected products ({selectedResults?.length || 0} selected)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="reprocess-failed"
                      name="reprocess-type"
                      type="radio"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      checked={reprocessType === 'failed'}
                      onChange={() => setReprocessType('failed')}
                    />
                    <label htmlFor="reprocess-failed" className="ml-2 block text-sm text-gray-700">
                      Failed or rejected products only
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Processing Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Settings</h4>
                
                <div className="space-y-4">
                  {/* Minimum Confidence */}
                  <div>
                    <label htmlFor="min-confidence" className="block text-sm text-gray-700 mb-1">
                      Minimum Confidence ({minConfidence}%)
                    </label>
                    <input
                      type="range"
                      id="min-confidence"
                      min="0"
                      max="100"
                      step="5"
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Lower (more results)</span>
                      <span>Higher (better quality)</span>
                    </div>
                  </div>
                  
                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="enhance-quality"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={enhanceImageQuality}
                        onChange={(e) => setEnhanceImageQuality(e.target.checked)}
                      />
                      <label htmlFor="enhance-quality" className="ml-2 block text-sm text-gray-700">
                        Enhance image quality (improves detection but slower)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="enable-ocr"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={enableOCR}
                        onChange={(e) => setEnableOCR(e.target.checked)}
                      />
                      <label htmlFor="enable-ocr" className="ml-2 block text-sm text-gray-700">
                        Enable OCR text detection
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="detect-grouped"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={detectGroupedProducts}
                        onChange={(e) => setDetectGroupedProducts(e.target.checked)}
                      />
                      <label htmlFor="detect-grouped" className="ml-2 block text-sm text-gray-700">
                        Detect grouped products
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prioritize Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritize Categories (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`category-${option.value}`}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={prioritizeCategories.includes(option.value)}
                        onChange={() => handleCategoryChange(option.value)}
                      />
                      <label htmlFor={`category-${option.value}`} className="ml-2 block text-sm text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Reason for Reprocessing */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reprocessing (Optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Explain why you are reprocessing this session..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isReprocessing}
            >
              {isReprocessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Start Reprocessing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultsReprocessing;