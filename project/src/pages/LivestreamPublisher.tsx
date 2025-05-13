import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Camera,
  Users,
  MessageSquare,
  Share,
  Settings,
  ShoppingBag,
  Clock,
  X,
  Send,
  Heart,
  ThumbsUp,
  Star,
  Smile,
  ChevronRight,
  CircleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { 
  createLivestream, 
  startLivestream, 
  endLivestream,
  addStreamComment,
  setStreamTitle,
  setStreamDescription,
  setStreamVisibility,
  setStreamQuality,
  setCameraPermission,
  setMicrophonePermission,
  selectCurrentStream,
  selectIsStreamLive,
  selectCameraPermission,
  selectMicrophonePermission,
  selectDetectedProducts,
  selectStreamComments,
  addReaction,
  StreamStatus
} from '../store/slices/livestreamSlice';
import { 
  StreamQuality, 
  StreamVisibility, 
  StreamDetectedProduct 
} from '../services/LivestreamService';
import StreamDetectedProductCard from '../components/livestream/StreamDetectedProductCard';
import LiveChatMessage from '../components/livestream/LiveChatMessage';
import ViewersList from '../components/livestream/ViewersList';
import StreamSettings from '../components/livestream/StreamSettings';
import ProductCatalogList from '../components/livestream/ProductCatalogList';
import { AppDispatch } from '../store';
import CatalogPublisher from '../components/livestream/CatalogPublisher';

const LivestreamPublisher: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const stream = useSelector(selectCurrentStream);
  const isLive = useSelector(selectIsStreamLive);
  const cameraPermission = useSelector(selectCameraPermission);
  const microphonePermission = useSelector(selectMicrophonePermission);
  const detectedProducts = useSelector(selectDetectedProducts);
  const streamComments = useSelector(selectStreamComments);
  
  const [streamTitle, setStreamTitleLocal] = useState('');
  const [streamDescription, setStreamDescriptionLocal] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [commentText, setCommentText] = useState('');
  const [showPreLiveScreen, setShowPreLiveScreen] = useState(true);
  const [setupStep, setSetupStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recentlyDetectedProducts, setRecentlyDetectedProducts] = useState<StreamDetectedProduct[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentListRef = useRef<HTMLDivElement>(null);
  
  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);
  
  // Format time elapsed
  const formatTimeElapsed = () => {
    const hours = Math.floor(timeElapsed / 3600);
    const minutes = Math.floor((timeElapsed % 3600) / 60);
    const seconds = timeElapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Setup media streams
  const setupMediaDevices = async () => {
    try {
      // Reset error state
      setError(null);
      
      // Request camera access
      const video = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(video);
      dispatch(setCameraPermission(true));
      
      // Request microphone access
      const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(audio);
      dispatch(setMicrophonePermission(true));
      
      // Advance to next step when permissions granted
      setSetupStep(1);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera or microphone. Please check permissions.');
      
      // Set permissions based on what was granted
      if (videoStream) dispatch(setCameraPermission(true));
      if (audioStream) dispatch(setMicrophonePermission(true));
    }
  };
  
  // Connect media streams to video element
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);
  
  // Toggle audio
  const toggleAudio = () => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (videoStream) {
      videoStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };
  
  // Request permissions on component mount
  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Create a new stream
  const createNewStream = () => {
    dispatch(createLivestream({
      title: streamTitle,
      description: streamDescription,
      visibility: StreamVisibility.PUBLIC,
      quality: StreamQuality.HIGH,
      productDetectionEnabled: true,
      chatEnabled: true,
    }));
    
    // Advance to go live screen
    setSetupStep(2);
  };
  
  // Start streaming
  const startStreaming = () => {
    if (stream) {
      dispatch(startLivestream(stream.id));
      setShowPreLiveScreen(false);
      
      // Simulate viewer count increasing for demo
      startViewerSimulation();
      
      // Simulate product detection
      simulateProductDetection();
    }
  };
  
  // End streaming
  const endStreaming = () => {
    if (stream) {
      dispatch(endLivestream(stream.id));
      
      // Redirect to stream summary
      navigate(`/livestream/summary/${stream.id}`);
    }
  };
  
  // Update title
  const handleTitleChange = (title: string) => {
    setStreamTitleLocal(title);
    if (stream) {
      dispatch(setStreamTitle(title));
    }
  };
  
  // Update description
  const handleDescriptionChange = (description: string) => {
    setStreamDescriptionLocal(description);
    if (stream) {
      dispatch(setStreamDescription(description));
    }
  };
  
  // Send a comment (for testing only)
  const sendComment = () => {
    if (stream && commentText.trim()) {
      dispatch(addStreamComment({
        streamId: stream.id,
        comment: {
          userId: 'self',
          userName: 'You',
          content: commentText,
        }
      }));
      setCommentText('');
    }
  };
  
  // Send a reaction
  const sendReaction = (type: string) => {
    if (stream) {
      dispatch(addReaction({ type }));
    }
  };
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [streamComments]);
  
  // Simulate increasing viewer count
  const startViewerSimulation = () => {
    const interval = setInterval(() => {
      if (viewerCount < 50) {
        setViewerCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  };
  
  // Simulate product detection
  const simulateProductDetection = () => {
    const interval = setInterval(() => {
      // 30% chance of detecting a new product
      if (Math.random() > 0.7) {
        const newProduct: StreamDetectedProduct = {
          timestamp: new Date(),
          productId: `product_${Math.floor(Math.random() * 1000)}`,
          confidence: 0.7 + Math.random() * 0.3,
          boundingBox: {
            x: Math.random() * 0.7,
            y: Math.random() * 0.7,
            width: 0.1 + Math.random() * 0.3,
            height: 0.1 + Math.random() * 0.3,
          },
          attributes: {
            color: ['red', 'blue', 'green', 'black', 'white'][Math.floor(Math.random() * 5)],
            type: ['shirt', 'pants', 'dress', 'jacket', 'skirt'][Math.floor(Math.random() * 5)],
            pattern: ['solid', 'striped', 'floral', 'checkered'][Math.floor(Math.random() * 4)],
          },
        };
        
        setRecentlyDetectedProducts(prev => [newProduct, ...prev].slice(0, 5));
      }
    }, 20000); // Every 20 seconds
    
    return () => clearInterval(interval);
  };
  
  // Pre-live setup screen
  const renderSetupScreen = () => {
    return (
      <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{t('livestream.setup.title')}</h2>
          <p className="text-gray-600">{t('livestream.setup.subtitle')}</p>
        </div>
        
        {setupStep === 0 && (
          <div className="space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('livestream.setup.cameraAccess')}</h3>
              <p className="text-gray-600 mb-4">{t('livestream.setup.allowAccess')}</p>
              <Button 
                onClick={setupMediaDevices}
                className="mx-auto"
              >
                {t('livestream.setup.grantAccess')}
              </Button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                  <CircleAlert className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {setupStep === 1 && (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button 
                  onClick={toggleAudio} 
                  className={`p-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-2 rounded-full ${videoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('livestream.setup.streamTitle')}
                </label>
                <Input 
                  type="text" 
                  value={streamTitle} 
                  onChange={(e) => setStreamTitleLocal(e.target.value)}
                  placeholder={t('livestream.setup.streamTitlePlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('livestream.setup.streamDescription')}
                </label>
                <Input
                  type="text"
                  value={streamDescription}
                  onChange={(e) => setStreamDescriptionLocal(e.target.value)}
                  placeholder={t('livestream.setup.streamDescriptionPlaceholder')}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={createNewStream}
                  disabled={!streamTitle.trim()}
                >
                  {t('livestream.setup.continue')}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {setupStep === 2 && (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-2 py-1 rounded flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span> 
                {t('livestream.preview')}
              </div>
              
              <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded flex items-center">
                <Users className="h-4 w-4 mr-1" /> 0
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button 
                  onClick={toggleAudio} 
                  className={`p-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-2 rounded-full ${videoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">
                  {t('livestream.setup.readyToGo')}
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  {t('livestream.setup.readyToGoDescription')}
                </p>
                <div className="text-sm text-green-800">
                  <div className="flex items-start mb-2">
                    <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{t('livestream.setup.tip1')}</span>
                  </div>
                  <div className="flex items-start">
                    <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{t('livestream.setup.tip2')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={startStreaming}
                  variant="destructive"
                >
                  {t('livestream.setup.goLive')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Main livestream interface
  const renderLiveInterface = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Livestream Video Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-black relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-2 py-1 rounded flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span> 
                {t('livestream.live')}
              </div>
              
              <div className="absolute top-4 right-4 flex space-x-2">
                <div className="bg-black/70 text-white text-sm px-2 py-1 rounded flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> {formatTimeElapsed()}
                </div>
                <div className="bg-black/70 text-white text-sm px-2 py-1 rounded flex items-center">
                  <Users className="h-4 w-4 mr-1" /> {viewerCount}
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  onClick={toggleAudio} 
                  className={`p-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-2 rounded-full ${videoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{stream?.title}</h2>
                  <p className="text-gray-600 text-sm">{stream?.description}</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={endStreaming}
                >
                  {t('livestream.endStream')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Recently Detected Products */}
          {recentlyDetectedProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-3">{t('livestream.detectedProducts')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentlyDetectedProducts.map((product, index) => (
                  <StreamDetectedProductCard 
                    key={`${product.productId}_${index}`}
                    product={product}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Product Catalog Publisher */}
          <CatalogPublisher />
        </div>
        
        {/* Right Sidebar with Tabs */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="border-b w-full bg-gray-50 px-4 py-2">
                <TabsTrigger value="chat" className="flex items-center px-3 py-1.5 mr-2">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  {t('livestream.chat')}
                </TabsTrigger>
                <TabsTrigger value="viewers" className="flex items-center px-3 py-1.5 mr-2">
                  <Users className="h-4 w-4 mr-1.5" />
                  {t('livestream.viewers')}
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center px-3 py-1.5 mr-2">
                  <ShoppingBag className="h-4 w-4 mr-1.5" />
                  {t('livestream.products')}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center px-3 py-1.5">
                  <Settings className="h-4 w-4 mr-1.5" />
                  {t('livestream.settings')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="p-0 flex flex-col h-[500px]">
                <div 
                  ref={commentListRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {streamComments.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                      {t('livestream.noComments')}
                    </div>
                  ) : (
                    streamComments.map((comment, index) => (
                      <LiveChatMessage 
                        key={comment.id || index}
                        message={comment}
                      />
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t">
                  <div className="mb-2 flex justify-center space-x-3">
                    <button
                      onClick={() => sendReaction('heart')}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-full"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => sendReaction('thumbsUp')}
                      className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => sendReaction('star')}
                      className="text-yellow-500 hover:bg-yellow-50 p-1.5 rounded-full"
                    >
                      <Star className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => sendReaction('smile')}
                      className="text-green-500 hover:bg-green-50 p-1.5 rounded-full"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex">
                    <Input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t('livestream.typeMessage')}
                      className="rounded-r-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendComment();
                      }}
                    />
                    <Button 
                      onClick={sendComment}
                      className="rounded-l-none"
                      disabled={!commentText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="viewers" className="p-4">
                <ViewersList viewerCount={viewerCount} />
              </TabsContent>
              
              <TabsContent value="products" className="p-4">
                <ProductCatalogList />
              </TabsContent>
              
              <TabsContent value="settings" className="p-4">
                <StreamSettings 
                  streamTitle={stream?.title || ''}
                  streamDescription={stream?.description || ''}
                  onTitleChange={handleTitleChange}
                  onDescriptionChange={handleDescriptionChange}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Stream Info Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">{t('livestream.shareStream')}</h3>
            <div className="flex items-center mb-3">
              <Input
                readOnly
                value={stream?.liveUrl || ''}
                className="mr-2"
              />
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <img src="/facebook-icon.svg" alt="Facebook" className="h-4 w-4 mr-1.5" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <img src="/whatsapp-icon.svg" alt="WhatsApp" className="h-4 w-4 mr-1.5" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <img src="/instagram-icon.svg" alt="Instagram" className="h-4 w-4 mr-1.5" />
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
      <div className="container mx-auto py-6 px-4">
        {showPreLiveScreen ? renderSetupScreen() : renderLiveInterface()}
      </div>
  );
};

export default LivestreamPublisher;