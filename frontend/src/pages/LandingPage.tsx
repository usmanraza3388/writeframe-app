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
        padding: '80px 32px', // Increased top/bottom padding
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-transparent)',
        gap: '32px' // Slightly increased gap
      }}>
        {/* Logo with more space */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)', // #000000
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            writeFrame
          </h1>
        </div>

        {/* Motto Line with better spacing */}
        <div style={{ 
          maxWidth: '280px',
          marginBottom: '40px' // Added space below motto
        }}>
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '20px',
            color: 'var(--text-secondary)', // #55524F
            margin: 0,
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            Write scenes. Craft characters. Create your cinematic world.
          </p>
        </div>

        {/* CTA Button with consistent spacing */}
        <div style={{ 
          width: '100%',
          marginBottom: '16px' // Space above secondary link
        }}>
          <Link 
            to="/signup"
            style={{
              width: '100%',
              padding: '16px 20px', // Slightly increased padding
              background: 'var(--text-dark)', // #1A1A1A
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

        {/* Secondary Link */}
        <Link 
          to="/signin"
          style={{
            color: 'var(--text-gray)', // #6B7280
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            textDecoration: 'underline',
            transition: 'color 0.2s ease',
            marginTop: '8px' // Extra space from button
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
      </div>
    </div>
  );
};

export default LandingPage;