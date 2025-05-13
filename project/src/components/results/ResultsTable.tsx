import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  updateResultStatus, 
  updateProductInformation,
  AppDispatch, 
  addResultTags,
  addResultNotes
} from '../../store/slices/resultsSlice';
import { DetectionResult } from '../../services/ResultsManagementService';

interface ResultsTableProps {
  results: DetectionResult[];
  onResultSelect: (resultId: string) => void;
  onBulkSelect?: (results: DetectionResult[]) => void;
  isFilteredView?: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  results, 
  onResultSelect,
  onBulkSelect,
  isFilteredView = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Status options for quick actions
  const statusOptions = [
    { value: 'processed', label: 'Mark as Processed', color: 'bg-blue-100 text-blue-800' },
    { value: 'added_to_catalog', label: 'Add to Catalog', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Reject', color: 'bg-red-100 text-red-800' },
    { value: 'pending_review', label: 'Mark for Review', color: 'bg-yellow-100 text-yellow-800' }
  ];

  // Handle status change
  const handleStatusChange = (resultId: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let details = {};
    
    if (status === 'rejected') {
      const reason = prompt('Enter reason for rejection:');
      if (!reason) return; // Cancel if no reason provided
      details = { reason };
    }
    
    if (status === 'added_to_catalog') {
      // In a real implementation, this might open a modal to select catalog options
      // For now, we'll just generate a placeholder catalog ID
      details = { catalogProductId: `catalog_${Date.now()}` };
    }
    
    dispatch(updateResultStatus({
      resultId,
      status: status as any,
      details
    }));
  };

  // Toggle row expansion
  const toggleRowExpansion = (resultId: string) => {
    setExpandedRow(expandedRow === resultId ? null : resultId);
  };
  
  // Handle row selection
  const handleRowSelect = (resultId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelectedRows = new Set(selectedRows);
    
    if (isChecked) {
      newSelectedRows.add(resultId);
    } else {
      newSelectedRows.delete(resultId);
    }
    
    setSelectedRows(newSelectedRows);
    
    // Notify parent component if provided
    if (onBulkSelect) {
      const selectedResults = results.filter(result => newSelectedRows.has(result.id));
      onBulkSelect(selectedResults);
    }
  };
  
  // Select/deselect all rows
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Select all
      const allIds = new Set(results.map(result => result.id));
      setSelectedRows(allIds);
      
      if (onBulkSelect) {
        onBulkSelect([...results]);
      }
    } else {
      // Deselect all
      setSelectedRows(new Set());
      
      if (onBulkSelect) {
        onBulkSelect([]);
      }
    }
  };

  // Add tags to a result
  const handleAddTag = (resultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tagInput = prompt('Enter tags (comma separated):');
    if (!tagInput) return;
    
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tags.length === 0) return;
    
    dispatch(addResultTags({
      resultId,
      tags
    }));
  };

  // Add notes to a result
  const handleAddNote = (resultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const note = prompt('Enter notes:');
    if (!note) return;
    
    dispatch(addResultNotes({
      resultId,
      notes: note
    }));
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'added_to_catalog':
        return 'bg-green-100 text-green-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (results.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No results found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {onBulkSelect && (
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={selectedRows.size === results.length && results.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result) => (
            <React.Fragment key={result.id}>
              <tr 
                className={`hover:bg-gray-50 cursor-pointer ${expandedRow === result.id ? 'bg-gray-50' : ''}`}
                onClick={() => toggleRowExpansion(result.id)}
              >
                {onBulkSelect && (
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedRows.has(result.id)}
                      onChange={(e) => handleRowSelect(result.id, e)}
                    />
                  </td>
                )}
                <td className="py-4 px-4">
                  <img 
                    src={result.detectedProduct.image} 
                    alt="Product" 
                    className="h-16 w-16 object-cover rounded"
                  />
                </td>
                <td className="py-4 px-4 text-sm">
                  {result.detectedProduct.attributes.category?.value || 'Unknown'}
                </td>
                <td className="py-4 px-4 text-sm">
                  {result.detectedProduct.attributes.type?.value || 'Unknown'}
                </td>
                <td className="py-4 px-4 text-sm">
                  {(result.confidence * 100).toFixed(1)}%
                </td>
                <td className="py-4 px-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(result.status)}`}>
                    {result.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm space-x-2">
                  <button 
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResultSelect(result.id);
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpansion(result.id);
                    }}
                  >
                    {expandedRow === result.id ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              
              {/* Expanded row */}
              {expandedRow === result.id && (
                <tr className="bg-gray-50">
                  <td colSpan={onBulkSelect ? 7 : 6} className="py-4 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Info */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Product Information</h4>
                        
                        {result.productInformation ? (
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Name:</span> {result.productInformation.name.text}</p>
                            <p className="text-sm"><span className="font-medium">Price:</span> {result.productInformation.price.currency} {result.productInformation.price.value}</p>
                            <p className="text-sm"><span className="font-medium">Description:</span> {result.productInformation.description.text.substring(0, 100)}...</p>
                            
                            {result.productInformation.tags.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">Tags: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.productInformation.tags.map(tag => (
                                    <span key={tag.text} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                      {tag.text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No product information generated yet.</p>
                        )}
                      </div>
                      
                      {/* Detection Details */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Detection Details</h4>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-medium">Detected At:</span> {new Date(result.createdAt).toLocaleString()}</p>
                          
                          <div>
                            <span className="text-sm font-medium">Attributes: </span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                              {Object.entries(result.detectedProduct.attributes).map(([key, value]) => (
                                value && (
                                  <p key={key} className="text-xs">
                                    <span className="font-medium capitalize">{key}:</span> {value.value} ({(value.confidence * 100).toFixed(0)}%)
                                  </p>
                                )
                              ))}
                            </div>
                          </div>
                          
                          {result.detectedProduct.priceDetection && (
                            <p className="text-sm">
                              <span className="font-medium">Detected Price:</span> {result.detectedProduct.priceDetection.text} ({(result.detectedProduct.priceDetection.confidence * 100).toFixed(0)}%)
                            </p>
                          )}
                          
                          {result.reviewTags && result.reviewTags.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Review Tags: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.reviewTags.map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {result.notes && (
                            <div>
                              <span className="text-sm font-medium">Notes: </span>
                              <p className="text-sm mt-1">{result.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                          <button
                            key={option.value}
                            className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded ${option.color} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            onClick={(e) => handleStatusChange(result.id, option.value, e)}
                          >
                            {option.label}
                          </button>
                        ))}
                        
                        <button
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={(e) => handleAddTag(result.id, e)}
                        >
                          Add Tags
                        </button>
                        
                        <button
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={(e) => handleAddNote(result.id, e)}
                        >
                          Add Notes
                        </button>
                        
                        <button
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResultSelect(result.id);
                          }}
                        >
                          Full Details
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;