import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import TutorialService, { Tutorial, TutorialStep } from '../services/TutorialService';

interface TutorialContextType {
  activeTutorial: Tutorial | null;
  activeStep: TutorialStep | null;
  isActive: boolean;
  startTutorial: (tutorialId: string) => boolean;
  endTutorial: (dismiss?: boolean) => void;
  nextStep: () => TutorialStep | null;
  previousStep: () => TutorialStep | null;
  completeTutorial: () => void;
  availableTutorials: Tutorial[];
  resetTutorialProgress: (tutorialId: string) => void;
  resetAllProgress: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [activeStep, setActiveStep] = useState<TutorialStep | null>(null);
  const [availableTutorials, setAvailableTutorials] = useState<Tutorial[]>([]);
  
  // Update active tutorial and step when the service state changes
  useEffect(() => {
    const updateFromService = () => {
      setActiveTutorial(TutorialService.getActiveTutorial());
      setActiveStep(TutorialService.getActiveStep());
      
      // Get tutorials relevant to current route
      const currentPath = location.pathname;
      setAvailableTutorials(TutorialService.getTutorialsForRoute(currentPath));
    };
    
    // Subscribe to tutorial service changes
    const unsubscribe = TutorialService.subscribe(updateFromService);
    
    // Initial update
    updateFromService();
    
    return () => {
      unsubscribe();
    };
  }, [location]);
  
  // Check for auto-start tutorials when route changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only auto-start if no tutorial is already active
    if (!activeTutorial) {
      const autoStartTutorial = TutorialService.getAutoStartTutorials(currentPath);
      if (autoStartTutorial) {
        TutorialService.startTutorial(autoStartTutorial.id);
      }
    }
  }, [location, activeTutorial]);
  
  // Context value
  const value: TutorialContextType = {
    activeTutorial,
    activeStep,
    isActive: !!activeTutorial && !!activeStep,
    
    startTutorial: (tutorialId: string) => {
      return TutorialService.startTutorial(tutorialId);
    },
    
    endTutorial: (dismiss = true) => {
      TutorialService.endTutorial(dismiss);
    },
    
    nextStep: () => {
      return TutorialService.nextStep();
    },
    
    previousStep: () => {
      return TutorialService.previousStep();
    },
    
    completeTutorial: () => {
      if (activeTutorial) {
        // Mark tutorial as completed, not dismissed
        TutorialService.endTutorial(false);
      }
    },
    
    availableTutorials,
    
    resetTutorialProgress: (tutorialId: string) => {
      TutorialService.resetProgress(tutorialId);
    },
    
    resetAllProgress: () => {
      TutorialService.resetAllProgress();
    }
  };
  
  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

// Custom hook for using the tutorial context
export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

export default TutorialContext;