import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // ADDED: Retry counter ref and max retries constant
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;

  // Get tour steps for current user
  const tourSteps = getTourStepsForUser(user?.id);
  const currentStep = tourSteps[currentStepIndex];
  const totalSteps = tourSteps.length;

  // Check if tour should be active - UPDATED: Wait for user data
  useEffect(() => {
    const tourOptedIn = localStorage.getItem('tour_opted_in') === 'true';
    const tourCompleted = localStorage.getItem('tour_completed') === 'true';
    
    if (tourOptedIn && !tourCompleted && !isActive && user?.id) {
      // Start tour on next tick to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 500);
    }
  }, [isActive, user?.id]);

  // Handle route changes for tour steps - UPDATED: Wait for navigation to complete
  useEffect(() => {
    if (!isActive || !currentStep || isNavigating) return;

    // Check if we're on the correct route for the current step
    const currentRoute = location.pathname;
    const stepRoute = currentStep.route;

    // Special handling for profile routes with dynamic user IDs
    const isProfileRoute = stepRoute.includes('/profile/');
    const isCorrectRoute = isProfileRoute 
      ? currentRoute.startsWith('/profile/')
      : currentRoute === stepRoute;

    if (!isCorrectRoute) {
      setIsNavigating(true);
      
      // Navigate and wait for page to load
      navigate(stepRoute);
      
      // Reset retry counter for new page
      retryCountRef.current = 0;
      
      // Set a timeout to reset navigation flag (page load time)
      const navigationTimeout = setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
      
      return () => clearTimeout(navigationTimeout);
    }
  }, [isActive, currentStep, location.pathname, navigate, isNavigating]);

  // Find and measure target element when step changes - FIXED: Remove targetElement from deps
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetElement(null);
      setTargetRect(null);
      retryCountRef.current = 0; // Reset retry counter
      return;
    }

    const findElement = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        setTargetRect(element.getBoundingClientRect());
        retryCountRef.current = 0; // Reset retry counter on success
        
        // Scroll element into view if needed
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      } else {
        retryCountRef.current += 1;
        
        if (retryCountRef.current < MAX_RETRIES) {
          // Retry finding element with increasing delay
          setTimeout(findElement, 300 * retryCountRef.current);
        } else {
          // Element not found after max retries - skip step after delay
          console.warn(`Tour element not found after ${MAX_RETRIES} attempts: ${currentStep.target}`);
          
          // Auto-skip to next step after 1.5 seconds
          const skipTimeout = setTimeout(() => {
            handleNext();
          }, 1500);
          
          return () => clearTimeout(skipTimeout);
        }
      }
    };

    // Don't reset isNavigating here - let navigation effect handle it
    
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
  }, [isActive, currentStep, currentStepIndex]); // REMOVED: targetElement from dependencies

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