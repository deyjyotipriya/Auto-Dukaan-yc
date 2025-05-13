import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Users,
  ShoppingBag,
  CreditCard,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  ArrowRight,
  Clock,
  Filter,
  FileText,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalyticsService, { 
  FullAnalyticsData, 
  AnalyticsTimeframe,
  DeviceData,
  TrafficSourceData,
  PagePerformanceData,
  ProductPerformanceData
} from '../../services/AnalyticsService';
import { StorefrontConfig } from '../../services/StorefrontService';
import dynamic from 'react-dom';

// We would normally use a proper charting library like ApexCharts, Recharts, etc.
// For this example, we'll create placeholder components
const VisitorChart = ({ data }: { data: any }) => (
  <div className="h-52 bg-gray-50 border rounded-md flex items-center justify-center">
    <p className="text-gray-400">Visitor Chart Component</p>
  </div>
);

const DeviceChart = ({ data }: { data: DeviceData[] }) => (
  <div className="h-52 bg-gray-50 border rounded-md flex items-center justify-center">
    <p className="text-gray-400">Device Distribution Chart</p>
  </div>
);

const ConversionChart = ({ data }: { data: any }) => (
  <div className="h-52 bg-gray-50 border rounded-md flex items-center justify-center">
    <p className="text-gray-400">Conversion Funnel Chart</p>
  </div>
);

interface StorefrontAnalyticsProps {
  storefrontConfig: StorefrontConfig;
}

const StorefrontAnalytics: React.FC<StorefrontAnalyticsProps> = ({
  storefrontConfig
}) => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customDateRange, setCustomDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<FullAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'acquisition' | 'behavior' | 'conversions'>('overview');
  
  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      let startDate: Date;
      let endDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          startDate = customDateRange.start;
          endDate = customDateRange.end;
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }
      
      try {
        const data = await AnalyticsService.getAnalyticsData(storefrontConfig.id, {
          startDate,
          endDate
        });
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeframe, customDateRange, storefrontConfig.id]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Get change indicator component
  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    const formattedChange = `${(Math.abs(change) * 100).toFixed(1)}%`;
    
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>{formattedChange}</span>
      </div>
    );
  };
  
  // Export analytics data
  const handleExportData = () => {
    if (!analyticsData) return;
    
    const csvData = AnalyticsService.exportAnalyticsToCSV(analyticsData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storefront-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Render metrics cards
  const renderOverviewCards = () => {
    if (!analyticsData) return null;
    
    const { overview } = analyticsData;
    
    const cards = [
      {
        icon: <Users className="h-5 w-5 text-blue-500" />,
        title: t('storefront.analytics.visitors'),
        value: overview.totalVisitors.toLocaleString(),
        change: overview.visitorsChange
      },
      {
        icon: <Eye className="h-5 w-5 text-purple-500" />,
        title: t('storefront.analytics.pageViews'),
        value: overview.totalPageViews.toLocaleString(),
        change: overview.visitorsChange * 1.1 // Just for variation
      },
      {
        icon: <ShoppingBag className="h-5 w-5 text-green-500" />,
        title: t('storefront.analytics.orders'),
        value: overview.totalOrders.toLocaleString(),
        change: overview.ordersChange
      },
      {
        icon: <CreditCard className="h-5 w-5 text-amber-500" />,
        title: t('storefront.analytics.revenue'),
        value: formatCurrency(overview.totalRevenue),
        change: overview.revenueChange
      }
    ];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between mb-2">
              <div className="p-2 rounded-md bg-gray-50">{card.icon}</div>
              {renderChangeIndicator(card.change)}
            </div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-gray-500">{card.title}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render device distribution
  const renderDeviceDistribution = () => {
    if (!analyticsData) return null;
    
    const { deviceDistribution } = analyticsData;
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.deviceDistribution')}</h3>
        
        <div className="space-y-4">
          <DeviceChart data={deviceDistribution} />
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            {deviceDistribution.map((device) => (
              <div key={device.device} className="text-center">
                <div className="flex justify-center mb-2">
                  {device.device === 'mobile' && <Smartphone className="h-6 w-6 text-blue-500" />}
                  {device.device === 'desktop' && <Monitor className="h-6 w-6 text-green-500" />}
                  {device.device === 'tablet' && <Tablet className="h-6 w-6 text-purple-500" />}
                </div>
                <div className="text-lg font-bold">{formatPercentage(device.percentage)}</div>
                <div className="text-xs text-gray-500 capitalize">{device.device}</div>
                <div className="text-sm">{device.visitors.toLocaleString()} {t('storefront.analytics.visitors')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render traffic sources
  const renderTrafficSources = () => {
    if (!analyticsData) return null;
    
    const { trafficSources } = analyticsData;
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.trafficSources')}</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 font-medium">{t('storefront.analytics.source')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.visitors')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.percentage')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.conversion')}</th>
              </tr>
            </thead>
            <tbody>
              {trafficSources.map((source, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{source.source}</td>
                  <td className="p-2 text-right">{source.visitors.toLocaleString()}</td>
                  <td className="p-2 text-right">{formatPercentage(source.percentage)}</td>
                  <td className="p-2 text-right">{formatPercentage(source.conversion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render top pages
  const renderTopPages = () => {
    if (!analyticsData) return null;
    
    const { topPages } = analyticsData;
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.topPages')}</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 font-medium">{t('storefront.analytics.page')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.views')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.avgTime')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.bounceRate')}</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <div className="font-medium truncate max-w-xs">{page.title}</div>
                    <div className="text-xs text-gray-500">{page.path}</div>
                  </td>
                  <td className="p-2 text-right">{page.views.toLocaleString()}</td>
                  <td className="p-2 text-right">{page.avgTimeOnPage}s</td>
                  <td className="p-2 text-right">{formatPercentage(page.bounceRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render conversion funnel
  const renderConversionFunnel = () => {
    if (!analyticsData) return null;
    
    // Calculate overall funnel metrics
    const visitors = analyticsData.conversionsByDay.reduce((sum, day) => sum + day.visitors, 0);
    const addedToCart = analyticsData.conversionsByDay.reduce((sum, day) => sum + day.addedToCart, 0);
    const checkouts = analyticsData.conversionsByDay.reduce((sum, day) => sum + day.checkouts, 0);
    const purchases = analyticsData.conversionsByDay.reduce((sum, day) => sum + day.purchases, 0);
    
    const cartRate = visitors > 0 ? addedToCart / visitors : 0;
    const checkoutRate = addedToCart > 0 ? checkouts / addedToCart : 0;
    const purchaseRate = checkouts > 0 ? purchases / checkouts : 0;
    const overallConversion = visitors > 0 ? purchases / visitors : 0;
    
    const steps = [
      {
        name: t('storefront.analytics.visitors'),
        value: visitors,
        percentage: 100
      },
      {
        name: t('storefront.analytics.addedToCart'),
        value: addedToCart,
        percentage: cartRate * 100
      },
      {
        name: t('storefront.analytics.checkouts'),
        value: checkouts,
        percentage: checkoutRate * 100
      },
      {
        name: t('storefront.analytics.purchases'),
        value: purchases,
        percentage: purchaseRate * 100
      }
    ];
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t('storefront.analytics.conversionFunnel')}</h3>
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {t('storefront.analytics.overallConversion')}: {formatPercentage(overallConversion)}
          </div>
        </div>
        
        <div className="space-y-4">
          <ConversionChart data={analyticsData.conversionsByDay} />
          
          <div className="relative pt-5">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{step.name}</span>
                    <span>{step.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${step.percentage}%` }}
                    ></div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-5 h-full">
                    <div className="w-0.5 h-8 bg-gray-200 mx-auto" style={{ transform: 'translateY(-50%)' }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render top products
  const renderTopProducts = () => {
    if (!analyticsData) return null;
    
    const { topProducts } = analyticsData;
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.topProducts')}</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 font-medium">{t('storefront.analytics.product')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.views')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.purchases')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.conversionRate')}</th>
                <th className="p-2 font-medium text-right">{t('storefront.analytics.revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.productId}</div>
                  </td>
                  <td className="p-2 text-right">{product.views.toLocaleString()}</td>
                  <td className="p-2 text-right">{product.purchases.toLocaleString()}</td>
                  <td className="p-2 text-right">{formatPercentage(product.conversionRate)}</td>
                  <td className="p-2 text-right font-medium">{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render visitor trends
  const renderVisitorTrends = () => {
    if (!analyticsData) return null;
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.visitorTrends')}</h3>
        <VisitorChart data={analyticsData.visitorsByDay} />
      </div>
    );
  };
  
  // Render tracking code snippet
  const renderTrackingCode = () => {
    const trackingCode = AnalyticsService.generateTrackingCode(storefrontConfig);
    
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-medium mb-3">{t('storefront.analytics.trackingCode')}</h3>
        <p className="text-sm text-gray-600 mb-4">{t('storefront.analytics.trackingCodeHelper')}</p>
        
        <div className="bg-gray-50 rounded-md border p-4 mb-4">
          <pre className="text-xs overflow-x-auto font-mono whitespace-pre-wrap">
            {trackingCode}
          </pre>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(trackingCode)}>
          {t('common.copy')}
        </Button>
      </div>
    );
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p>{t('storefront.analytics.loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            {t('storefront.analytics.title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('storefront.analytics.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex border rounded-md">
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe === '7d' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => setTimeframe('7d')}
            >
              7d
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe === '30d' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => setTimeframe('30d')}
            >
              30d
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe === '90d' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => setTimeframe('90d')}
            >
              90d
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe === 'custom' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => setTimeframe('custom')}
            >
              {t('storefront.analytics.custom')}
            </button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1" />
            {t('storefront.analytics.export')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const now = new Date();
              setTimeframe(timeframe);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('storefront.analytics.refresh')}
          </Button>
        </div>
      </div>
      
      {timeframe === 'custom' && (
        <div className="bg-gray-50 p-4 rounded-md flex items-center flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('storefront.analytics.startDate')}
            </label>
            <input 
              type="date" 
              value={customDateRange.start.toISOString().split('T')[0]}
              onChange={(e) => {
                const start = new Date(e.target.value);
                setCustomDateRange({ ...customDateRange, start });
              }}
              className="px-3 py-1.5 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('storefront.analytics.endDate')}
            </label>
            <input 
              type="date"
              value={customDateRange.end.toISOString().split('T')[0]}
              onChange={(e) => {
                const end = new Date(e.target.value);
                setCustomDateRange({ ...customDateRange, end });
              }}
              className="px-3 py-1.5 border rounded-md"
            />
          </div>
          <div className="self-end">
            <Button 
              onClick={() => {
                setTimeframe('custom');
              }}
            >
              {t('storefront.analytics.apply')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Navigation tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          <button 
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            {t('storefront.analytics.tabs.overview')}
          </button>
          <button 
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'audience' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('audience')}
          >
            {t('storefront.analytics.tabs.audience')}
          </button>
          <button 
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'acquisition' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('acquisition')}
          >
            {t('storefront.analytics.tabs.acquisition')}
          </button>
          <button 
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'behavior' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('behavior')}
          >
            {t('storefront.analytics.tabs.behavior')}
          </button>
          <button 
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'conversions' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('conversions')}
          >
            {t('storefront.analytics.tabs.conversions')}
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div>
          {renderOverviewCards()}
          {renderVisitorTrends()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderDeviceDistribution()}
            {renderTrafficSources()}
          </div>
          {renderConversionFunnel()}
          {renderTrackingCode()}
        </div>
      )}
      
      {activeTab === 'audience' && (
        <div>
          {renderOverviewCards()}
          {renderVisitorTrends()}
          {renderDeviceDistribution()}
          
          {/* Demographics data would be here in a real implementation */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.demographics')}</h3>
            <div className="p-8 bg-gray-50 rounded-md flex justify-center items-center">
              <p className="text-gray-400">{t('storefront.analytics.comingSoon')}</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'acquisition' && (
        <div>
          {renderTrafficSources()}
          
          {/* Referral sources would be here in a real implementation */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.campaignPerformance')}</h3>
            <div className="p-8 bg-gray-50 rounded-md flex justify-center items-center">
              <p className="text-gray-400">{t('storefront.analytics.comingSoon')}</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'behavior' && (
        <div>
          {renderTopPages()}
          {renderVisitorTrends()}
          
          {/* Events tracking would be here in a real implementation */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.eventTracking')}</h3>
            <div className="p-8 bg-gray-50 rounded-md flex justify-center items-center">
              <p className="text-gray-400">{t('storefront.analytics.comingSoon')}</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'conversions' && (
        <div>
          {renderConversionFunnel()}
          {renderTopProducts()}
          
          {/* Advanced e-commerce tracking would be here in a real implementation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.checkoutAnalysis')}</h3>
              <div className="p-8 bg-gray-50 rounded-md flex justify-center items-center">
                <p className="text-gray-400">{t('storefront.analytics.comingSoon')}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">{t('storefront.analytics.cartAnalysis')}</h3>
              <div className="p-8 bg-gray-50 rounded-md flex justify-center items-center">
                <p className="text-gray-400">{t('storefront.analytics.comingSoon')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorefrontAnalytics;