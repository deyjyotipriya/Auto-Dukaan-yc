import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectSessions, selectResultsFilter } from '../../store/slices/resultsSlice';
import { ResultsFilter as FilterType } from '../../services/ResultsManagementService';

interface ResultsFilterProps {
  onFilterChange: (filter: Partial<FilterType>) => void;
}

const ResultsFilter: React.FC<ResultsFilterProps> = ({ onFilterChange }) => {
  const currentFilter = useSelector(selectResultsFilter);
  const sessions = useSelector(selectSessions);
  
  const [filter, setFilter] = useState<Partial<FilterType>>({
    status: [],
    minConfidence: 0,
    categories: [],
    sortBy: 'date',
    sortDirection: 'desc',
    addedToCatalog: undefined,
    searchQuery: '',
  });

  // Initialize filter from current state
  useEffect(() => {
    setFilter({
      ...currentFilter
    });
  }, [currentFilter]);

  // Available statuses
  const statusOptions = [
    { value: 'detected', label: 'Detected' },
    { value: 'processed', label: 'Processed' },
    { value: 'added_to_catalog', label: 'Added to Catalog' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'pending_review', label: 'Pending Review' }
  ];

  // Available categories (should be dynamic based on your actual data)
  const categoryOptions = [
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Jewelry', label: 'Jewelry' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Home & Decor', label: 'Home & Decor' },
    { value: 'Handicrafts', label: 'Handicrafts' },
    { value: 'Beauty', label: 'Beauty' }
  ];

  // Handle changes to status filter
  const handleStatusChange = (status: string) => {
    const currentStatuses = filter.status || [];
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status as any];
    
    const newFilter = {
      ...filter,
      status: newStatuses
    };
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Handle changes to categories filter
  const handleCategoryChange = (category: string) => {
    const currentCategories = filter.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    const newFilter = {
      ...filter,
      categories: newCategories
    };
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Handle changes to confidence filter
  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    
    const newFilter = {
      ...filter,
      minConfidence: value
    };
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Handle changes to search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = {
      ...filter,
      searchQuery: e.target.value
    };
    
    setFilter(newFilter);
    
    // Debounce the search to avoid too many updates
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      onFilterChange(newFilter);
    }, 300);
  };

  // Handle changes to session filter
  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newFilter = {
      ...filter,
      sessions: value ? [value] : undefined
    };
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Handle changes to sort options
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [sortBy, sortDirection] = value.split(':');
    
    const newFilter = {
      ...filter,
      sortBy: sortBy as any,
      sortDirection: sortDirection as any
    };
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Handle changes to catalog filter
  const handleCatalogFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let addedToCatalog: boolean | undefined;
    
    if (value === 'true') {
      addedToCatalog = true;
    } else if (value === 'false') {
      addedToCatalog = false;
    } else {
      addedToCatalog = undefined;
    }
    
    const newFilter = {
      ...filter,
      addedToCatalog
    };
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Reset all filters
  const handleReset = () => {
    const resetFilter: Partial<FilterType> = {
      status: [],
      minConfidence: 0,
      categories: [],
      sortBy: 'date',
      sortDirection: 'desc',
      addedToCatalog: undefined,
      searchQuery: '',
      sessions: undefined
    };
    
    setFilter(resetFilter);
    onFilterChange(resetFilter);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by product name, attributes..."
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={filter.searchQuery || ''}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Session Filter */}
        <div>
          <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
            Session
          </label>
          <select
            id="session"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={filter.sessions && filter.sessions[0] || ''}
            onChange={handleSessionChange}
          >
            <option value="">All Sessions</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sort Options */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={`${filter.sortBy}:${filter.sortDirection}`}
            onChange={handleSortChange}
          >
            <option value="date:desc">Date (Newest First)</option>
            <option value="date:asc">Date (Oldest First)</option>
            <option value="confidence:desc">Confidence (High to Low)</option>
            <option value="confidence:asc">Confidence (Low to High)</option>
            <option value="category:asc">Category (A-Z)</option>
            <option value="category:desc">Category (Z-A)</option>
            <option value="status:asc">Status (A-Z)</option>
            <option value="status:desc">Status (Z-A)</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {statusOptions.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`status-${option.value}`}
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={(filter.status || []).includes(option.value as any)}
                  onChange={() => handleStatusChange(option.value)}
                />
                <label htmlFor={`status-${option.value}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="space-y-2">
            {categoryOptions.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`category-${option.value}`}
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={(filter.categories || []).includes(option.value)}
                  onChange={() => handleCategoryChange(option.value)}
                />
                <label htmlFor={`category-${option.value}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confidence Filter */}
        <div>
          <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Confidence ({filter.minConfidence ? Math.round(filter.minConfidence * 100) : 0}%)
          </label>
          <input
            type="range"
            id="confidence"
            min="0"
            max="100"
            step="5"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            value={filter.minConfidence ? filter.minConfidence * 100 : 0}
            onChange={handleConfidenceChange}
          />
        </div>
        
        {/* Catalog Filter */}
        <div>
          <label htmlFor="catalog" className="block text-sm font-medium text-gray-700 mb-1">
            Catalog Status
          </label>
          <select
            id="catalog"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={filter.addedToCatalog === undefined ? '' : filter.addedToCatalog.toString()}
            onChange={handleCatalogFilterChange}
          >
            <option value="">All</option>
            <option value="true">Added to Catalog</option>
            <option value="false">Not in Catalog</option>
          </select>
        </div>
      </div>
      
      {/* Filter Actions */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleReset}
        >
          Reset Filters
        </button>
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => onFilterChange(filter)}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default ResultsFilter;