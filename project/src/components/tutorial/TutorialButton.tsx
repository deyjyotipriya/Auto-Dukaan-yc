import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Book, Lightbulb } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { useTutorial } from '../../contexts/TutorialContext';

interface TutorialButtonProps {
  tutorialId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
  icon?: 'help' | 'book' | 'lightbulb';
  tooltip?: string;
  className?: string;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({
  tutorialId,
  variant = 'outline',
  size = 'sm',
  label,
  icon = 'help',
  tooltip,
  className = ''
}) => {
  const { t } = useTranslation();
  const { startTutorial } = useTutorial();
  
  // Start the tutorial when clicked
  const handleClick = () => {
    startTutorial(tutorialId);
  };
  
  // Get the appropriate icon component
  const IconComponent = (() => {
    switch (icon) {
      case 'book':
        return Book;
      case 'lightbulb':
        return Lightbulb;
      case 'help':
      default:
        return HelpCircle;
    }
  })();
  
  // Use provided label or default
  const buttonLabel = label || t('tutorial.showTutorial');
  
  // Render icon-only button for size=icon
  if (size === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="icon"
              onClick={handleClick}
              className={`w-8 h-8 rounded-full ${className}`}
            >
              <IconComponent className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip || buttonLabel}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Render full button
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      <IconComponent className="h-4 w-4 mr-1.5" />
      {buttonLabel}
    </Button>
  );
};

export default TutorialButton;