import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  Settings,
  MoreVertical,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import LivestreamRecordingService, { RecordingSession, CapturedFrame } from '../../services/LivestreamRecordingService';
import { DetectedProduct } from '../../services/ProductDetectionService';

interface MobileProcessingVisualizationProps {
  sessionId: string;
  detectedProducts: DetectedProduct[];
  onClose: () => void;
}

const MobileProcessingVisualization: React.FC<MobileProcessingVisualizationProps> = ({
  sessionId,
  detectedProducts,
  onClose
}) => {
  const { t } = useTranslation();
  
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightProducts, setHighlightProducts] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playbackTimerRef = useRef<number | null>(null);
  
  // Load session data
  useEffect(() => {
    const loadSession = () => {
      const loadedSession = LivestreamRecordingService.getSession(sessionId);
      if (loadedSession) {
        setSession(loadedSession);
      }
    };
    
    loadSession();
  }, [sessionId]);
  
  // Effect for automatic playback
  useEffect(() => {
    if (isPlaying && session) {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current);
      }
      
      playbackTimerRef.current = window.setInterval(() => {
        setCurrentFrameIndex(prev => {
          const next = prev + 1;
          if (next >= session.frames.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    } else if (playbackTimerRef.current) {
      window.clearInterval(playbackTimerRef.current);
    }
    
    return () => {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, session, playbackSpeed]);
  
  // Draw current frame with detection overlays
  useEffect(() => {
    if (!session || !canvasRef.current || currentFrameIndex >= session.frames.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentFrame = session.frames[currentFrameIndex];
    
    // Draw the image on the canvas
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw detection overlays if enabled
      if (highlightProducts) {
        // Get products detected in this frame
        const productsInFrame = getProductsInFrame(currentFrame);
        
        // Draw bounding boxes
        for (const product of productsInFrame) {
          const { x, y, width, height } = product.boundingBox;
          
          // Convert normalized coordinates to pixel coordinates
          const boxX = x * canvas.width;
          const boxY = y * canvas.height;
          const boxWidth = width * canvas.width;
          const boxHeight = height * canvas.height;
          
          // Draw bounding box
          ctx.strokeStyle = getColorBasedOnConfidence(product.confidence);
          ctx.lineWidth = 3;
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
          
          // Draw background for label
          if (showLabels) {
            const category = product.attributes.category?.value || 'Product';
            const type = product.attributes.type?.value || '';
            const label = `${category}: ${type}`;
            const confidenceText = showConfidence ? ` (${Math.round(product.confidence * 100)}%)` : '';
            const fullLabel = label + confidenceText;
            
            // Use a smaller font on mobile
            ctx.font = '12px Arial';
            const textWidth = ctx.measureText(fullLabel).width;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(boxX, boxY - 18, textWidth + 8, 18);
            
            // Draw label
            ctx.fillStyle = 'white';
            ctx.fillText(fullLabel, boxX + 4, boxY - 5);
          }
        }
      }
    };
    
    img.src = currentFrame.dataUrl;
  }, [currentFrameIndex, session, highlightProducts, showLabels, showConfidence, detectedProducts]);
  
  // Get products detected in the given frame
  const getProductsInFrame = (frame: CapturedFrame): DetectedProduct[] => {
    return detectedProducts.filter(product => product.originalFrameId === frame.id);
  };
  
  // Get color based on confidence score
  const getColorBasedOnConfidence = (confidence: number): string => {
    if (confidence >= 0.8) return 'rgb(22, 163, 74)'; // Green
    if (confidence >= 0.6) return 'rgb(234, 179, 8)';  // Yellow
    return 'rgb(220, 38, 38)';                        // Red
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Handle play/pause toggle
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle next frame
  const goToNextFrame = () => {
    if (!session) return;
    
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.min(prev + 1, session.frames.length - 1));
  };
  
  // Handle previous frame
  const goToPreviousFrame = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.max(prev - 1, 0));
  };
  
  // Handle jumping forward
  const jumpForward = () => {
    if (!session) return;
    
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.min(prev + 10, session.frames.length - 1));
  };
  
  // Handle jumping backward
  const jumpBackward = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.max(prev - 10, 0));
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Handle zoom in
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  // Handle zoom out
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Handle playback speed change
  const changePlaybackSpeed = () => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };
  
  // Export current frame as image
  const exportCurrentFrame = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `frame-${currentFrameIndex}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };
  
  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentFrameIndex(parseInt(e.target.value));
  };
  
  // Render loading state
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-black">
      {/* Header bar */}
      <div className="flex justify-between items-center p-2 bg-gray-900 text-white">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
          className="text-white p-1.5"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {t('livestream.visualization.frameViewer')}
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-white p-1.5"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFullscreen}
            className="text-white p-1.5"
          >
            {isFullscreen 
              ? <Minimize className="h-4 w-4" />
              : <Maximize className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
      
      {/* Main canvas area */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 relative overflow-hidden">
        <canvas 
          ref={canvasRef}
          style={{ transform: `scale(${zoomLevel})` }}
          className="transition-transform duration-200"
        />
        
        {/* Frame info overlay - only shown when showInfo is true */}
        {showInfo && (
          <>
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs p-1.5 rounded">
              <div>
                {t('livestream.visualization.frame')} {currentFrameIndex + 1} / {session.frames.length}
              </div>
              {session.frames[currentFrameIndex] && (
                <div>
                  {formatTimestamp(session.frames[currentFrameIndex].timestamp)}
                </div>
              )}
            </div>
            
            {/* Products in frame info */}
            {session.frames[currentFrameIndex] && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-1.5 rounded">
                <div>
                  {t('livestream.visualization.productsInFrame')}: {
                    getProductsInFrame(session.frames[currentFrameIndex]).length
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Timeline slider */}
      <div className="px-3 pt-2 pb-0 bg-gray-900">
        <input
          type="range"
          min="0"
          max={session.frames.length - 1}
          value={currentFrameIndex}
          onChange={handleSliderChange}
          className="w-full h-2"
        />
      </div>
      
      {/* Main controls */}
      <div className="p-2 bg-gray-900 text-white flex justify-between">
        <div className="flex items-center space-x-1.5">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={jumpBackward}
            className="text-white p-1.5"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={goToPreviousFrame}
            className="text-white p-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={togglePlayback}
            className="text-white p-1.5 h-8 w-8 flex items-center justify-center"
          >
            {isPlaying 
              ? <Pause className="h-4 w-4" />
              : <Play className="h-4 w-4" />
            }
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={goToNextFrame}
            className="text-white p-1.5"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={jumpForward}
            className="text-white p-1.5"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={zoomOut}
            className="text-white p-1.5"
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={zoomIn}
            className="text-white p-1.5"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={changePlaybackSpeed}
            className="text-white p-1.5 text-xs"
          >
            {playbackSpeed}x
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white p-1.5"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Settings panel - collapsible */}
      {showSettings && (
        <div className="p-3 bg-gray-900 border-t border-gray-800 text-white">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setHighlightProducts(!highlightProducts)}
              className={`text-white text-xs justify-start ${highlightProducts ? 'bg-gray-700' : ''}`}
            >
              <Check className={`h-3 w-3 mr-1.5 ${highlightProducts ? 'opacity-100' : 'opacity-0'}`} />
              {t('livestream.visualization.highlightProducts')}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className={`text-white text-xs justify-start ${showLabels ? 'bg-gray-700' : ''}`}
            >
              <Check className={`h-3 w-3 mr-1.5 ${showLabels ? 'opacity-100' : 'opacity-0'}`} />
              {t('livestream.visualization.showLabels')}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowConfidence(!showConfidence)}
              className={`text-white text-xs justify-start ${showConfidence ? 'bg-gray-700' : ''}`}
            >
              <Check className={`h-3 w-3 mr-1.5 ${showConfidence ? 'opacity-100' : 'opacity-0'}`} />
              {t('livestream.visualization.showConfidence')}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={exportCurrentFrame}
              className="text-white text-xs justify-start"
            >
              <Download className="h-3 w-3 mr-1.5" />
              {t('livestream.visualization.saveFrame')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProcessingVisualization;