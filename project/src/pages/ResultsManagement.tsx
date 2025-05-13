import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSessions, 
  selectSessions, 
  selectResultsLoading, 
  selectResultsError,
  fetchSessionById,
  fetchSessionResults,
  selectCurrentSession,
  selectCurrentResults,
  selectCurrentSessionStats,
  clearCurrentSession,
  setFilter,
  filterResults,
  calculateMetrics,
  selectResultsMetrics
} from '../store/slices/resultsSlice';
import { AppDispatch } from '../store';
import { ProcessingSession, DetectionResult } from '../services/ResultsManagementService';

// Import components
import ResultsFilter from '../components/results/ResultsFilter';
import ResultsTable from '../components/results/ResultsTable';
import ResultsDetail from '../components/results/ResultsDetail';
import ResultsMetrics from '../components/results/ResultsMetrics';
import ResultsReprocessing from '../components/results/ResultsReprocessing';

const ResultsManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sessions = useSelector(selectSessions);
  const currentSession = useSelector(selectCurrentSession);
  const currentResults = useSelector(selectCurrentResults);
  const sessionStats = useSelector(selectCurrentSessionStats);
  const metrics = useSelector(selectResultsMetrics);
  const loading = useSelector(selectResultsLoading);
  const error = useSelector(selectResultsError);

  const [activeTab, setActiveTab] = useState<'sessions' | 'results' | 'metrics'>('sessions');
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [showReprocessing, setShowReprocessing] = useState<boolean>(false);
  const [selectedResults, setSelectedResults] = useState<DetectionResult[]>([]);

  // Fetch all sessions on mount
  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  // Calculate metrics on mount
  useEffect(() => {
    dispatch(calculateMetrics());
  }, [dispatch]);

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    dispatch(fetchSessionById(sessionId));
    dispatch(fetchSessionResults(sessionId));
    setActiveTab('results');
  };

  // Handle back to sessions list
  const handleBackToSessions = () => {
    dispatch(clearCurrentSession());
    setActiveTab('sessions');
  };

  // Handle result selection
  const handleResultSelect = (resultId: string) => {
    setSelectedResultId(resultId);
  };
  
  // Handle bulk result selection
  const handleResultsSelect = (results: DetectionResult[]) => {
    setSelectedResults(results);
  };
  
  // Open reprocessing modal
  const handleOpenReprocessing = () => {
    setShowReprocessing(true);
  };
  
  // Close reprocessing modal
  const handleCloseReprocessing = () => {
    setShowReprocessing(false);
  };

  // Handle filter change
  const handleFilterChange = (filter: any) => {
    dispatch(setFilter(filter));
    dispatch(filterResults({
      ...filter
    }));
  };

  // Render sessions list
  const renderSessionsList = () => {
    if (sessions.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-500">No processing sessions found.</p>
          <button 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={() => {/* TODO: Implement create session flow */}}
          >
            Create New Processing Session
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Source Type</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Products</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Added to Catalog</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr 
                key={session.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSessionSelect(session.id)}
              >
                <td className="py-4 px-4 text-sm">{session.name}</td>
                <td className="py-4 px-4 text-sm capitalize">{session.sourceType}</td>
                <td className="py-4 px-4 text-sm">
                  {new Date(session.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm">{session.productsDetected}</td>
                <td className="py-4 px-4 text-sm">{session.productsAdded}</td>
                <td className="py-4 px-4 text-sm space-x-2">
                  <button 
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSessionSelect(session.id);
                    }}
                  >
                    View
                  </button>
                  {/* Additional action buttons can be added here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render session details and results
  const renderSessionResults = () => {
    if (!currentSession) {
      return null;
    }

    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <button 
            className="flex items-center text-indigo-600 hover:text-indigo-900"
            onClick={handleBackToSessions}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sessions
          </button>
          <h2 className="text-xl font-semibold">{currentSession.name}</h2>
        </div>

        {/* Session Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Products Detected</h3>
            <p className="text-2xl font-bold">{sessionStats.totalDetected}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Added to Catalog</h3>
            <p className="text-2xl font-bold">{sessionStats.addedToCatalog}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold">{sessionStats.conversionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Avg. Confidence</h3>
            <p className="text-2xl font-bold">{(sessionStats.averageConfidence * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Filter Component */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Filter Results</h3>
          <ResultsFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Detected Products</h3>
            {selectedResults.length > 0 && (
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600">{selectedResults.length} selected</span>
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={handleOpenReprocessing}
                >
                  Reprocess Selected
                </button>
              </div>
            )}
          </div>
          {currentResults.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No results found.
            </div>
          ) : (
            <ResultsTable 
              results={currentResults} 
              onResultSelect={handleResultSelect}
              onBulkSelect={handleResultsSelect}
            />
          )}
        </div>
      </div>
    );
  };

  // Render metrics dashboard
  const renderMetrics = () => {
    if (!metrics) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-500">No metrics available.</p>
        </div>
      );
    }

    return <ResultsMetrics />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Results Management</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'sessions' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => {
              setActiveTab('sessions');
              if (currentSession) {
                dispatch(clearCurrentSession());
              }
            }}
          >
            Sessions
          </button>
          {currentSession && (
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'results' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
          )}
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'metrics' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
        </div>
      </div>

      {loading && !currentResults.length && (
        <div className="text-center py-8">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === 'sessions' && renderSessionsList()}
          {activeTab === 'results' && renderSessionResults()}
          {activeTab === 'metrics' && renderMetrics()}
        </div>
      )}

      {/* Result Detail Modal */}
      {selectedResultId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Product Details</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedResultId(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ResultsDetail resultId={selectedResultId} />
            </div>
          </div>
        </div>
      )}
      
      {/* Reprocessing Modal */}
      {showReprocessing && currentSession && (
        <ResultsReprocessing
          session={currentSession}
          selectedResults={selectedResults.length > 0 ? selectedResults : undefined}
          onClose={handleCloseReprocessing}
        />
      )}
    </div>
  );
};

export default ResultsManagement;