import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  calculateMetrics, 
  selectResultsMetrics, 
  selectResultsLoading 
} from '../../store/slices/resultsSlice';
import { AppDispatch } from '../../store';

interface ResultsMetricsProps {
  sessionId?: string;
}

const ResultsMetrics: React.FC<ResultsMetricsProps> = ({ sessionId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const metrics = useSelector(selectResultsMetrics);
  const loading = useSelector(selectResultsLoading);
  
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  
  const [timeframe, setTimeframe] = useState<'all' | '7days' | '30days' | 'custom'>('all');

  // Calculate metrics on component mount
  useEffect(() => {
    if (timeframe === 'all') {
      dispatch(calculateMetrics());
    } else if (timeframe === '7days') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      setDateRange({ start, end });
      dispatch(calculateMetrics({ start, end }));
    } else if (timeframe === '30days') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setDateRange({ start, end });
      dispatch(calculateMetrics({ start, end }));
    }
  }, [dispatch, timeframe]);

  // Custom date range change
  const handleDateRangeChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    
    if (dateRange) {
      const newDateRange = {
        ...dateRange,
        [type]: date
      };
      setDateRange(newDateRange);
    } else {
      const now = new Date();
      setDateRange({
        start: type === 'start' ? date : now,
        end: type === 'end' ? date : now
      });
    }
  };

  // Apply custom date range
  const handleApplyDateRange = () => {
    if (dateRange) {
      dispatch(calculateMetrics(dateRange));
    }
  };
  
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

  if (!metrics) {
    return (
      <div className="p-6 text-center text-gray-500">
        No metrics available.
      </div>
    );
  }

  return (
    <div>
      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">Time Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`inline-flex items-center px-3 py-2 border ${
                timeframe === 'all' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setTimeframe('all')}
            >
              All Time
            </button>
            <button
              className={`inline-flex items-center px-3 py-2 border ${
                timeframe === '7days' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setTimeframe('7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`inline-flex items-center px-3 py-2 border ${
                timeframe === '30days' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setTimeframe('30days')}
            >
              Last 30 Days
            </button>
            <button
              className={`inline-flex items-center px-3 py-2 border ${
                timeframe === 'custom' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setTimeframe('custom')}
            >
              Custom Range
            </button>
          </div>
          
          {timeframe === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={dateRange?.start.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('start', e)}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={dateRange?.end.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('end', e)}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleApplyDateRange}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
          <p className="text-2xl font-bold">{metrics.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Products Detected</h3>
          <p className="text-2xl font-bold">{metrics.totalProductsDetected}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Products Added</h3>
          <p className="text-2xl font-bold">{metrics.totalProductsAdded}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Confidence</h3>
          <p className="text-2xl font-bold">{(metrics.averageConfidence * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Processing Time</h3>
          <p className="text-2xl font-bold">{metrics.processingTimeAverage.toFixed(0)} ms</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Category Distribution</h3>
          </div>
          <div className="p-4">
            {Object.keys(metrics.categoryDistribution).length === 0 ? (
              <p className="text-gray-500 text-center">No category data available.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(metrics.categoryDistribution).map(([category, count]) => {
                  const percentage = (count / metrics.totalProductsDetected) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-sm text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Rejection Reasons */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Top Rejection Reasons</h3>
          </div>
          <div className="p-4">
            {metrics.topRejectionReasons.length === 0 ? (
              <p className="text-gray-500 text-center">No rejection data available.</p>
            ) : (
              <div className="space-y-4">
                {metrics.topRejectionReasons.map((item) => {
                  return (
                    <div key={item.reason}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                        <span className="text-sm text-gray-500">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-red-500 h-2.5 rounded-full"
                          style={{ 
                            width: `${(item.count / Math.max(...metrics.topRejectionReasons.map(r => r.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Performance Over Time */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Performance Over Time</h3>
        </div>
        <div className="p-4">
          {metrics.performanceOverTime.length === 0 ? (
            <p className="text-gray-500 text-center">No time-series data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detections
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added to Catalog
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.performanceOverTime.map((period) => {
                    const conversionRate = period.detectionCount > 0 
                      ? (period.addedCount / period.detectionCount) * 100
                      : 0;
                    return (
                      <tr key={period.period}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(period.period).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {period.detectionCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {period.addedCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {conversionRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(period.averageConfidence * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Processing Efficiency */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Processing Efficiency</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Frames Processed</p>
              <p className="text-xl font-semibold">{metrics.totalFramesProcessed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Detection Rate</p>
              <p className="text-xl font-semibold">{metrics.averageDetectionRate.toFixed(2)} products/frame</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Processing Time</p>
              <p className="text-xl font-semibold">{metrics.processingTimeAverage.toFixed(1)} ms/frame</p>
            </div>
            
            <div className="col-span-3">
              <p className="text-sm text-gray-500 mb-2">Processing Performance</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${Math.min(100, (1 / metrics.processingTimeAverage) * 10000)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsMetrics;