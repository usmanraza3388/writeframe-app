import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TourOverlay from '../TourOverlay/TourOverlay';
import TourTooltip from '../TourTooltip/TourTooltip';
import { getTourStepsForUser } from '../../utils/tourSteps'; // Match actual filename

const TourManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Get tour steps for current user
  const tourSteps = getTourStepsForUser(user?.id);
  const currentStep = tourSteps[currentStepIndex];
  const totalSteps = tourSteps.length;

  // Check if tour should be active
  useEffect(() => {
    const tourOptedIn = localStorage.getItem('tour_opted_in') === 'true';
    const tourCompleted = localStorage.getItem('tour_completed') === 'true';
    
    if (tourOptedIn && !tourCompleted && !isActive) {
      // Start tour on next tick to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 500);
    }
  }, [isActive]);

  // Handle route changes for tour steps
  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Check if we're on the correct route for the current step
    const currentRoute = location.pathname;
    const stepRoute = currentStep.route;

    // Special handling for profile routes with dynamic user IDs
    const isProfileRoute = stepRoute.includes('/profile/');
    const isCorrectRoute = isProfileRoute 
      ? currentRoute.startsWith('/profile/')
      : currentRoute === stepRoute;

    if (!isCorrectRoute && !isNavigating) {
      setIsNavigating(true);
      navigate(stepRoute);
    }
  }, [isActive, currentStep, location.pathname, navigate, isNavigating]);

  // Find and measure target element when step changes
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetElement(null);
      setTargetRect(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        setTargetRect(element.getBoundingClientRect());
        
        // Scroll element into view if needed
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      } else {
        // Retry finding element
        setTimeout(findElement, 200);
      }
    };

    // Reset navigation flag when step changes
    setIsNavigating(false);
    
    // Find the target element
    findElement();

    // Update rect on window resize
    const handleResize = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, currentStep, currentStepIndex, targetElement]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tour completed
      handleComplete();
    }
  }, [currentStepIndex, totalSteps]);

  // Handle previous step
  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Handle skip tour
  const handleSkip = useCallback(() => {
    localStorage.setItem('tour_completed', 'true');
    localStorage.setItem('tour_opted_in', 'false');
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  // Handle tour completion
  const handleComplete = useCallback(() => {
    localStorage.setItem('tour_completed', 'true');
    localStorage.setItem('tour_opted_in', 'false');
    setIsActive(false);
    setCurrentStepIndex(0);
    
    // Show completion message (optional)
    setTimeout(() => {
      alert('Tour completed! You can now explore writeFrame on your own.');
    }, 300);
  }, []);

  // Handle overlay click (advance to next step)
  const handleOverlayClick = useCallback(() => {
    // Only advance if not on an interactive step
    if (currentStep?.action !== 'click') {
      handleNext();
    }
  }, [currentStep, handleNext]);

  // Handle target element click (for interactive steps)
  useEffect(() => {
    if (!targetElement || currentStep?.action !== 'click') return;

    const handleTargetClick = (e: Event) => {
      e.stopPropagation();
      setTimeout(handleNext, 300); // Small delay to see the result
    };

    targetElement.addEventListener('click', handleTargetClick);
    return () => {
      targetElement.removeEventListener('click', handleTargetClick);
    };
  }, [targetElement, currentStep, handleNext]);

  if (!isActive || !currentStep) return null;

  return (
    <>
      <TourOverlay
        targetSelector={currentStep.target}
        isActive={isActive}
        onOverlayClick={handleOverlayClick}
      >
        <TourTooltip
          targetRect={targetRect}
          position={currentStep.position}
          title={currentStep.title}
          content={currentStep.content}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          showNextButton={currentStep.action !== 'click'}
          showBackButton={currentStepIndex > 0}
        />
      </TourOverlay>
    </>
  );
};

export default TourManager;