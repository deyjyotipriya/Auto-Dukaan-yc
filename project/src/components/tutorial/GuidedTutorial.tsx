import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  CheckCircle, 
  ShoppingBag, 
  Package, 
  MessageCircle, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface GuidedTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(isOpen);
  
  useEffect(() => {
    setShowTutorial(isOpen);
  }, [isOpen]);
  
  const handleClose = () => {
    setShowTutorial(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  const tutorialSteps = [
    {
      title: "Welcome to Auto-Dukaan!",
      description: "Let's take a quick tour of your dashboard and learn how to set up your online business.",
      icon: <ShoppingBag size={40} className="text-primary-500" />,
      spotlight: null
    },
    {
      title: "Dashboard Overview",
      description: "Your dashboard shows your key business metrics, recent orders, and inventory alerts at a glance.",
      icon: <CheckCircle size={40} className="text-primary-500" />,
      spotlight: ".dashboard-metrics"
    },
    {
      title: "Add Products",
      description: "Start by adding products to your catalog. You can add them manually or use our AI to recognize products from images.",
      icon: <Package size={40} className="text-primary-500" />,
      spotlight: ".add-product-button"
    },
    {
      title: "Chat with Customers",
      description: "Communicate with customers, share products, and process orders directly through chat.",
      icon: <MessageCircle size={40} className="text-primary-500" />,
      spotlight: ".chat-nav-item"
    },
    {
      title: "Manage Orders",
      description: "View and process orders, from confirmation to delivery, all in one place.",
      icon: <ShoppingBag size={40} className="text-primary-500" />,
      spotlight: ".orders-nav-item"
    },
    {
      title: "Compliance Made Easy",
      description: "Auto-generate invoices, manage taxes, and stay compliant with regulations.",
      icon: <FileText size={40} className="text-primary-500" />,
      spotlight: ".compliance-nav-item"
    },
    {
      title: "You're All Set!",
      description: "Explore your dashboard and start selling. Need help? Click the '?' icon at any time.",
      icon: <CheckCircle size={40} className="text-primary-500" />,
      spotlight: null
    }
  ];
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Spotlight effect to highlight specific elements
  useEffect(() => {
    const spotlightTarget = tutorialSteps[currentStep].spotlight;
    
    if (spotlightTarget) {
      const targetElement = document.querySelector(spotlightTarget);
      if (targetElement) {
        // Add a highlight class
        targetElement.classList.add('tutorial-highlight');
        
        // Scroll element into view if needed
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Clean up
        return () => {
          targetElement.classList.remove('tutorial-highlight');
        };
      }
    }
  }, [currentStep]);
  
  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-11/12 max-w-md relative overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 bg-gray-100 p-1 rounded-full"
              onClick={handleClose}
            >
              <X size={20} />
            </button>
            
            {/* Progress indicator */}
            <div className="absolute top-0 left-0 w-full flex">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 flex-1 transition-colors duration-300 ${
                    index <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            {/* Tutorial content */}
            <div className="pt-4 px-6 pb-6">
              <div className="flex flex-col items-center pt-8 pb-6">
                {tutorialSteps[currentStep].icon}
                
                <h3 className="text-xl font-bold mt-4 text-center">
                  {tutorialSteps[currentStep].title}
                </h3>
                
                <p className="text-gray-600 text-center mt-2">
                  {tutorialSteps[currentStep].description}
                </p>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-md ${
                    currentStep > 0 
                      ? 'text-gray-600 hover:bg-gray-100' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>
                
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  onClick={handleNext}
                >
                  <span>{currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStep === tutorialSteps.length - 1 ? 
                    <CheckCircle size={20} /> : 
                    <ChevronRight size={20} />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuidedTutorial;