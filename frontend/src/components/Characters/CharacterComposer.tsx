'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCharacterComposer } from '../../hooks/useCharacterComposer';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../assets/lib/supabaseClient';
import { promptsData } from '../../data/promptsData';
import InspirationBottomSheet from '../InspirationBottomSheet/InspirationBottomSheet';

export default function CharacterComposer() {
  const [searchParams] = useSearchParams();
  const characterId = searchParams.get('id');
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnPath = location.state?.from || '/home-feed';
  
  const {
    characterData,
    visualReferences,
    isLoading,
    error,
    updateField,
    addVisualReference,
    removeVisualReference,
    submitCharacter,
    resetForm
  } = useCharacterComposer();

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [showVisualRefInput, setShowVisualRefInput] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [showPublishOption, setShowPublishOption] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingCharacter, setLoadingCharacter] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<'draft' | 'published'>('draft');
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioEditorRef = useRef<HTMLDivElement>(null);
  const [isBioFocused, setIsBioFocused] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Formatting handlers
  const handleFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    bioEditorRef.current?.focus();
  };

  const handleBioInput = () => {
    if (bioEditorRef.current) {
      const content = bioEditorRef.current.innerHTML;
      updateField('bio', content);
      setShowPlaceholder(content === '<br>' || content === '');
    }
  };

  const handleBioFocus = () => {
    setIsBioFocused(true);
    if (showPlaceholder && bioEditorRef.current) {
      bioEditorRef.current.innerHTML = '';
      setShowPlaceholder(false);
    }
  };

  const handleBioBlur = () => {
    setIsBioFocused(false);
    if (bioEditorRef.current && (bioEditorRef.current.innerHTML === '<br>' || bioEditorRef.current.innerHTML === '')) {
      setShowPlaceholder(true);
    }
  };

  const handlePromptSelect = (prompt: any) => {
    if (prompt.name) {
      updateField('name', prompt.name);
    }
    if (prompt.tagline) {
      updateField('tagline', prompt.tagline);
    }
    if (prompt.bio && bioEditorRef.current) {
      bioEditorRef.current.innerHTML = prompt.bio;
      updateField('bio', prompt.bio);
      setShowPlaceholder(false);
    }
    setIsInspirationOpen(false);
  };

  const BackArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  const handleBack = () => {
    const hasContent = characterData.name !== '' || characterData.tagline !== '' || characterData.bio !== '' || visualReferences.length > 0;
    
    if (hasContent) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your changes will not be saved.');
      if (!confirmLeave) return;
    }
    
    if (isEditing && characterId) {
      navigate(`/home-feed#character-${characterId}`);
    } else {
      navigate(returnPath);
    }
  };

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) return;
      
      try {
        setLoadingCharacter(true);
        const { data: character, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', characterId)
          .single();

        if (error) throw error;
        if (character) {
          updateField('name', character.name);
          updateField('tagline', character.tagline || '');
          updateField('bio', character.bio || '');
          setIsEditing(true);
          setOriginalStatus(character.status as 'draft' | 'published');
          setShowPublishOption(false);
          
          if (bioEditorRef.current && character.bio) {
            bioEditorRef.current.innerHTML = character.bio;
            setShowPlaceholder(false);
          }
          
          const { data: visualRefs } = await supabase
            .from('character_visual_references')
            .select('*')
            .eq('character_id', characterId);
          
          if (visualRefs) {
            visualRefs.forEach(ref => {
              addVisualReference(ref.image_url);
            });
          }
        }
      } catch (err) {
        console.error('Error loading character:', err);
      } finally {
        setLoadingCharacter(false);
      }
    };

    loadCharacter();
  }, [characterId]);

  useEffect(() => {
    if (!isEditing) {
      const hasSubstantialContent = 
        characterData.name.length > 2 && 
        characterData.tagline.length > 2 && 
        characterData.bio.length > 10;
      
      setShowPublishOption(hasSubstantialContent);
    }
  }, [characterData.name, characterData.tagline, characterData.bio, isEditing]);

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    
    if (!characterData.name.trim()) {
      alert('Please enter a character name');
      return;
    }

    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      if (isEditing && characterId) {
        await handleEditUpdate();
        return;
      }
      
      const result = await submitCharacter(publish ? 'published' : 'draft');
      
      if (result) {
        alert(publish ? 'Character published successfully!' : 'Character saved as draft!');
        resetForm();
        if (bioEditorRef.current) {
          bioEditorRef.current.innerHTML = '';
          setShowPlaceholder(true);
        }
        setShowVisualRefInput(false);
        setShowPublishOption(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      if (publish) {
        setIsPublishing(false);
      } else {
        setIsSavingDraft(false);
      }
    }
  };

  const handleEditUpdate = async () => {
    if (!characterId) return;
    
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          name: characterData.name.trim(),
          tagline: characterData.tagline.trim(),
          bio: characterData.bio.trim(),
          status: originalStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId);

      if (error) throw error;

      await supabase.from('character_visual_references').delete().eq('character_id', characterId);
      if (visualReferences.length > 0) {
        const visualRefInserts = visualReferences.map(ref => ({
          character_id: characterId,
          image_url: ref.image_url
        }));
        await supabase.from('character_visual_references').insert(visualRefInserts);
      }

      alert('Character updated successfully!');
      navigate(`/home-feed#character-${characterId}`);
      
    } catch (err) {
      console.error('Error updating character:', err);
      alert('Error updating character. Please try again.');
    }
  };

  const handleAddVisualReference = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (tempImageUrl.trim()) {
      addVisualReference(tempImageUrl);
      setTempImageUrl('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      addVisualReference(objectUrl);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const objectUrl = URL.createObjectURL(file);
            addVisualReference(objectUrl);
            event.preventDefault();
            break;
          }
        }
      }
    }
  };

  const handleVisualRefClick = () => {
    setShowVisualRefInput(true);
  };

  const containerStyle: React.CSSProperties = {
    width: 375,
    background: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    alignSelf: 'center',
    margin: '40px auto',
    overflow: 'clip',
    position: 'relative'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#FAF8F2',
    outline: 'none',
    fontSize: 15,
    margin: 0,
    fontFamily: "'Garamond', serif",
    color: '#000000'
  };

  const editorStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 120,
    display: 'block',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#FAF8F2',
    outline: 'none',
    fontSize: 15,
    margin: 0,
    fontFamily: "'Garamond', serif",
    color: '#000000',
    resize: 'none',
    overflow: 'auto',
    lineHeight: '1.4',
    position: 'relative'
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    left: '16px',
    right: '16px',
    color: '#6B7280',
    fontFamily: "'Garamond', serif",
    fontSize: 15,
    pointerEvents: 'none',
    userSelect: 'none'
  };

  const toolbarStyle: React.CSSProperties = {
    display: isBioFocused ? 'flex' : 'none',
    gap: '8px',
    padding: '8px 12px',
    background: '#FAF8F2',
    border: '1px solid rgba(0,0,0,0.12)',
    borderBottom: 'none',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: '-1px'
  };

  const formatButtonStyle: React.CSSProperties = {
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Cormorant', serif",
    fontWeight: 600,
    color: '#000000',
    transition: 'all 0.2s ease'
  };

  const actionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    borderRadius: 12,
    background: '#FAF8F2',
    border: '1px solid rgba(0,0,0,0.12)',
    color: '#000000',
    cursor: 'pointer',
    fontSize: 15,
    fontFamily: "'Cormorant', serif",
    fontWeight: 600,
    textAlign: 'center',
    transition: 'all 0.2s ease'
  };

  const draftButtonStyle: React.CSSProperties = {
    width: showPublishOption ? '48%' : '100%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#FAF8F2',
    border: '1px solid rgba(0,0,0,0.12)',
    color: '#000000',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  const publishButtonStyle: React.CSSProperties = {
    width: '48%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#1A1A1A',
    border: '1px solid #1A1A1A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  const updateButtonStyle: React.CSSProperties = {
    width: '100%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#1A1A1A',
    border: '1px solid #1A1A1A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    background: isActive ? '#1A1A1A' : '#FAF8F2',
    color: isActive ? '#FFFFFF' : '#000000',
    border: '1px solid rgba(0,0,0,0.12)',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Cormorant', serif",
    fontWeight: 600,
    transition: 'all 0.2s ease'
  });

  if (loadingCharacter) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF'
      }}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center', 
            padding: '60px 0', 
            color: '#6B7280',
            fontFamily: "'Cormorant', serif"
          }}>
            Loading character...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF'
    }}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#FAF8F2',
            border: '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1C1C1C',
            zIndex: 1000,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#F0EDE4';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FAF8F2';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
          }}
        >
          <BackArrowIcon />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#1C1C1C',
            lineHeight: 'auto',
            letterSpacing: '10%',
            margin: '0 auto'
          }}>
            {isEditing ? 'Edit Character' : 'Create a Character'}
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 400,
            color: '#55524F',
            lineHeight: 'auto',
            letterSpacing: '0%',
            margin: '16px auto 0'
          }}>
            {isEditing ? 'Update your character' : 'What voice can unlock your imagination?'}
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 400,
              color: '#55524F',
              marginBottom: 8,
              lineHeight: '15px'
            }}>
              Give your character a Name?
            </label>
            <input
              type="text"
              value={characterData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder='e.g., "The Crimson Alchemist"'
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 400,
              color: '#55524F',
              marginBottom: 8,
              lineHeight: '15px'
            }}>
              Tagline or Trait
            </label>
            <input
              type="text"
              value={characterData.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder='e.g., "A Mystic who sees sound as color"'
              style={inputStyle}
              required
            />
          </div>

          {/* UPDATED: Biography Editor with WYSIWYG formatting */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 400,
              color: '#55524F',
              marginBottom: 8,
              lineHeight: '15px'
            }}>
              Give your character an arc, characteristics and back story...
            </label>
            
            {/* Formatting Toolbar */}
            <div style={toolbarStyle}>
              <button
                type="button"
                onClick={() => handleFormat('bold')}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => handleFormat('italic')}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => handleFormat('insertUnorderedList')}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                • List
              </button>
            </div>

            {/* WYSIWYG Editor */}
            <div
              ref={bioEditorRef}
              contentEditable
              onInput={handleBioInput}
              onFocus={handleBioFocus}
              onBlur={handleBioBlur}
              style={editorStyle}
              suppressContentEditableWarning={true}
            />
            
            {/* Placeholder */}
            {showPlaceholder && (
              <div style={placeholderStyle}>
                Describe your character's story, personality, and development...
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleVisualRefClick}
              style={actionButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
              onMouseOut={(e) => e.currentTarget.style.background = '#FAF8F2'}
            >
              Add Visual References
            </button>
            
            {(showVisualRefInput || visualReferences.length > 0) && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    style={tabButtonStyle(uploadMethod === 'url')}
                  >
                    From URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    style={tabButtonStyle(uploadMethod === 'file')}
                  >
                    Upload File
                  </button>
                </div>

                {uploadMethod === 'url' && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      type="text"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                      style={{ ...inputStyle, flex: 1 }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddVisualReference()}
                      onPaste={handlePaste}
                    />
                    <button
                      type="button"
                      onClick={handleAddVisualReference}
                      disabled={!tempImageUrl.trim()}
                      style={{
                        padding: '12px 16px',
                        background: '#1A1A1A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontFamily: "'Cormorant', serif",
                        fontSize: 14,
                        opacity: tempImageUrl.trim() ? 1 : 0.5
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}

                {uploadMethod === 'file' && (
                  <div style={{ marginBottom: 12 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#FAF8F2',
                        border: '1px solid rgba(0,0,0,0.12)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontFamily: "'Cormorant', serif",
                        fontSize: 14,
                        color: '#000000'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#FAF8F2'}
                    >
                      📁 Choose Image File
                    </button>
                    <p style={{
                      fontFamily: "'Cormorant', serif",
                      fontSize: 12,
                      color: '#55524F',
                      textAlign: 'center',
                      marginTop: 8,
                      marginBottom: 0
                    }}>
                      Or paste an image (Ctrl+V) anywhere
                    </p>
                  </div>
                )}
                
                {visualReferences.map((ref) => (
                  <div key={ref.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#F8F6F0',
                    padding: '12px',
                    borderRadius: 8,
                    marginBottom: 8
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={ref.image_url} 
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <span style={{
                      fontFamily: "'Cormorant', serif",
                      fontSize: 14,
                      color: '#55524F',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {ref.image_url.startsWith('blob:') ? 'Uploaded Image' : ref.image_url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVisualReference(ref.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontFamily: "'Cormorant', serif",
                        fontSize: 14,
                        padding: '4px 8px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsInspirationOpen(true)}
              style={{
                padding: '12px 24px',
                background: '#FAF8F2',
                border: '1px solid #D4AF37',
                borderRadius: '10px',
                color: '#1A1A1A',
                cursor: 'pointer',
                fontFamily: "'Cormorant', serif",
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#F0EDE4';
                e.currentTarget.style.borderColor = '#B8860B';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FAF8F2';
                e.currentTarget.style.borderColor = '#D4AF37';
              }}
            >
              💡 Get Character Inspiration
            </button>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: 8,
              fontFamily: "'Cormorant', serif",
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '4%', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {isEditing ? (
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...updateButtonStyle,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = '#2A2A2A')}
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = '#1A1A1A')}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSavingDraft || isPublishing}
                  style={{
                    ...draftButtonStyle,
                    opacity: (isSavingDraft || isPublishing) ? 0.7 : 1,
                    cursor: (isSavingDraft || isPublishing) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseOver={(e) => !isSavingDraft && !isPublishing && (e.currentTarget.style.background = '#F0EDE4')}
                  onMouseOut={(e) => !isSavingDraft && !isPublishing && (e.currentTarget.style.background = '#FAF8F2')}
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>

                {showPublishOption && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isPublishing || isSavingDraft}
                    style={{
                      ...publishButtonStyle,
                      opacity: (isPublishing || isSavingDraft) ? 0.7 : 1,
                      cursor: (isPublishing || isSavingDraft) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => !isPublishing && !isSavingDraft && (e.currentTarget.style.background = '#2A2A2A')}
                    onMouseOut={(e) => !isPublishing && !isSavingDraft && (e.currentTarget.style.background = '#1A1A1A')}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish'}
                  </button>
                )}
              </>
            )}
          </div>
        </form>

        <InspirationBottomSheet
          isOpen={isInspirationOpen}
          onClose={() => setIsInspirationOpen(false)}
          onSelectPrompt={handlePromptSelect}
          prompts={promptsData.characters}
          contentType="characters"
        />
      </div>
    </div>
  );
}