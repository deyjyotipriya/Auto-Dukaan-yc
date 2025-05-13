import React, { useState, useEffect } from 'react';
import LivestreamRecorder from './LivestreamRecorder';
import MobileLivestreamRecorder from './MobileLivestreamRecorder';

interface ResponsiveLivestreamRecorderProps {
  onSessionCreated?: (sessionId: string) => void;
  onProcessingComplete?: (sessionId: string) => void;
}

const ResponsiveLivestreamRecorder: React.FC<ResponsiveLivestreamRecorderProps> = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial screen size
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
  };

  return isMobile ? (
    <MobileLivestreamRecorder {...props} />
  ) : (
    <LivestreamRecorder {...props} />
  );
};

export default ResponsiveLivestreamRecorder;