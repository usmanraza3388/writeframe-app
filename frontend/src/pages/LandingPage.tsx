// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background-secondary)', // #FAF8F2
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '375px',
        height: '812px',
        background: 'var(--background-primary)', // #FFFFFF
        borderRadius: '18px',
        padding: '60px 32px', // Reduced padding to fit more content
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between', // Changed to space-between for better layout
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-transparent)',
        gap: '24px'
      }}>
        {/* Top Section - Logo and Main CTA */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%'
        }}>
          {/* Logo and Title Section */}
          <div style={{ 
            marginBottom: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            {/* Logo Image */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src="/favicon.ico" 
                alt="writeFrame Logo"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {/* Title */}
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              writeFrame
            </h1>
          </div>

          {/* Improved Motto Line - More Benefit-Focused */}
          <div style={{ 
            maxWidth: '280px',
            marginBottom: '8px'
          }}>
            <p style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '18px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.4,
              textAlign: 'center'
            }}>
              <strong>The portfolio builder for cinematic creators.</strong>
            </p>
            <p style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '16px',
              color: '#55524F',
              margin: '12px 0 0 0',
              lineHeight: 1.4,
              textAlign: 'center',
              opacity: 0.9
            }}>
              Share scenes, monologues, characters, and visual frames—no finished script required.
            </p>
          </div>
        </div>

        {/* Middle Section - Action Buttons */}
        <div style={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Main CTA Button */}
          <Link 
            to="/signup"
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'var(--text-dark)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2A2A2A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A1A';
            }}
          >
            Start Creating Free
          </Link>

          {/* Browse Community Work First Button */}
          <Link 
            to="/home-feed"
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: 'transparent',
              color: '#55524F',
              border: '1px solid var(--border-transparent)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
              e.currentTarget.style.borderColor = 'var(--text-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-transparent)';
              e.currentTarget.style.color = '#55524F';
            }}
          >
            Browse Community Work First
          </Link>
        </div>

        {/* Bottom Section - About & Login */}
        <div style={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginTop: 'auto'
        }}>
          {/* 🆕 PROMINENT "NEW HERE?" SECTION */}
          <div style={{ 
            background: '#FAF8F2',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative corner accent */}
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '40px',
              height: '40px',
              background: 'rgba(212, 175, 55, 0.1)',
              borderBottomLeftRadius: '40px'
            }}></div>
            
            <h3 style={{ 
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#1C1C1C',
              margin: '0 0 8px 0'
            }}>
              New to writeFrame?
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#55524F',
              margin: '0 0 16px 0',
              lineHeight: 1.5
            }}>
              Learn how it works, why creators love it, and how to get started.
            </p>
            
            <Link 
              to="/about"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#1C1C1C',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                border: '1px solid #1C1C1C'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2A2A2A';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1C1C1C';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              See How It Works →
            </Link>
          </div>

          {/* Already have account? Sign In */}
          <div style={{
            textAlign: 'center',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <Link 
              to="/signin"
              style={{
                color: 'var(--text-gray)',
                fontFamily: "'Cormorant', serif",
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                display: 'inline-block',
                padding: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-gray)';
              }}
            >
              Already have an account? <strong>Sign In</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;