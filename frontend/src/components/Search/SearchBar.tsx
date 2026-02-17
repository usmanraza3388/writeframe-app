import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';

interface SearchBarProps {
  onClose?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onClose, 
  placeholder = "Search filmmakers...",
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, searchUsers } = useSearch();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    searchUsers(value);
    setIsOpen(true);
  }, [searchUsers]);

  const handleSelectUser = (userId: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${userId}`);
    onClose?.(); // This line was added
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#FAF8F2',
        borderRadius: '25px',
        padding: '8px 16px',
        border: '1px solid #E5E5E5'
      }}>
        <span style={{ marginRight: '8px', color: '#55524F' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontFamily: "'Cormorant', serif",
            fontSize: '15px',
            color: '#1C1C1C'
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#55524F'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && query && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          marginTop: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#55524F' }}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F0F0F0'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF8F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#55524F'
                }}>
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name || ''}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    (user.full_name?.[0] || user.username?.[0] || '?').toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ 
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: '600',
                    color: '#1C1C1C'
                  }}>
                    {user.full_name || 'Anonymous'}
                  </div>
                  <div style={{ 
                    fontSize: '13px',
                    color: '#6B7280',
                    fontFamily: "'Cormorant', serif"
                  }}>
                    @{user.username || 'user'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#55524F' }}>
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;