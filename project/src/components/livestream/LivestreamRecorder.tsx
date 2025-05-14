import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Play,
  Pause,
  StopCircle,
  Settings,
  RotateCcw,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Switch } from '../../components/ui/switch';
import LivestreamRecordingService, { 
  RecordingSession, 
  CaptureSettings,
  CapturedFrame
} from '../../services/LivestreamRecordingService';
import DatabaseService, { CapturedFrameRecord } from '../../services/DatabaseService';

interface LivestreamRecorderProps {
  onSessionCreated?: (sessionId: string) => void;
  onProcessingComplete?: (sessionId: string) => void;
}

const LivestreamRecorder: React.FC<LivestreamRecorderProps> = ({
  onSessionCreated,
  onProcessingComplete
}) => {
  const { t } = useTranslation();
  
  const [recordingState, setRecordingState] = useState<'idle' | 'ready' | 'recording' | 'paused' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [captureSettings, setCaptureSettings] = useState<CaptureSettings>({
    captureInterval: 5000, // 5 seconds
    maxFrames: 1000,
    quality: 0.7,
    resolution: {
      width: 640,
      height: 480
    },
    batteryThreshold: 15,
    detectInactivity: true
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Initialize database
  useEffect(() => {
    DatabaseService.initialize().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);
  
  // Set up available media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableDevices(videoDevices);
        
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
        setError(t('livestream.recorder.deviceError'));
      }
    };
    
    getDevices();
  }, [t]);
  
  // Initialize media access
  const initializeMedia = async () => {
    try {
      // Reset error state
      setError(null);
      
      // Stop any existing stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      // Request camera and microphone permissions
      const constraints: MediaStreamConstraints = {
        video: selectedDevice 
          ? { deviceId: { exact: selectedDevice } }
          : true,
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setRecordingState('ready');
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError(t('livestream.recorder.permissionError'));
      setRecordingState('error');
    }
  };
  
  // Save captured frame to database
  const saveFrameToDatabase = async (sessionId: string, frame: CapturedFrame) => {
    try {
      const frameRecord: CapturedFrameRecord = {
        id: frame.id,
        sessionId,
        timestamp: frame.timestamp,
        imageUrl: frame.dataUrl,
        isProcessed: false,
        isEdited: false,
        metadata: {
          sourceWidth: frame.sourceWidth,
          sourceHeight: frame.sourceHeight,
          batteryLevel: frame.batteryLevel
        }
      };
      
      await DatabaseService.saveCapturedFrame(frameRecord);
      console.log('Frame saved to database:', frame.id);
    } catch (error) {
      console.error('Error saving frame to database:', error);
    }
  };
  
  // Start recording
  const startRecording = async () => {
    if (!mediaStream) return;
    
    try {
      // Create a new recording session
      const session = await LivestreamRecordingService.startCameraRecording(captureSettings);
      
      if (!session) {
        throw new Error('Failed to create recording session');
      }
      
      setRecordingSession(session);
      setRecordingState('recording');
      
      // Notify parent component
      if (onSessionCreated) {
        onSessionCreated(session.id);
      }
      
      // Start timer for elapsed time
      startTimer();
      
      // Set up frame capture event listener
      window.addEventListener('frameCaptured', handleFrameCaptured);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError(t('livestream.recorder.recordingError'));
      setRecordingState('error');
    }
  };
  
  // Pause recording
  const pauseRecording = () => {
    if (!recordingSession) return;
    
    LivestreamRecordingService.pauseRecording(recordingSession.id);
    setRecordingState('paused');
    
    // Pause timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Resume recording
  const resumeRecording = () => {
    if (!recordingSession) return;
    
    LivestreamRecordingService.resumeRecording(recordingSession.id);
    setRecordingState('recording');
    
    // Resume timer
    startTimer();
  };
  
  // Stop recording
  const stopRecording = async () => {
    if (!recordingSession) return;
    
    LivestreamRecordingService.stopRecording(recordingSession.id);
    setRecordingState('completed');
    
    // Stop timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop media tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Remove event listener
    window.removeEventListener('frameCaptured', handleFrameCaptured);
    
    // Update session information
    const updatedSession = LivestreamRecordingService.getSession(recordingSession.id);
    if (updatedSession) {
      setRecordingSession(updatedSession);
      
      // Save all captured frames to database if not already saved
      for (const frame of updatedSession.frames) {
        await saveFrameToDatabase(updatedSession.id, frame);
      }
    }
    
    // Notify parent component
    if (onProcessingComplete) {
      onProcessingComplete(recordingSession.id);
    }
  };
  
  // Reset recording
  const resetRecording = () => {
    // Stop any existing recording
    if (recordingSession) {
      LivestreamRecordingService.stopRecording(recordingSession.id);
      LivestreamRecordingService.deleteSession(recordingSession.id);
    }
    
    // Reset state
    setRecordingSession(null);
    setElapsedTime(0);
    setCapturedFrames(0);
    setStorageUsed(0);
    setRecordingState('idle');
    setError(null);
    
    // Stop timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop media tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Remove event listener
    window.removeEventListener('frameCaptured', handleFrameCaptured);
  };
  
  // Start the timer
  const startTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };
  
  // Handle frame captured event
  const handleFrameCaptured = async (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail.sessionId === recordingSession?.id) {
      setCapturedFrames(prev => prev + 1);
      
      // Get the frame data from the event
      const frame = customEvent.detail.frame as CapturedFrame;
      
      // Save frame to database
      await saveFrameToDatabase(recordingSession.id, frame);
      
      // Update storage usage
      if (recordingSession) {
        const usage = LivestreamRecordingService.getEstimatedStorage(recordingSession.id);
        setStorageUsed(usage);
      }
    }
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };
  
  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Format storage size
  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Change camera device
  const changeDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    
    // Re-initialize media with new device
    if (recordingState === 'ready') {
      initializeMedia();
    }
  };
  
  // Update capture settings
  const updateCaptureSetting = (key: keyof CaptureSettings, value: any) => {
    setCaptureSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update active recording session if exists
    if (recordingSession) {
      LivestreamRecordingService.adjustCaptureSettings(recordingSession.id, {
        [key]: value
      });
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop any active recording
      if (recordingSession && (recordingState === 'recording' || recordingState === 'paused')) {
        LivestreamRecordingService.stopRecording(recordingSession.id);
      }
      
      // Stop timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Stop media tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      // Remove event listener
      window.removeEventListener('frameCaptured', handleFrameCaptured);
    };
  }, [recordingSession, recordingState, mediaStream]);
  
  // Render the camera permission request
  const renderPermissionRequest = () => (
    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">{t('livestream.recorder.cameraAccess')}</h3>
      <p className="text-gray-600 mb-4">{t('livestream.recorder.allowAccess')}</p>
      <Button 
        onClick={initializeMedia}
        className="mx-auto"
      >
        {t('livestream.recorder.grantAccess')}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
  
  // Render the camera preview
  const renderCameraPreview = () => (
    <div className="space-y-4">
      <div className="relative">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-4 right-4 flex space-x-3">
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
            {videoEnabled ? <Camera className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-1.5" />
          {t('livestream.recorder.settings')}
        </Button>
        
        <div className="space-x-3">
          <Button 
            variant="outline" 
            onClick={resetRecording}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {t('livestream.recorder.reset')}
          </Button>
          
          <Button 
            onClick={startRecording}
          >
            <Play className="h-4 w-4 mr-1.5" />
            {t('livestream.recorder.startRecording')}
          </Button>
        </div>
      </div>
      
      {showSettings && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h4 className="font-medium mb-3">{t('livestream.recorder.recordingSettings')}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('livestream.recorder.captureInterval')}
              </label>
              <div className="flex space-x-2 items-center">
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="1000"
                  value={captureSettings.captureInterval}
                  onChange={(e) => updateCaptureSetting('captureInterval', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 min-w-[60px]">
                  {(captureSettings.captureInterval / 1000).toFixed(0)}s
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('livestream.recorder.captureIntervalHelp')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('livestream.recorder.imageQuality')}
              </label>
              <div className="flex space-x-2 items-center">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={captureSettings.quality}
                  onChange={(e) => updateCaptureSetting('quality', parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 min-w-[60px]">
                  {Math.round(captureSettings.quality * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('livestream.recorder.imageQualityHelp')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('livestream.recorder.resolution')}
              </label>
              <select
                value={`${captureSettings.resolution.width}x${captureSettings.resolution.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  updateCaptureSetting('resolution', { width, height });
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="640x480">640x480</option>
                <option value="1280x720">1280x720 (720p)</option>
                <option value="1920x1080">1920x1080 (1080p)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t('livestream.recorder.resolutionHelp')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('livestream.recorder.camera')}
              </label>
              <select
                value={selectedDevice || ''}
                onChange={(e) => changeDevice(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {availableDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${availableDevices.indexOf(device) + 1}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('livestream.recorder.detectInactivity')}
              </label>
              <Switch
                checked={captureSettings.detectInactivity}
                onCheckedChange={(checked) => updateCaptureSetting('detectInactivity', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('livestream.recorder.lowBatteryThreshold')}
                </label>
                <p className="text-xs text-gray-500">
                  {t('livestream.recorder.lowBatteryThresholdHelp')}
                </p>
              </div>
              <select
                value={captureSettings.batteryThreshold}
                onChange={(e) => updateCaptureSetting('batteryThreshold', parseInt(e.target.value))}
                className="rounded-md border border-gray-300 shadow-sm py-1 pl-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
                <option value={25}>25%</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render the recording UI
  const renderRecordingUI = () => (
    <div className="space-y-4">
      <div className="relative">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-4 left-4 flex items-center bg-red-500 text-white text-sm font-medium px-2 py-1 rounded">
            <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
            {t('livestream.recorder.recording')}
          </div>
          
          <div className="absolute top-4 right-4 flex items-center space-x-2 text-white text-sm">
            <div className="bg-black/70 px-2 py-1 rounded flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatElapsedTime()}
            </div>
            <div className="bg-black/70 px-2 py-1 rounded flex items-center">
              <Camera className="h-4 w-4 mr-1" />
              {capturedFrames}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 flex space-x-3">
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
            {videoEnabled ? <Camera className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 justify-center">
        {recordingState === 'recording' ? (
          <Button 
            onClick={pauseRecording} 
            variant="outline"
          >
            <Pause className="h-4 w-4 mr-1.5" />
            {t('livestream.recorder.pause')}
          </Button>
        ) : (
          <Button 
            onClick={resumeRecording}
            variant="outline"
          >
            <Play className="h-4 w-4 mr-1.5" />
            {t('livestream.recorder.resume')}
          </Button>
        )}
        
        <Button 
          onClick={stopRecording}
          variant="destructive"
        >
          <StopCircle className="h-4 w-4 mr-1.5" />
          {t('livestream.recorder.stop')}
        </Button>
      </div>
      
      <div className="p-4 border rounded-md bg-gray-50">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{t('livestream.recorder.storageTelemetry')}</span>
          <span>{formatStorageSize(storageUsed)}</span>
        </div>
        <Progress 
          value={(storageUsed / (50 * 1024 * 1024)) * 100} 
          className="h-2" 
          indicatorColor={storageUsed > 30 * 1024 * 1024 ? '#ef4444' : undefined}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('livestream.recorder.storageTelemetryHelp')}
        </p>
      </div>
    </div>
  );
  
  // Render the completed UI
  const renderCompletedUI = () => (
    <div className="space-y-4">
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-green-800 mb-2">
          {t('livestream.recorder.recordingComplete')}
        </h3>
        <p className="text-green-700 mb-4">
          {t('livestream.recorder.recordingCompleteDescription', {
            frames: capturedFrames,
            time: formatElapsedTime(),
            storage: formatStorageSize(storageUsed)
          })}
        </p>
        
        <div className="flex justify-center space-x-3">
          <Button 
            variant="outline" 
            onClick={resetRecording}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {t('livestream.recorder.startNew')}
          </Button>
          <Button>
            {t('livestream.recorder.processRecording')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render the error UI
  const renderErrorUI = () => (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800 mb-1">{t('livestream.recorder.error')}</h3>
          <p className="text-sm text-red-700">{error}</p>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetRecording}
            className="mt-3"
          >
            {t('livestream.recorder.tryAgain')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      {recordingState === 'idle' && renderPermissionRequest()}
      {recordingState === 'ready' && renderCameraPreview()}
      {(recordingState === 'recording' || recordingState === 'paused') && renderRecordingUI()}
      {recordingState === 'completed' && renderCompletedUI()}
      {recordingState === 'error' && renderErrorUI()}
    </div>
  );
};

export default LivestreamRecorder;