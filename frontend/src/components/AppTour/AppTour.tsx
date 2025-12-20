// src/components/AppTour/AppTour.tsx
import React, { useState, useEffect, useRef } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  targetElement?: 'bottomnav' | 'create-button' | 'whispers-button' | 'profile-button' | 'home-feed';
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface AppTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const AppTour: React.FC<AppTourProps> = ({ 
  isActive, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to writeFrame',
      description: 'Let\'s take a quick tour of the key features.',
      position: 'top'
    },
    {
      id: 'bottomnav',
      title: 'Navigation',
      description: 'Everything you need is in the bottom navigation bar.',
      targetElement: 'bottomnav',
      position: 'top'
    },
    {
      id: 'create-button',
      title: 'Create Content',
      description: 'Tap the Create button to write scenes, monologues, create characters, or frames.',
      targetElement: 'create-button',
      position: 'top'
    },
    {
      id: 'whispers-button',
      title: 'Private Messages',
      description: 'Use Whispers to send private feedback to other creators.',
      targetElement: 'whispers-button',
      position: 'top'
    },
    {
      id: 'profile-button',
      title: 'Your Profile',
      description: 'Your profile shows your portfolio and stats.',
      targetElement: 'profile-button',
      position: 'top'
    },
    {
      id: 'home-feed',
      title: 'Home Feed',
      description: 'Discover creations from others. Like, comment, or repost content.',
      targetElement: 'home-feed',
      position: 'bottom'
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Start creating or exploring. You can always access help from your profile settings.',
      position: 'top'
    }
  ];

  // Find and highlight target element for current step
  useEffect(() => {
    if (!isActive || !tourSteps[currentStep].targetElement) {
      setHighlightedElement(null);
      return;
    }

    const step = tourSteps[currentStep];
    let element: HTMLElement | null = null;

    switch (step.targetElement) {
      case 'bottomnav':
        element = document.querySelector('nav') as HTMLElement;
        break;
      case 'create-button':
        const navButtons = document.querySelectorAll('nav button');
        element = Array.from(navButtons).find(btn => 
          btn.textContent?.includes('Create') || btn.textContent?.includes('+')
        ) as HTMLElement || navButtons[2] as HTMLElement;
        break;
      case 'whispers-button':
        const whispersButtons = document.querySelectorAll('nav button');
        element = Array.from(whispersButtons).find(btn => 
          btn.textContent?.includes('Whispers') || btn.textContent?.includes('Messages')
        ) as HTMLElement || whispersButtons[1] as HTMLElement;
        break;
      case 'profile-button':
        const profileButtons = document.querySelectorAll('nav button');
        element = Array.from(profileButtons).find(btn => 
          btn.textContent?.includes('Profile')
        ) as HTMLElement || profileButtons[3] as HTMLElement;
        break;
      case 'home-feed':
        element = document.querySelector('[data-home-feed]') as HTMLElement || 
                  document.querySelector('main') as HTMLElement;
        break;
    }

    setHighlightedElement(element);
  }, [currentStep, isActive]);

  // Handle click outside to prevent interaction with highlighted elements
  useEffect(() => {
    if (!isActive || !overlayRef.current) return;

    const handleClick = (e: MouseEvent) => {
      if (highlightedElement && highlightedElement.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isActive, highlightedElement]);

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (step.action) {
      step.action();
    }

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Calculate tooltip position based on highlighted element
  const getTooltipPosition = () => {
    if (!highlightedElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    switch (step.position) {
      case 'top':
        return {
          top: `${Math.max(rect.top - 160, 20)}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: `${Math.min(rect.bottom + 20, windowHeight - 200)}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      default:
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left + rect.width + 20}px`
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Dark Overlay */}
      <div 
        ref={overlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998
        }}
        onClick={(e) => {
          if (highlightedElement && highlightedElement.contains(e.target as Node)) {
            e.stopPropagation();
          }
        }}
      />

      {/* Highlight Overlay with Cutout */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}>
        {highlightedElement && (
          <div style={{
            position: 'absolute',
            top: highlightedElement.offsetTop - 8,
            left: highlightedElement.offsetLeft - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            border: '2px solid #D4AF37',
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            animation: 'pulse 2s infinite'
          }} />
        )}
      </div>

      {/* Tooltip */}
      <div style={{
        position: 'fixed',
        ...tooltipStyle,
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '320px',
        width: '90%',
        zIndex: 10000,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0
          }}>
            {step.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              color: '#6B7280',
              fontFamily: "'Cormorant', serif"
            }}>
              {currentStep + 1}/{tourSteps.length}
            </span>
            <button
              onClick={onSkip}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '0',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '15px',
          color: '#55524F',
          lineHeight: 1.5,
          margin: '0 0 20px'
        }}>
          {step.description}
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {tourSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: index === currentStep ? '#1A1A1A' : '#E5E7EB'
                }}
              />
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Cormorant', serif",
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isLastStep ? 'Finish Tour' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7), 0 0 0 9999px rgba(0, 0, 0, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0), 0 0 0 9999px rgba(0, 0, 0, 0.5); }
            100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0), 0 0 0 9999px rgba(0, 0, 0, 0.5); }
          }
        `}
      </style>
    </>
  );
};

export default AppTour;