import React, { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export default function EditProfileModal({ initial, onClose, onSave, open, onProfilePictureChange, hasProfilePicture }) {
  const [form, setForm] = useState({
    full_name: initial.full_name || '',
    bio: initial.bio || '',
    genre_persona: initial.genre_persona || '',
    expression: initial.expression || '',
    username: initial.username || '',
  });
  
  const [usernameError, setUsernameError] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Reset form when modal opens with new initial data
  useEffect(() => {
    if (open) {
      setForm({
        full_name: initial.full_name || '',
        bio: initial.bio || '',
        genre_persona: initial.genre_persona || '',
        expression: initial.expression || '',
        username: initial.username || '',
      });
      setUsernameError(null);
    }
  }, [open, initial]);

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (!username || username === initial.username) return true;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      return !data; // Available if no data returned
    } catch (error) {
      return true; // Assume available on error
    }
  };

  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setForm(prev => ({ ...prev, username: newUsername }));
    
    // Clear previous error
    setUsernameError(null);
    
    // Validate username
    if (newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    if (newUsername.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return;
    }
    
    if (newUsername !== initial.username) {
      setIsCheckingUsername(true);
      const isAvailable = await checkUsernameAvailability(newUsername);
      setIsCheckingUsername(false);
      
      if (!isAvailable) {
        setUsernameError('Username is already taken');
      }
    }
  };

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function save() {
    // Final validation before saving
    if (form.username !== initial.username) {
      const isAvailable = await checkUsernameAvailability(form.username);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        return;
      }
    }
    
    if (form.username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    onSave(form);
  }

  if (!open) return null;

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    boxSizing: 'border-box'
  };

  const modalContentStyle = {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '340px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(0, 0, 0, 0.06)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    backgroundColor: '#FAF8F2',
    outline: 'none',
    fontSize: '15px',
    fontFamily: "'Cormorant', serif",
    marginBottom: '12px',
    boxSizing: 'border-box'
  };

  const errorInputStyle = {
    ...inputStyle,
    border: '1px solid #DC2626',
    backgroundColor: '#FEF2F2'
  };

  const textareaStyle = {
    ...inputStyle,
    height: '80px',
    resize: 'none'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.15)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Cormorant', serif",
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    border: '1px solid #1A1A1A'
  };

  const disabledSaveButtonStyle = {
    ...saveButtonStyle,
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
    cursor: 'not-allowed'
  };

  const profilePictureButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '8px',
    color: '#1A1A1A',
    fontSize: '14px',
    fontFamily: "'Cormorant', serif",
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'all 0.2s ease'
  };

  const isSaveDisabled = usernameError !== null || isCheckingUsername || form.username.length < 3;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px',
          fontWeight: '700',
          color: '#1A1A1A',
          marginBottom: '20px'
        }}>
          Edit Profile
        </h3>
        
        {/* ADDED: Profile Picture Button */}
        <button
          onClick={onProfilePictureChange}
          style={profilePictureButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FAF8F2';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
          }}
        >
          {hasProfilePicture ? '📷 Change Profile Picture' : '📷 Add Profile Picture'}
        </button>
        
        <div style={{ marginBottom: '16px' }}>
          <input 
            name="username" 
            value={form.username} 
            onChange={handleUsernameChange} 
            placeholder="Username" 
            style={usernameError ? errorInputStyle : inputStyle}
            disabled={isCheckingUsername}
          />
          {isCheckingUsername && (
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '-8px', marginBottom: '12px' }}>
              Checking username availability...
            </div>
          )}
          {usernameError && (
            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '-8px', marginBottom: '12px' }}>
              {usernameError}
            </div>
          )}
          
          <input 
            name="full_name" 
            value={form.full_name} 
            onChange={handleChange} 
            placeholder="Full name" 
            style={inputStyle}
          />
          <input 
            name="genre_persona" 
            value={form.genre_persona} 
            onChange={handleChange} 
            placeholder="Genre persona" 
            style={inputStyle}
          />
          <input 
            name="expression" 
            value={form.expression} 
            onChange={handleChange} 
            placeholder="Expression" 
            style={inputStyle}
          />
          <textarea 
            name="bio" 
            value={form.bio} 
            onChange={handleChange} 
            placeholder="Bio" 
            style={textareaStyle}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={buttonStyle}>
            Cancel
          </button>
          <button 
            onClick={save} 
            disabled={isSaveDisabled}
            style={isSaveDisabled ? disabledSaveButtonStyle : saveButtonStyle}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}s