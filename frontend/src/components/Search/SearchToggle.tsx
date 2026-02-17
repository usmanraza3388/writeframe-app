import React, { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';

interface SearchToggleProps {
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
}

const SearchToggle: React.FC<SearchToggleProps> = ({ onSearchOpen, onSearchClose }) => {
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearchClick = () => {
    setIsSearching(true);
    onSearchOpen?.();
  };

  const handleClose = () => {
    setIsSearching(false);
    onSearchClose?.();
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isSearching) {
          handleClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearching]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {!isSearching ? (
        // Header with title and search icon
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1C1C1C',
            margin: 0,
            transition: 'opacity 0.2s ease'
          }}>
            writeFrame
          </h1>
          <button
            onClick={handleSearchClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1C1C1C',
              fontSize: '20px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      ) : (
        // Search bar expanded
        <div style={{
          width: '100%',
          animation: 'slideIn 0.3s ease'
        }}>
          <SearchBar 
            autoFocus 
            onClose={handleClose}
            placeholder="Search filmmakers by name or username..."
          />
        </div>
      )}
      
      {/* Add animation styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchToggle;