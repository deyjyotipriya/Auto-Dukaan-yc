import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Video, 
  Camera,
  Plus,
  List,
  ArrowLeft,
  FileVideo,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LivestreamRecorder from '../components/livestream/LivestreamRecorder';
import ProductCreator from '../components/livestream/ProductCreator';
import CatalogBrowser from '../components/livestream/CatalogBrowser';
import SessionManager from '../components/livestream/SessionManager';
import { Button } from '../components/ui/button';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import DatabaseService, { CapturedFrameRecord, SessionRecord } from '../services/DatabaseService';
import { 
  fetchSessions, 
  createSession, 
  setCurrentSessionId,
  updateSession,
  fetchFrames,
  fetchProducts
} from '../store/slices/databaseSlice';

enum CatalogTab {
  RECORD = 'record',
  BROWSE = 'browse',
  MANAGE = 'manage'
}

const LivestreamCatalog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [activeTab, setActiveTab] = useState<CatalogTab>(CatalogTab.RECORD);
  const [selectedFrame, setSelectedFrame] = useState<CapturedFrameRecord | null>(null);
  const [showProductCreator, setShowProductCreator] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const sessions = useAppSelector(state => state.database.sessions.items);
  const currentSessionId = useAppSelector(state => state.database.sessions.currentSessionId);
  const sessionsStatus = useAppSelector(state => state.database.sessions.status);
  const products = useAppSelector(state => state.database.products.items);
  
  // Initialize database and load data
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Initialize the database
        await DatabaseService.initialize();
        
        // Load sessions
        dispatch(fetchSessions());
        
        // Load products
        dispatch(fetchProducts());
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    if (!isInitialized) {
      initializeDatabase();
    }
  }, [dispatch, isInitialized]);
  
  // Create a new session for recording if none exists
  useEffect(() => {
    const createNewSession = async () => {
      if (sessionsStatus === 'succeeded' && sessions.length === 0) {
        // Create a default session
        const newSession: Omit<SessionRecord, 'id'> = {
          name: `Session ${new Date().toLocaleString()}`,
          startTime: new Date(),
          endTime: null,
          status: 'ready',
          deviceInfo: navigator.userAgent,
          metadata: {
            browser: navigator.userAgent,
            createdFrom: 'LivestreamCatalog'
          }
        };
        
        dispatch(createSession(newSession));
      } else if (sessionsStatus === 'succeeded' && sessions.length > 0 && !currentSessionId) {
        // Set the most recent session as current if none is selected
        const mostRecentSession = [...sessions].sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )[0];
        
        dispatch(setCurrentSessionId(mostRecentSession.id));
      }
    };
    
    createNewSession();
  }, [sessionsStatus, sessions, currentSessionId, dispatch]);
  
  // Load frames when current session changes
  useEffect(() => {
    if (currentSessionId) {
      dispatch(fetchFrames(currentSessionId));
    }
  }, [currentSessionId, dispatch]);
  
  const handleStartRecording = () => {
    // Set status of current session to recording
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        dispatch(updateSession({
          ...session,
          status: 'recording',
          startTime: new Date()
        }));
      }
    }
  };
  
  const handleStopRecording = () => {
    // Set status of current session to completed
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        dispatch(updateSession({
          ...session,
          status: 'completed',
          endTime: new Date()
        }));
        
        // Load frames for this session
        dispatch(fetchFrames(currentSessionId));
        
        // Navigate to browse tab
        setActiveTab(CatalogTab.BROWSE);
      }
    }
  };
  
  const handleFrameSelected = (frame: CapturedFrameRecord) => {
    setSelectedFrame(frame);
    
    // If the frame doesn't have a product yet, show the product creator
    if (!frame.productDetected) {
      setShowProductCreator(true);
    }
  };
  
  const handleProductCreated = async (productId: string) => {
    setShowProductCreator(false);
    setSelectedFrame(null);
    
    // Refresh products list
    dispatch(fetchProducts());
    
    // Navigate to browse tab
    setActiveTab(CatalogTab.BROWSE);
  };
  
  // Render the Record tab content
  const renderRecordTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{t('livestream.catalog.recordLivestream', 'Record Livestream')}</h2>
      <p className="text-gray-600 mb-6">
        {t('livestream.catalog.description', 'Start a livestream to capture product screenshots every 5 seconds. These screenshots can be used to create your product catalog.')}
      </p>
      
      {!isInitialized ? (
        <div className="text-center p-6">Initializing database...</div>
      ) : !currentSessionId ? (
        <div className="text-center p-6">Creating a recording session...</div>
      ) : (
        <LivestreamRecorder 
          sessionId={currentSessionId}
          captureInterval={5000} // 5 seconds
          enableAIDetection={false}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      )}
      
      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => setActiveTab(CatalogTab.BROWSE)}
          className="mx-2"
        >
          Browse Captured Screenshots
        </Button>
      </div>
    </div>
  );
  
  // If product creator is shown, show that instead of normal content
  if (showProductCreator && selectedFrame) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setShowProductCreator(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back', 'Back')}
          </Button>
          <h1 className="text-2xl font-bold">
            {t('livestream.catalog.createProduct', 'Create Product')}
          </h1>
        </div>
        
        <ProductCreator
          initialFrame={selectedFrame}
          onClose={() => setShowProductCreator(false)}
          onSuccess={handleProductCreated}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('livestream.catalog.title', 'Livestream Catalog')}</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/products')}
        >
          <List className="h-4 w-4 mr-2" />
          {t('livestream.catalog.viewAllProducts', 'View All Products')}
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as CatalogTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value={CatalogTab.RECORD}>
            <Camera className="h-4 w-4 mr-2" />
            {t('livestream.catalog.record', 'Record')}
          </TabsTrigger>
          <TabsTrigger value={CatalogTab.BROWSE}>
            <FileVideo className="h-4 w-4 mr-2" />
            {t('livestream.catalog.browse', 'Browse')}
          </TabsTrigger>
          <TabsTrigger value={CatalogTab.MANAGE}>
            <Video className="h-4 w-4 mr-2" />
            {t('livestream.catalog.manage', 'Manage')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={CatalogTab.RECORD}>
          {renderRecordTab()}
        </TabsContent>
        
        <TabsContent value={CatalogTab.BROWSE}>
          <CatalogBrowser
            defaultSessionId={currentSessionId || undefined}
            onSelectFrame={handleFrameSelected}
          />
        </TabsContent>
        
        <TabsContent value={CatalogTab.MANAGE}>
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                {t('livestream.catalog.manageSessions', 'Manage Recording Sessions')}
              </h2>
            </div>
            <SessionManager
              onSelectSession={(sessionId) => {
                dispatch(setCurrentSessionId(sessionId));
              }}
              currentSessionId={currentSessionId || undefined}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Recent Products Section */}
      {activeTab === CatalogTab.RECORD && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {t('livestream.catalog.recentlyAddedProducts', 'Recently Added Products')}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/products')}
            >
              {t('livestream.catalog.viewAll', 'View All')}
            </Button>
          </div>
          
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <div 
                  key={product.id}
                  className="border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="aspect-square bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.images[0].alt || product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        product.inventory > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
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
              <p className="text-gray-500">
                {t('livestream.catalog.noProductsYet', 'No products have been created yet.')}
              </p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => navigate('/products/add')}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('livestream.catalog.addProductManually', 'Add Product Manually')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ShoppingBag icon
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