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
  
  // FORCE console logs - use different methods
  console.log('🎭 CHARACTER COMPOSER RENDERED - characterId:', characterId);
  console.warn('🎭 URL search params:', Object.fromEntries([...searchParams]));
  console.error('🎭 Location state:', location.state);
  
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

  // DEBUG: Visual debug state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const addDebugLog = (message: string) => {
    console.log(`🔍 ${message}`);
    setDebugLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Log current state
  useEffect(() => {
    addDebugLog(`characterData.bio: "${characterData.bio?.substring(0, 50)}..."`);
    addDebugLog(`characterData.bio length: ${characterData.bio?.length}`);
    addDebugLog(`visualReferences count: ${visualReferences.length}`);
  }, [characterData.bio, visualReferences.length]);

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

  // Add debug logs for all key events
  useEffect(() => {
    addDebugLog('Component mounted');
  }, []);

  useEffect(() => {
    addDebugLog(`bioEditorRef changed: ${!!bioEditorRef.current}`);
    if (bioEditorRef.current) {
      addDebugLog(`Editor innerHTML: "${bioEditorRef.current.innerHTML?.substring(0, 50)}..."`);
    }
  }, [bioEditorRef.current]);

  // Sync the editor content when characterData.bio changes
  useEffect(() => {
    addDebugLog(`SYNC EFFECT - characterData.bio: "${characterData.bio?.substring(0, 50)}..."`);
    addDebugLog(`SYNC EFFECT - bioEditorRef exists: ${!!bioEditorRef.current}`);
    
    if (bioEditorRef.current && characterData.bio !== bioEditorRef.current.innerHTML) {
      addDebugLog('SETTING EDITOR CONTENT FROM characterData.bio');
      bioEditorRef.current.innerHTML = characterData.bio;
      setShowPlaceholder(!characterData.bio.trim());
      addDebugLog(`After set - editor content: "${bioEditorRef.current.innerHTML?.substring(0, 50)}..."`);
    }
  }, [characterData.bio]);

  const handleFormat = (command: string, value: string = '') => {
    addDebugLog(`Format: ${command} ${value}`);
    document.execCommand(command, false, value);
    bioEditorRef.current?.focus();
    
    if (bioEditorRef.current) {
      const content = bioEditorRef.current.innerHTML;
      updateField('bio', content);
    }
  };

  const handleBioInput = () => {
    addDebugLog('Bio input detected');
    if (bioEditorRef.current) {
      const content = bioEditorRef.current.innerHTML;
      updateField('bio', content);
      
      const hasContent = content !== '' && 
                         content !== '<br>' && 
                         content !== '<div><br></div>' &&
                         !content.startsWith('<div></div>');
      
      setShowPlaceholder(!hasContent);
    }
  };

  const handleBioFocus = () => {
    addDebugLog('Bio editor focused');
    setIsBioFocused(true);
    if (showPlaceholder && bioEditorRef.current) {
      bioEditorRef.current.innerHTML = '';
      setShowPlaceholder(false);
    }
  };

  const handleBioBlur = () => {
    addDebugLog('Bio editor blurred');
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement && !activeElement.closest('.toolbar-button')) {
        setIsBioFocused(false);
        
        const content = bioEditorRef.current?.innerHTML || '';
        const isEmpty = content === '' || 
                        content === '<br>' || 
                        content === '<div><br></div>' ||
                        content.startsWith('<div></div>');
        
        setShowPlaceholder(isEmpty);
      }
    }, 200);
  };

  const handlePromptSelect = (prompt: any) => {
    addDebugLog(`Prompt selected: ${prompt.name}`);
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
    addDebugLog('Back button clicked');
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
    addDebugLog(`MAIN useEffect triggered - characterId: ${characterId}`);
    
    const loadCharacter = async () => {
      addDebugLog('loadCharacter function called');
      
      if (!characterId) {
        addDebugLog('No characterId - skipping load');
        return;
      }
      
      try {
        addDebugLog('Setting loadingCharacter: true');
        setLoadingCharacter(true);
        
        addDebugLog(`Making Supabase request for character: ${characterId}`);
        const { data: character, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', characterId)
          .single();

        addDebugLog(`Supabase response - data: ${!!character}, error: ${error}`);
        
        if (error) {
          addDebugLog(`Supabase error: ${error.message}`);
          throw error;
        }
        
        if (!character) {
          addDebugLog('No character data returned');
          return;
        }

        addDebugLog(`Character loaded: ${character.name}`);
        addDebugLog(`Character bio: "${character.bio?.substring(0, 50)}..."`);
        addDebugLog(`Bio editor ref exists: ${!!bioEditorRef.current}`);
        
        // Set basic fields
        addDebugLog(`Setting name: ${character.name}`);
        updateField('name', character.name);
        
        addDebugLog(`Setting tagline: ${character.tagline}`);
        updateField('tagline', character.tagline || '');
        
        addDebugLog('Setting isEditing: true');
        setIsEditing(true);
        
        addDebugLog(`Setting originalStatus: ${character.status}`);
        setOriginalStatus(character.status as 'draft' | 'published');
        
        addDebugLog('Setting showPublishOption: false');
        setShowPublishOption(false);
        
        // FIXED: Use exact same pattern as SceneComposer
        const characterBio = character.bio || '';
        addDebugLog(`Setting bio state: "${characterBio.substring(0, 50)}..."`);
        
        // Update state first
        updateField('bio', characterBio);
        
        addDebugLog('Attempting to set editor content...');
        
        // Update editor content after a brief delay to ensure DOM is ready
        setTimeout(() => {
          addDebugLog('setTimeout callback executing');
          addDebugLog(`bioEditorRef.current: ${!!bioEditorRef.current}`);
          addDebugLog(`characterBio to set: "${characterBio.substring(0, 50)}..."`);
          
          if (bioEditorRef.current && characterBio) {
            addDebugLog('SETTING EDITOR CONTENT');
            bioEditorRef.current.innerHTML = characterBio;
            addDebugLog(`Editor content after set: "${bioEditorRef.current.innerHTML?.substring(0, 50)}..."`);
            setShowPlaceholder(!characterBio.trim());
            addDebugLog(`showPlaceholder set to: ${!characterBio.trim()}`);
          } else {
            addDebugLog(`Could not set editor - ref: ${!!bioEditorRef.current}, bio: ${!!characterBio}`);
          }
        }, 100);
        
        // Load visual references
        addDebugLog('Loading visual references...');
        const { data: visualRefs } = await supabase
          .from('character_visual_references')
          .select('*')
          .eq('character_id', characterId);
        
        addDebugLog(`Visual references loaded: ${visualRefs?.length || 0}`);
        
        if (visualRefs) {
          visualRefs.forEach(ref => {
            addDebugLog(`Adding visual reference: ${ref.image_url}`);
            addVisualReference(ref.image_url);
          });
        }
        
      } catch (err) {
        addDebugLog(`Error in loadCharacter: ${err}`);
        console.error('Error loading character:', err);
      } finally {
        addDebugLog('Setting loadingCharacter: false');
        setLoadingCharacter(false);
        addDebugLog('loadCharacter completed');
      }
    };

    loadCharacter();
  }, [characterId]);

  useEffect(() => {
    addDebugLog('Smart button useEffect - checking content');
    if (!isEditing) {
      const hasSubstantialContent = 
        characterData.name.length > 2 && 
        characterData.tagline.length > 2 && 
        characterData.bio.length > 10;
      
      addDebugLog(`showPublishOption set to: ${hasSubstantialContent}`);
      setShowPublishOption(hasSubstantialContent);
    }
  }, [characterData.name, characterData.tagline, characterData.bio, isEditing]);

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    addDebugLog(`Submit called with publish: ${publish}`);
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
      addDebugLog(`Submit error: ${err}`);
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
    addDebugLog(`handleEditUpdate called for characterId: ${characterId}`);
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
      addDebugLog(`Error updating character: ${err}`);
      console.error('Error updating character:', err);
      alert('Error updating character. Please try again.');
    }
  };

  const handleAddVisualReference = (e?: React.MouseEvent) => {
    addDebugLog('handleAddVisualReference called');
    if (e) e.preventDefault();
    if (tempImageUrl.trim()) {
      addVisualReference(tempImageUrl);
      setTempImageUrl('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    addDebugLog('handleFileUpload called');
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
    addDebugLog('handlePaste called');
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
    addDebugLog('handleVisualRefClick called');
    setShowVisualRefInput(true);
  };

  // ... (rest of your styles remain the same)
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
    lineHeight: '1.4'
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
    userSelect: 'none',
    zIndex: 1
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
    addDebugLog('Rendering loading state');
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

  addDebugLog('Rendering main component');
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF'
    }}>
      <div style={containerStyle}>
        {/* Enhanced debug overlay */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '400px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Debug Info:</div>
          <div>characterId: {characterId || 'null'}</div>
          <div>isEditing: {isEditing ? 'true' : 'false'}</div>
          <div>loadingCharacter: {loadingCharacter ? 'true' : 'false'}</div>
          <div>bioLength: {characterData.bio?.length || 0}</div>
          <div>editorRef: {bioEditorRef.current ? 'exists' : 'null'}</div>
          <div>showPlaceholder: {showPlaceholder ? 'true' : 'false'}</div>
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Recent Logs:</div>
          {debugLogs.map((log, index) => (
            <div key={index} style={{ fontSize: '10px', marginTop: '2px' }}>
              {log}
            </div>
          ))}
        </div>

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

        {/* ... rest of your JSX remains the same */}
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
          {/* ... rest of your form JSX remains the same */}
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
            
            <div style={toolbarStyle}>
              <button
                type="button"
                className="toolbar-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleFormat('bold');
                }}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleFormat('italic');
                }}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleFormat('insertUnorderedList');
                }}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                • List
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                ref={bioEditorRef}
                contentEditable
                onInput={handleBioInput}
                onFocus={handleBioFocus}
                onBlur={handleBioBlur}
                style={editorStyle}
                suppressContentEditableWarning={true}
              />
              
              {showPlaceholder && (
                <div style={placeholderStyle}>
                  Describe your character's story, personality, and development...
                </div>
              )}
            </div>
          </div>

          {/* ... rest of your form JSX remains the same */}

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