// src/components/GettingStartedModal/GettingStartedModal.tsx
import React, { useState } from 'react';

interface GettingStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const GettingStartedModal: React.FC<GettingStartedModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to writeFrame",
      description: "A dedicated platform for cinematic creators to develop and showcase their portfolio. Begin with concepts—polished scripts are not required.",
      buttonText: "Continue"
    },
    {
      title: "Create in Four Ways",
      description: "Write scenes, craft monologues, create characters, or curate visual frames. Start with just one idea.",
      details: [
        "Scenes: Professional-grade screenplay composer with industry-standard formatting",
        "Monologues: Character voice development with emotional tone analysis and prose refinement", 
        "Characters: Persona building with visual reference galleries and backstory development",
        "Frames: Visual narrative curation with collage composition and mood board creation"
      ],
      buttonText: "Next"
    },
    {
      title: "Build Your Portfolio",
      description: "Each creation adds to your public profile. Showcase your style and growth over time.",
      buttonText: "Next"
    },
    {
      title: "Connect & Collaborate",
      description: "Follow creators you admire. Send private feedback. Find inspiration in the community.",
      details: [
        "Follow: Track creators whose work aligns with your artistic development",
        "Connect: Exchange professional feedback through dedicated messaging",
        "Discover: Analyze diverse creative approaches and narrative techniques"
      ],
      buttonText: "Begin Creating"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 'min(400px, calc(100vw - 40px))',
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#9CA3AF',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        {/* Progress Bar */}
        <div style={{
          height: '4px',
          background: '#F3F4F6',
          borderRadius: '2px',
          marginBottom: '32px'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#1A1A1A',
            borderRadius: '2px'
          }} />
        </div>

        {/* Step Content */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {/* Title */}
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 12px 0',
            lineHeight: 1.3
          }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '18px',
            color: '#55524F',
            margin: '0 0 20px 0',
            lineHeight: 1.5
          }}>
            {step.description}
          </p>

          {/* Details List */}
          {step.details && (
            <div style={{
              background: '#FAF8F2',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '20px'
            }}>
              {step.details.map((detail, index) => {
                const colonIndex = detail.indexOf(':');
                const label = colonIndex !== -1 ? detail.substring(0, colonIndex) : detail;
                const description = colonIndex !== -1 ? detail.substring(colonIndex + 1) : '';
                
                return (
                  <div 
                    key={index}
                    style={{
                      padding: '12px 0',
                      fontSize: '15px',
                      color: '#4B5563',
                      borderBottom: index < step.details!.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                    }}
                  >
                    <div style={{
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '4px',
                      fontFamily: "'Cormorant', serif"
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      lineHeight: 1.4,
                      fontFamily: "'Cormorant', serif"
                    }}>
                      {description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: 'transparent',
              border: '1px solid #D1D5DB',
              borderRadius: '12px',
              color: '#6B7280',
              fontSize: '15px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Skip Tour
          </button>

          {/* Next/Start Button */}
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: '14px 20px',
              background: '#1A1A1A',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {step.buttonText}
          </button>
        </div>

        {/* Step Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentStep ? '#1A1A1A' : '#E5E7EB'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GettingStartedModal;