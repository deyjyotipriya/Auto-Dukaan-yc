import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { TutorialStep as TutorialStepType, ElementPosition } from '../../services/TutorialService';

interface TutorialStepProps {
  step: TutorialStepType;
  totalSteps: number;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onComplete?: () => void;
}

const TutorialStep: React.FC<TutorialStepProps> = ({
  step,
  totalSteps,
  currentIndex,
  onNext,
  onPrevious,
  onClose,
  onComplete
}) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState<ElementPosition>({});
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<ElementPosition>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Find target element and calculate position
  useEffect(() => {
    if (step.target?.selector) {
      const element = document.querySelector(step.target.selector);
      setTargetElement(element);
      
      if (element) {
        updatePositions(element);
      }
    } else {
      // Center if no target
      setPosition({
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
      });
      
      setTooltipPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
    }
    
    // Update position on resize
    const handleResize = () => {
      if (targetElement) {
        updatePositions(targetElement);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [step, targetElement]);
  
  // Calculate positions based on target element and placement
  const updatePositions = (element: Element) => {
    const rect = element.getBoundingClientRect();
    const margin = step.target?.margin || 10;
    
    // Set target highlight position
    setPosition({
      top: `${rect.top - margin}px`,
      left: `${rect.left - margin}px`,
      width: `${rect.width + (margin * 2)}px`,
      height: `${rect.height + (margin * 2)}px`
    });
    
    // Calculate tooltip position based on placement
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight;
      const tooltipWidth = tooltipRef.current.offsetWidth;
      
      switch (step.placement) {
        case 'top':
          setTooltipPosition({
            bottom: `${window.innerHeight - rect.top + margin + 10}px`,
            left: `${rect.left + (rect.width / 2)}px`,
            transform: 'translateX(-50%)'
          });
          break;
        case 'bottom':
          setTooltipPosition({
            top: `${rect.bottom + margin + 10}px`,
            left: `${rect.left + (rect.width / 2)}px`,
            transform: 'translateX(-50%)'
          });
          break;
        case 'left':
          setTooltipPosition({
            top: `${rect.top + (rect.height / 2)}px`,
            right: `${window.innerWidth - rect.left + margin + 10}px`,
            transform: 'translateY(-50%)'
          });
          break;
        case 'right':
          setTooltipPosition({
            top: `${rect.top + (rect.height / 2)}px`,
            left: `${rect.right + margin + 10}px`,
            transform: 'translateY(-50%)'
          });
          break;
        default:
          // Center
          setTooltipPosition({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          });
      }
    }
  };
  
  // Handle complete action
  const handleCompleteAction = () => {
    if (onComplete) {
      onComplete();
    } else {
      onNext();
    }
  };
  
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-transparent pointer-events-none">
      {/* Target highlight element */}
      {step.target && (
        <div 
          className="absolute border-2 border-primary rounded-md bg-primary bg-opacity-10 z-10 pointer-events-none"
          style={position}
        />
      )}
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs sm:max-w-sm md:max-w-md z-20 pointer-events-auto"
        style={tooltipPosition}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-primary">
            <HelpCircle className="h-5 w-5 mr-2" />
            <h3 className="font-semibold text-sm">{step.title}</h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700">{step.content}</p>
          
          {step.image && (
            <img 
              src={step.image} 
              alt={step.title} 
              className="w-full h-auto mt-2 rounded-md"
            />
          )}
          
          {step.videoUrl && (
            <video 
              src={step.videoUrl} 
              controls 
              className="w-full h-auto mt-2 rounded-md"
            />
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {t('tutorial.step')} {currentIndex + 1} / {totalSteps}
          </div>
          
          <div className="flex space-x-2">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="text-xs h-8"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                {t('tutorial.previous')}
              </Button>
            )}
            
            {step.action ? (
              <Button
                size="sm"
                onClick={handleCompleteAction}
                className="text-xs h-8"
              >
                <Check className="h-3 w-3 mr-1" />
                {step.action}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onNext}
                className="text-xs h-8"
              >
                {currentIndex === totalSteps - 1 
                  ? t('tutorial.finish')
                  : t('tutorial.next')}
                {currentIndex < totalSteps - 1 && <ChevronRight className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialStep;