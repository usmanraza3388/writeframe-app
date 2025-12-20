// src/contexts/TourContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import useTour, { TourStep, TourProgress } from '../hooks/useTour';

interface TourContextType {
  // State from useTour
  progress: TourProgress;
  currentStep: TourStep | null;
  isActive: boolean;
  steps: TourStep[];
  
  // Actions from useTour
  enableTour: () => void;
  skipTour: () => void;
  completeTour: () => void;
  completeStep: (stepId: string) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  startTour: () => void;
  pauseTour: () => void;
  resetTour: () => void;
  triggerStep: (stepId: string) => boolean;
  checkAndTriggerSteps: (currentRoute: string) => void;
  
  // Getters from useTour
  getProgressPercentage: () => number;
  isTourCompleted: () => boolean;
  isStepCompleted: (stepId: string) => boolean;
  getCurrentStepIndex: () => number;
  
  // Opt-in related
  hasSeenOptIn: () => boolean;
  markOptInSeen: () => void;
  
  // Constants
  totalSteps: number;
  
  // Additional context methods
  isTourEnabled: () => boolean;
  shouldShowCoachMark: (stepId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const tour = useTour();

  const contextValue: TourContextType = {
    // State
    progress: tour.progress,
    currentStep: tour.currentStep,
    isActive: tour.isActive,
    steps: tour.steps,
    
    // Actions
    enableTour: tour.enableTour,
    skipTour: tour.skipTour,
    completeTour: tour.completeTour,
    completeStep: tour.completeStep,
    goToNextStep: tour.goToNextStep,
    goToPrevStep: tour.goToPrevStep,
    startTour: tour.startTour,
    pauseTour: tour.pauseTour,
    resetTour: tour.resetTour,
    triggerStep: tour.triggerStep,
    checkAndTriggerSteps: tour.checkAndTriggerSteps,
    
    // Getters
    getProgressPercentage: tour.getProgressPercentage,
    isTourCompleted: tour.isTourCompleted,
    isStepCompleted: tour.isStepCompleted,
    getCurrentStepIndex: tour.getCurrentStepIndex,
    
    // Opt-in related
    hasSeenOptIn: tour.hasSeenOptIn,
    markOptInSeen: tour.markOptInSeen,
    
    // Constants
    totalSteps: tour.totalSteps,
    
    // Additional methods
    isTourEnabled: () => tour.progress.enabled && !tour.progress.skipped,
    shouldShowCoachMark: (stepId: string) => {
      return (
        tour.progress.enabled &&
        !tour.progress.skipped &&
        tour.currentStep?.id === stepId &&
        tour.isActive
      );
    }
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
};

export const useTourContext = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};

// Helper hook for checking tour state in components
export const useTourStep = (stepId?: string) => {
  const context = useTourContext();
  
  return {
    // General tour state
    isTourEnabled: context.isTourEnabled(),
    isTourActive: context.isActive,
    currentStep: context.currentStep,
    progressPercentage: context.getProgressPercentage(),
    
    // Step-specific state
    isCurrentStep: stepId ? context.currentStep?.id === stepId : false,
    isStepCompleted: stepId ? context.isStepCompleted(stepId) : false,
    shouldShowCoachMark: stepId ? context.shouldShowCoachMark(stepId) : false,
    
    // Actions
    completeStep: context.completeStep,
    triggerStep: context.triggerStep,
    goToNextStep: context.goToNextStep,
    goToPrevStep: context.goToPrevStep
  };
};

// Hook for route-based tour triggering
export const useTourRoute = () => {
  const context = useTourContext();
  
  return {
    checkAndTriggerSteps: context.checkAndTriggerSteps,
    triggerStep: context.triggerStep
  };
};

// Hook for tour progress display
export const useTourProgress = () => {
  const context = useTourContext();
  
  return {
    progress: context.progress,
    progressPercentage: context.getProgressPercentage(),
    currentStepIndex: context.getCurrentStepIndex(),
    totalSteps: context.totalSteps,
    isTourCompleted: context.isTourCompleted(),
    currentStep: context.currentStep
  };
};

export default TourContext;