/**
 * Tutorial and seller guidance service
 */

// Define tutorial element position
export interface ElementPosition {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
}

// Define target element for highlighting
export interface TutorialTarget {
  selector: string;  // CSS selector for the target element
  position?: ElementPosition; // Optional manual position if selector can't be used
  margin?: number;   // Extra margin around the target element
}

// Define tutorial step
export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: TutorialTarget;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: string;
  dismissable?: boolean;
  image?: string;
  videoUrl?: string;
}

// Define complete tutorial
export interface Tutorial {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'feature' | 'livestream' | 'orders' | 'products';
  steps: TutorialStep[];
  requiredOnly?: boolean;
  autoStart?: boolean;
  triggerRoute?: string;
}

// Define user's tutorial progress
export interface TutorialProgress {
  tutorialId: string;
  completedSteps: string[]; // Array of completed step IDs
  currentStepId: string;
  completed: boolean;
  lastUpdated: Date;
  dismissed: boolean;
}

class TutorialService {
  private tutorials: Tutorial[] = [];
  private progress: Record<string, TutorialProgress> = {};
  private activeTutorialId: string | null = null;
  private activeStepId: string | null = null;
  private onTutorialChangeCallbacks: Function[] = [];
  
  constructor() {
    this.loadTutorials();
    this.loadProgress();
  }
  
  /**
   * Initialize tutorials
   */
  private loadTutorials() {
    // Load all available tutorials
    this.tutorials = [
      // Livestream tutorial
      {
        id: 'livestream-catalog',
        name: 'Livestream to Catalog Tutorial',
        description: 'Learn how to turn your livestream into product listings',
        category: 'livestream',
        autoStart: true,
        triggerRoute: '/products/livestream',
        steps: [
          {
            id: 'livestream-intro',
            title: 'Welcome to Livestream Catalog!',
            content: 'This feature helps you turn your product videos into catalog items. Follow this tutorial to learn how it works.',
            placement: 'center',
            dismissable: true
          },
          {
            id: 'video-recorder',
            title: 'Record Your Products',
            content: 'Use the camera to record or upload product videos. Make sure the product is clearly visible and well-lit.',
            target: {
              selector: '.livestream-recorder'
            },
            placement: 'bottom'
          },
          {
            id: 'video-tips',
            title: 'Recording Tips',
            content: 'For best results: Keep products centered, use good lighting, and rotate to show all sides.',
            placement: 'right',
            dismissable: true,
            target: {
              selector: '.recording-tips-button'
            }
          },
          {
            id: 'processing-settings',
            title: 'Processing Settings',
            content: 'Adjust detection settings based on your products. Clothing and accessories work best with the default settings.',
            target: {
              selector: '.processing-settings'
            },
            placement: 'left'
          },
          {
            id: 'results-review',
            title: 'Review Results',
            content: 'After processing, you can review detected products, edit details, and add them to your catalog.',
            target: {
              selector: '.results-section'
            },
            placement: 'top'
          },
          {
            id: 'add-to-catalog',
            title: 'Add to Catalog',
            content: 'Select products and click "Add to Catalog" to create listings. You can edit them further from the Products page.',
            target: {
              selector: '.add-to-catalog-button'
            },
            placement: 'bottom',
            action: 'Complete Tutorial'
          }
        ]
      },
      
      // Mobile tutorial
      {
        id: 'mobile-recording',
        name: 'Mobile Recording Guide',
        description: 'Tips for recording products on your mobile device',
        category: 'livestream',
        triggerRoute: '/products/livestream',
        steps: [
          {
            id: 'mobile-intro',
            title: 'Mobile Recording',
            content: 'Recording on mobile is optimized for your device. Here are some tips to get the best results.',
            placement: 'center',
            dismissable: true
          },
          {
            id: 'mobile-battery',
            title: 'Battery Optimization',
            content: 'Recording uses more battery. Make sure you have at least 20% battery or keep your device plugged in.',
            placement: 'top',
            image: '/tutorial/battery-icon.png'
          },
          {
            id: 'mobile-camera',
            title: 'Camera Tips',
            content: 'Use the back camera for best quality. You can switch cameras using the button in the recorder.',
            target: {
              selector: '.camera-switch-button'
            },
            placement: 'right'
          },
          {
            id: 'mobile-quality',
            title: 'Adjust Quality',
            content: 'If you have a slow internet connection, reduce quality settings to improve performance.',
            target: {
              selector: '.quality-settings'
            },
            placement: 'bottom'
          },
          {
            id: 'mobile-complete',
            title: 'You\'re Ready!',
            content: 'You now know how to optimize recording on mobile. Tap "Start Recording" to begin.',
            placement: 'center',
            action: 'Start Recording'
          }
        ]
      },
      
      // Onboarding tutorial
      {
        id: 'onboarding',
        name: 'Auto-Dukaan Onboarding',
        description: 'Get started with Auto-Dukaan',
        category: 'onboarding',
        autoStart: true,
        triggerRoute: '/dashboard',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to Auto-Dukaan!',
            content: 'Let\'s take a quick tour to help you set up your online store.',
            placement: 'center'
          },
          {
            id: 'dashboard',
            title: 'Your Dashboard',
            content: 'This is your dashboard where you can see sales, orders and store performance at a glance.',
            placement: 'top',
            target: {
              selector: '.dashboard-overview'
            }
          },
          {
            id: 'product-menu',
            title: 'Manage Products',
            content: 'Click here to add and manage your products. You can upload individually or use our AI-powered video detection.',
            target: {
              selector: '.products-nav-link'
            },
            placement: 'right'
          },
          {
            id: 'orders-menu',
            title: 'Manage Orders',
            content: 'Here you\'ll find all your customer orders. You can process, track, and manage them.',
            target: {
              selector: '.orders-nav-link'
            },
            placement: 'right'
          },
          {
            id: 'settings-menu',
            title: 'Store Settings',
            content: 'Configure your store settings, payment methods, and delivery options here.',
            target: {
              selector: '.settings-nav-link'
            },
            placement: 'right'
          },
          {
            id: 'onboarding-complete',
            title: 'You\'re All Set!',
            content: 'You\'re ready to start selling! Would you like to add your first product now?',
            placement: 'center',
            action: 'Add First Product'
          }
        ]
      }
    ];
  }
  
  /**
   * Load user progress from local storage
   */
  private loadProgress() {
    try {
      const savedProgress = localStorage.getItem('tutorial-progress');
      if (savedProgress) {
        this.progress = JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error('Failed to load tutorial progress:', error);
    }
  }
  
  /**
   * Save user progress to local storage
   */
  private saveProgress() {
    try {
      localStorage.setItem('tutorial-progress', JSON.stringify(this.progress));
    } catch (error) {
      console.error('Failed to save tutorial progress:', error);
    }
  }
  
  /**
   * Get all available tutorials
   */
  public getTutorials(): Tutorial[] {
    return this.tutorials;
  }
  
  /**
   * Get a specific tutorial by ID
   */
  public getTutorial(id: string): Tutorial | undefined {
    return this.tutorials.find(tutorial => tutorial.id === id);
  }
  
  /**
   * Get tutorials for a specific category
   */
  public getTutorialsByCategory(category: string): Tutorial[] {
    return this.tutorials.filter(tutorial => tutorial.category === category);
  }
  
  /**
   * Get tutorials that should start on a specific route
   */
  public getTutorialsForRoute(route: string): Tutorial[] {
    return this.tutorials.filter(tutorial => 
      tutorial.triggerRoute === route && 
      (!this.getProgress(tutorial.id)?.completed || 
       !this.getProgress(tutorial.id)?.dismissed)
    );
  }
  
  /**
   * Get auto-start tutorials for a route
   */
  public getAutoStartTutorials(route: string): Tutorial | undefined {
    return this.tutorials.find(tutorial => 
      tutorial.triggerRoute === route && 
      tutorial.autoStart === true &&
      (!this.getProgress(tutorial.id)?.completed && 
       !this.getProgress(tutorial.id)?.dismissed)
    );
  }
  
  /**
   * Start a tutorial
   */
  public startTutorial(tutorialId: string): boolean {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial || tutorial.steps.length === 0) {
      return false;
    }
    
    this.activeTutorialId = tutorialId;
    const firstStep = tutorial.steps[0];
    this.activeStepId = firstStep.id;
    
    // Initialize or update progress
    if (!this.progress[tutorialId]) {
      this.progress[tutorialId] = {
        tutorialId,
        completedSteps: [],
        currentStepId: firstStep.id,
        completed: false,
        lastUpdated: new Date(),
        dismissed: false
      };
    } else {
      this.progress[tutorialId].currentStepId = firstStep.id;
      this.progress[tutorialId].dismissed = false;
      this.progress[tutorialId].lastUpdated = new Date();
    }
    
    this.saveProgress();
    this.notifyChange();
    return true;
  }
  
  /**
   * Move to the next step in the current tutorial
   */
  public nextStep(): TutorialStep | null {
    if (!this.activeTutorialId || !this.activeStepId) {
      return null;
    }
    
    const tutorial = this.getTutorial(this.activeTutorialId);
    if (!tutorial) {
      return null;
    }
    
    // Find current step index
    const currentIndex = tutorial.steps.findIndex(step => step.id === this.activeStepId);
    if (currentIndex === -1) {
      return null;
    }
    
    // Mark current step as completed
    if (!this.progress[this.activeTutorialId].completedSteps.includes(this.activeStepId)) {
      this.progress[this.activeTutorialId].completedSteps.push(this.activeStepId);
    }
    
    // Check if this was the last step
    if (currentIndex >= tutorial.steps.length - 1) {
      // Tutorial completed
      this.progress[this.activeTutorialId].completed = true;
      this.progress[this.activeTutorialId].lastUpdated = new Date();
      this.activeTutorialId = null;
      this.activeStepId = null;
      this.saveProgress();
      this.notifyChange();
      return null;
    }
    
    // Move to next step
    const nextStep = tutorial.steps[currentIndex + 1];
    this.activeStepId = nextStep.id;
    this.progress[this.activeTutorialId].currentStepId = nextStep.id;
    this.progress[this.activeTutorialId].lastUpdated = new Date();
    this.saveProgress();
    this.notifyChange();
    
    return nextStep;
  }
  
  /**
   * Move to the previous step in the current tutorial
   */
  public previousStep(): TutorialStep | null {
    if (!this.activeTutorialId || !this.activeStepId) {
      return null;
    }
    
    const tutorial = this.getTutorial(this.activeTutorialId);
    if (!tutorial) {
      return null;
    }
    
    // Find current step index
    const currentIndex = tutorial.steps.findIndex(step => step.id === this.activeStepId);
    if (currentIndex <= 0) {
      return null;
    }
    
    // Move to previous step
    const prevStep = tutorial.steps[currentIndex - 1];
    this.activeStepId = prevStep.id;
    this.progress[this.activeTutorialId].currentStepId = prevStep.id;
    this.progress[this.activeTutorialId].lastUpdated = new Date();
    this.saveProgress();
    this.notifyChange();
    
    return prevStep;
  }
  
  /**
   * End the current tutorial
   */
  public endTutorial(dismiss: boolean = true): void {
    if (!this.activeTutorialId) {
      return;
    }
    
    if (dismiss) {
      this.progress[this.activeTutorialId].dismissed = true;
    }
    
    this.progress[this.activeTutorialId].lastUpdated = new Date();
    this.activeTutorialId = null;
    this.activeStepId = null;
    this.saveProgress();
    this.notifyChange();
  }
  
  /**
   * Get the current active tutorial
   */
  public getActiveTutorial(): Tutorial | null {
    if (!this.activeTutorialId) {
      return null;
    }
    
    return this.getTutorial(this.activeTutorialId) || null;
  }
  
  /**
   * Get the current active step
   */
  public getActiveStep(): TutorialStep | null {
    if (!this.activeTutorialId || !this.activeStepId) {
      return null;
    }
    
    const tutorial = this.getTutorial(this.activeTutorialId);
    if (!tutorial) {
      return null;
    }
    
    return tutorial.steps.find(step => step.id === this.activeStepId) || null;
  }
  
  /**
   * Get progress for a specific tutorial
   */
  public getProgress(tutorialId: string): TutorialProgress | undefined {
    return this.progress[tutorialId];
  }
  
  /**
   * Reset progress for a specific tutorial
   */
  public resetProgress(tutorialId: string): void {
    if (this.progress[tutorialId]) {
      delete this.progress[tutorialId];
      this.saveProgress();
      this.notifyChange();
    }
  }
  
  /**
   * Reset all tutorial progress
   */
  public resetAllProgress(): void {
    this.progress = {};
    this.activeTutorialId = null;
    this.activeStepId = null;
    this.saveProgress();
    this.notifyChange();
  }
  
  /**
   * Subscribe to tutorial changes
   */
  public subscribe(callback: Function): Function {
    this.onTutorialChangeCallbacks.push(callback);
    return () => {
      this.onTutorialChangeCallbacks = this.onTutorialChangeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all subscribers of a change
   */
  private notifyChange(): void {
    for (const callback of this.onTutorialChangeCallbacks) {
      callback();
    }
  }
}

export default new TutorialService();