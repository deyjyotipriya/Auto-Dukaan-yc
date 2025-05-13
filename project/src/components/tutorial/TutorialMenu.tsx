import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Book, Play, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useTutorial } from '../../contexts/TutorialContext';
import { Tutorial } from '../../services/TutorialService';

interface TutorialMenuProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const TutorialMenu: React.FC<TutorialMenuProps> = ({
  variant = 'outline',
  size = 'sm'
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { 
    availableTutorials, 
    startTutorial,
    resetTutorialProgress
  } = useTutorial();
  
  // Start a specific tutorial
  const handleStartTutorial = (tutorial: Tutorial) => {
    startTutorial(tutorial.id);
    setOpen(false);
  };
  
  // Reset progress for a tutorial
  const handleResetProgress = (tutorialId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resetTutorialProgress(tutorialId);
  };
  
  // If no tutorials available, don't render
  if (availableTutorials.length === 0) {
    return null;
  }
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          {t('tutorial.help')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{t('tutorial.availableTutorials')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTutorials.map((tutorial) => (
          <DropdownMenuItem 
            key={tutorial.id}
            onClick={() => handleStartTutorial(tutorial)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <Book className="h-4 w-4 mr-2 text-primary" />
              <span>{tutorial.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => handleResetProgress(tutorial.id, e)}
                title={t('tutorial.resetProgress')}
              >
                <RotateCcw className="h-3 w-3 text-gray-500" />
              </Button>
              <Play className="h-3 w-3 text-primary" />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TutorialMenu;