import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { 
  Upload, 
  X, 
  FileVideo, 
  Check, 
  AlertTriangle, 
  Info, 
  Image,
  Play,
  Pause,
  Trash,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import LivestreamRecordingService, { 
  RecordingSession, 
  CaptureSettings
} from '../../services/LivestreamRecordingService';
import { AppDispatch } from '../../store';

interface VideoUploaderProps {
  onSessionCreated?: (sessionId: string) => void;
  onProcessingComplete?: (sessionId: string) => void;
  allowedFormats?: string[];
  maxFileSize?: number; // In MB
  captureSettings?: Partial<CaptureSettings>;
  showCategorySelection?: boolean;
}

interface UploadState {
  file: File | null;
  preview: string;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  sessionId?: string;
  duration?: number;
  thumbnails: string[];
}

// Valid video file types
const DEFAULT_ALLOWED_FORMATS = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/ogg',
  'video/mpeg'
];

// Product categories
const PRODUCT_CATEGORIES = [
  'Clothing',
  'Jewelry',
  'Electronics',
  'Home & Decor',
  'Handicrafts',
  'Beauty',
  'Food & Beverages',
  'Toys',
  'Accessories',
  'Books',
  'Sports Equipment',
  'Health & Wellness'
];

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onSessionCreated,
  onProcessingComplete,
  allowedFormats = DEFAULT_ALLOWED_FORMATS,
  maxFileSize = 500, // 500MB default
  captureSettings,
  showCategorySelection = true
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: '',
    progress: 0,
    status: 'idle',
    thumbnails: []
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [processingSession, setProcessingSession] = useState<RecordingSession | null>(null);
  
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  /**
   * Handle drag enter event
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  /**
   * Handle drag over event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  /**
   * Handle file drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };
  
  /**
   * Open file dialog
   */
  const openFileDialog = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };
  
  /**
   * Validate and process the selected file
   */
  const validateAndProcessFile = (file: File) => {
    // Reset state
    setUploadState({
      file: null,
      preview: '',
      progress: 0,
      status: 'idle',
      thumbnails: []
    });
    
    // Validate file type
    if (!allowedFormats.includes(file.type)) {
      setUploadState({
        file: null,
        preview: '',
        progress: 0,
        status: 'error',
        error: t('videoUpload.invalidFormat'),
        thumbnails: []
      });
      return;
    }
    
    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setUploadState({
        file: null,
        preview: '',
        progress: 0,
        status: 'error',
        error: t('videoUpload.fileTooLarge', { maxSize: maxFileSize }),
        thumbnails: []
      });
      return;
    }
    
    // Create preview URL
    const preview = URL.createObjectURL(file);
    
    // Update state with file info
    setUploadState({
      file,
      preview,
      progress: 0,
      status: 'idle',
      thumbnails: []
    });
    
    // Load video metadata to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      // Update with duration info
      setUploadState(prev => ({
        ...prev,
        duration: video.duration
      }));
      
      // Clean up
      video.src = '';
    };
    video.src = preview;
  };
  
  /**
   * Process the video
   */
  const processVideo = async () => {
    if (!uploadState.file) return;
    
    // Update state to processing
    setUploadState(prev => ({
      ...prev,
      status: 'uploading',
      progress: 0
    }));
    
    try {
      // Create a recording session from the uploaded video
      const session = await LivestreamRecordingService.createFromUploadedVideo(
        uploadState.file,
        captureSettings,
        selectedCategories
      );
      
      if (!session) {
        throw new Error('Failed to create recording session');
      }
      
      // Update state with session info
      setUploadState(prev => ({
        ...prev,
        status: 'processing',
        progress: 0,
        sessionId: session.id
      }));
      
      // Store session for monitoring
      setProcessingSession(session);
      
      // Notify parent component
      if (onSessionCreated) {
        onSessionCreated(session.id);
      }
      
      // Start processing the video
      const success = await LivestreamRecordingService.processVideoFile(session.id);
      
      if (success) {
        // Update state to complete
        setUploadState(prev => ({
          ...prev,
          status: 'complete',
          progress: 100
        }));
        
        // Get the updated session with processed frames
        const updatedSession = LivestreamRecordingService.getSession(session.id);
        setProcessingSession(updatedSession || null);
        
        // Generate thumbnails from frames
        if (updatedSession) {
          const thumbnails = updatedSession.frames
            .filter((_, i) => i % 10 === 0) // Take every 10th frame
            .slice(0, 5) // Maximum 5 thumbnails
            .map(frame => frame.dataUrl);
          
          setUploadState(prev => ({
            ...prev,
            thumbnails
          }));
        }
        
        // Notify parent component
        if (onProcessingComplete) {
          onProcessingComplete(session.id);
        }
      } else {
        throw new Error('Failed to process video');
      }
    } catch (error) {
      // Update state with error
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: (error as Error).message
      }));
    }
  };
  
  /**
   * Cancel processing
   */
  const cancelProcessing = () => {
    if (uploadState.sessionId) {
      LivestreamRecordingService.deleteSession(uploadState.sessionId);
    }
    
    // Reset state
    setUploadState({
      file: null,
      preview: '',
      progress: 0,
      status: 'idle',
      thumbnails: []
    });
    
    setProcessingSession(null);
    setSelectedCategories([]);
  };
  
  /**
   * Toggle category selection
   */
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  /**
   * Format video duration
   */
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ]
      .filter(Boolean)
      .join(':');
  };
  
  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  /**
   * Update progress based on session
   */
  useEffect(() => {
    if (processingSession && uploadState.status === 'processing') {
      setUploadState(prev => ({
        ...prev,
        progress: processingSession.processingProgress || 0
      }));
    }
  }, [processingSession]);
  
  /**
   * Clean up preview URL on unmount
   */
  useEffect(() => {
    return () => {
      if (uploadState.preview) {
        URL.revokeObjectURL(uploadState.preview);
      }
    };
  }, [uploadState.preview]);
  
  // Render drag & drop area when no file is selected
  const renderDragDropArea = () => (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-md p-6 text-center transition-colors duration-200 ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-primary/50'
      }`}
    >
      <input
        ref={uploadInputRef}
        type="file"
        accept={allowedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center">
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">{t('videoUpload.dragDropTitle')}</h3>
        <p className="text-gray-500 mb-4">{t('videoUpload.dragDropSubtitle')}</p>
        
        <Button onClick={openFileDialog}>
          {t('videoUpload.browse')}
        </Button>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>{t('videoUpload.supportedFormats')}: {allowedFormats.map(f => f.split('/')[1]).join(', ')}</p>
          <p>{t('videoUpload.maxFileSize')}: {maxFileSize} MB</p>
        </div>
      </div>
    </div>
  );
  
  // Render file preview
  const renderFilePreview = () => (
    <div className="border rounded-md overflow-hidden">
      <div className="aspect-video bg-black relative">
        <video
          ref={videoRef}
          src={uploadState.preview}
          className="w-full h-full object-contain"
          controls
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium">{uploadState.file?.name}</h4>
            <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
              <span>{formatFileSize(uploadState.file?.size || 0)}</span>
              {uploadState.duration && (
                <span>{formatDuration(uploadState.duration)}</span>
              )}
              <span>{uploadState.file?.type.split('/')[1].toUpperCase()}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={cancelProcessing}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            {t('videoUpload.remove')}
          </Button>
        </div>
        
        {/* Category selection */}
        {showCategorySelection && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('videoUpload.selectCategories')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategories.includes(category)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <Button
          onClick={processVideo}
          disabled={uploadState.status !== 'idle'}
          className="w-full"
        >
          {t('videoUpload.processVideo')}
        </Button>
      </div>
    </div>
  );
  
  // Render upload progress
  const renderProgress = () => (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{uploadState.file?.name}</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={cancelProcessing}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">
            {uploadState.status === 'uploading' 
              ? t('videoUpload.uploading') 
              : t('videoUpload.processing')}
          </span>
          <span className="text-sm text-gray-500">{uploadState.progress}%</span>
        </div>
        <Progress value={uploadState.progress} className="h-2" />
      </div>
      
      <div className="flex items-center text-sm text-blue-600">
        <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
        {uploadState.status === 'uploading' 
          ? t('videoUpload.uploadingMessage') 
          : t('videoUpload.processingMessage')}
      </div>
    </div>
  );
  
  // Render error message
  const renderError = () => (
    <div className="border border-red-300 rounded-md p-4 bg-red-50">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-800 mb-1">{t('videoUpload.error')}</h4>
          <p className="text-sm text-red-700">{uploadState.error}</p>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cancelProcessing}
            className="mt-3"
          >
            {t('videoUpload.tryAgain')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render processing complete
  const renderComplete = () => (
    <div className="border border-green-300 rounded-md p-4 bg-green-50">
      <div className="flex items-start mb-4">
        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-800 mb-1">{t('videoUpload.processingComplete')}</h4>
          <p className="text-sm text-green-700">{t('videoUpload.processingCompleteMessage')}</p>
        </div>
      </div>
      
      {/* Thumbnails */}
      {uploadState.thumbnails.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-green-800 mb-2">{t('videoUpload.extractedFrames')}</h5>
          <div className="grid grid-cols-5 gap-2">
            {uploadState.thumbnails.map((thumbnail, index) => (
              <div 
                key={index} 
                className="aspect-video bg-white border rounded overflow-hidden"
              >
                <img 
                  src={thumbnail} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={cancelProcessing}
        >
          {t('videoUpload.uploadAnother')}
        </Button>
        
        <Button>
          {t('videoUpload.viewResults')}
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('videoUpload.title')}</h3>
        
        {/* Tips section */}
        <div className="flex items-center text-sm text-blue-600">
          <Info className="h-4 w-4 mr-1.5" />
          {t('videoUpload.tips')}
        </div>
      </div>
      
      {/* Main upload area */}
      {!uploadState.file && renderDragDropArea()}
      
      {/* File preview */}
      {uploadState.file && uploadState.status === 'idle' && renderFilePreview()}
      
      {/* Processing progress */}
      {(uploadState.status === 'uploading' || uploadState.status === 'processing') && renderProgress()}
      
      {/* Error message */}
      {uploadState.status === 'error' && renderError()}
      
      {/* Processing complete */}
      {uploadState.status === 'complete' && renderComplete()}
      
      {/* Additional tips */}
      <div className="bg-blue-50 rounded-md p-4 text-sm text-blue-800">
        <h4 className="font-medium mb-2">{t('videoUpload.tipsTitle')}</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('videoUpload.tip1')}</li>
          <li>{t('videoUpload.tip2')}</li>
          <li>{t('videoUpload.tip3')}</li>
          <li>{t('videoUpload.tip4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUploader;