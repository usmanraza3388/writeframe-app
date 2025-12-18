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
      title: "Welcome to writeFrame 🎬",
      description: "The portfolio builder for cinematic creators. Share your ideas—no finished script required.",
      image: "🎞️",
      buttonText: "Next"
    },
    {
      title: "Create in 4 Ways",
      description: "Write scenes, monologues, character sketches, or curate visual frames. Start with just one idea.",
      image: "✍️",
      details: [
        "🎬 Scenes: Capture moments",
        "🎭 Monologues: Express inner thoughts", 
        "👤 Characters: Build personas",
        "🖼️ Frames: Curate visual inspiration"
      ],
      buttonText: "Next"
    },
    {
      title: "Build Your Portfolio",
      description: "Each creation adds to your public profile. Showcase your style and growth over time.",
      image: "📁",
      buttonText: "Next"
    },
    {
      title: "Connect & Collaborate",
      description: "Follow creators you admire. Send private feedback. Find inspiration in the community.",
      image: "🤝",
      details: [
        "👥 Follow: Echo other creators",
        "💬 Connect: Send Whisper messages",
        "✨ Discover: Find new perspectives"
      ],
      buttonText: "Let's Start Creating"
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
        maxWidth: '400px',
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
          {/* Image/Emoji */}
          <div style={{
            fontSize: '64px',
            marginBottom: '24px'
          }}>
            {step.image}
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 12px 0'
          }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '18px',
            color: '#55524F',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            {step.description}
          </p>

          {/* Details List */}
          {step.details && (
            <div style={{
              background: '#FAF8F2',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '20px',
              textAlign: 'left'
            }}>
              {step.details.map((detail, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    fontSize: '15px',
                    color: '#4B5563'
                  }}
                >
                  <div style={{ fontSize: '20px' }}>
                    {detail.substring(0, 2)}
                  </div>
                  <span>{detail.substring(3)}</span>
                </div>
              ))}
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