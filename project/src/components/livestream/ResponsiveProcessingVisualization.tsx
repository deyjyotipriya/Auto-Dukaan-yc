import React, { useState, useEffect } from 'react';
import ProcessingVisualization from './ProcessingVisualization';
import MobileProcessingVisualization from './MobileProcessingVisualization';
import { DetectedProduct } from '../../services/ProductDetectionService';

interface ResponsiveProcessingVisualizationProps {
  sessionId: string;
  detectedProducts: DetectedProduct[];
  onClose: () => void;
}

const ResponsiveProcessingVisualization: React.FC<ResponsiveProcessingVisualizationProps> = (props) => {
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
    <MobileProcessingVisualization {...props} />
  ) : (
    <ProcessingVisualization {...props} />
  );
};

export default ResponsiveProcessingVisualization;