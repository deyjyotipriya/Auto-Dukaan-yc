import React from 'react';
import { useTutorial } from '../../contexts/TutorialContext';
import TutorialStep from './TutorialStep';

const TutorialOverlay: React.FC = () => {
  const { 
    activeTutorial, 
    activeStep, 
    isActive, 
    nextStep, 
    previousStep, 
    endTutorial,
    completeTutorial
  } = useTutorial();
  
  if (!isActive || !activeTutorial || !activeStep) {
    return null;
  }
  
  // Find active step index
  const currentStepIndex = activeTutorial.steps.findIndex(step => step.id === activeStep.id);
  
  // Handle next step
  const handleNext = () => {
    const nextStepResult = nextStep();
    
    // If no next step, tutorial is complete
    if (!nextStepResult) {
      completeTutorial();
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    previousStep();
  };
  
  // Handle close
  const handleClose = () => {
    // Only allow close if step is dismissable or we're on the last step
    if (activeStep.dismissable || currentStepIndex === activeTutorial.steps.length - 1) {
      endTutorial(true);
    }
  };
  
  // Handle complete action
  const handleComplete = () => {
    completeTutorial();
  };
  
  return (
    <TutorialStep
      step={activeStep}
      totalSteps={activeTutorial.steps.length}
      currentIndex={currentStepIndex}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
};

export default TutorialOverlay;