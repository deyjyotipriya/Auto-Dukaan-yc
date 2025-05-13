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
  Clock,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import LivestreamRecordingService, { 
  RecordingSession, 
  CaptureSettings 
} from '../../services/LivestreamRecordingService';
import MobileOptimizationService from '../../services/MobileOptimizationService';

interface MobileLivestreamRecorderProps {
  onSessionCreated?: (sessionId: string) => void;
  onProcessingComplete?: (sessionId: string) => void;
}

const MobileLivestreamRecorder: React.FC<MobileLivestreamRecorderProps> = ({
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
  const [showTips, setShowTips] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(true);
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
  
  // Set up available media devices and check orientation
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
    
    // Check initial orientation
    checkOrientation();
    
    // Add orientation change listener
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    
    // Get battery level if available
    getBatteryLevel();
    
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, [t]);

  // Get current battery level
  const getBatteryLevel = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        // @ts-ignore - Battery API not in all TypeScript types
        const battery = await navigator.getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }
    } catch (error) {
      console.log('Battery API not supported');
    }
  };
  
  // Check device orientation
  const checkOrientation = () => {
    if (window.innerWidth > window.innerHeight) {
      setOrientation('landscape');
    } else {
      setOrientation('portrait');
    }
  };
  
  // Initialize media access
  const initializeMedia = async () => {
    try {
      // Reset error state
      setError(null);
      
      // Stop any existing stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      // Get optimized video constraints
      const optimizedVideoConstraints = await MobileOptimizationService.getOptimizationProfile();
      const optimalFrameRate = optimizedVideoConstraints.frameRate;
      
      // Request camera and microphone permissions with optimized constraints
      const constraints: MediaStreamConstraints = {
        video: selectedDevice 
          ? { 
              deviceId: { exact: selectedDevice },
              facingMode: { ideal: 'environment' }, // Prefer back camera on mobile
              width: { ideal: captureSettings.resolution.width },
              height: { ideal: captureSettings.resolution.height },
              frameRate: { ideal: optimalFrameRate }
            }
          : {
              facingMode: { ideal: 'environment' }, // Prefer back camera on mobile
              width: { ideal: captureSettings.resolution.width },
              height: { ideal: captureSettings.resolution.height },
              frameRate: { ideal: optimalFrameRate }
            },
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setRecordingState('ready');
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Optimize for battery life
        if (batteryLevel !== null && batteryLevel <= 20) {
          videoRef.current.muted = true;
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError(t('livestream.recorder.permissionError'));
      setRecordingState('error');
    }
  };
  
  // Start recording
  const startRecording = async () => {
    if (!mediaStream) return;
    
    try {
      // Get optimized settings based on current device state
      const optimizationProfile = await MobileOptimizationService.getOptimizationProfile();
      
      // Apply optimized settings
      const optimizedSettings: CaptureSettings = {
        ...captureSettings,
        captureInterval: optimizationProfile.captureInterval,
        quality: optimizationProfile.imageQuality,
        resolution: {
          width: (optimizationProfile.videoConstraints as any).width?.ideal || captureSettings.resolution.width,
          height: (optimizationProfile.videoConstraints as any).height?.ideal || captureSettings.resolution.height
        }
      };
      
      setCaptureSettings(optimizedSettings);
      
      // Create a new recording session with optimized settings
      const session = await LivestreamRecordingService.startCameraRecording(optimizedSettings);
      
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
      
      // Enable low power mode for recording if battery is low
      if (batteryLevel !== null && batteryLevel <= 20) {
        // Reduce UI updates to save power
        setShowInfo(false);
      }
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
  const stopRecording = () => {
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
  const handleFrameCaptured = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail.sessionId === recordingSession?.id) {
      setCapturedFrames(prev => prev + 1);
      
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
  
  // Switch camera
  const switchCamera = async () => {
    if (!availableDevices || availableDevices.length <= 1) return;
    
    // Find current device index
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDevice);
    
    // Select next device (or first if at the end)
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];
    
    setSelectedDevice(nextDevice.deviceId);
    
    // Re-initialize media with new device
    if (recordingState === 'ready' || recordingState === 'recording' || recordingState === 'paused') {
      // If recording, pause it first
      const wasRecording = recordingState === 'recording';
      
      if (wasRecording && recordingSession) {
        LivestreamRecordingService.pauseRecording(recordingSession.id);
      }
      
      await initializeMedia();
      
      // Resume recording if needed
      if (wasRecording && recordingSession) {
        LivestreamRecordingService.resumeRecording(recordingSession.id);
        setRecordingState('recording');
      }
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
    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-base font-medium mb-2">{t('livestream.recorder.cameraAccess')}</h3>
      <p className="text-sm text-gray-600 mb-3">{t('livestream.recorder.allowAccess')}</p>
      <Button 
        onClick={initializeMedia}
        className="w-full"
      >
        {t('livestream.recorder.grantAccess')}
      </Button>
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
  
  // Render the camera preview
  const renderCameraPreview = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className={`bg-black rounded-lg overflow-hidden ${orientation === 'landscape' ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button 
            onClick={toggleAudio} 
            className={`p-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button 
            onClick={toggleVideo} 
            className={`p-2 rounded-full ${videoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
          >
            {videoEnabled ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
        </div>
        
        {availableDevices.length > 1 && (
          <button
            onClick={switchCamera}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        
        {batteryLevel !== null && batteryLevel <= 20 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <span className="mr-1">🔋</span> {batteryLevel}%
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          {t('livestream.recorder.settings')}
        </Button>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTips(!showTips)}
            className="text-xs"
          >
            {showTips ? 'Hide Tips' : 'Show Tips'}
          </Button>
          
          <Button 
            onClick={startRecording}
            size="sm"
            className="text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            {t('livestream.recorder.startRecording')}
          </Button>
        </div>
      </div>
      
      {showSettings && (
        <div className="mt-3 p-3 border rounded-md bg-gray-50 text-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">{t('livestream.recorder.recordingSettings')}</h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full h-1.5"
                />
                <span className="text-xs text-gray-600 min-w-[50px]">
                  {(captureSettings.captureInterval / 1000).toFixed(0)}s
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full h-1.5"
                />
                <span className="text-xs text-gray-600 min-w-[50px]">
                  {Math.round(captureSettings.quality * 100)}%
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('livestream.recorder.resolution')}
              </label>
              <select
                value={`${captureSettings.resolution.width}x${captureSettings.resolution.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  updateCaptureSetting('resolution', { width, height });
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm py-1 pl-2 pr-8 text-xs"
              >
                <option value="640x480">640x480</option>
                <option value="1280x720">1280x720 (720p)</option>
                <option value="1920x1080">1920x1080 (1080p)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                {t('livestream.recorder.detectInactivity')}
              </label>
              <Switch
                checked={captureSettings.detectInactivity}
                onCheckedChange={(checked) => updateCaptureSetting('detectInactivity', checked)}
                className="scale-75"
              />
            </div>
          </div>
        </div>
      )}
      
      {showTips && (
        <div className="bg-blue-50 rounded-md p-3 text-xs text-blue-800 mt-3">
          <h4 className="font-medium mb-2">Recording Tips</h4>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Hold your phone steady for better product detection</li>
            <li>Ensure good lighting for clearer images</li>
            <li>Rotate product to capture all sides</li>
            <li>Keep products centered in the frame</li>
            <li>Low battery may affect recording quality</li>
          </ul>
        </div>
      )}
    </div>
  );
  
  // Render the recording UI
  const renderRecordingUI = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className={`bg-black rounded-lg overflow-hidden ${orientation === 'landscape' ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-3 left-3 flex items-center bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
            {t('livestream.recorder.recording')}
          </div>
          
          {showInfo && (
            <div className="absolute top-3 right-3 flex items-center space-x-2 text-white text-xs">
              <div className="bg-black/60 px-2 py-1 rounded-full flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatElapsedTime()}
              </div>
            </div>
          )}
          
          {batteryLevel !== null && batteryLevel <= 20 && (
            <div className="absolute top-12 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <span className="mr-1">🔋</span> {batteryLevel}%
            </div>
          )}
        </div>
        
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button 
            onClick={toggleAudio} 
            className={`p-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button 
            onClick={toggleVideo} 
            className={`p-2 rounded-full ${videoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
          >
            {videoEnabled ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-gray-100 rounded-md px-2 py-1 text-xs">
            <span className="font-medium">{capturedFrames}</span> frames
          </div>
          
          <div className="bg-gray-100 rounded-md px-2 py-1 text-xs">
            <span className="font-medium">{formatStorageSize(storageUsed)}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2 justify-center">
        <Button 
          onClick={() => setShowInfo(!showInfo)}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          {showInfo ? 'Hide Info' : 'Show Info'}
        </Button>
        
        {recordingState === 'recording' ? (
          <Button 
            onClick={pauseRecording} 
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Pause className="h-3 w-3 mr-1" />
            {t('livestream.recorder.pause')}
          </Button>
        ) : (
          <Button 
            onClick={resumeRecording}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            {t('livestream.recorder.resume')}
          </Button>
        )}
        
        <Button 
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          className="text-xs"
        >
          <StopCircle className="h-3 w-3 mr-1" />
          {t('livestream.recorder.stop')}
        </Button>
      </div>
      
      {showInfo && (
        <div className="p-3 border rounded-md bg-gray-50">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium">{t('livestream.recorder.storageTelemetry')}</span>
            <span>{formatStorageSize(storageUsed)}</span>
          </div>
          <Progress 
            value={(storageUsed / (50 * 1024 * 1024)) * 100} 
            className="h-1.5" 
            indicatorColor={storageUsed > 30 * 1024 * 1024 ? '#ef4444' : undefined}
          />
        </div>
      )}
    </div>
  );
  
  // Render the completed UI
  const renderCompletedUI = () => (
    <div className="space-y-3">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-base font-medium text-green-800 mb-2">
          {t('livestream.recorder.recordingComplete')}
        </h3>
        <p className="text-sm text-green-700 mb-3">
          {t('livestream.recorder.recordingCompleteDescription', {
            frames: capturedFrames,
            time: formatElapsedTime(),
            storage: formatStorageSize(storageUsed)
          })}
        </p>
        
        <div className="flex justify-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetRecording}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {t('livestream.recorder.startNew')}
          </Button>
          <Button size="sm" className="text-xs">
            {t('livestream.recorder.processRecording')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render the error UI
  const renderErrorUI = () => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800 mb-1 text-sm">{t('livestream.recorder.error')}</h3>
          <p className="text-xs text-red-700">{error}</p>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetRecording}
            className="mt-2 text-xs"
          >
            {t('livestream.recorder.tryAgain')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-3">
      {recordingState === 'idle' && renderPermissionRequest()}
      {recordingState === 'ready' && renderCameraPreview()}
      {(recordingState === 'recording' || recordingState === 'paused') && renderRecordingUI()}
      {recordingState === 'completed' && renderCompletedUI()}
      {recordingState === 'error' && renderErrorUI()}
    </div>
  );
};

export default MobileLivestreamRecorder;