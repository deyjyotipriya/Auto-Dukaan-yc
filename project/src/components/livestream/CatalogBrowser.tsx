import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatabaseService, { CapturedFrameRecord, ProductRecord, SessionRecord } from '../../services/DatabaseService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import ProductCreator from './ProductCreator';
import SessionManager from './SessionManager';

enum ViewMode {
  GRID = 'grid',
  LIST = 'list',
  TIMELINE = 'timeline'
}

interface CatalogBrowserProps {
  defaultSessionId?: string;
  onSelectFrame?: (frame: CapturedFrameRecord) => void;
}

const CatalogBrowser: React.FC<CatalogBrowserProps> = ({
  defaultSessionId,
  onSelectFrame
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(defaultSessionId || null);
  const [frames, setFrames] = useState<CapturedFrameRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [showProductCreator, setShowProductCreator] = useState<boolean>(false);
  const [showSessionManager, setShowSessionManager] = useState<boolean>(false);
  
  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await DatabaseService.getAllSessions();
        setSessions(allSessions.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));
        
        // If no session is selected, select the most recent one
        if (!selectedSessionId && allSessions.length > 0) {
          setSelectedSessionId(allSessions[0].id);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    };
    
    loadSessions();
  }, [selectedSessionId]);
  
  // Load frames and products when session changes
  useEffect(() => {
    const loadData = async () => {
      if (!selectedSessionId) {
        setFrames([]);
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Load frames for this session
        const sessionFrames = await DatabaseService.getFramesBySession(selectedSessionId);
        setFrames(sessionFrames.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        
        // Load products created from this session's frames
        const productIds = new Set<string>();
        for (const frame of sessionFrames) {
          if (frame.productDetected) {
            productIds.add(frame.productDetected);
          }
        }
        
        const productsData: ProductRecord[] = [];
        for (const productId of productIds) {
          const product = await DatabaseService.getProduct(productId);
          if (product) {
            productsData.push(product);
          }
        }
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedSessionId]);
  
  // Filter frames by search query
  const filteredFrames = frames.filter(frame => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const timestamp = new Date(frame.timestamp).toLocaleString().toLowerCase();
    const metadata = JSON.stringify(frame.metadata).toLowerCase();
    
    return timestamp.includes(query) || metadata.includes(query);
  });
  
  // Filter products by search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  const handleFrameClick = (frame: CapturedFrameRecord) => {
    setSelectedFrameId(frame.id);
    
    if (onSelectFrame) {
      onSelectFrame(frame);
    }
  };
  
  const handleCreateProduct = (frame: CapturedFrameRecord) => {
    setSelectedFrameId(frame.id);
    setShowProductCreator(true);
  };
  
  const handleProductCreated = async (productId: string) => {
    setShowProductCreator(false);
    
    try {
      // Refresh the frames list to update the product linking
      if (selectedSessionId) {
        const updatedFrames = await DatabaseService.getFramesBySession(selectedSessionId);
        setFrames(updatedFrames.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
      
      // Add the new product to the list
      const newProduct = await DatabaseService.getProduct(productId);
      if (newProduct) {
        setProducts(prev => [newProduct, ...prev]);
      }
    } catch (error) {
      console.error('Error refreshing data after product creation:', error);
    }
  };
  
  const handleViewProductDetails = (productId: string) => {
    navigate(`/products/${productId}`);
  };
  
  const handleSessionSelected = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowSessionManager(false);
  };
  
  const handleFrameSelected = (frameId: string) => {
    setSelectedFrameId(frameId);
    setShowSessionManager(false);
    
    // Find the frame and pass it to the parent component if needed
    const frame = frames.find(f => f.id === frameId);
    if (frame && onSelectFrame) {
      onSelectFrame(frame);
    }
  };
  
  // Render functions for different view modes
  const renderGridView = (items: CapturedFrameRecord[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {items.map(frame => (
        <div 
          key={frame.id}
          className={`cursor-pointer rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow ${
            selectedFrameId === frame.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleFrameClick(frame)}
        >
          <div className="aspect-square relative">
            <img
              src={frame.thumbnailUrl || frame.editedImageUrl || frame.imageUrl}
              alt={`Frame from ${new Date(frame.timestamp).toLocaleString()}`}
              className="w-full h-full object-cover"
            />
            {frame.productDetected && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                ✓
              </div>
            )}
          </div>
          <div className="p-2 bg-white">
            <div className="text-xs text-gray-500">
              {new Date(frame.timestamp).toLocaleString()}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleCreateProduct(frame);
                  }}>
                    Create Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderListView = (items: CapturedFrameRecord[]) => (
    <div className="space-y-2 mt-4">
      {items.map(frame => (
        <div 
          key={frame.id}
          className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex items-center ${
            selectedFrameId === frame.id ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => handleFrameClick(frame)}
        >
          <div className="w-16 h-16 mr-3 flex-shrink-0">
            <img
              src={frame.thumbnailUrl || frame.editedImageUrl || frame.imageUrl}
              alt={`Frame from ${new Date(frame.timestamp).toLocaleString()}`}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="flex-grow">
            <div className="text-sm">
              {new Date(frame.timestamp).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {frame.isEdited ? 'Edited' : 'Original'} 
              {frame.productDetected ? ' • Product Created' : ''}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateProduct(frame);
            }}
          >
            Create Product
          </Button>
        </div>
      ))}
    </div>
  );
  
  const renderTimelineView = (items: CapturedFrameRecord[]) => (
    <div className="mt-4">
      {sessions.map(session => {
        const sessionFrames = items.filter(frame => frame.sessionId === session.id);
        if (sessionFrames.length === 0) return null;
        
        return (
          <div key={session.id} className="mb-8">
            <h3 className="text-lg font-medium mb-2">{session.name}</h3>
            <div className="text-sm text-gray-500 mb-4">
              {new Date(session.startTime).toLocaleString()}
              {session.endTime ? ` - ${new Date(session.endTime).toLocaleString()}` : ' (In progress)'}
            </div>
            
            <div className="space-y-4">
              {sessionFrames.map(frame => (
                <div 
                  key={frame.id}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex items-center ${
                    selectedFrameId === frame.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleFrameClick(frame)}
                >
                  <div className="w-16 h-16 mr-3 flex-shrink-0">
                    <img
                      src={frame.thumbnailUrl || frame.editedImageUrl || frame.imageUrl}
                      alt={`Frame from ${new Date(frame.timestamp).toLocaleString()}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm">
                      {new Date(frame.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {frame.isEdited ? 'Edited' : 'Original'} 
                      {frame.productDetected ? ' • Product Created' : ''}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateProduct(frame);
                    }}
                  >
                    Create Product
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderProductsView = (items: ProductRecord[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {items.map(product => (
        <div 
          key={product.id}
          className="cursor-pointer rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
          onClick={() => handleViewProductDetails(product.id)}
        >
          <div className="aspect-square relative bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {product.isPublished && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                Published
              </div>
            )}
          </div>
          <div className="p-3 bg-white">
            <h3 className="font-medium truncate">{product.name}</h3>
            <div className="text-sm text-gray-900 mt-1 font-bold">
              ${product.price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {product.category}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  // If session manager is shown, display only that
  if (showSessionManager) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setShowSessionManager(false)}
        >
          &larr; Back to Catalog
        </Button>
        <SessionManager 
          onSelectSession={handleSessionSelected}
          onSelectFrame={handleFrameSelected}
          currentSessionId={selectedSessionId || undefined}
        />
      </div>
    );
  }
  
  // If product creator is shown, display only that
  if (showProductCreator && selectedFrameId) {
    const selectedFrame = frames.find(frame => frame.id === selectedFrameId);
    
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setShowProductCreator(false)}
        >
          &larr; Back to Catalog
        </Button>
        {selectedFrame && (
          <ProductCreator
            initialFrame={selectedFrame}
            onClose={() => setShowProductCreator(false)}
            onSuccess={handleProductCreated}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="frames">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <TabsList>
            <TabsTrigger value="frames">Frames</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSessionManager(true)}
            >
              Manage Sessions
            </Button>
            
            <Input
              className="w-60"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="frames">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === ViewMode.GRID ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(ViewMode.GRID)}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === ViewMode.LIST ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(ViewMode.LIST)}
              >
                List
              </Button>
              <Button
                variant={viewMode === ViewMode.TIMELINE ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(ViewMode.TIMELINE)}
              >
                Timeline
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredFrames.length} frames 
              {selectedSessionId && sessions.find(s => s.id === selectedSessionId)
                ? ` from "${sessions.find(s => s.id === selectedSessionId)?.name}"`
                : ''
              }
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center p-8">Loading frames...</div>
          ) : filteredFrames.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No frames found. Start a recording session to capture frames.
            </div>
          ) : (
            <>
              {viewMode === ViewMode.GRID && renderGridView(filteredFrames)}
              {viewMode === ViewMode.LIST && renderListView(filteredFrames)}
              {viewMode === ViewMode.TIMELINE && renderTimelineView(filteredFrames)}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="products">
          {isLoading ? (
            <div className="text-center p-8">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No products created yet. Create products from your captured frames.
            </div>
          ) : (
            renderProductsView(filteredProducts)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogBrowser;