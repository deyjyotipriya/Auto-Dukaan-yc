import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Video, 
  Upload, 
  List, 
  Grid, 
  Camera,
  Plus,
  Settings,
  ArrowLeft,
  Info,
  FileVideo
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import VideoUploader from '../components/livestream/VideoUploader';
import ResponsiveLivestreamRecorder from '../components/livestream/ResponsiveLivestreamRecorder';
import ProductProcessingResults from '../components/livestream/ProductProcessingResults';
import { Button } from '../components/ui/button';
import { AppDispatch } from '../store';

// Import mock product data
import { selectAllProducts } from '../store/slices/productsSlice';

const LivestreamCatalog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [activeTab, setActiveTab] = useState('upload');
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const products = useSelector(selectAllProducts);
  
  const handleSessionCreated = (sessionId: string) => {
    setProcessingSessionId(sessionId);
  };
  
  const handleProcessingComplete = (sessionId: string) => {
    setProcessingSessionId(sessionId);
    setShowResults(true);
  };
  
  const handleBackToUpload = () => {
    setShowResults(false);
    setProcessingSessionId(null);
  };
  
  return (
      <div className="container mx-auto py-6 px-4">
        {!showResults ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{t('livestream.catalog.title')}</h1>
              <Button 
                variant="outline" 
                onClick={() => navigate('/livestream/manage')}
              >
                <List className="h-4 w-4 mr-2" />
                {t('livestream.catalog.manage')}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">{t('livestream.catalog.subtitle')}</h2>
              <p className="text-gray-600 mb-6">
                {t('livestream.catalog.description')}
              </p>
              
              <Tabs 
                defaultValue="upload" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="flex p-1 bg-gray-100 rounded-lg">
                  <TabsTrigger 
                    value="upload" 
                    className="flex-1 flex items-center justify-center py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <FileVideo className="h-4 w-4 mr-2" />
                    {t('livestream.catalog.uploadVideo')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="record" 
                    className="flex-1 flex items-center justify-center py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t('livestream.catalog.recordLivestream')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="background" 
                    className="flex-1 flex items-center justify-center py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {t('livestream.catalog.backgroundRecording')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="p-0">
                  <VideoUploader 
                    onSessionCreated={handleSessionCreated}
                    onProcessingComplete={handleProcessingComplete}
                  />
                </TabsContent>
                
                <TabsContent value="record" className="p-0">
                  <ResponsiveLivestreamRecorder 
                    onSessionCreated={handleSessionCreated}
                    onProcessingComplete={handleProcessingComplete}
                  />
                </TabsContent>
                
                <TabsContent value="background" className="p-0">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <Video className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      {t('livestream.catalog.backgroundRecordingTitle')}
                    </h3>
                    <p className="text-blue-700 mb-4">
                      {t('livestream.catalog.backgroundRecordingDescription')}
                    </p>
                    <div className="flex justify-center space-x-3">
                      <Button variant="outline">
                        {t('livestream.catalog.installExtension')}
                      </Button>
                      <Button>
                        {t('livestream.catalog.learnMore')}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{t('livestream.catalog.recentlyAddedProducts')}</h3>
                <Button variant="outline" size="sm">
                  {t('livestream.catalog.viewAll')}
                </Button>
              </div>
              
              {products && products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.slice(0, 4).map((product) => (
                    <div 
                      key={product.id}
                      className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-gray-100">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-bold">₹{product.price}</span>
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <ShoppingBag className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('livestream.catalog.noProductsYet')}</p>
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => navigate('/products/add')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('livestream.catalog.addProductManually')}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={handleBackToUpload}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common.back')}
              </Button>
              <h1 className="text-2xl font-bold">{t('livestream.results.title')}</h1>
            </div>
            
            {processingSessionId && (
              <ProductProcessingResults 
                sessionId={processingSessionId}
              />
            )}
          </div>
        )}
      </div>
  );
};

// ShoppingBag icon (to avoid import issues)
function ShoppingBag(props: any) {
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
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}

export default LivestreamCatalog;