import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Plus, 
  Edit, 
  BarChart3, 
  ShoppingBag, 
  ExternalLink,
  MoreHorizontal,
  Trash,
  Copy,
  ArrowUpDown,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { selectUser } from '../store/slices/userSlice';
import { selectStorefrontConfig, selectIsStorefrontPublished, selectStorefrontLiveUrl } from '../store/slices/storefrontSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Mock multiple storefront data for dashboard demonstration
interface StorefrontData {
  id: string;
  name: string;
  domain: string;
  isPublished: boolean;
  liveUrl: string | null;
  theme: string;
  lastUpdated: Date;
  status: 'active' | 'draft' | 'maintenance';
  orders: number;
  visitors: number;
  products: number;
}

const StorefrontManagement: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const storefrontConfig = useSelector(selectStorefrontConfig);
  const isPublished = useSelector(selectIsStorefrontPublished);
  const liveUrl = useSelector(selectStorefrontLiveUrl);
  
  const [storefronts, setStorefronts] = useState<StorefrontData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastUpdated' | 'visitors'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'maintenance'>('all');
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    // Here we're creating mock data including the real storefront if it exists
    const mockData: StorefrontData[] = [];
    
    // Add the real storefront if it exists
    if (storefrontConfig) {
      mockData.push({
        id: storefrontConfig.id,
        name: storefrontConfig.businessName,
        domain: storefrontConfig.domain,
        isPublished,
        liveUrl,
        theme: storefrontConfig.theme,
        lastUpdated: new Date(storefrontConfig.updatedAt),
        status: isPublished ? 'active' : 'draft',
        orders: Math.floor(Math.random() * 50),
        visitors: Math.floor(Math.random() * 500),
        products: Math.floor(Math.random() * 30),
      });
    }
    
    // Add some mock storefronts for demonstration
    mockData.push(
      {
        id: 'store-1',
        name: 'Fashion Boutique',
        domain: 'fashion-boutique.autodukaan.com',
        isPublished: true,
        liveUrl: 'https://fashion-boutique.autodukaan.com',
        theme: 'elegant',
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'active',
        orders: 37,
        visitors: 425,
        products: 48,
      },
      {
        id: 'store-2',
        name: 'Artisan Crafts',
        domain: 'artisan-crafts.autodukaan.com',
        isPublished: true,
        liveUrl: 'https://artisan-crafts.autodukaan.com',
        theme: 'vintage',
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'maintenance',
        orders: 12,
        visitors: 89,
        products: 35,
      },
      {
        id: 'store-3',
        name: 'Tech Gadgets',
        domain: 'tech-gadgets.autodukaan.com',
        isPublished: false,
        liveUrl: null,
        theme: 'modern',
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'draft',
        orders: 0,
        visitors: 0,
        products: 27,
      }
    );
    
    setStorefronts(mockData);
  }, [storefrontConfig, isPublished, liveUrl]);
  
  // Filter and sort storefronts
  const filteredStorefronts = storefronts
    .filter(store => 
      (filterStatus === 'all' || store.status === filterStatus) && 
      (store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       store.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'lastUpdated') {
        return sortOrder === 'asc' 
          ? a.lastUpdated.getTime() - b.lastUpdated.getTime() 
          : b.lastUpdated.getTime() - a.lastUpdated.getTime();
      } else if (sortBy === 'visitors') {
        return sortOrder === 'asc' 
          ? a.visitors - b.visitors 
          : b.visitors - a.visitors;
      }
      return 0;
    });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleCreateStore = () => {
    navigate('/storefront-creation');
  };
  
  const handleEditStore = (storeId: string) => {
    navigate('/storefront-settings');
  };
  
  const handleViewAnalytics = (storeId: string) => {
    // In a real app, this would navigate to the analytics page for the specific store
    console.log(`View analytics for store ${storeId}`);
  };
  
  const handleViewStore = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  const getStatusBadge = (status: StorefrontData['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('storefront.management.status.active')}
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {t('storefront.management.status.draft')}
          </span>
        );
      case 'maintenance':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {t('storefront.management.status.maintenance')}
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('storefront.management.title')}</h1>
            <p className="text-gray-600">{t('storefront.management.subtitle')}</p>
          </div>
          <Button onClick={handleCreateStore} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            {t('storefront.management.createNew')}
          </Button>
        </div>
        
        {storefronts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t('storefront.management.noStores')}</h2>
            <p className="text-gray-600 mb-6">{t('storefront.management.noStoresDesc')}</p>
            <Button onClick={handleCreateStore}>
              {t('storefront.management.createFirst')}
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
                <div className="relative w-full md:w-auto md:flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    type="text" 
                    placeholder={t('storefront.management.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="all">{t('storefront.management.filter.all')}</option>
                      <option value="active">{t('storefront.management.filter.active')}</option>
                      <option value="draft">{t('storefront.management.filter.draft')}</option>
                      <option value="maintenance">{t('storefront.management.filter.maintenance')}</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="lastUpdated">{t('storefront.management.sort.updated')}</option>
                      <option value="name">{t('storefront.management.sort.name')}</option>
                      <option value="visitors">{t('storefront.management.sort.visitors')}</option>
                    </select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={toggleSortOrder}
                    title={sortOrder === 'asc' ? t('storefront.management.sort.descending') : t('storefront.management.sort.ascending')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStorefronts.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg truncate" title={store.name}>
                        {store.name}
                      </h3>
                      {getStatusBadge(store.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Globe className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="truncate" title={store.domain}>{store.domain}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-gray-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold">{store.products}</div>
                        <div className="text-xs text-gray-500">{t('storefront.management.products')}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold">{store.orders}</div>
                        <div className="text-xs text-gray-500">{t('storefront.management.orders')}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold">{store.visitors}</div>
                        <div className="text-xs text-gray-500">{t('storefront.management.visitors')}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {t('storefront.management.lastUpdated')}: {store.lastUpdated.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditStore(store.id)}
                        className="flex items-center"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {t('common.edit')}
                      </Button>
                      
                      {store.isPublished && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewStore(store.liveUrl)}
                            className="flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {t('common.view')}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/store/${store.id}`)}
                            className="flex items-center"
                          >
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            View as Buyer
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewAnalytics(store.id)}
                        className="flex items-center"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {t('storefront.management.analytics')}
                      </Button>
                      
                      <div className="relative">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredStorefronts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Filter className="h-6 w-6 text-gray-400" />
                </div>
                <h2 className="text-lg font-medium mb-2">{t('storefront.management.noResults')}</h2>
                <p className="text-gray-600 mb-4">{t('storefront.management.noResultsDesc')}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  {t('storefront.management.clearFilters')}
                </Button>
              </div>
            )}
          </>
        )}
        
        {/* Information panel for subscription upgrade */}
        {storefronts.length >= 3 && (
          <div className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">{t('storefront.management.upgradeTitle')}</h3>
              <p className="text-sm text-amber-700 mt-1">{t('storefront.management.upgradeDesc')}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                {t('storefront.management.upgradePlan')}
              </Button>
            </div>
          </div>
        )}
      </div>
  );
};

export default StorefrontManagement;