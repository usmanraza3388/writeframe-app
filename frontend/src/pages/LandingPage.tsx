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
        padding: '80px 32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-transparent)',
        gap: '32px'
      }}>
        {/* Logo and Title Section */}
        <div style={{ 
          marginBottom: '20px',
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

        {/* Motto Line with better spacing */}
        <div style={{ 
          maxWidth: '280px',
          marginBottom: '40px'
        }}>
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '20px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            Write Scenes and Monologues. Craft characters and Cinematic Frames. Create your cinematic world.
          </p>
        </div>

        {/* CTA Button with consistent spacing */}
        <div style={{ 
          width: '100%',
          marginBottom: '8px'
        }}>
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
            Start Creating
          </Link>
        </div>

        {/* 👇 ADDED: Browse Community Work First Button 👇 */}
        <div style={{ 
          width: '100%',
          marginBottom: '16px'
        }}>
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

        {/* Secondary Link */}
        <Link 
          to="/signin"
          style={{
            color: 'var(--text-gray)',
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            textDecoration: 'underline',
            transition: 'color 0.2s ease',
            marginTop: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-gray)';
          }}
        >
          Already have an account? Sign In
        </Link>

        {/* 👇 ADDED: About Page Link 👇 */}
        <div style={{ 
          marginTop: '16px',
          textAlign: 'center'
        }}>
          <Link 
            to="/about"
            style={{
              color: 'var(--text-gray)',
              fontFamily: "'Cormorant', serif",
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              opacity: 0.8,
              display: 'inline-block',
              padding: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-gray)';
              e.currentTarget.style.opacity = '0.8';
            }}
          >
            What is writeFrame? Learn more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;